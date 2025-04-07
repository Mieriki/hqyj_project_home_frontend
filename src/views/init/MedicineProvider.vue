<template>
  <div style="margin-bottom: 10px;">
    <el-row>
      <el-input v-model="searchValue.providerName" style="width: 240px;" size="small" placeholder="请输入供应商名称" type="text">
        <template #prepend>
          <el-button @click="handleSearch" :icon="Search" />
        </template>
      </el-input>
<!--      <el-input v-model="searchValue.keyword" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入关键字" type="text"></el-input>-->
      <el-button  @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small" type="primary">搜索</el-button>

      <el-button type="primary" style="width: 80px; height: 32px;" size="small" @click="nextAdd">新增<el-icon><CirclePlus /></el-icon></el-button>

      <el-popconfirm
          confirm-button-text="删除"
          cancel-button-text="点错了"
          :icon="InfoFilled"
          confirm-button-type="danger"
          icon-color="#ef0004"
          title="确认要删除此这些客户?"
          :width="200"
          @confirm="handleDeleteList()"
      >
        <template #reference>
          <el-button type="danger" style="margin-left: 5px; width: 80px; height: 32px;" size="small" >批量删除<el-icon><Remove /></el-icon></el-button>
        </template>
      </el-popconfirm>

      <el-upload
          list-type="text"
          accept=".xls, .xlsx"
          :file-list="fileList"
          :headers="headers"
          :action="postUrl"
          :multiple="false"
          :show-file-list="false"
          :on-success="uploadSuccess">
        <el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small">导入<el-icon><Download /></el-icon></el-button>
      </el-upload>
      <el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small" @click="exportData">导出<el-icon><Upload /></el-icon></el-button>
    </el-row>
  </div>

  <el-table :data="providerList" border @selection-change="handleSelectionChange" max-height=525>
    <el-table-column type="selection" width="55"/>
    <el-table-column prop="providerName" label="供应商名称" width="200"></el-table-column>
    <el-table-column prop="providerCode" label="供应商编码" width="150"></el-table-column>
    <el-table-column prop="contactName" label="联系人" width="150"></el-table-column>
    <el-table-column prop="contactTel" label="联系电话" width="150"></el-table-column>
    <el-table-column prop="bankAccount" label="银行账号" width="185"></el-table-column>
    <el-table-column prop="providerAddress" label="供应商地址" width="200"></el-table-column>
    <el-table-column label="操作" fixed="right">
      <template #default="scope">
        <el-button size="small" type="warning" @click="handleEdit(scope.row)">编辑</el-button>
        <el-popconfirm
            confirm-button-text="删除"
            cancel-button-text="点错了"
            :icon="InfoFilled"
            confirm-button-type="danger"
            icon-color="#ef0004"
            title="确认要删除此客户?"
            :width="200"
            @confirm="handleDelete(scope.row)"
        >
          <template #reference>
            <el-button type="danger" size="small">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>

  <div style="padding: 10px 0; position: absolute; bottom: 2%;">
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        v-model:current-page="searchValue.currentPage"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="searchValue.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="count">
    </el-pagination>
  </div>

  <el-dialog
      v-if="addDialogVisible"
      v-model="addDialogVisible"
      width=620
      :before-close="handleClose">
    <el-form :model="provider" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="供应商名称" prop="providerName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="provider.providerName" placeholder="请输入供应商名称"></el-input>
      </el-form-item>
      <el-form-item label="供应商编码" prop="providerCode" style="width: 505px; margin-top: 20px;">
        <el-input v-model="provider.providerCode" placeholder="请输入供应商编码"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="contactName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="provider.contactName" placeholder="请输入联系人"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="contactTel" style="width: 505px; margin-top: 20px;">
        <el-input v-model="provider.contactTel" placeholder="请输入联系电话"></el-input>
      </el-form-item>
      <el-form-item label="银行账号" prop="bankAccount" style="width: 505px; margin-top: 20px;">
        <el-input v-model="provider.bankAccount" placeholder="请输入银行账号"></el-input>
      </el-form-item>
      <el-form-item label="供应商地址" prop="providerAddress" style="width: 505px; margin-top: 20px;">
        <el-input v-model="provider.providerAddress" placeholder="请输入供应商地址"></el-input>
      </el-form-item>
      <el-row style="display: flex; justify-content: center; align-items: center; ">
        <el-button type="primary" style="width: 200px; margin-top: 20px;" @click="addSubmitForm">新增</el-button>
        <el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消</el-button>
      </el-row>
    </el-form>
  </el-dialog>

  <el-dialog
      v-if="editDialogVisible"
      v-model="editDialogVisible"
      width=620
      :before-close="handleClose">
    <el-form :model="provider" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="供应商名称" prop="providerName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="provider.providerName" placeholder="请输入供应商名称"></el-input>
      </el-form-item>
      <el-form-item label="供应商编码" prop="providerCode" style="width: 505px; margin-top: 20px;">
        <el-input v-model="provider.providerCode" placeholder="请输入供应商编码" disabled></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="contactName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="provider.contactName" placeholder="请输入联系人"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="contactTel" style="width: 505px; margin-top: 20px;">
        <el-input v-model="provider.contactTel" placeholder="请输入联系电话"></el-input>
      </el-form-item>
      <el-form-item label="银行账号" prop="bankAccount" style="width: 505px; margin-top: 20px;">
        <el-input v-model="provider.bankAccount" placeholder="请输入银行账号"></el-input>
      </el-form-item>
      <el-form-item label="供应商地址" prop="providerAddress" style="width: 505px; margin-top: 20px;">
        <el-input v-model="provider.providerAddress" placeholder="请输入供应商地址"></el-input>
      </el-form-item>
      <el-row style="display: flex; justify-content: center; align-items: center; ">
        <el-button type="primary" style="width: 200px; margin-top: 20px;" @click="editSubmitForm">修改</el-button>
        <el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消</el-button>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import {CirclePlus, Search} from '@element-plus/icons-vue';
