<template>
  <div style="margin-bottom: 10px;">
    <el-row>
      <el-input v-model="searchValue.title" style="width: 240px;" size="small" placeholder="请输入题目" type="text">
        <template #prepend>
          <el-button @click="handleSearch" :icon="Search"/>
        </template>
      </el-input>
      <!--      <el-input v-model="searchValue.address" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入地址" type="text"></el-input>-->
      <el-button @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small" type="primary">
        搜索
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
          title="确认要删除此这些客户?"
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
      <el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small" @click="exportData">导出
        <el-icon>
          <Upload/>
        </el-icon>
      </el-button>
    </el-row>
  </div>

  <el-table :data="mondaiList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange"
            max-height=525>
    <el-table-column type="selection" width="55" align="center"></el-table-column>
    <el-table-column type="index" label="序号" width="70"/>
    <el-table-column label="题目" prop="title" width="300">
      <template #default="scope">
        {{ truncate(scope.row.title, 50) }}
      </template>
    </el-table-column>
    <el-table-column label="选项" prop="items" width="250">
      <template #default="scope">
        <el-tag v-for="(item, index) in JSON.parse(scope.row.items)" :key="index"
                style="margin-right: 5px; margin-bottom: 5px;">
          {{ truncate(`${item.label}: ${item.value}`, 50) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="资料" prop="informations" width="220">
      <template #default="scope">
        {{ truncate(scope.row.informations, 50) }}
      </template>
    </el-table-column>
    <el-table-column label="图片" prop="pictures" width="100">
      <template #default="scope">
        <el-image
            v-if="scope.row.pictures"
            :src="scope.row.pictures"
            class="preview-image"
            fit="cover"
        />
      </template>
    </el-table-column>
    <el-table-column label="备注" prop="note" width="300">
      <template #default="scope">
        {{ truncate(scope.row.note, 50) }}
      </template>
    </el-table-column>
    <el-table-column label="类型" prop="type" width="150">
      <template #default="scope">
        {{ mondaiType.find((item) => item.value === scope.row.type).label }}
      </template>
    </el-table-column>
    <el-table-column label="操作" fixed="right" width="220">
      <template #default="scope">
        <el-button size="small" type="primary" plain @click="handleDetail(scope.row)">
          <el-icon>
            <View/>
          </el-icon>
          详情
        </el-button>
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
    <el-form :model="mondai" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="题目" prop="title" style="width: 505px; margin-top: 20px;">
        <el-input v-model="mondai.title" placeholder="请输入题目"></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="type" style="width: 505px; margin-top: 20px;">
        <el-select v-model="mondai.type" placeholder="请选择类型">
          <el-option label="政治理论与常识" value="politics"></el-option>
          <el-option label="言语理解与表达" value="speech"></el-option>
          <el-option label="数量关系" value="quantity"></el-option>
          <el-option label="逻辑推理" value="logic"></el-option>
          <el-option label="材料应用" value="material"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选项" prop="items" style="width: 505px; margin-top: 20px;"
                    v-if="mondai.type !== '' && mondai.type !== 'material'">
        <el-row v-if="itemList.length > 0">
          <el-tag v-for="(item, index) in itemList" :key="index" closable @close="deleteItem(index)"
                  style="margin-right: 5px; margin-bottom: 5px;">
            {{ truncate(`${item.label}: ${item.value}`, 50) }}
          </el-tag>
        </el-row>
        <el-input v-model="selectItem" placeholder="请输入选项" style="width: 505px;">
          <template #append>
            <el-button @click="addItem" :icon="CirclePlus"/>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="正确答案" v-if="mondai.type !== '' && mondai.type !== 'material'" style="width: 505px;">
        <el-select placeholder="请选择正确答案" v-model="label" style="width: 505px;">
          <el-option v-for="(item, index) in itemList" :key="index"
                     :label="truncate(`${item.label}: ${item.value}`, 50)" :value="item.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="资料" prop="informations" style="width: 505px; margin-top: 20px;">
        <el-input type="textarea" rows="4" v-model="mondai.informations" placeholder="请输入资料"></el-input>
      </el-form-item>
      <el-form-item label="图片" prop="pictures" style="width: 505px; margin-top: 20px;">
        <div class="image-upload-wrapper">
          <el-image
              v-if="mondai.pictures"
              :src="mondai.pictures"
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
            <el-icon class="upload-icon">
              <Plus/>
            </el-icon>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="备注" prop="note" style="width: 505px; margin-top: 20px;">
        <el-input type="textarea" rows="4" v-model="mondai.note" placeholder="请输入备注"></el-input>
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
    <el-form :model="mondai" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="题目" prop="title" style="width: 505px; margin-top: 20px;">
        <el-input v-model="mondai.title" placeholder="请输入题目"></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="type" style="width: 505px; margin-top: 20px;">
        <el-select v-model="mondai.type" placeholder="请选择类型">
          <el-option v-for="(item, index) in mondaiType" :key="index" :label="item.label"
                     :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选项" prop="items" style="width: 505px; margin-top: 20px;"
                    v-if="mondai.type !== '' && mondai.type !== 'material'">
        <el-row v-if="itemList.length > 0">
          <el-tag v-for="(item, index) in itemList" :key="index" closable @close="deleteItem(index)"
                  style="margin-right: 5px; margin-bottom: 5px;">
            {{ truncate(`${item.label}: ${item.value}`, 50) }}
          </el-tag>
        </el-row>
        <el-input v-model="selectItem" placeholder="请输入选项" style="width: 505px;">
          <template #append>
            <el-button @click="addItem" :icon="CirclePlus"/>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="正确答案" v-if="mondai.type !== '' && mondai.type !== 'material'" style="width: 505px;">
        <el-select placeholder="请选择正确答案" v-model="label" style="width: 505px;">
          <el-option v-for="(item, index) in itemList" :key="index"
                     :label="truncate(`${item.label}: ${item.value}`, 50)" :value="item.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="资料" prop="informations" style="width: 505px; margin-top: 20px;">
        <el-input type="textarea" rows="4" v-model="mondai.informations" placeholder="请输入资料"></el-input>
      </el-form-item>
      <el-form-item label="图片" prop="pictures" style="width: 505px; margin-top: 20px;">
        <div class="image-upload-wrapper">
          <!-- 图片预览带关闭按钮 -->
          <div v-if="mondai.pictures" class="preview-wrapper">
            <el-image
                :src="mondai.pictures"
                class="preview-image"
                fit="cover"
            />
            <el-icon class="close-icon" @click="handleRemoveImage">
              <Close />
            </el-icon>
          </div>

          <!-- 上传组件 -->
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
            <el-icon class="upload-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="备注" prop="note" style="width: 505px; margin-top: 20px;">
        <el-input type="textarea" rows="4" v-model="mondai.note" placeholder="请输入备注"></el-input>
      </el-form-item>
      <el-row style="display: flex; justify-content: center; align-items: center; ">
        <el-button type="primary" style="width: 200px; margin-top: 20px;" @click="editSubmitForm">修改</el-button>
        <el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消
        </el-button>
      </el-row>
    </el-form>
  </el-dialog>

  <el-dialog
      v-if="detailDialogVisible"
      v-model="detailDialogVisible"
      width=60%
      :before-close="handleClose">
    <MondaiCard
        :question="question"
        @change="handleSelection"
        admin
    ></MondaiCard>
  </el-dialog>

</template>

<script setup lang="ts">
import {ref, onMounted, reactive, watch} from 'vue';
import {CirclePlus, Search} from '@element-plus/icons-vue';
import {get, post, accessHeader} from '@/net';
import router from '@/router';
import {truncate} from "lodash-es";

let mondaiList = ref([]);
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const detailDialogVisible = ref(false)

const answer = ref()

const showAnswers = ref(true);

let selectedRowList = ref([])
const count = ref(0)

let question = ref(null)
// 答案映射表
const answerMap = ref<Record<number, string | string[]>>({});


// 父组件传递对象
interface SelectionPayload {
  questionId: number;  // 新增题目ID
  type: 'single' | 'multiple';
  value: string | string[];
}

// 父组件处理函数
const handleSelection = (payload: SelectionPayload) => {
  answerMap.value[payload.questionId] = payload.value;
  console.log('answerMap:', answerMap.value);
  // 示例：提交时转换数据结构
};

// 父组件重置选择
const resetSelection = () => {
  selectedOption.value = '';
  selectedOptions.value = [];
};

let selectItem = ref('')
let label = ref('')
let itemList = ref([])

let imageList = ref([])

const imageRef = ref(null)

const selectLabel = ref('ABCDEFGHIJKLMNOPQRSTUVWXYZ')

const mondaiType = ref([
  {label: '政治理论与常识', value: 'politics'},
  {label: '言语理解与表达', value: 'speech'},
  {label: '数量关系', value: 'quantity'},
  {label: '逻辑推理', value: 'logic'},
  {label: '材料应用', value: 'material'},
])

let searchValue = reactive({
  title: '',
  type: '',
  currentPage: 1,
  pageSize: 10
})

let mondai = reactive({
  id: null,
  title: '',
  items: '',
  informations: '',
  pictures: '',
  note: '',
  type: '',
});

let fileName = ref("multipartFiles")
let headers = ref(accessHeader())
let fileList = ref([])
let postUrl = ref("http://localhost:8000/mugen/api/mondais/post/excel")
let imagePostUrl = ref("http://192.168.189.209:8000/mugen/api/mondais/post/image")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  post(`/mondais/get`, searchValue, (data: any) => {
    mondaiList.value = data.mondaiList

    count.value = data.count
  })
  handleClose()
};

function handleDetail(row) {
  // console.log(row)
  question.value = row
  detailDialogVisible.value = true
}

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  detailDialogVisible.value = false
  mondai.id = null
  mondai.title = ''
  mondai.items = ''
  mondai.informations = ''
  mondai.pictures = ''
  mondai.note = ''
  mondai.type = ''
  selectItem.value = ''
  itemList.value = []
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
  mondai.id = row.id
  mondai.title = row.title
  mondai.items = row.items
  mondai.informations = row.informations
  mondai.pictures = row.pictures
  mondai.note = row.note
  mondai.type = row.type
  itemList.value = JSON.parse(row.items)
  label.value = ''
  label.value = itemList.value.find(item => item.single === true).label
  editDialogVisible.value = true
}

