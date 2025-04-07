<template>
  <div style="margin-bottom: 10px;">
    <el-row>
      <el-input v-model="searchValue.deptName" style="width: 240px;" size="small" placeholder="请输入科室名称" type="text">
        <template #prepend>
          <el-button @click="handleSearch" :icon="Search" />
        </template>
      </el-input>
<!--      <el-input v-model="searchValue.address" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入地址" type="text"></el-input>-->
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

  <el-table :data="deptList" border @selection-change="handleSelectionChange" max-height=525>
    <el-table-column type="selection" width="55"/>
    <el-table-column prop="deptName" label="科室名称" width="200">
    </el-table-column>
    <el-table-column prop="deptNumber" label="科室编号" width="180">
    </el-table-column>
    <el-table-column prop="regNumber" label="当前挂号量" width="150">
    </el-table-column>
    <el-table-column prop="deptLeader" label="负责人" width="150">
    </el-table-column>
    <el-table-column prop="leaderPhone" label="负责人电话" width="200">
    </el-table-column>
    <el-table-column prop="status" label="状态" width="100">
      <template #default="scope">
        {{ statusList.find((item) => item.dictCode === scope.row.status)?.dictName }}
      </template>
    </el-table-column>
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
    <el-table-column label="排序" width="120" fixed="right">
      <template #default="scope">
        <el-row>
          <IconButton :show-shine="false" @click="sortUp(scope.row)" style="margin-right: 10px;"><ArrowUpBold /></IconButton>
          <IconButton :show-shine="false" @click="sortDown(scope.row)"><ArrowDownBold /></IconButton>
        </el-row>
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
    <el-form :model="dept" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="科室名称" prop="deptName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dept.deptName"></el-input>
      </el-form-item>
      <el-form-item label="科室编号" prop="deptNumber" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dept.deptNumber"></el-input>
      </el-form-item>
      <el-form-item label="部门类型" prop="status" style="width: 505px; margin-top: 20px;">
        <el-select v-model="dept.status" placeholder="请选择">
          <el-option v-for="item in statusList" :key="item.dictCode" :label="item.dictName" :value="item.dictCode"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="科室负责人" prop="deptLeader" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dept.deptLeader"></el-input>
      </el-form-item>
      <el-form-item label="负责人电话" prop="leaderPhone" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dept.leaderPhone"></el-input>
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
    <el-form :model="dept" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="科室名称" prop="deptName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dept.deptName"></el-input>
      </el-form-item>
      <el-form-item label="科室编号" prop="deptNumber" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dept.deptNumber" disabled></el-input>
      </el-form-item>
      <el-form-item label="部门类型" prop="status" style="width: 505px; margin-top: 20px;">
        <el-select v-model="dept.status" placeholder="请选择">
          <el-option v-for="item in statusList" :key="item.dictCode" :label="item.dictName" :value="item.dictCode"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="科室负责人" prop="deptLeader" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dept.deptLeader"></el-input>
      </el-form-item>
      <el-form-item label="负责人电话" prop="leaderPhone" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dept.leaderPhone"></el-input>
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
import { Search } from '@element-plus/icons-vue';
import { get, post, accessHeader } from '@/net';
import router from '@/router';
import IconButton from "@/components/IconButton.vue";

let deptList = ref([]);
let statusList = ref([]);
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let selectedRowList = ref([])
const count = ref(0)

let searchValue = reactive({
  deptName: '',
  currentPage: 1,
  pageSize: 10
})


interface Dept {
  id: number;
  deptName: string;
  regNumber: number;
  deptNumber: string;
  orderNum: number;
  deptLeader: string;
  leaderPhone: string;
  status: string;
}

let dept : Dept = reactive({
  id: 0,
  deptName: '',
  regNumber: 0,
  deptNumber: '',
  orderNum: 0,
  deptLeader: '',
  leaderPhone: '',
  status: '',
})

let fileName = ref("multipartFiles")
let headers =ref(accessHeader())
let fileList =ref([])
let postUrl = ref("http://mugen.net/mugen/api/sso/depts/post/excel")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  post(`/sso/depts/get`,searchValue , (data: any) => {
    deptList.value = data.deptList
    count.value = data.count
  })
  get(`/dict/dict-datas/get/list/dept-status`, (data: any) => {
    statusList.value = data
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  dept.id = 0
  dept.deptName = ''
  dept.regNumber = 0
  dept.deptNumber = ''
  dept.orderNum = 0
  dept.deptLeader = ''
  dept.leaderPhone = ''
  dept.status = ''
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
  dept.id = row.id
  dept.deptName = row.deptName
  dept.regNumber = row.regNumber
  dept.deptNumber = row.deptNumber
  dept.orderNum = row.orderNum
  dept.deptLeader = row.deptLeader
  dept.leaderPhone = row.leaderPhone
  dept.status = row.status
  editDialogVisible.value = true
}

function addSubmitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      post(`/sso/depts/post`, dept, () => {
        ElMessage.success('添加成功!')
        initializePage()
      })
    } else {
      // 表单验证失败，不执行提交操作
      ElMessage.warning('请完整填写表单内容!');
      return false;
    }
  });
};

function editSubmitForm() {
  formRef.value.validate((valid) => {
    if(valid) {
      post('/sso/depts/put', dept, () => {
        ElMessage.success('修改成功!')
        initializePage()
      })
    } else {
      ElMessage.warning('请完整填写表单内容!')
    }
  });
}

function handleDelete(row) {
  get(`/sso/depts/delete/${row.id}`, () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function handleDeleteList() {
  post(`/sso/depts/delete`, selectedRowList.value.map(row => row.id), () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function exportData() {
  const headers = accessHeader();

  fetch(`http://mugen.net/mugen/api/sso/depts/get/excel`, {
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
        a.download = `Dept_${new Date().toLocaleString()}.xlsx`; // 设置文件名
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

function sortUp(row) {
  get(`/sso/depts/get/sort/up/${row.id}`, () => {
    ElMessage.success('上移成功!')
    initializePage()
  })
}

function sortDown(row) {
  get(`/sso/depts/get/sort/down/${row.id}`, () => {
    ElMessage.success('下移成功!')
    initializePage()
  })
}

let rules = {
  deptName: [
    { required: true, message: '科室名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  deptNumber: [
    { required: true, message: '科室编号不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  deptLeader: [
    { required: true, message: '科室负责人不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  leaderPhone: [
    { required: true, message: '负责人电话不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^1[34578]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '部门类型不能为空', trigger: 'blur' }
  ]
};
</script>

<style scoped>
</style>