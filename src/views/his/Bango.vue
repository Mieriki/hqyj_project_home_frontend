<template>
  <el-card>
    <el-form :model="searchValue" :rules="rules" ref="searchFormRef" label-width="100px">
      <el-form-item label="身份证号" prop="sCIdCard">
        <el-row style="width: 100%;">
          <el-col :span="16">
            <el-input v-model="searchValue.sCIdCard" placeholder="请输入身份证号"></el-input>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="search" style="margin-left: 10px;">
              <el-icon style="margin-right: 5px;">
                <Search/>
              </el-icon>
              载入患者信息
            </el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card style="margin-top: 10px;">
    <el-form :model="patient" label-width="100px" :rules="rules" ref="patientFormRef">
      <el-row>
        <el-col :span="8">
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="patient.idCard" placeholder="请输入身份证号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="patient.phone" placeholder="请输入手机号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="patient.name" placeholder="请输入姓名"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="14">
          <el-form-item label="住址" prop="address">
            <el-input v-model="patient.address" placeholder="请输入住址"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="patient.gender" placeholder="请选择性别">
              <el-option label="男" value="男"></el-option>
              <el-option label="女" value="女"></el-option>
              <el-option label="未知" value="未知"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-card>

  <el-card style="margin-top: 10px;">
    <el-form label-width="100px" :model="eranValue" ref="eranFormRef" :rules="rules">
      <el-row>
        <el-col :span="5">
          <el-form-item label="所属科室" prop="deptNumber">
            <el-select v-model="eranValue.deptNumber" placeholder="请选择科室">
              <el-option v-for="dept in deptList" :key="dept.deptNumber" :label="dept.deptName"
                         :value="dept.deptNumber"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="挂号类型" prop="registerType">
            <el-select v-model="eranValue.registerType" placeholder="请选择挂号类型">
              <el-option v-for="type in registeredList" :key="type.id" :label="type.regName" :value="type.regName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="挂号时段" prop="sortTime">
            <el-select v-model="eranValue.sortTime" placeholder="请选择挂号时段">
              <el-option label="上午" value="上午"></el-option>
              <el-option label="下午" value="下午"></el-option>
              <el-option label="晚上" value="晚上"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="预约日期" prop="reserveDate">
            <el-date-picker v-model="eranValue.reserveDate" type="date" placeholder="请选择预约日期"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" style="margin-left: 10px;" @click="searchDoctor"><el-icon style="margin-right: 5px;"><Search/></el-icon>查询医生</el-button>
          <el-button type="warning" style="margin-left: 10px;" @click="handleClose">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-scrollbar max-height="32vh" style="padding: 0;">
      <div style="padding: 0; height: 32vh;">
        <div v-if="doctorList.length !== 0">
          <el-table :data="doctorList" style="width: 100%;">
            <el-table-column label="头像" prop="picture">
              <template #default="scope">
                <el-avatar :size="40" :src="scope.row.picture"></el-avatar>
              </template>
            </el-table-column>
            <el-table-column label="医生姓名" prop="username">
            </el-table-column>
            <el-table-column label="科室" prop="deptName">
              <template #default="scope">
                <span>{{ deptList.find(item => item.id === scope.row.deptId)?.deptName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="挂号数" prop="regCount">
            </el-table-column>
            <el-table-column label="简介" prop="introduction">
            </el-table-column>

            <el-table-column label="操作" fixed="right" width="150">
              <template #default="scope">
                <el-popconfirm
                    confirm-button-text="提交"
                    cancel-button-text="点错了"
                    :icon="InfoFilled"
                    confirm-button-type="primary"
                    icon-color="#ef0004"
                    title="确认要进行挂号操作吗?"
                    :width="200"
                    @confirm="handleReg(scope.row)"
                >
                  <template #reference>
                    <el-button type="primary" size="small">挂号</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-scrollbar>
  </el-card>
</template>

<script setup lang="ts">
// 导入依赖
import {ref, onMounted, reactive} from 'vue';
import {ElInput, ElButton, ElTable, ElTableColumn, ElPagination, ElMessage} from 'element-plus';
import {Search, CirclePlus, Remove, Download, Upload, Lock} from '@element-plus/icons-vue';
import {get, post, accessHeader} from '@/net';
import router from '@/router';
// import { useStore } from 'vuex';
import {useMeanStore} from '@/store'

let registeredList = ref([]);
let deptList = ref([]);
let doctorList = ref([]);

const searchFormRef = ref()
const patientFormRef = ref()
const eranFormRef = ref()

let searchValue = reactive({
  sCIdCard: '',
})

let eranValue = reactive({
  deptNumber: '',
  registerType: '',
  sortTime: '',
  reserveDate: '',
})

interface Patient {
  id: number | string;
  name: string,
  phone: string,
  gender: string,
  birthDate: string,
  idCard: string,
  address: string,
}

let patient: Patient = reactive({
  id: 0,
  name: '',
  phone: '',
  gender: '',
  birthDate: '',
  idCard: '',
  address: '',
})

onMounted(() => {
  initializePage();
});

function initializePage() {
  // 页面初始化
  get(`/his/registereds/get`, (data: any) => {
    registeredList.value = data;
    console.log("registeredList", registeredList.value)
  })
  get(`/sso/depts/get/his`, (data: any) => {
    deptList.value = data;
    console.log("deptList", deptList.value)
  })
  handleClose();
}

function searchDoctor() {
  eranFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 验证通过，执行搜索逻辑
      post(`/sso/users/get/doctors`, eranValue,(data: any) => {
        doctorList.value = data;
      })
    } else {
      // 验证失败，提示用户
      ElMessage.error('请正确填写信息');
    }
  });
}

