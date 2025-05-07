<template>
  <div style="margin-bottom: 10px;">
<!--    <el-row>-->
<!--      <el-input v-model="searchValue.name" style="width: 240px;" size="small" placeholder="请输入医生姓名" type="text">-->
<!--        <template #prepend>-->
<!--          <el-button @click="handleSearch" :icon="Search"/>-->
<!--        </template>-->
<!--      </el-input>-->
<!--      &lt;!&ndash;      <el-input v-model="searchValue.address" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入地址" type="text"></el-input>&ndash;&gt;-->
<!--      <el-button @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small" type="primary">-->
<!--        搜索-->
<!--      </el-button>-->

      <!--      <el-button type="primary" style="width: 80px; height: 32px;" size="small" @click="nextAdd">新增<el-icon><CirclePlus /></el-icon></el-button>-->

      <!--      <el-popconfirm-->
      <!--          confirm-button-text="删除"-->
      <!--          cancel-button-text="点错了"-->
      <!--          :icon="InfoFilled"-->
      <!--          confirm-button-type="danger"-->
      <!--          icon-color="#ef0004"-->
      <!--          title="确认要删除此这些客户?"-->
      <!--          :width="200"-->
      <!--          @confirm="handleDeleteList()"-->
      <!--      >-->
      <!--        <template #reference>-->
      <!--          <el-button type="danger" style="margin-left: 5px; width: 80px; height: 32px;" size="small" >批量删除<el-icon><Remove /></el-icon></el-button>-->
      <!--        </template>-->
      <!--      </el-popconfirm>-->

<!--      <el-upload-->
<!--          list-type="text"-->
<!--          accept=".xls, .xlsx"-->
<!--          :file-list="fileList"-->
<!--          :headers="headers"-->
<!--          :action="postUrl"-->
<!--          :multiple="false"-->
<!--          :show-file-list="false"-->
<!--          :on-success="uploadSuccess">-->
<!--        <el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small">导入-->
<!--          <el-icon>-->
<!--            <Download/>-->
<!--          </el-icon>-->
<!--        </el-button>-->
<!--      </el-upload>-->
<!--      <el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small" @click="exportData">导出-->
<!--        <el-icon>-->
<!--          <Upload/>-->
<!--        </el-icon>-->
<!--      </el-button>-->
<!--    </el-row>-->
  </div>

  <el-scrollbar max-height="75vh">
    <el-card>
      <div class="schedule-container">
        <table class="schedule-table">
          <tr class="table-header">
            <th><span>时段</span></th>
            <th v-for="day in weekdays" :key="day"><span>{{ day }}</span></th>
          </tr>
          <tr
              v-for="(timeSlot, index) in timeSlots"
              :key="timeSlot"
              :class="['table-row', { 'zebra-stripe': index % 2 === 0 }]"
          >
            <td class="time-slot"><span>{{ timeSlot }}</span></td>
            <td
                v-for="day in weekdays"
                :key="day"
                class="schedule-cell"
            >
              <div class="cell-content">
                {{ getSchedulingInfo(day, timeSlot) }}
              </div>
            </td>
          </tr>
        </table>
      </div>
    </el-card>
  </el-scrollbar>

  <el-dialog
      v-if="addDialogVisible"
      v-model="addDialogVisible"
      width=620
      :before-close="handleClose">

  </el-dialog>

  <el-dialog
      v-if="editDialogVisible"
      v-model="editDialogVisible"
      width=1250
      :before-close="handleClose">
    <div class="schedule-container" style="margin-top: 20px;">
      <table class="schedule-table">
        <tr class="table-header">
          <th><span>时段</span></th>
          <th v-for="day in weekdays" :key="day"><span>{{ day }}</span></th>
        </tr>
        <tr
            v-for="(timeSlot, index) in timeSlots"
            :key="timeSlot"
            :class="['table-row', { 'zebra-stripe': index % 2 === 0 }]"
        >
          <td class="time-slot"><span>{{ timeSlot }}</span></td>
          <td
              v-for="day in weekdays"
              :key="day"
              class="schedule-cell"
          >
            <div class="cell-content">
              <el-select v-model="getUpdataScheduling(doctor.id, day, timeSlot).schedulingType">
                <el-option label="休息" value="休息"></el-option>
                <el-option label="门诊" value="门诊"></el-option>
                <el-option label="急诊" value="急诊"></el-option>
              </el-select>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, onMounted, reactive} from 'vue';
import {Search} from '@element-plus/icons-vue';
import {get, post, accessHeader} from '@/net';
import router from '@/router';

let docterList = ref([]);
let deptList = ref([]);
let schedulingList = ref([]);
let schedulingUpdateList = ref([]);

const editDialogVisible = ref(false);
const addDialogVisible = ref(false);
let selectedRowList = ref([])
const count = ref(0)

let searchValue = reactive({
  name: '',
})

import {computed} from 'vue';

const weekdays = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
const timeSlots = ["上午", "下午", "晚上"];

interface Scheduling {
  id: number;
  userId: string | number;
  schedulingDay: "星期一" | "星期二" | "星期三" | "星期四" | "星期五" | "星期六" | "星期日";
  schedulingType: "上午" | "下午" | "晚上";
  subsectionType: "门诊" | "急诊";
}

let scheduling: Scheduling = reactive({
  id: null,
  userId: null,
  schedulingDay: null,
  schedulingType: null,
  subsectionType: null,
})

let doctor = ref(null);

// 创建一个计算属性来存储每个医生的排班信息
const doctorSchedulingInfo = computed(() => {
  return schedulingList.value.reduce((acc, scheduling) => {
    if (!acc[scheduling.schedulingDay]) {
      acc[scheduling.schedulingDay] = {};
    }
    acc[scheduling.schedulingDay][scheduling.subsectionType] = scheduling.schedulingType;
    return acc;
  }, {});
});

