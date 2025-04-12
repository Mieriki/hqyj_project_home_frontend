<template>
  <div style="margin-bottom: 10px;">
    <el-row>
      <el-input v-model="searchValue.itemName" style="width: 240px;" size="small" placeholder="请输检查入名称" type="text">
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

  <el-table :data="checkItemList" border @selection-change="handleSelectionChange" max-height="525">
    <el-table-column type="selection" width="55"/>
    <el-table-column prop="itemName" label="检查项目名称" width="250"></el-table-column>
    <el-table-column prop="unitPrice" label="单价" width="120"></el-table-column>
    <el-table-column prop="cost" label="成本" width="120"></el-table-column>
    <el-table-column prop="unit" label="单位" width="120"></el-table-column>
    <el-table-column prop="type" label="类型" width="150">
      <template #default="scope">
        {{checkTypeList.find((item) => item.dictCode === scope.row.type)?.dictName}}
      </template>
    </el-table-column>
<!--    <el-table-column prop="status" label="状态" width="100"></el-table-column>-->
    <el-table-column prop="keywords" label="关键字" width="250">
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
    <el-form :model="checkItem" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="项目名称" prop="itemName" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="checkItem.itemName" placeholder="请输入检查项目名称"></el-input>
      </el-form-item>
      <el-form-item label="单价" prop="unitPrice" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="checkItem.unitPrice" placeholder="请输入单价"></el-input>
      </el-form-item>
      <el-form-item label="成本" prop="cost" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="checkItem.cost" placeholder="请输入成本"></el-input>
      </el-form-item>
      <el-form-item label="单位" prop="unit" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="checkItem.unit" placeholder="请输入单位"></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="type" style="width: 505px; margin-bottom: 20px;">
        <el-select v-model="checkItem.type" placeholder="请选择类型">
          <el-option v-for="(item, index) in checkTypeList" :key="index" :label="item.dictName" :value="item.dictCode"></el-option>
        </el-select>
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
    <el-form :model="checkItem" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="项目名称" prop="itemName" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="checkItem.itemName" placeholder="请输入检查项目名称"></el-input>
      </el-form-item>
      <el-form-item label="单价" prop="unitPrice" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="checkItem.unitPrice" placeholder="请输入单价"></el-input>
      </el-form-item>
      <el-form-item label="成本" prop="cost" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="checkItem.cost" placeholder="请输入成本"></el-input>
      </el-form-item>
      <el-form-item label="单位" prop="unit" style="width: 505px; margin-bottom: 20px;">
        <el-input v-model="checkItem.unit" placeholder="请输入单位"></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="type" style="width: 505px; margin-bottom: 20px;">
        <el-select v-model="checkItem.type" placeholder="请选择类型">
          <el-option v-for="(item, index) in checkTypeList" :key="index" :label="item.dictName" :value="item.dictCode"></el-option>
        </el-select>
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

let checkItemList = ref([]);
let checkTypeList = ref([])
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let selectedRowList = ref([])
const count = ref(0)

let keywordList = ref([])
let keyword = ref('')

let searchValue = reactive({
  itemName: '',
  keyword: '',
  currentPage: 1,
  pageSize: 10
})

interface CheckItem {
  id: number,
  itemName: string,
  keywords: string,
  unitPrice: number,
  cost: number,
  unit: string,
  type: string,
  status: string
}

let checkItem : CheckItem = reactive({
  id: 0,
  itemName: '',
  keywords: '',
  unitPrice: 0,
  cost: 0,
  unit: '',
  type: '',
  status: ''
})

let fileName = ref("multipartFiles")
let headers =ref(accessHeader())
let fileList =ref([])
let postUrl = ref("http://mugen.net/mugen/api/his/check-items/post/excel")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  post(`/his/check-items/get`, searchValue , (data: any) => {
    checkItemList.value = data.checkItemList
    count.value = Number(data.count)
  })
  get(`/dict/dict-datas/get/list/check-type`, (data: any) => {
    checkTypeList.value = data
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  checkItem.id = 0
  checkItem.itemName = ''
  checkItem.keywords = ''
  checkItem.unitPrice = 0
  checkItem.cost = 0
  checkItem.unit = ''
  checkItem.type = ''
  checkItem.status = ''
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
  checkItem.id = row.id
  checkItem.itemName = row.itemName
  checkItem.keywords = row.keywords
  checkItem.unitPrice = row.unitPrice
  checkItem.cost = row.cost
  checkItem.unit = row.unit
  checkItem.type = row.type
  checkItem.status = row.status
  keywordList.value = row.keywords ? row.keywords.split(',') : []
  editDialogVisible.value = true
}

function addSubmitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      checkItem.keywords = keywordList.value.join(',')
      post(`/his/check-items/post`, checkItem, () => {
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
      checkItem.keywords = keywordList.value.join(',')
      post('/his/check-items/put', checkItem, () => {
        ElMessage.success('修改成功!')
        initializePage()
      })
    } else {
      ElMessage.warning('请完整填写注册表单内容!')
    }
  });
}

function handleDelete(row) {
  get(`/his/check-items/delete/${row.id}`, () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function handleDeleteList() {
  post(`/his/check-items/delete`, selectedRowList.value.map(row => row.id), () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function exportData() {
  const headers = accessHeader();

  fetch(`http://mugen.net/mugen/api/his/check-items/get/excel`, {
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
  if (keyword.value.trim() === '') {
    ElMessage.warning('请输入关键字!')
  } else if (keywordList.value.includes(keyword.value.trim())) {
    ElMessage.warning('关键字已存在!')
  } else {
    keywordList.value.push(keyword.value.trim())
    keyword.value = ''
  }
}

function deleteKeyword(item, index) {
  keywordList.value.splice(index, 1)
}

let rules = {
  itemName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  unitPrice: [
    { required: true, message: '请输入单价', trigger: 'blur' },
    {
      pattern: /^\d+(\.\d+)?$/,
      message: '请输入正确的数字格式',
      trigger: 'blur'
    }
  ],
  cost: [
    { required: true, message: '请输入成本', trigger: 'blur' },
    {
      pattern: /^\d+(\.\d+)?$/,
      message: '请输入正确的数字格式',
      trigger: 'blur'
    }
  ],
  unit: [
    { required: true, message: '请输入单位', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'blur' }
  ]
};
</script>

<style scoped>
</style>