<template>
  <el-row>
    <el-col :span="8">
      <el-card v-if="patient">
        <template #header>
          <span>患者信息</span>
        </template>

        <el-form label-width="100px" :model="patient" ref="patientRef" :rules="rules">
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="patient.idCard" disabled></el-input>
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="patient.name"></el-input>
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <el-select v-model="patient.gender">
              <el-option label="男" value="男"></el-option>
              <el-option label="女" value="女"></el-option>
              <el-option label="未知" value="未知"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="年龄">
            <el-input :value="calculateAge(patient.birthDate)" disabled></el-input>
          </el-form-item>
          <el-form-item label="出生日期">
            <el-date-picker v-model="patient.birthDate" disabled type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="联系方式" prop="phone">
            <el-input v-model="patient.phone"></el-input>
          </el-form-item>
          <el-form-item label="住址">
            <el-input v-model="patient.address"></el-input>
          </el-form-item>
          <el-form-item label="过敏史">
            <el-input type="textarea" rows="5" v-model="patient.allergyInfo"></el-input>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
    <el-col :span="15" style="margin-left: 20px;">
      <el-card v-if="reregistration">
        <el-text style="font-size: 14px; font-weight: bold; color: red;  margin-bottom: 20px;">挂号单: {{reregistration.id}}</el-text>
        <el-button type="primary" @click="handleAdd" style="float: right;">>保存并结束就诊</el-button>
      </el-card>
      <el-card v-if="reregistration" style="margin-top: 5px;">
        <el-form label-width="100px" :model="careHistory" ref="reregistrationRef" :rules="rules">
          <el-row>
            <el-col :span="8">
              <el-form-item label="发病日期" prop="caseDate">
                <el-date-picker v-model="careHistory.caseDate" type="date" placeholder="选择日期"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="传染性" prop="transmissible">
                <el-select v-model="careHistory.transmissible">
                  <el-option label="无" value="无"></el-option>
                  <el-option label="低" value="低"></el-option>
                  <el-option label="中" value="中"></el-option>
                  <el-option label="高" value="高"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="主诉">
            <el-input type="textarea" rows="5" v-model="careHistory.caseTitle"></el-input>
          </el-form-item>
          <el-form-item label="诊断信息">
            <el-input type="textarea" rows="3" v-model="careHistory.caseResult"></el-input>
          </el-form-item>
          <el-form-item label="医生建议">
            <el-input type="textarea" rows="3" v-model="careHistory.doctorTips"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" rows="3" v-model="careHistory.remark"></el-input>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import {ref, onMounted, reactive} from 'vue';
import {Search} from '@element-plus/icons-vue';
import {get, post, accessHeader} from '@/net';
import router from '@/router';
import {useRoute} from 'vue-router';
import { ElMessage } from 'element-plus';


let registrationList = ref([]);
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let reregistration = ref()
let patient = ref()

const patientRef = ref()
const reregistrationRef = ref()

let selectedRowList = ref([])
const count = ref(0)

const route = useRoute()

let careHistory = reactive({
  id: '',
  patientId: '',
  patientName: '',
  departmentNumber: '',
  departmentName: '',
  chType: '',
  recriveType: '',
  transmissible: '',
  careDate: '',
  caseDate: '',
  regId: '',
  regNumber: '',
  caseTitle: '',
  caseResult: '',
  doctorTips: '',
  remark: '',
})



onMounted(() => {
  if (!route.query.registrationId) {
    router.push({name: '挂号列表'})
    return
  }


  initializePage();
});

// 初始化页面数据
function initializePage() {
  get(`/his/registrations/get/${route.query.registrationId}`, (data: any) => {
    reregistration.value = data
    console.log('reregistration', reregistration.value)
    get(`/his/patients/get/${reregistration.value.patientId}`, (data: any) => {
      patient.value = data
      console.log('patient', patient.value)
    })
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  careHistory.id = ''
  careHistory.patientId = ''
  careHistory.patientName = ''
  careHistory.departmentNumber = ''
  careHistory.departmentName = ''
  careHistory.chType = ''
  careHistory.recriveType = ''
  careHistory.transmissible = ''
  careHistory.careDate =
  careHistory.caseDate = ''
  careHistory.regId = ''
  careHistory.regNumber =
  careHistory.caseTitle = ''
  careHistory.caseResult = ''
  careHistory.doctorTips = ''
  careHistory.remark = ''
}

//计算年龄
function calculateAge(birthDate: string) {
  const ageDifMs = Date.now() - new Date(birthDate).getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function handleAdd() {
  careHistory.patientId = reregistration.value.patientId
  careHistory.patientName = patient.value.name
  careHistory.departmentNumber = reregistration.value.departmentNumber
  careHistory.departmentName = reregistration.value.departmentName
  post('/his/care-historys/post', careHistory, (data: any) => {
    post(`/his/patients/put`, patient.value, (data: any) => {
      ElMessage.success('保存成功')
      initializePage()
    })
  })
}

const rules = {
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
}
</script>

<style scoped>

</style>