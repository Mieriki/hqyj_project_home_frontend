<template>
  <el-row style="height: 75vh;">
    <el-col :span="19">
      <MondaiCard
          v-if="question"
          :question="question"
          :show-answer="showAnswer"
          v-model="answer"
          :max-height="`67vh`"
          @change="handleSelection"
      >
      </MondaiCard>
    </el-col>
    <el-col :span="5">
      <el-card
          shadow="hover"
          style="height: 72vh; margin-left: 10px; border-radius: 12px;"
          class="stats-card"
      >
        <template #header>
          <div class="card-header">
            <div class="stat-item">
              <span class="stat-label">总题数</span>
              <span class="stat-value">{{ count }}</span>
            </div>
            <el-divider direction="vertical"/>
            <div class="stat-item">
              <span class="stat-label">已做题</span>
              <span class="stat-value text-primary">{{ testCount }}</span>
            </div>
            <el-divider direction="vertical"/>
            <div class="stat-item">
              <span class="stat-label">正确率</span>
              <span class="stat-value text-success">
              {{ rate }}
            </span>
            </div>
          </div>
        </template>

        <h4 class="error-title">
          <el-icon>
            <warning/>
          </el-icon>
          易错题 TOP 10
        </h4>

        <el-scrollbar height="52vh">
          <div
              v-for="(item, index) in errorMondaiList"
              :key="item.id"
              class="error-item"
          >
            <span class="item-index">{{ index + 1 }}.</span>
            <el-tooltip
                :content="item.title"
                placement="top"
                :show-after="300"
            >
        <span class="item-title">
          {{ truncate(item.title, {length: 18}) }}
        </span>
            </el-tooltip>
            <span class="error-count">
        <el-icon><circle-close/></el-icon>
        {{ item.errorCount || 0 }}
      </span>
          </div>
          <el-empty
              v-if="errorMondaiList.length === 0"
              description="暂无错题记录"
              :image-size="80"
          />
        </el-scrollbar>
      </el-card>
    </el-col>
  </el-row>

  <el-row>
    <el-button v-if="!showAnswer" type="primary" size="large" style="width: 10vw" @click="handleAnswer">提交</el-button>
    <el-button v-else type="primary" size="large" style="width: 10vw; margin-left: 10px" @click="initializePage">
      下一题
    </el-button>
  </el-row>

</template>

<script setup lang="ts">
import {ref, onMounted, reactive, watch} from 'vue';
import {CirclePlus, Search} from '@element-plus/icons-vue';
import {get, post, accessHeader} from '@/net';
import router from '@/router';
import {truncate} from "lodash-es";
import MondaiCard from "@/components/MondaiCard.vue";

let mondaiList = ref([]);
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const detailDialogVisible = ref(false)

const answer = ref('')

const showAnswer = ref(false);

let selectedRowList = ref([])
let errorMondaiList = ref([])
const count = ref(0)
const testCount = ref(0)
const errorCount = ref(0)
const rate = ref('0.00%')

let question = ref(null)
// 答案映射表
const answerMap = ref<Record<number, string | string[]>>({});


// 父组件传递对象
interface SelectionPayload {
  questionId: number;  // 新增题目ID
  type: 'single' | 'multiple';
  value: string | string[];
}

// 父组件处理函数
const handleSelection = (payload: SelectionPayload) => {
  answerMap.value[payload.questionId] = payload.type === 'single' ? [payload.value] : payload.value.filter(v => v !== '');
  ;
  console.log('answerMap:', answerMap.value);
  // 示例：提交时转换数据结构
};

// 父组件重置选择
const resetSelection = () => {
  selectedOption.value = '';
  selectedOptions.value = [];
};

let selectItem = ref('')
let label = ref('')
let itemList = ref([])

let imageList = ref([])

const imageRef = ref(null)

const selectLabel = ref('ABCDEFGHIJKLMNOPQRSTUVWXYZ')

const mondaiType = ref([
  {label: '政治理论与常识', value: 'politics'},
  {label: '言语理解与表达', value: 'speech'},
  {label: '数量关系', value: 'quantity'},
  {label: '逻辑推理', value: 'logic'},
  {label: '材料应用', value: 'material'},
])

let searchValue = reactive({
  title: '',
  type: '',
  currentPage: 1,
  pageSize: 10
})

let mondai = reactive({
  id: null,
  title: '',
  items: '',
  informations: '',
  pictures: '',
  note: '',
  type: '',
});

let fileName = ref("multipartFiles")
let headers = ref(accessHeader())
let fileList = ref([])
let postUrl = ref("http://localhost:8000/mugen/api/mondais/post/excel")
let imagePostUrl = ref("http://localhost:8000/mugen/api/mondais/post/image")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  get(`/mondais/get/order`, (data: any) => {
    console.log("question data:", data)
    question.value = data
  })
  get(`/mondais/get/count`, (data: any) => {
    count.value = data
  })
  get(`/testKirokus/get/count/test`, (data: any) => {
    testCount.value = data
  })
  get(`/errorQuestions/get/count/error`, (data: any) => {
    errorCount.value = data
  })
  get(`/mondais/get/error/mondai`, (data: any) => {
    errorMondaiList.value = data
    console.log('mondaiList:', mondaiList.value)
  })
  get(`/testKirokus/get/count/rate`, (data: any) => {
    rate.value = data
  })
  handleClose()
};

function handleDetail(row) {
  // console.log(row)
  question.value = row
  detailDialogVisible.value = true
}

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  detailDialogVisible.value = false
  mondai.id = null
  mondai.title = ''
  mondai.items = ''
  mondai.informations = ''
  mondai.pictures = ''
  mondai.note = ''
  mondai.type = ''
  selectItem.value = ''
  itemList.value = []
  answerMap.value = {}
  answer.value = ''
  showAnswer.value = false
}

const handleSearch = () => {
  searchValue.currentPage = 1
  initializePage()
};

const handleSizeChange = (val) => {
  searchValue.pageSize = val;
  initializePage();
};

const handleCurrentChange = (val) => {
  initializePage()
};

function handleAnswer() {
  console.log('answer:', answerMap.value)
  post('/mondais/post/answer', answerMap.value, (data: any) => {
    showAnswer.value = true
  })
}
</script>

<style scoped>
.stats-card {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --error-color: #F56C6C;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
}

.text-primary {
  color: var(--primary-color);
}

.text-success {
  color: var(--success-color);
}

.text-error {
  color: var(--error-color);
}

.error-title {
  display: flex;
  align-items: center;
  color: var(--error-color);
  margin: 12px 0 16px;
}

.error-title .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.error-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 4px 0;
  border-radius: 6px;
  transition: all 0.3s;
}

.error-item:hover {
  background: #f5f7fa;
  transform: translateX(4px);
}

.item-index {
  color: #909399;
  min-width: 28px;
}

.item-title {
  flex: 1;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-count {
  color: var(--error-color);
  margin-left: 12px;
  display: inline-flex;
  align-items: center;
}

.error-count .el-icon {
  margin-right: 4px;
}
</style>