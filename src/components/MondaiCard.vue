<template>
  <el-card class="question-card">
    <div class="question-title">{{ question.title }}</div>
    <el-image
        v-if="question.pictures"
        :src="question.pictures"
        class="question-image"
        fit="cover"
    />
    <div class="question-content" v-html="question.informations"></div>

    <!-- 选项区域 -->
    <div class="options">
      <el-radio-group
          v-if="isSingleChoice"
          v-model="selectedOption"
          :disabled="shouldDisableInteraction"
      >
        <el-radio
            v-for="(item, index) in parsedOptions"
            :key="index"
            :label="item.label"
            class="option-item"
        >
          <p class="option-label">{{ item.value }}</p>
        </el-radio>
      </el-radio-group>

      <el-checkbox-group
          v-else
          v-model="selectedOptions"
          :disabled="shouldDisableInteraction"
      >
        <el-checkbox
            v-for="(item, index) in parsedOptions"
            :key="index"
            :label="item.label"
            class="option-item"
        >
          <span class="option-label">{{ item.value }}</span>
        </el-checkbox>
      </el-checkbox-group>
    </div>

    <!-- 答案解析 -->
    <div v-if="showAnswer || admin" class="answer-explanation">
      <div v-if="!admin" class="result-indicator" :class="isCorrect ? 'correct' : 'wrong'">
        <div class="indicator-content">
          <el-icon class="icon">
            <SuccessFilled v-if="isCorrect" />
            <WarningFilled v-else />
          </el-icon>
          <span class="text">
            {{ isCorrect ? '回答正确！' : '回答错误！' }}
          </span>
        </div>
      </div>

      <div class="user-answer" v-if="!admin">
        <span class="explanation-title">📝 你的答案：</span>
        <span :class="answerClass">{{ formattedUserAnswer }}</span>
      </div>

      <div class="correct-answer">
        <span class="explanation-title">✅ 正确答案：</span>
        <span class="answer-value">{{ correctAnswerLabels }}</span>
      </div>

      <div class="explanation-detail">
        <span class="explanation-title">📖 题目解析：</span>
        <span class="explanation-text">{{ question.note }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { PropType } from 'vue';
import { SuccessFilled, WarningFilled } from '@element-plus/icons-vue';

interface QuestionOption {
  label: string;
  value: string;
  single: boolean;
}

interface Question {
  id: number;
  title: string;
  items: string;
  informations: string;
  pictures?: string;
  note: string;
}

const props = defineProps({
  question: {
    type: Object as PropType<Question>,
    required: true,
    validator: (q: Question) => !!q.items
  },
  modelValue: {
    type: [String, Array] as PropType<string | string[]>,
    default: ''
  },
  admin: {
    type: Boolean,
    default: false
  },
  showAnswer: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// 内部状态
const selectedOption = ref('');
const selectedOptions = ref<string[]>([]);

// 解析题目选项
const parsedOptions = computed<QuestionOption[]>(() => {
  try {
    return JSON.parse(props.question.items);
  } catch {
    console.error('Invalid question items format');
    return [];
  }
});

// 是否为单选题
const isSingleChoice = computed(() => {
  const correctOptions = parsedOptions.value.filter(opt => opt.single);
  return correctOptions.length === 1;
});

// 正确答案标签
const correctAnswerLabels = computed(() => {
  return parsedOptions.value
      .filter(opt => opt.single)
      .map(opt => opt.label)
      .join(', ');
});

// 用户答案格式化
const formattedUserAnswer = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.join(', ');
  }
  return props.modelValue;
});

// 是否应该禁用交互
const shouldDisableInteraction = computed(() => {
  return props.showAnswer || props.admin;
});

// 答案正确性判断
const isCorrect = computed(() => {
  const correctAnswers = parsedOptions.value
      .filter(opt => opt.single)
      .map(opt => opt.label);

  if (isSingleChoice.value) {
    return correctAnswers.includes(props.modelValue as string);
  }

  const userAnswers = Array.isArray(props.modelValue)
      ? props.modelValue
      : [props.modelValue];

  return (
      userAnswers.length === correctAnswers.length &&
      userAnswers.every(ans => correctAnswers.includes(ans))
  );
});

// 答案样式类
const answerClass = computed(() => ({
  'answer-value': isCorrect.value,
  'answer-explanation-value': !isCorrect.value
}));

// 同步外部值到内部状态
watch(() => [props.modelValue, props.admin], ([value, isKanri]) => {
  if (isKanri) {
    // 管理模式显示正确答案
    const correct = parsedOptions.value
        .filter(opt => opt.single)
        .map(opt => opt.label);

    if (isSingleChoice.value) {
      selectedOption.value = correct[0] || '';
    } else {
      selectedOptions.value = correct;
    }
  } else {
    // 正常模式同步用户答案
    if (isSingleChoice.value) {
      selectedOption.value = value as string || '';
    } else {
      selectedOptions.value = Array.isArray(value) ? value : [value];
    }
  }
}, { immediate: true });

// 监听内部变化
watch(
    [() => selectedOption.value, () => selectedOptions.value],
    ([singleVal, multiVal]) => {
      if (props.admin) return;

      const value = isSingleChoice.value ? singleVal : multiVal;
      emit('update:modelValue', value);
      emit('change', {
        questionId: props.question.id,
        type: isSingleChoice.value ? 'single' : 'multiple',
        value
      });
    }
);

// 切换题型时重置未使用的状态
watch(isSingleChoice, (isSingle) => {
  if (isSingle) {
    selectedOptions.value = [];
  } else {
    selectedOption.value = '';
  }
});
</script>

<style scoped lang="scss">
.question-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .question-title {
    font-size: 1.1rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
  }

  .question-image {
    width: 100%;
    max-height: 280px;
    border-radius: 6px;
    margin: 8px 0;
  }

  .options {
    :deep(.el-radio-group),
    :deep(.el-checkbox-group) {
      width: 100%;
    }

    .option-item {
      position: relative;
      width: 100%;
      min-height: 40px;
      margin: 8px 0;
      padding: 10px 12px 10px 40px; // 左侧留出图标位置
      box-sizing: border-box;
      text-align: left;

      // 强制图标位置
      :deep(.el-radio__input),
      :deep(.el-checkbox__input) {
        position: absolute !important;
        left: 12px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        margin: 0 !important;
      }

      // 文本对齐控制
      :deep(.el-radio__label),
      :deep(.el-checkbox__label) {
        display: block;
        width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        line-height: 1.5;
      }
    }

    // 统一选中状态
    .is-checked {
      background: #f0f7ff;
      border-radius: 4px;
    }
  }

  .option-label {
    // 移除可能影响对齐的样式
    display: block;
    width: 100%;
  }

  .answer-explanation {
    margin-top: 16px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;

    .explanation-title {
      font-size: 13px;
      color: #666;
    }

    .answer-value {
      color: #07c160;
      font-weight: 500;
    }

    .answer-explanation-value {
      color: #F56C6C;
      font-weight: 500;
    }

    .explanation-text {
      color: #666;
      font-size: 13px;
    }
  }
}

.result-indicator {
  margin: 16px 0;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease;

  .indicator-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .text {
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  &.correct {
    background: #f0faf3;
    border-color: #67c23a;

    .icon {
      color: #67c23a;
    }

    .text {
      color: #2a5420;
    }
  }

  &.wrong {
    background: #fef0f0;
    border-color: #f56c6c;

    .icon {
      color: #f56c6c;
    }

    .text {
      color: #a94442;
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
