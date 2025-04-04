<template>
  <el-row style="height: 100%;">
    <el-col :span="4">
      <el-card
          style="height: 80vh; border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);"
          shadow="hover">
        <template #header>
          <div class="card-header">
            <span style="font-size: 16px; font-weight: 600; color: #303133;">参数分类</span>
          </div>
        </template>
        <el-scrollbar wrap-class="scrollbar-wrapper" view-class="scrollbar-view" style="width: 100%; top: -15px;">
          <div class="category-list">
            <div
                class="category-item"
                :class="{ 'active-item': activeIndex === -1 }"
                @click="handleCategoryClick(-1)">
              全部
            </div>
            <div
                v-for="(item, index) in dictTypeList"
                :key="item.typeName"
                class="category-item"
                :class="{ 'active-item': activeIndex === index }"
                @click="handleCategoryClick(index)">
              {{ item.typeName }}
            </div>
          </div>
        </el-scrollbar>
      </el-card>
    </el-col>
    <el-col :span="20" style="padding-left: 10px;">
      <div style="margin-bottom: 10px;">
        <el-row>
          <el-input v-model="searchValue.dictCode" style="width: 240px;" size="small" placeholder="请输入参数编码"
                    type="text">
            <template #prepend>
              <el-button @click="handleSearch" :icon="Search"/>
            </template>
          </el-input>
          <el-input v-model="searchValue.dictName" style="width: 200px; margin-left: 5px;" size="small"
                    placeholder="请输入参数名称" type="text"></el-input>
          <el-button @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small"
                     type="primary">搜索
          </el-button>

          <el-button type="primary" style="width: 80px; height: 32px;" size="small" @click="nextAdd">新增
            <el-icon>
              <CirclePlus/>
            </el-icon>
          </el-button>

          <el-popconfirm
              confirm-button-text="删除"
              cancel-button-text="点错了"
              :icon="InfoFilled"
              confirm-button-type="danger"
              icon-color="#ef0004"
              title="确认要删除此这些参数?"
              :width="200"
              @confirm="handleDeleteList()"
          >
            <template #reference>
              <el-button type="danger" style="margin-left: 5px; width: 80px; height: 32px;" size="small">批量删除
                <el-icon>
                  <Remove/>
                </el-icon>
              </el-button>
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
            <el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small">导入
              <el-icon>
                <Download/>
              </el-icon>
            </el-button>
          </el-upload>
          <el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small"
                     @click="exportData">导出
            <el-icon>
              <Upload/>
            </el-icon>
          </el-button>
        </el-row>
      </div>

      <el-table :data="dictDataList" border @selection-change="handleSelectionChange"
                max-height=525 width="100%">
        <el-table-column type="selection" width="55">
        </el-table-column>
        <el-table-column label="参数编码" prop="dictCode" width="175">
        </el-table-column>
        <el-table-column label="参数名称" prop="dictName" width="120">
        </el-table-column>
        <el-table-column label="参数值" prop="dictValue" width="200">
          <template #default="scope">
            <el-popconfirm
                v-if="scope.row.status === 'bool'"
                confirm-button-text="修改"
                cancel-button-text="点错了"
                :icon="InfoFilled"
                confirm-button-type="danger"
                icon-color="#ef0004"
                title="确认要更改此参数值?"
                :width="200"
                @confirm="editBoolean(scope.row)"
            >
              <template #reference>
                <el-switch v-model="scope.row.switch" @click="scope.row.switch = !scope.row.switch"></el-switch>
              </template>
            </el-popconfirm>
            <el-image v-else-if="scope.row.status === 'image'" :src="scope.row.dictValue" style="width: 35px; height: 35px;;"></el-image>
            <el-text v-if="scope.row.status !== 'bool' && scope.row.status !== 'image'">{{ scope.row.dictValue }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="参数分类" prop="dictType" width="120">
          <template #default="scope">
            {{ dictTypeList.find(item => item.dictType === scope.row.dictType)?.typeName }}
          </template>
        </el-table-column>
        <el-table-column label="参数类型" prop="status" width="120">
          <template #default="scope">

          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" width="200">
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
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

      <div style="padding: 10px 0; position: absolute; bottom: -10px;">
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
    </el-col>
  </el-row>

  <el-dialog
      v-if="addDialogVisible"
      v-model="addDialogVisible"
      width=620
      :before-close="handleClose">
    <el-form :model="dictData" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="参数编码" prop="dictCode" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dictData.dictCode" placeholder="请输入参数编码"/>
      </el-form-item>
      <el-row>
        <el-col :span="10">
          <el-form-item label="参数类型" prop="status">
            <el-select v-model="dictData.status" placeholder="请选择参数类型">
              <el-option v-for="item in inputTypeList" :key="item.dictCode" :label="item.dictName"
                         :value="item.dictCode">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="参数分类" prop="dictType">
            <el-select v-model="dictData.dictType" placeholder="请选择参数分类">
              <el-option v-for="item in dictTypeList" :key="item.dictType" :label="item.typeName"
                         :value="item.dictType">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="参数名称" prop="dictName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dictData.dictName" placeholder="请输入参数名称"/>
      </el-form-item>
      <el-form-item v-if="dictData.status !== 'static'" label="参数值" prop="dictValue" style="width: 505px; margin-top: 20px;">
        <el-input v-if="dictData.status !== 'bool'" v-model="dictData.dictValue" type="textarea" placeholder="请输入参数值"/>
        <el-switch v-if="dictData.status === 'bool'" v-model="switchValue" active-color="#13ce66" inactive-color="#ff4949" active-text="是" inactive-text="否"></el-switch>
        <!-- 图片上传区域 -->
        <div v-if="dictData.status === 'image'" class="image-upload-wrapper">
          <el-image
              v-if="dictData.dictValue"
              :src="dictData.dictValue"
              class="preview-image"
              fit="cover"
          />
          <el-upload
              ref="imageRef"
              list-type="picture-card"
              :accept="'image/*'"
              :headers="headers"
              :action="imagePostUrl"
              :multiple="false"
              :show-file-list="false"
              :on-exceed="handleExceed"
              :limit="1"
              :on-success="imageUploadSuccess"
              class="image-uploader"
          >
            <el-icon class="upload-icon"><Plus /></el-icon>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="备注" prop="remark" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dictData.remark" type="textarea" placeholder="请输入备注"/>
      </el-form-item>
      <el-row style="display: flex; justify-content: center; align-items: center; ">
        <el-button type="primary" style="width: 200px; margin-top: 20px;" @click="addSubmitForm">新增</el-button>
        <el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消
        </el-button>
      </el-row>
    </el-form>
  </el-dialog>

  <el-dialog
      v-if="editDialogVisible"
      v-model="editDialogVisible"
      width=620
      :before-close="handleClose">
    <el-form :model="dictData" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="参数编码" prop="dictCode" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dictData.dictCode" placeholder="请输入参数编码" disabled />
      </el-form-item>
      <el-row>
        <el-col :span="10">
          <el-form-item label="参数类型" prop="status">
            <el-select v-model="dictData.status" placeholder="请选择参数类型">
              <el-option v-for="item in inputTypeList" :key="item.dictCode" :label="item.dictName"
                         :value="item.dictCode">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="参数分类" prop="dictType">
            <el-select v-model="dictData.dictType" placeholder="请选择参数分类">
              <el-option v-for="item in dictTypeList" :key="item.dictType" :label="item.typeName"
                         :value="item.dictType">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="参数名称" prop="dictName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dictData.dictName" placeholder="请输入参数名称"/>
      </el-form-item>
      <el-form-item v-if="dictData.status !== 'static'" label="参数值" prop="dictValue" style="width: 505px; margin-top: 20px;">
        <el-input v-if="dictData.status !== 'bool'" v-model="dictData.dictValue" type="textarea" placeholder="请输入参数值"/>
        <el-switch v-if="dictData.status === 'bool'" v-model="switchValue" active-color="#13ce66" inactive-color="#ff4949" active-text="是" inactive-text="否"></el-switch>
        <!-- 图片上传区域 -->
        <div v-if="dictData.status === 'image'" class="image-upload-wrapper">
          <el-image
              v-if="dictData.dictValue"
              :src="dictData.dictValue"
              class="preview-image"
              fit="cover"
          />
          <el-upload
              ref="imageRef"
              :accept="'image/*'"
              list-type="picture-card"
              :headers="headers"
              :action="imagePostUrl"
              :multiple="false"
              :show-file-list="false"
              :on-exceed="handleExceed"
              :limit="1"
              :on-success="imageUploadSuccess"
              class="image-uploader"
          >
            <el-icon class="upload-icon"><Plus /></el-icon>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="备注" prop="remark" style="width: 505px; margin-top: 20px;">
        <el-input v-model="dictData.remark" type="textarea" placeholder="请输入备注"/>
      </el-form-item>
      <el-row style="display: flex; justify-content: center; align-items: center; ">
        <el-button type="primary" style="width: 200px; margin-top: 20px;" @click="editSubmitForm">更新</el-button>
        <el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消
        </el-button>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, onMounted, reactive, watch} from 'vue';