import { get, post, accessHeader } from '@/net';
import router from '@/router';

let providerList = ref([]);
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let selectedRowList = ref([])
const count = ref(0)


let searchValue = reactive({
  providerName: '',
  currentPage: 1,
  pageSize: 10
})

interface Provider {
  id: number,
  providerCode: string,
  providerName: string,
  contactName: string,
  contactTel: string,
  bankAccount: string,
  providerAddress: string,
  status: string,
}

let provider :Provider  = reactive({
  id: 0,
  providerCode: '',
  providerName: '',
  contactName: '',
  contactTel: '',
  bankAccount: '',
  providerAddress: '',
  status: '',
})

let fileName = ref("multipartFiles")
let headers =ref(accessHeader())
let fileList =ref([])
let postUrl = ref("http://mugen.net/mugen/api/erp/providers/post/excel")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  post(`/erp/providers/get`, searchValue , (data: any) => {
    providerList.value = data.providerList
    count.value = Number(data.count)
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  provider.id = 0
  provider.providerCode = ''
  provider.providerName = ''
  provider.contactName = ''
  provider.contactTel = ''
  provider.bankAccount = ''
  provider.providerAddress = ''
  provider.status = ''
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

function handleSelectionChange(selection) {
  selectedRowList.value = selection;
};

function nextAdd() {
  addDialogVisible.value = true
}

function handleEdit(row) {
  provider.id = row.id
  provider.providerCode = row.providerCode
  provider.providerName = row.providerName
  provider.contactName = row.contactName
  provider.contactTel = row.contactTel
  provider.bankAccount = row.bankAccount
  provider.providerAddress = row.providerAddress
  provider.status = row.status
  editDialogVisible.value = true
}

function addSubmitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      post(`/erp/providers/post`, provider, () => {
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
    if(valid) {
      post('/erp/providers/put', provider, () => {
        ElMessage.success('修改成功!')
        initializePage()
      })
    } else {
      ElMessage.warning('请完整填写注册表单内容!')
    }
  });
}

function handleDelete(row) {
  get(`/erp/providers/delete/${row.id}`, () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function handleDeleteList() {
  post(`/erp/providers/delete`, selectedRowList.value.map(row => row.id), () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function exportData() {
  const headers = accessHeader();

  fetch('http://mugen.net/mugen/api/erp/providers/get/excel', {
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
        a.download = `Provider_${new Date().toLocaleString()}.xlsx`; // 设置文件名
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

let rules = {
  providerName: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  providerCode: [
    { required: true, message: '请输入供应商编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  contactName: [
    { required: true, message: '请输入联系人', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  contactTel: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[0-9]{3,12}-[0-9]{5,12}$|^1[34578]\d{9}$/, message: '请输入正确的电话号码', trigger: 'blur' }
  ],
  bankAccount: [
    { required: true, message: '请输入银行账号', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[0-9]+$/, message: '银行账号只能为数字', trigger: 'blur' }
  ],
  providerAddress: [
    { required: true, message: '请输入供应商地址', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],

};
</script>

<style scoped>
</style>