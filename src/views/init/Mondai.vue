<template>
  <div style="margin-bottom: 10px;">
    <el-row>
      <el-input v-model="searchValue.titile" style="width: 240px;" size="small" placeholder="请输入题目" type="text">
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

  <el-table :data="mindaiList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange" max-height=525>
    <el-table-column type="selection" width="55" align="center"></el-table-column>
    <el-table-column label="题目" prop="titile" width="200">
    </el-table-column>
    <el-table-column label="选项" prop="items" width="200">
    </el-table-column>
    <el-table-column label="资料" prop="informations" width="220">
    </el-table-column>
    <el-table-column label="图片" prop="pictures" width="100">
    </el-table-column>
    <el-table-column label="备注" prop="note" width="220">
    </el-table-column>
    <el-table-column label="类型" prop="type" width="100">
    </el-table-column>
    <el-table-column label="操作" fixed="right" width="220">
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
    <el-form :model="mondai" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="题目" prop="titile" style="width: 505px; margin-top: 20px;">
        <el-input v-model="mondai.titile" placeholder="请输入题目"></el-input>
      </el-form-item>
      <el-form-item label="选项" prop="items" style="width: 505px; margin-top: 20px;">
        <el-input v-model="mondai.items" placeholder="请输入选项"></el-input>
      </el-form-item>
      <el-form-item label="资料" prop="informations" style="width: 505px; margin-top: 20px;">
        <el-input v-model="mondai.informations" placeholder="请输入资料"></el-input>
      </el-form-item>
      <el-form-item label="图片" prop="pictures" style="width: 505px; margin-top: 20px;">
        <el-input v-model="mondai.pictures" placeholder="请输入图片"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="note" style="width: 505px; margin-top: 20px;">
        <el-input v-model="mondai.note" placeholder="请输入备注"></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="type" style="width: 505px; margin-top: 20px;">
        <el-select v-model="mondai.type" placeholder="请选择类型">
          <el-option label="单选" value="单选"></el-option>
          <el-option label="多选" value="多选"></el-option>
          <el-option label="判断" value="判断"></el-option>
          <el-option label="填空" value="填空"></el-option>
        </el-select>
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
    <el-form :model="mondai" :rules="rules" ref="formRef" label-width="100px">

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

let mindaiList = ref([]);
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let selectedRowList = ref([])
const count = ref(0)

let searchValue = reactive({
  titile:'',
  type: '',
  currentPage: 1,
  pageSize: 10
})

/*
*   @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

     // 题目
    @TableField("titile")
    private String titile;

     // 选项
    @TableField("items")
    private String items;

     // 资料
    @TableField("informations")
    private String informations;

     // 图片
    @TableField("pictures")
    private String pictures;

     // 备注
    @TableField("note")
    private String note;

     // 类型
    @TableField("type")
    private String type;*/

let mondai = reactive({
  id: null,
  titile: '',
  items: '',
  informations: '',
  pictures: '',
  note: '',
  type: '',
});

let fileName = ref("multipartFiles")
let headers =ref(accessHeader())
let fileList =ref([])
let postUrl = ref("http://localhost:8000/mugen/api/mondais/post/excel")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  post(`/mondais/get`,searchValue , (data: any) => {
    mindaiList.value = data.mindaiList
    count.value = data.count
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  mondai.id = null
  mondai.titile = ''
  mondai.items = ''
  mondai.informations = ''
  mondai.pictures = ''
  mondai.note = ''
  mondai.type = ''
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
  mondai.titile = row.titile
  mondai.items = row.items
  mondai.informations = row.informations
  mondai.pictures = row.pictures
  mondai.note = row.note
  mondai.type = row.type
  editDialogVisible.value = true
}

function addSubmitForm() {
  formRef.value.validate((valid) => {
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
  formRef.value.validate((valid) => {
    if(valid) {
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

let rules = {

};
</script>

<style scoped>
</style>