function handleReg(doctor: any) {
  patientFormRef.value.validate((valid: boolean) => {
    if (valid) {
      post(`/his/registrations/post/reg/${doctor.id}?kane=${registeredList.value.find(item => item.regName === eranValue.registerType)?.regFee}&sortTime=${eranValue.sortTime}&reserveDate=${eranValue.reserveDate}`,
          patient, () => {
            ElMessage.success('挂号成功');
            initializePage();
          }, () => {
            ElMessage.error('挂号失败');
          })
    }
  })
}

function handleClose() {
  // 重置表单
  searchValue.sCIdCard = '';
  patient.idCard = '';
  patient.phone = '';
  patient.name = '';
  patient.address = '';
  patient.gender = '';
  eranValue.deptNumber = '';
  eranValue.registerType = '';
  eranValue.sortTime = '';
  eranValue.reserveDate = '';
  doctorList.value = [];
}

const rules = reactive({
  sCIdCard: [
    {
      pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
      message: '身份证号格式不正确',
      trigger: 'blur'
    },
    {min: 15, max: 18, message: '身份证号长度必须为15或18位', trigger: 'blur'},
  ],
  idCard: [
    {required: true, message: '请输入身份证号', trigger: 'blur'},
    {
      pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
      message: '身份证号格式不正确',
      trigger: 'blur'
    },
    {min: 15, max: 18, message: '身份证号长度必须为15或18位', trigger: 'blur'},
  ],
  phone: [
    {required: true, message: '请输入手机号', trigger: 'blur'},
    {pattern: /^\d{11}$/, message: '手机号必须为数字', trigger: 'blur'},
    {min: 11, max: 11, message: '手机号长度必须为11位', trigger: 'blur'},
  ],
  name: [
    {required: true, message: '请输入姓名', trigger: 'blur'},
    {min: 2, max: 20, message: '姓名长度必须在2-20之间', trigger: 'blur'},
  ],
  address: [
    {min: 2, max: 50, message: '住址长度必须在2-50之间', trigger: 'blur'},
  ],
  deptNumber: [
    {required: true, message: '请选择科室', trigger: 'blur'},
  ],
  registerType: [
    {required: true, message: '请选择挂号类型', trigger: 'blur'},
  ],
  sortTime: [
    {required: true, message: '请选择挂号时段', trigger: 'blur'},
  ],
  reserveDate: [
    {required: true, message: '请选择预约日期', trigger: 'blur'},
  ],
});

function search() {
  searchFormRef.value.validate((valid: boolean) => {
    if (valid) {
      if (searchValue.sCIdCard.length !== 15 && searchValue.sCIdCard.length !== 18) {
        ElMessage.warning('请输入正确的身份证号');
        return;
      }
      get(`/his/patients/get/id-card/${searchValue.sCIdCard}`, (data: any) => {
        if (data) {
          patient.id = data.id;
          patient.name = data.name;
          patient.phone = data.phone;
          patient.gender = data.gender;
          patient.birthDate = data.birthDate;
          patient.idCard = data.idCard;
          patient.address = data.address;
        } else {
          ElMessage.warning('未找到该患者信息');
          patient.idCard = searchValue.sCIdCard;
        }
      })
    } else {
      ElMessage.error('请输入正确的身份证号');
    }
  });
}

</script>

<style scoped>

</style>
