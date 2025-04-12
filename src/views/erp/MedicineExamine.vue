<template>
  <div style="margin-bottom: 10px;">
    <el-row>
      <el-input v-model="searchValue.contact" style="width: 240px;" size="small" placeholder="请输入联系人" type="text">
        <template #prepend>
          <el-button @click="handleSearch" :icon="Search" />
        </template>
      </el-input>
      <el-input v-model="searchValue.address" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入地址" type="text"></el-input>
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

<!--      <el-upload-->
<!--          list-type="text"-->
<!--          accept=".xls, .xlsx"-->
<!--          :file-list="fileList"-->
<!--          :headers="headers"-->
<!--          :action="postUrl"-->
<!--          :multiple="false"-->
<!--          :show-file-list="false"-->
<!--          :on-success="uploadSuccess">-->
<!--        <el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small">导入<el-icon><Download /></el-icon></el-button>-->
<!--      </el-upload>-->
      <el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small" @click="exportData">导出<el-icon><Upload /></el-icon></el-button>
    </el-row>
  </div>

  <el-table :data="purchaseList" border @selection-change="handleSelectionChange" max-height=525>
    <el-table-column type="selection" width="55"/>
    <el-table-column prop="applyUserName" label="申请人姓名" width="200"></el-table-column>
    <el-table-column prop="tradeTotalAmount" label="交易总金额" width="120"></el-table-column>
    <el-table-column prop="auditMsg" label="审核信息" width="150"></el-table-column>
    <el-table-column prop="status" label="状态" width="200">
      <template #default="scope">
        {{dictDataList.find((item) => item.dictCode === scope.row.status)?.dictName}}
      </template>
    </el-table-column>
    <el-table-column prop="info" label="信息" width="300"></el-table-column>
    <el-table-column label="操作" fixed="right">
      <template #default="scope">
<!--        <el-button size="small" type="warning" @click="handleEdit(scope.row)">编辑</el-button>-->
<!--        <el-popconfirm-->
<!--            confirm-button-text="删除"-->
<!--            cancel-button-text="点错了"-->
<!--            :icon="InfoFilled"-->
<!--            confirm-button-type="danger"-->
<!--            icon-color="#ef0004"-->
<!--            title="确认要删除此客户?"-->
<!--            :width="200"-->
<!--            @confirm="handleDelete(scope.row)"-->
<!--        >-->
<!--          <template #reference>-->
<!--            <el-button type="danger" size="small">删除</el-button>-->
<!--          </template>-->
<!--        </el-popconfirm>-->

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
    <el-form :model="purchases" :rules="rules" ref="formRef" label-width="100px">

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
    <el-form :model="purchases" :rules="rules" ref="formRef" label-width="100px">
      <el-table :data="purchaseDetailList" style="width: 100%;">
        <el-table-column prop="medicinesId" label="药品ID" width="250" />
        <el-table-column prop="medicinesName" label="药品名称" width="220" />
        <el-table-column prop="size" label="数量" width="100" />
      </el-table>
      <el-form-item label="审核信息" prop="massage" style="width: 505px; margin-top: 20px;">
        <el-input v-model="purchases.massage" placeholder="请输入审核信息" type="textarea" rows="4" ></el-input>
      </el-form-item>
      <el-row style="display: flex; justify-content: center; align-items: center; ">
        <el-button type="primary" style="width: 200px; margin-top: 20px;" @click="editSubmitForm('通过')">通过</el-button>
        <el-button type="warning" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="editSubmitForm('拒绝')">拒绝</el-button>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { get, post, accessHeader } from '@/net';
import router from '@/router';

let purchaseList = ref([]);
let dictDataList = ref([])
let purchaseDetailList = ref([])

const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let selectedRowList = ref([])
const count = ref(0)

let massage = ref('')

let searchValue = reactive({
  status: '',
  currentPage: 1,
  pageSize: 10
})

interface Purchases {
  id: number
  tradeTotalAmount: number
  applyUserId: number
  applyUserName: string
  storageOptUser: string
  storageOptTime: string
  auditMsg: string
  status: string
  info: string
  massage: string
}

let purchases : Purchases = reactive({
  id: 0,
  tradeTotalAmount: 0,
  applyUserId: 0,
  applyUserName: '',
  storageOptUser: '',
  storageOptTime: '',
  auditMsg: '',
  status: '',
  info: '',
  massage: ''
})

let fileName = ref("multipartFiles")
let headers =ref(accessHeader())
let fileList =ref([])
let postUrl = ref("http://localhost:8000/mugen/api/customers/post/excel")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  post(`/erp/purchases/get/examine`,searchValue , (data: any) => {
    purchaseList.value = data.purchaseList
    count.value = Number(data.count)
  })
  get('/dict/dict-datas/get/list/medicine-ins-flow', (data: any) => {
    dictDataList.value = data
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  purchases.id = 0
  purchases.tradeTotalAmount = 0
  purchases.applyUserId = 0
  purchases.applyUserName = ''
  purchases.storageOptUser = ''
  purchases.storageOptTime = ''
  purchases.auditMsg = ''
  purchases.status = ''
  purchases.info = ''
  massage.value = ''
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
  purchases.id = row.id
  purchases.tradeTotalAmount = row.tradeTotalAmount
  purchases.applyUserId = row.applyUserId
  purchases.applyUserName = row.applyUserName
  purchases.storageOptUser = row.storageOptUser
  purchases.storageOptTime = row.storageOptTime
  purchases.auditMsg = row.auditMsg
  purchases.status = row.status
  purchases.info = row.info
  get(`/erp/purchase-details/get/purchase/${row.id}`, (data: any) => {
    purchaseDetailList.value = data
  })
  editDialogVisible.value = true
}

function addSubmitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      post(`/erp/purchases/post`, purchases, () => {
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

function editSubmitForm(flag : number) {
  formRef.value.validate((valid) => {
    if(valid) {
      post(`/erp/purchases/put/examine`, {
        purchaseId: purchases.id,
        flag: flag,
        massage: purchases.massage
      }, () => {
        ElMessage.success('审核成功!')
        initializePage()
      })
    } else {
      ElMessage.warning('请完整填写内容!')
    }
  });
}

function handleDelete(row) {
  get(`/erp/purchases/delete/${row.id}`, () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function handleDeleteList() {
  post(`/erp/purchases/delete`, selectedRowList.value.map(row => row.id), () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function exportData() {
  const headers = accessHeader();

  fetch(`http://mugen.net/mugen/api/erp/purchases/get/excel`, {
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
        a.download = `User_${new Date().toLocaleString()}.xlsx`; // 设置文件名
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
  massage: [
    { required: true, message: '请输入审核信息', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
};
</script>

<style scoped>
</style>