function addSubmitForm() {
  if (label.value.trim() === '') {
    ElMessage.warning('请选择正确答案!')
    return
  }
  formRef.value.validate((valid) => {
    itemList.value.forEach((item, index) => {
      if (item.label === label.value) {
        item.single = true
      } else {
        item.single = false
      }
    })
    // console.log('itemList:', JSON.stringify(itemList.value))
    mondai.items = JSON.stringify(itemList.value)
    if (valid) {
      post(`/mondais/post`, mondai, () => {
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
  if (label.value.trim() === '') {
    ElMessage.warning('请选择正确答案!')
    return
  }
  formRef.value.validate((valid) => {
    itemList.value.forEach((item, index) => {
      if (item.label === label.value) {
        item.single = true
      } else {
        item.single = false
      }
    })
    // console.log('itemList:', JSON.stringify(itemList.value))
    mondai.items = JSON.stringify(itemList.value)
    if (valid) {
      post('/mondais/put', mondai, () => {
        ElMessage.success('修改成功!')
        initializePage()
      })
    } else {
      ElMessage.warning('请完整填写注册表单内容!')
    }
  });
}

function handleDelete(row) {
  get(`/mondais/delete/${row.id}`, () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function handleDeleteList() {
  post(`/mondais/delete`, selectedRowList.value.map(row => row.id), () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function exportData() {
  window.open(`http://localhost:8000/mugen/api/mondais/get/excel`)
}

function uploadSuccess(data) {
  if (data.code === 200) {
    ElMessage.success("上传成功!")
    initializePage();
  } else (
      ElMessage.warning(data.message)
  )
}

function imageUploadSuccess(data) {
  if (data.code === 200) {
    mondai.pictures = data.data
    imageList.value = []
    imageRef.value.clearFiles()
    ElMessage.success("上传成功!")
  } else (
      ElMessage.warning(data.message)
  )
}

function addItem() {
  // if (selectItem.value.trim() === '') {
  //   ElMessage.warning('选项不能为空!')
  //   return
  // }
  if (itemList.value.length < selectLabel.value.length) {
    itemList.value.push(
        {
          label: selectLabel.value[itemList.value.length],
          value: selectItem.value.trim(),
          single: false
        }
    )
    selectItem.value = ''
  } else {
    // 如果 selectLabel.value 不够长，你可以选择抛出一个错误或者使用默认值
    console.error('selectLabel.value 长度不足!')
  }
  console.log('itemList:', JSON.stringify(itemList.value))
}

function deleteItem(index) {
  itemList.value.splice(index, 1)
  if (itemList.value.length <= selectLabel.value.length) {
    itemList.value.forEach((item, i) => {
      item.label = selectLabel.value[i]
    })
  } else {
    // 如果 selectLabel.value 不够长，你可以选择抛出一个错误或者使用默认值
    console.error('selectLabel.value 长度不足!')
  }
}

function handleRemoveImage() {
  mondai.pictures = ''
  imageList.value = []
  imageRef.value.clearFiles()
}

let rules = {
  title: [
    {required: true, message: '请输入题目', trigger: 'blur'},
    {min: 1, max: 1000, message: '题目长度在 1 到 100 个字符', trigger: 'blur'},
  ],
  type: [
    {required: true, message: '请选择类型', trigger: 'blur'},
  ],
  informations: [
    {min: 1, max: 1000, message: '资料长度在 1 到 1000 个字符', trigger: 'blur'},
  ],
  note: [
    {min: 1, max: 1000, message: '备注长度在 1 到 1000 个字符', trigger: 'blur'},
  ],
};
</script>

<style scoped>
.image-upload-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.preview-wrapper {
  position: relative;
  display: inline-block;
  margin-right: 16px; /* 保持原有间距 */
}

.preview-image {
  top: 5px;
  width: 80px;
  height: 80px;
  border-radius: var(--el-border-radius-base);
  box-shadow: var(--el-box-shadow-light);
  transition: transform 0.3s ease;
}

.preview-image:hover {
  transform: scale(1.05); /* 保持原有悬停效果 */
}

.close-icon {
  position: absolute;
  top: -6px;  /* 根据新尺寸调整 */
  right: -6px; /* 根据新尺寸调整 */
  cursor: pointer;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 2;
  transition: all 0.3s;
  padding: 3px;
  font-size: 14px;
}

.close-icon:hover {
  color: #ff4444;
  transform: scale(1.1);
}

:deep(.el-upload--picture-card) {
  width: 80px !important;  /* 匹配预览图尺寸 */
  height: 80px !important;
  margin-right: 0; /* 清除默认边距 */
}

.upload-icon {
  font-size: 18px;
  color: var(--el-text-color-secondary);
}
</style>