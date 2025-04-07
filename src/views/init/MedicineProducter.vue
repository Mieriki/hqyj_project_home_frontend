<template>
  <div style="margin-bottom: 10px;">
    <el-row>
      <el-input v-model="searchValue.producterName" style="width: 240px;" size="small" placeholder="请输入厂家名称" type="text">
        <template #prepend>
          <el-button @click="handleSearch" :icon="Search" />
        </template>
      </el-input>
      <el-input v-model="searchValue.keyword" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入关键字" type="text"></el-input>
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

  <el-table :data="producterList" border @selection-change="handleSelectionChange" max-height=525>
    <el-table-column type="selection" width="55"/>
    <el-table-column prop="producterName" label="厂商名称" width="220">
    </el-table-column>
    <el-table-column prop="producterCode" label="厂商编码" width="150">
    </el-table-column>
    <el-table-column prop="producterAddress" label="厂商地址" width="200">
    </el-table-column>
    <el-table-column prop="producterPerson" label="联系人" width="100">
    </el-table-column>
    <el-table-column prop="producterTel" label="厂商电话" width="150">
    </el-table-column>
    <el-table-column prop="keywords" label="关键字" width="200">
      <template #default="scope">
        <el-row v-if="scope.row.keywords">
          <el-tag type="primary" v-for="(item, index) in scope.row.keywords.split(',')" :key="index" style="margin-right: 2px;">
            {{item}}
          </el-tag>
        </el-row>
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
    <el-form :model="producter" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="厂商名称" prop="producterName" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="producter.producterName" placeholder="请输入厂商名称"></el-input>
      </el-form-item>
      <el-form-item label="厂商编码" prop="producterCode" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="producter.producterCode" placeholder="请输入厂商编码"></el-input>
      </el-form-item>
      <el-form-item label="厂商地址" prop="producterAddress" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="producter.producterAddress" placeholder="请输入厂商地址"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="producterPerson" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="producter.producterPerson" placeholder="请输入联系人"></el-input>
      </el-form-item>
      <el-form-item label="厂商电话" prop="producterTel" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="producter.producterTel" placeholder="请输入厂商电话"></el-input>
      </el-form-item>
      <el-form-item label="关键字" style="width: 505px; margin-bottom: 20px;">
        <el-row style="margin-bottom: 20px;">
          <el-tag type="primary" v-for="(item, index) in keywordList" :key="index" style="margin-right: 2px;">
            {{item}}
            <el-icon @click="deleteKeyword(item, index)" style="cursor: pointer;">
              <CircleClose />
            </el-icon>
          </el-tag>
        </el-row>
        <el-input v-model="keyword" placeholder="请输入关键字">
          <template #append>
            <el-button @click="addKeyword" :icon="CirclePlus" />
          </template>
        </el-input>
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
    <el-form :model="producter" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="厂商名称" prop="producterName" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="producter.producterName" placeholder="请输入厂商名称"></el-input>
      </el-form-item>
      <el-form-item label="厂商编码" prop="producterCode" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="producter.producterCode" placeholder="请输入厂商编码" disabled></el-input>
      </el-form-item>
      <el-form-item label="厂商地址" prop="producterAddress" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="producter.producterAddress" placeholder="请输入厂商地址"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="producterPerson" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="producter.producterPerson" placeholder="请输入联系人"></el-input>
      </el-form-item>
      <el-form-item label="厂商电话" prop="producterTel" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="producter.producterTel" placeholder="请输入厂商电话"></el-input>
      </el-form-item>
      <el-form-item label="关键字" style="width: 505px; margin-bottom: 20px;">
        <el-row style="margin-bottom: 20px;">
          <el-tag type="primary" v-for="(item, index) in keywordList" :key="index" style="margin-right: 2px;">
            {{item}}
            <el-icon @click="deleteKeyword(item, index)" style="cursor: pointer;">
              <CircleClose />
            </el-icon>
          </el-tag>
        </el-row>
        <el-input v-model="keyword" placeholder="请输入关键字">
          <template #append>
            <el-button @click="addKeyword" :icon="CirclePlus" />
          </template>
        </el-input>
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

let producterList = ref([]);
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let selectedRowList = ref([])
const count = ref(0)

let keywordList = ref([])
let keyword = ref('')

let searchValue = reactive({
  producterName: '',
  producterCode: '',
  keyword: '',
  currentPage: 1,
  pageSize: 10
})

interface Producter {
  id: number,
  producterName: string,
  producterCode: string,
  producterAddress: string,
  producterTel: string,
  producterPerson: string,
  keywords: string,
  status: string,
}

let producter : Producter = reactive({
  id: 0,
  producterName: '',
  producterCode: '',
  producterAddress: '',
  producterTel: '',
  producterPerson: '',
  keywords: '',
  status: '',
})

let fileName = ref("multipartFiles")
let headers =ref(accessHeader())
let fileList =ref([])
let postUrl = ref("http://mugen.net/mugen/api/erp/producters/post/excel")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  post(`/erp/producters/get`, searchValue , (data: any) => {
    producterList.value = data.producterList
    count.value = Number(data.count)
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  producter.id = 0
  producter.producterName = ''
  producter.producterCode = ''
  producter.producterAddress = ''
  producter.producterTel = ''
  producter.producterPerson = ''
  producter.keywords = ''
  producter.status = ''
  keywordList.value = []
  keyword.value = ''
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
  producter.id = row.id
  producter.producterName = row.producterName
  producter.producterCode = row.producterCode
  producter.producterAddress = row.producterAddress
  producter.producterTel = row.producterTel
  producter.producterPerson = row.producterPerson
  producter.keywords = row.keywords
  producter.status = row.status
  keywordList.value = row.keywords ? row.keywords.split(',') : []
  editDialogVisible.value = true
}

function addSubmitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      producter.keywords = keywordList.value.join(',')
      post(`/erp/producters/post`, producter, () => {
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
      producter.keywords = keywordList.value.join(',')
      post('/erp/producters/put', producter, () => {
        ElMessage.success('修改成功!')
        initializePage()
      })
    } else {
      ElMessage.warning('请完整填写注册表单内容!')
    }
  });
}

function handleDelete(row) {
  get(`/erp/producters/delete/${row.id}`, () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function handleDeleteList() {
  post(`/erp/producters/delete`, selectedRowList.value.map(row => row.id), () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function exportData() {
  const headers = accessHeader();

  fetch(`http://mugen.net/mugen/api/erp/producters/get/excel`, {
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
        a.download = `Producter_${new Date().toLocaleString()}.xlsx`; // 设置文件名
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

function addKeyword() {
  if (keyword.value.trim() !== '') {
    keywordList.value.push(keyword.value.trim())
    keyword.value = ''
  } else if (keyword.value.trim() === '') {
    ElMessage.warning('请输入关键字!')
  } else if (!keywordList.value.includes(keyword.value.trim())) {
    ElMessage.warning('关键字已存在!')
  }
}

function deleteKeyword(item, index) {
  keywordList.value.splice(index, 1)
}

let rules = {
  producterName: [
    { required: true, message: '请输入厂商名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  producterCode: [
    { required: true, message: '请输入厂商编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  producterAddress: [
    { required: true, message: '请输入厂商地址', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  producterPerson: [
    { required: true, message: '请输入联系人', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  producterTel: [
    { required: true, message: '请输入厂商电话', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[0-9]{3,12}-[0-9]{5,12}$|^1[34578]\d{9}$/, message: '请输入正确的电话号码', trigger: 'blur' }
  ],
};
</script>

<style scoped>
</style>