import {Search} from '@element-plus/icons-vue';
import {get, post, accessHeader} from '@/net';
import router from '@/router';

let customerList = ref([]);
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let dictTypeList = ref([])
let dictDataList = ref([])
const count = ref(0)
const inputTypeList = ref([])

let switchValue = ref(true)

let fileName = ref("multipartFiles")
let imageName = ref("multipartFiles")


let headers = ref(accessHeader())
let fileList = ref([])
let imageList = ref([])

let imageRef = ref(null)

let postUrl = ref("http://mugen.net/mugen/api/dict/dict-datas/post/excel")
let imagePostUrl = ref("http://mugen.net/mugen/api/dict/dict-datas/post/image")

let searchValue = reactive({
  dictType: '',
  dictName: '',
  dictCode: '',
  currentPage: 1,
  pageSize: 10
})

interface DictData {
  id: number;
  dictCode: string;
  dictName: string;
  dictType: string;
  dictValue: string;
  remark: string;
  status: string;
}

interface DictType {
  id: number;
  typeName: string;
  dictType: string;
  remark: string;
  status: string;
}

let dictData: DictData = reactive({
  id: 0,
  dictCode: '',
  dictName: '',
  dictType: '',
  dictValue: '',
  remark: '',
  status: ''
})

let dictType: DictType = reactive({
  id: 0,
  typeName: '',
  dictType: '',
  remark: '',
  status: ''
})

