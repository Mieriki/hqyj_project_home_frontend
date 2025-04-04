<script setup lang="ts">
import { ArrowUpBold } from '@element-plus/icons-vue'
import { computed } from 'vue'

interface Props {
  size?: number
  primaryColor?: string
  showShine?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
  primaryColor: '#409eff',
  showShine: true
})

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const hoverColor = computed(() => {
  try {
    const hex = props.primaryColor
        .replace(/[^0-9a-f]/gi, '')
        .padEnd(6, '0')
        .slice(0, 6)

    const channels = hex.match(/.{2}/g)?.map(v => parseInt(v, 16)) || [0, 0, 0]

    return `rgb(
      ${Math.max(0, Math.min(255, Math.round(channels[0] * 0.8)))},
      ${Math.max(0, Math.min(255, Math.round(channels[1] * 0.8)))},
      ${Math.max(0, Math.min(255, Math.round(channels[2] * 0.8)))}
    )`
  } catch {
    return '#337ecc'
  }
})

/*
<IconButton
      :size="40"
      primary-color="#ff4757"
      :show-shine="false">
    <el-icon><Star /></el-icon>
 </IconButton>
*/
</script>

<template>
  <button
      class="icon-button"
      :class="{ 'no-shine': !showShine }"
      v-bind="$attrs"
      @click="$emit('click', $event)"
  >
    <div class="button-core">
      <div class="button-background">
        <el-icon class="button-icon">
          <slot>
            <ArrowUpBold />
          </slot>
        </el-icon>
      </div>
    </div>
  </button>
</template>

<style scoped>
.icon-button {
  --button-size: v-bind('props.size + "px"');
  --icon-size: v-bind('props.size * 0.5 + "px"');
  --primary-color: v-bind('props.primaryColor');
  --hover-color: v-bind('hoverColor');

  display: inline-block;
  vertical-align: middle;
  position: relative;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  width: var(--button-size);
  height: var(--button-size);
  outline: none;
  line-height: 0;
  box-sizing: border-box;

  overflow: hidden;
}

.button-core {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.2s ease;
}

/* 调整伪元素尺寸为100% */
.button-core::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;  /* 修改此处 */
  height: 100%; /* 修改此处 */
  z-index: 1;
  pointer-events: none;
}

.button-background {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--primary-color);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-background::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
      45deg,
      transparent 35%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 65%
  );
  transform: rotate(45deg);
  animation: v-shine 3s infinite linear;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.button-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  font-size: var(--icon-size);
  color: white;
  transition: transform 0.25s ease;
  pointer-events: none;
}

.no-shine .button-background::after {
  animation: none !important;
  opacity: 0 !important;
}

.icon-button:hover .button-background {
  background-color: var(--hover-color);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translate(-50%, calc(-50% - 1px));
}

.icon-button:hover .button-icon {
  transform: translate(-50%, calc(-50% - 1px));
}

.icon-button:active .button-core {
  transform: scale(0.92);
}

.icon-button:active .button-icon {
  transform: translate(-50%, -50%) scale(0.85);
}

@keyframes v-shine {
  0% {
    transform: translateX(-150%) rotate(45deg);
  }
  100% {
    transform: translateX(150%) rotate(45deg);
  }
}
</style>