function getSchedulingInfo(schedulingDay, subsectionType) {
  const schedulingType = doctorSchedulingInfo.value[schedulingDay]?.[subsectionType];
  return schedulingType !== undefined ? schedulingType : '休息';
}

let fileName = ref("multipartFiles")
let headers = ref(accessHeader())
let fileList = ref([])
let postUrl = ref("http://localhost:8000/mugen/api/customers/post/excel")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  get(`/sso/depts/get`, (data) => {
    deptList.value = data
  })
  get(`/his/schedulings/get/me`, (data) => {
    schedulingList.value = data
  })
};

let admin = reactive({
  id: null,
  account: '',
  username: '',
  password: '',
  deptId: null,
  userType: null,
  gender: 0,
  birthDate: null,
  picture: '',
  education: '',
  phone: '',
  email: '',
  strong: '',
  introduction: '',
  userRank: null,
  lastLoginIp: '',
  lastLoginDate: null,
  status: '',
  schedulingFlag: null,
});

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

function handleClose() {
  post(`/his/schedulings/put/schedulings?doctorId=${doctor.value.id}`, schedulingUpdateList.value.filter(scheduling => scheduling.schedulingType !== "休息"), () => {
    schedulingUpdateList.value = []
    doctor.value = null
    ElMessage.success('保存成功!')
    initializePage()
  })
  addDialogVisible.value = false
  editDialogVisible.value = false
}

function handleSelectionChange(selection) {
  selectedRowList.value = selection;
};

function nextAdd() {
  addDialogVisible.value = true
}

function handleEdit(item) {
  schedulingUpdateList.value = []
  doctor.value = item
  weekdays.forEach(day => {
    timeSlots.forEach(time => {
      schedulingUpdateList.value.push(getScheduling(item.id, day, time))
    })
  })
  console.log("schedulingUpdateList", schedulingUpdateList.value)
  editDialogVisible.value = true
}

function addSubmitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      post(`/customers/post`, customer, () => {
        ElMessage.success('添加成功!')
        initializePage()
      })
    } else {
      // 表单验证失败，不执行提交操作
      ElMessage.warning('请完整填写注册表单内容!');
      return false;
    }
  });
};

function editSubmitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      post('/customers/put', customer, () => {
        ElMessage.success('修改成功!')
        initializePage()
      })
    } else {
      ElMessage.warning('请完整填写注册表单内容!')
    }
  });
}

function handleDelete(row) {
  get(`/customers/delete/${row.id}`, () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function handleDeleteList() {
  post(`/customers/delete`, selectedRowList.value.map(row => row.id), () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function exportData() {
  const headers = accessHeader();

  fetch(`http://mugen.net/mugen/api/his/schedulings/get/excel`, {
    method: 'GET',
    headers: headers // 确保accessHeader()返回正确的headers对象
  })
      .then(response => {
        if (response.status === 401) {
          alert('登录过期，请重新登录');
          // 这里可以跳转到登录页
          return;
        }
        if (!response.ok) throw new Error('导出失败');
        return response.blob();
      })
      .then(blob => {
        // 创建临时链接触发下载
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Scheduling_${new Date().toLocaleString()}.xlsx`; // 设置文件名
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // 释放内存
      })
      .catch(error => {
        console.error('导出错误:', error);
        alert('导出失败，请稍后重试');
      });
}

function uploadSuccess(data) {
  if (data.code === 200) {
    ElMessage.success("上传成功!")
    initializePage();
  } else (
      ElMessage.warning(data.message)
  )
}

function getScheduling(schedulingDay, subsectionType) {
  let scheduling = schedulingList.value.find(scheduling => scheduling.userId === userId && scheduling.schedulingDay === schedulingDay && scheduling.subsectionType === subsectionType)
  return scheduling ? {
    id: null,
    userId: userId,
    schedulingDay: schedulingDay,
    schedulingType: scheduling.schedulingType,
    subsectionType: subsectionType
  } : {
    id: null,
    userId: userId,
    schedulingDay: schedulingDay,
    schedulingType: "休息",
    subsectionType: subsectionType
  }
}

function getUpdataScheduling(userId, schedulingDay, subsectionType) {
  return schedulingUpdateList.value.find(scheduling => scheduling.userId === userId && scheduling.schedulingDay === schedulingDay && scheduling.subsectionType === subsectionType)
}

let rules = {};
</script>

<style scoped>
.schedule-container {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.table-header {
  background-color: #2c3e50;
  color: white;
}

.table-header th {
  padding: 16px 20px;
  font-weight: 600;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.table-header th:first-child {
  border-radius: 8px 0 0 0;
}

.table-header th:last-child {
  border-right: none;
  border-radius: 0 8px 0 0;
}

.time-slot {
  background-color: #f8f9fa;
  font-weight: 500;
  color: #rgb(51.2, 126.4, 204);
  padding: 14px 20px;
  border-right: 1px solid #e0e0e0;
}

.schedule-cell {
  padding: 12px;
  border: 1px solid #e0e0e0;
  text-align: center;
  transition: background-color 0.2s;
}

.schedule-cell:hover {
  background-color: #f5f7fa;
}

.zebra-stripe {
  background-color: #fdfdfd;
}

.table-row:not(.zebra-stripe) {
  background-color: white;
}

.cell-content {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-header th,
  .time-slot {
    padding: 12px 15px;
    font-size: 14px;
  }

  .schedule-cell {
    padding: 8px;
  }
}
</style>