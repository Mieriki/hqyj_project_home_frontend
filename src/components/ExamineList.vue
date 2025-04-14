<template>
  <el-card :class="['box-card', cardClass]" :shadow="shadow">
    <template #header v-if="title || steps.length > 0">
      <div class="card-header">
        <span v-if="title">{{ title }}</span>
        <el-steps v-if="steps.length > 0" :active="currentStep" :finish-status="finishStatus" :simple="simple"
                  style="margin-top: 10px; background-color: #00000000;">
          <el-step v-for="(step, index) in steps" :key="index" :title="step.title" :icon="step.icon"
                   :description="step.description"></el-step>
        </el-steps>
      </div>
    </template>
    <el-timeline>
      <el-timeline-item
          v-for="(record, index) in examineRecords"
          :key="index"
          :timestamp="formatDate(record[timeField])"
          placement="top"
          :size="timelineItemSize"
          :color="nodeStyle.color"
          :icon="nodeStyle.icon"
          :hollow="nodeStyle.hollow"
          :type="nodeStyle.type"
      >
        <el-card :shadow="cardShadow">
          <p v-for="(field, fieldName) in fields" :key="fieldName">
            <strong>{{ field.label }}:</strong> {{ record[fieldName] }}
          </p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script setup>
import {defineProps} from 'vue';

const props = defineProps({
  examineRecords: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  dateFormat: {
    type: String,
    default: 'YYYY-MM-DD HH:mm:ss'
  },
  cardClass: {
    type: String,
    default: ''
  },
  timelineItemSize: {
    type: String,
    default: 'normal' // can be 'large', 'small', or 'normal'
  },
  cardShadow: {
    type: String,
    default: 'always' // can be 'always', 'hover', or 'never'
  },
  fields: {
    type: Object,
    default: () => ({
      examineFlag: {label: '审查标志'},
      examineMsg: {label: '审查消息'},
      examineUser: {label: '审查用户'}
    })
  },
  nodeStyle: {
    type: Object,
    default: () => ({
      color: '#409EFF',
      icon: '',
      hollow: false,
      type: '' // can be 'primary', 'success', 'warning', 'danger', or ''
    })
  },
  timeField: {
    type: String,
    default: 'examineDate' // 默认的时间字段名
  },
  steps: {
    type: Array,
    default: () => []
  },
  currentStep: {
    type: Number,
    default: 0
  },
  simple: {
    type: Boolean,
    default: false
  },
  finishStatus: {
    type: String,
    default: 'finish'
  },
  shadow: {
    type: String,
    default: 'never' // can be 'always', 'hover', or 'never'
  }

});

function formatDate(dateString) {
  const date = new Date(dateString);
  return formatDateString(date, props.dateFormat);
}

function formatDateString(date, format) {
  const options = {
    YYYY: date.getFullYear(),
    MM: ('0' + (date.getMonth() + 1)).slice(-2),
    DD: ('0' + date.getDate()).slice(-2),
    HH: ('0' + date.getHours()).slice(-2),
    mm: ('0' + date.getMinutes()).slice(-2),
    ss: ('0' + date.getSeconds()).slice(-2)
  };
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, matched => options[matched]);
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  //align-items: center;
  flex-direction: column;
}

.box-card {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
</style>



