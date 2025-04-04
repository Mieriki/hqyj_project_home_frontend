<template>
  <div style="margin-bottom: 10px;">
    <el-row>
      <div>
        <el-input v-model="searchValue.username" style="width: 400px; " size="small" placeholder="请输入用户名"
                  type="text">
          <template #prepend>
            <el-button @click="handleSearch" :icon="Search"/>
          </template>
          <template #append>
            <el-select v-model="searchValue.businessType" filterable placeholder="操作类型" style="width: 140px;">
              <el-option key="" label="无" value=""></el-option>
              <el-option v-for="item in bussSet" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </template>
        </el-input>
      </div>
      <el-button @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small"
                 type="primary">搜索
      </el-button>
      <el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small"
                 @click="exportData">导出
        <el-icon>
          <Upload/>
        </el-icon>
      </el-button>
    </el-row>
  </div>

  <el-table :data="logList" border :row-class-name="tableRowClassName" max-height=525>
    <el-table-column prop="userName" label="用户名" width="100">
    </el-table-column>
    <el-table-column prop="businessType" label="操作模块" width="125">
      <template #default="scope">
        <el-tag type="primary"> {{ scope.row.businessType }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="operation" label="操作类型" width="120"></el-table-column>
    <el-table-column prop="method" label="方法名" width="220">
      <template #default="scope">
        {{ scope.row.method.substring(0, 25) + "..." }}
      </template>
    </el-table-column>
    <el-table-column prop="params" label="参数" width="225">
      <template #default="scope">
        {{ scope.row.params.substring(0, 22) + "..." }}
      </template>
    </el-table-column>
    <el-table-column prop="ipAddr" label="地址" width="120">
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" width="180">
      <template #default="scope">
        {{ formatISODate(scope.row.createDate) }}
      </template>
    </el-table-column>
    <el-table-column prop="time" label="时间" width="120">
      <template #default="scope">
        {{ scope.row.operTime + " 毫秒" }}
      </template>
    </el-table-column>
    <el-table-column label="操作" fixed="right">
      <template #default="scope">
        <el-button size="small" type="primary" plain @click="handleEdit(scope.row)">
          <el-icon>
            <View/>
          </el-icon>
          详情
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <div style="padding: 10px 0; position: absolute; bottom: 2%;">
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                   v-model:current-page="searchValue.currentPage" :page-sizes="[5, 10, 15, 20]"
                   :page-size="searchValue.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="count">
    </el-pagination>
  </div>

  <el-dialog
      v-if="editDialogVisible"
      v-model="editDialogVisible"
      width="720px"
      :before-close="handleClose"
      style="padding: 20px;"
  >
    <el-descriptions
        title="日志详情"
        :column="2"
        size="default"
        style="margin-left: 20px; margin-right: 20px; width: 100%;"
    >
      <el-descriptions-item label="用户名" label-width="120px">
        <div style="word-break: break-all; white-space: pre-wrap;">{{ log.userName }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="操作模块" label-width="120px">
        <el-tag type="primary">{{ log.businessType }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="操作类型" label-width="120px">
        <div style="word-break: break-all; white-space: pre-wrap;">{{ log.operation }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="方法名" label-width="120px">
        <div style="word-break: break-all; white-space: pre-wrap;">{{ log.method }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="参数" :span="2" label-width="120px">
        <div style="word-break: break-all; white-space: pre-wrap;">{{ log.params }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="地址" label-width="120px">
        <div style="word-break: break-all; white-space: pre-wrap;">{{ log.ipAddr }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="花费时间" label-width="120px">
        <div style="word-break: break-all; white-space: pre-wrap;">{{ log.operTime + " 毫秒" }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间" label-width="120px">
        <div style="word-break: break-all; white-space: pre-wrap;">{{ log.createDate }}</div>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, onMounted, reactive, computed} from 'vue';
import {Search} from '@element-plus/icons-vue';
import {get, post, accessHeader} from '@/net';
import router from '@/router';

let logList = ref([]);
let bussSet = ref([])
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let selectedRowList = ref([])
const count = ref(0)

let searchValue = reactive({
  username: '',
  businessType: '',
  operation: '',
  currentPage: 1,
  pageSize: 10
})

interface Log {
  id: number
  operation: string
  businessType: string
  method: string
  params: string
  userId: number
  userName: string
  ipAddr: string
  operTime: number
  createDate: string
}

let log: Log = reactive({
  id: 0,
  operation: '',
  businessType: '',
  method: '',
  params: '',
  userId: 0,
  userName: '',
  ipAddr: '',
  operTime: 0,
  createDate: ''
})

let fileName = ref("multipartFiles")
let headers = ref(accessHeader())
let fileList = ref([])
let postUrl = ref("http://mieriki.net/sso/mugen/api/operation-logs/post/excel")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  post(`/sso/operation-logs/get`, searchValue, (data) => {
    logList.value = data.operationLogList
    count.value = Number(data.count)
  })
  get(`/sso/operation-logs/get/business-type`, (data) => {
    bussSet.value = data
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
}

const handleSearch = () => {
  searchValue.currentPage = 1
  initializePage()
};

const handleSizeChange = (val: number) => {
  searchValue.pageSize = val;
  initializePage();
};

const handleCurrentChange = (val) => {
  initializePage()
};

function handleSelectionChange(selection: never[]) {
  selectedRowList.value = selection;
};

function handleEdit(row: Log) {
  log = row
  editDialogVisible.value = true
}

function exportData() {
  window.open(`http://mieriki.net/mugen/api/sso/operation-logs/get/excel`)
}

function formatISODate(isoDateString: string | number | Date) {
  const date = new Date(isoDateString);

  // 获取年份的后两位
  const year = date.getFullYear().toString();

  // 获取月份和日期，确保两位数
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // 获取小时、分钟和秒，确保两位数
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const tableRowClassName = ({row, rowIndex}: {
  row: Log,
  rowIndex: number
}) => {
  if (row.operTime > 1000) {
    return 'warning-row'
  } else if (row.operTime > 3600) {
    return 'error-row'
  }
  return ''
}
</script>

<style scoped>
</style>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
.el-table .error-row {
  --el-table-tr-bg-color: var(--el-color-error-light-9);
}
.el-table .handler {
  --el-table-tr-bg-color: var(--el-color-black);
}
</style>