const formRef = ref()

onMounted(() => {
  initializePage();
});

function initializePage() {
  post(`/dict/dict-datas/get`, searchValue, (data: any) => {
    dictDataList.value = data.dictDataList.map(item => {
      if (item.status === 'bool') {
        item.switch = item.dictValue === 'true' ? true : false
        console.log("item", item)
      }

      return item
    })
    count.value = Number(data.count)
  })
  get('/dict/dict-types/get', (data: any) => {
    dictTypeList.value = data
  })
  get('/dict/dict-datas/get/type', (data: any) => {
    inputTypeList.value = data
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  dictData.id = 0
  dictData.dictCode = ''
  dictData.dictName = ''
  dictData.dictType = ''
  dictData.dictValue = ''
  dictData.remark = ''
  dictData.status = ''
  dictType.id = 0
  dictType.typeName = ''
  dictType.dictType = ''
  dictType.remark = ''
  dictType.status = ''
  switchValue.value = true
}

const handleSearch = () => {
  searchValue.currentPage = 1
  initializePage()
};

function getAllDictType() {
  searchValue.currentPage = 1
  searchValue.dictType = ''
  initializePage()
}

function handleCategoryClick(index) {
  searchValue.currentPage = 1
  searchValue.dictType = index === -1 ? '' : dictTypeList.value[index].dictType
  initializePage()
}

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

function addSubmitForm() {
  if (dictData.status === 'bool') {
    dictData.dictValue = switchValue.value ? 'true' : 'false'
  }
  if (dictData.status === "static") {
    dictData.dictValue = ''
  }
  formRef.value.validate((valid) => {
    if (valid) {
      post('/dict/dict-datas/post', dictData, () => {
        ElMessage.success('新增成功!')
        addDialogVisible.value = false
        initializePage()
      })
    } else {
      ElMessage.warning('请检查输入项')
    }
  })
}

function editSubmitForm() {
  if (dictData.status === 'bool') {
    dictData.dictValue = switchValue.value ? 'true' : 'false'
  }
  if (dictData.status === "static") {
    dictData.dictValue = ''
  }
  formRef.value.validate((valid) => {
    if (valid) {
      post('/dict/dict-datas/put', dictData, () => {
        ElMessage.success('更新成功!')
        editDialogVisible.value = false
        initializePage()
      })
    } else {
      ElMessage.warning('请检查输入项')
    }
  })
}

function handleEdit(row) {
  dictData.id = row.id
  dictData.dictCode = row.dictCode
  dictData.dictName = row.dictName
  dictData.dictType = row.dictType
  dictData.dictValue = row.dictValue
  dictData.remark = row.remark
  dictData.status = row.status
  if (dictData.status === 'bool') {
    switchValue.value = row.dictValue === 'true' ? true : false
  }

  editDialogVisible.value = true
}

function handleDelete(row) {
  get(`/dict/dict-datas/delete/${row.id}`, () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function editBoolean(row) {
  row.dictValue = row.switch ? 'false' : 'true'
  post('/dict/dict-datas/put', {
    id: row.id,
    dictValue: row.dictValue
  }, () => {
    ElMessage.success('更新成功!')
    initializePage()
  })
}

function exportData() {
  window.open(`http://mugen.net/mugen/api/dict/dict-datas/get/excel`)
}

function uploadSuccess(data: any) {
  if (data.code === 200) {
    ElMessage.success("上传成功!")
    initializePage();
  } else (
      ElMessage.warning(data.message)
  )
}

function imageUploadSuccess(data) {
  if (data.code === 200) {
    dictData.dictValue = data.data
    imageList.value = []
    imageRef.value.clearFiles()
    ElMessage.success("上传成功!")
  } else (
      ElMessage.warning(data.message)
  )
}

const rules = {
  dictCode: [
    { required: true, message: '请输入参数编码', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  dictName: [
    { required: true, message: '请输入参数名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  dictType: [
    { required: true, message: '请选择参数分类', trigger: 'blur' }
  ],
  dictValue: [
    { required: true, message: '请输入参数值', trigger: 'blur' },
    { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择参数类型', trigger: 'blur' }
  ],
  remark: [
    { min: 0, max: 200, message: '长度在 0 到 200 个字符', trigger: 'blur' }
  ]
};
</script>

<style scoped>
/* 卡片整体样式 */
.card-header {
  //padding: 16px 20px;
  padding: 0;
}

/* 滚动区域样式 */
.scrollbar-wrapper {
  padding: 10px 0;
}

/* 分类列表样式 */
.category-list {
  padding: 0;
  margin: 0;
}

.category-item {
  font-size: 15px;
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 6px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  line-height: 1.5;
}

.category-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.active-item {
  background-color: #ecf5ff !important;
  color: #409eff !important;
  font-weight: 500;
}

.dict-form-item {
  width: 505px;
  margin-top: 20px;
}

.value-input {
  --el-input-textarea-height: 120px;
}

.preview-image {
  width: 80px;
  height: 80px;
  margin-right: 16px;
  border-radius: var(--el-border-radius-base);
  box-shadow: var(--el-box-shadow-light);
  transition: transform 0.3s ease;
}

.preview-image:hover {
  transform: scale(1.05);
}

.image-upload-wrapper {
  display: flex;
  align-items: center;
  margin-top: 12px;
}

.image-uploader :deep(.el-upload) {
  width: 80px;
  height: 80px;
  border: 2px dashed var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  transition: border-color 0.3s;
}

.image-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.upload-icon {
  font-size: 24px;
  color: var(--el-text-color-secondary);
}

.bool-switch {
  margin: 10px 0;
}
</style>