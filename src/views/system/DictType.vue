<template>
  <div style="margin-bottom: 10px;">
    <el-row>
      <el-input v-model="searchValue.typeName" style="width: 240px;" size="small" placeholder="请输入类型名称" type="text">
        <template #prepend>
          <el-button @click="handleSearch" :icon="Search" />
        </template>
      </el-input>
      <el-input v-model="searchValue.dictType" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入类型编码" type="text"></el-input>
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

  <el-table :data="dictTypeList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange" max-height=525>
    <el-table-column type="selection" width="55">
    </el-table-column>
    <el-table-column label="类型名称" prop="typeName" width="270">
    </el-table-column>
    <el-table-column label="字典类型" prop="dictType" width="275">
    </el-table-column>
    <el-table-column label="备注" prop="remark" width="500">
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
    <el-form :model="dictType" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="类型名称" prop="typeName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dictType.typeName"></el-input>
      </el-form-item>
      <el-form-item label="字典编码" prop="dictType" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dictType.dictType"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dictType.remark"></el-input>
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
    <el-form :model="dictType" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="类型名称" prop="typeName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dictType.typeName"></el-input>
      </el-form-item>
      <el-form-item label="字典编码" prop="dictType" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dictType.dictType" disabled></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dictType.remark"></el-input>
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

let dictTypeList = ref([]);
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let selectedRowList = ref([])
const count = ref(0)

let searchValue = reactive({

  currentPage: 1,
  pageSize: 10
})

interface DictType {
  id: number;
  typeName: string;
  dictType: string;
  remark: string;
  status: string;
}


let dictType: DictType = reactive({
  id: 0,
  typeName: '',
  dictType: '',
  remark: '',
  status: ''
})

let fileName = ref("multipartFiles")
let headers =ref(accessHeader())
let fileList =ref([])
let postUrl = ref("http://mugen.net/mugen/api/dict/dict-types/post/excel")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  post(`/dict/dict-types/get`,searchValue , (data: any) => {
    dictTypeList.value = data.dictTypeList
    count.value = Number(data.count)
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  dictType.id = 0
  dictType.typeName = ''
  dictType.dictType = ''
  dictType.remark = ''
  dictType.status = ''
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
  dictType.id = row.id
  dictType.typeName = row.typeName
  dictType.dictType = row.dictType
  dictType.remark = row.remark
  dictType.status = row.status
  editDialogVisible.value = true
}

function addSubmitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      post(`/dict/dict-types/post`, dictType, () => {
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
      post('/dict/dict-types/put', dictType, () => {
        ElMessage.success('修改成功!')
        initializePage()
      })
    } else {
      ElMessage.warning('请完整填写表单内容!')
    }
  });
}

function handleDelete(row) {
  get(`/dict/dict-types/delete/${row.id}`, () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function handleDeleteList() {
  post(`/dict/dict-types/delete`, selectedRowList.value.map(row => row.id), () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function exportData() {
  window.open(`http://mugen.net/mugen/api/dict/dict-types/get/excel`)
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
  typeName: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  dictType: [
    { required: true, message: '请输入字典类型', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  remark: [
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ]
};
</script>

<style scoped>
</style>