<template>
  <div style="margin-bottom: 10px;">
    <el-row>
      <el-input v-model="searchValue.medicinesName" style="width: 240px;" size="small" placeholder="请输入药品名称" type="text">
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

  <el-table :data="medicineList" border @selection-change="handleSelectionChange" max-height=525>
    <el-table-column type="selection" width="55"/>
    <el-table-column label="药品名称" prop="medicinesName" width="200" sortable="custom"/>
    <el-table-column label="国药准字" prop="medicinesNumber" width="120" sortable="custom"/>
    <el-table-column label="药品类型" prop="medicinesType" width="120" sortable="custom">
      <template #default="scope">
        {{medicineTypeList.find((item) => item.dictCode === scope.row.medicinesType)?.dictName}}
      </template>
    </el-table-column>
    <el-table-column label="处方类型" prop="prescriptionType" width="120" sortable="custom">
      <template #default="scope">
        {{prescriptionTypeList.find((item) => item.dictCode === scope.row.prescriptionType)?.dictName}}
      </template>
    </el-table-column>
    <el-table-column label="处方价格" prop="prescriptionPrice" width="120" sortable="custom"/>
    <el-table-column label="单位" prop="unit" width="120" sortable="custom"/>
    <el-table-column label="转换比例" prop="conversion" width="120" sortable="custom"/>
    <el-table-column prop="kerwords" label="关键字" width="200">
      <template #default="scope">
        <el-row v-if="scope.row.keywords">
          <el-tag type="primary" v-for="(item, index) in scope.row.keywords.split(',')" :key="index" style="margin-right: 2px;">
            {{item}}
          </el-tag>
        </el-row>
      </template>
    </el-table-column>
    <el-table-column label="生产商" prop="producterId" width="250" sortable="custom">
      <template #default="scope">
        {{producterList.find((item) => item.producterCode === scope.row.producterId)?.producterName}}
      </template>
    </el-table-column>
    <el-table-column label="库存数量" prop="stockNum" width="120" sortable="custom"/>
    <el-table-column label="库存警戒数量" prop="stockDengerNum" width="120" sortable="custom"/>
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
      style="top: -10vh;"
      :before-close="handleClose">
    <el-form :model="medicine" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="国药准字" prop="medicinesNumber" style="width: 505px; margin-top: 20px;">
        <el-input v-model="medicine.medicinesNumber" placeholder="请输入药品编号" />
      </el-form-item>
      <el-form-item label="药品名称" prop="medicinesName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="medicine.medicinesName" placeholder="请输入药品名称" />
      </el-form-item>
      <el-row style=" margin-top: 20px;">
        <el-col :span="10" >
          <el-form-item label="药品类型" prop="medicinesType">
            <el-select v-model="medicine.medicinesType" placeholder="请选择药品类型">
              <el-option v-for="item in medicineTypeList" :key="item.dictCode" :label="item.dictName" :value="item.dictCode"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="处方类型" prop="prescriptionType">
            <el-select v-model="medicine.prescriptionType" placeholder="请选择处方类型">
              <el-option v-for="item in prescriptionTypeList" :key="item.dictCode" :label="item.dictName" :value="item.dictCode"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10" >
          <el-form-item label="单位" prop="unit">
            <el-input v-model="medicine.unit" placeholder="请输入单位" />
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="转换比例" prop="conversion">
            <el-input v-model="medicine.conversion" placeholder="请输入转换比例" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="处方价格" prop="prescriptionPrice" style="width: 300px;">
        <el-input v-model="medicine.prescriptionPrice" placeholder="请输入处方价格" />
      </el-form-item>
      <el-form-item label="生产商" prop="producterId" style="width: 505px; margin-top: 20px;">
        <el-select v-model="medicine.producterId" placeholder="请选择生产商">
          <el-option v-for="item in producterList" :key="item.producterCode" :label="item.producterName" :value="item.producterCode"></el-option>
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
      <el-form-item label="库存数量" prop="stockNum" style="width: 505px; margin-top: 20px;">
        <el-input v-model="medicine.stockNum" placeholder="请输入库存数量" />
      </el-form-item>
      <el-form-item label="库存警戒数量" prop="stockDengerNum" style="width: 505px; margin-top: 20px;">
        <el-input v-model="medicine.stockDengerNum" placeholder="请输入库存警戒数量" />
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
      style="top: -10vh;"
      :before-close="handleClose">
    <el-form :model="medicine" :rules="rules" ref="formRef" label-width="100px">
     <el-form-item label="国药准字" prop="medicinesNumber" style="width: 505px; margin-top: 20px;">
        <el-input v-model="medicine.medicinesNumber" placeholder="请输入药品编号" disabled />
      </el-form-item>
      <el-form-item label="药品名称" prop="medicinesName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="medicine.medicinesName" placeholder="请输入药品名称" />
      </el-form-item>
      <el-row style=" margin-top: 20px;">
        <el-col :span="10" >
          <el-form-item label="药品类型" prop="medicinesType">
            <el-select v-model="medicine.medicinesType" placeholder="请选择药品类型">
              <el-option v-for="item in medicineTypeList" :key="item.dictCode" :label="item.dictName" :value="item.dictCode"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="处方类型" prop="prescriptionType">
            <el-select v-model="medicine.prescriptionType" placeholder="请选择处方类型">
              <el-option v-for="item in prescriptionTypeList" :key="item.dictCode" :label="item.dictName" :value="item.dictCode"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10" >
          <el-form-item label="单位" prop="unit">
            <el-input v-model="medicine.unit" placeholder="请输入单位" />
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="转换比例" prop="conversion">
            <el-input v-model="medicine.conversion" placeholder="请输入转换比例" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="处方价格" prop="prescriptionPrice" style="width: 300px;">
        <el-input v-model="medicine.prescriptionPrice" placeholder="请输入处方价格" />
      </el-form-item>
      <el-form-item label="生产商" prop="producterId" style="width: 505px; margin-top: 20px;">
        <el-select v-model="medicine.producterId" placeholder="请选择生产商">
          <el-option v-for="item in producterList" :key="item.producterCode" :label="item.producterName" :value="item.producterCode"></el-option>
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
      <el-form-item label="库存数量" prop="stockNum" style="width: 505px; margin-top: 20px;">
        <el-input v-model="medicine.stockNum" placeholder="请输入库存数量" />
      </el-form-item>
      <el-form-item label="库存警戒数量" prop="stockDengerNum" style="width: 505px; margin-top: 20px;">
        <el-input v-model="medicine.stockDengerNum" placeholder="请输入库存警戒数量" />
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

let medicineList = ref([]);
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let selectedRowList = ref([])
const count = ref(0)

let keywordList = ref([])
let keyword = ref('')

let medicineTypeList = ref([])
let prescriptionTypeList = ref([])

let producterList = ref([])

let searchValue = reactive({
  medicinesName: '',
  medicinesType: '',
  prescriptionType: '',
  currentPage: 1,
  pageSize: 10
})

interface Medicine {
  id: null,
  medicinesNumber: string,
  medicinesName: string,
  medicinesType: string,
  prescriptionType: string,
  prescriptionPrice: string,
  unit: string,
  conversion: number,
  keywords: string,
  producterId: string,
  stockNum: string,
  stockDengerNum: string,
  status: string,
}

let medicine : Medicine = reactive({
  id: null,
  medicinesNumber: '',
  medicinesName: '',
  medicinesType: '',
  prescriptionType: '',
  prescriptionPrice: '',
  unit: '',
  conversion: null,
  keywords: '',
  producterId: '',
  stockNum: '',
  stockDengerNum: '',
  status: '',
})

let fileName = ref("multipartFiles")
let headers =ref(accessHeader())
let fileList =ref([])
let postUrl = ref("http://mugen.net/mugen/api/erp/medicines/post/excel")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  post(`/erp/medicines/get`,searchValue , (data: any) => {
    medicineList.value = data.medicineList
    count.value = Number(data.count)
  })
  get('/erp/producters/get', (data: any) => {
    producterList.value = data
  })
  get(`/dict/dict-datas/get/list/medicine-type`, (data: any) => {
    medicineTypeList.value = data
  })
  get(`/dict/dict-datas/get/list/prescription_type`, (data: any) => {
    prescriptionTypeList.value = data
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  medicine.id = null
  medicine.medicinesNumber = ''
  medicine.medicinesName = ''
  medicine.medicinesType = ''
  medicine.prescriptionType = ''
  medicine.prescriptionPrice = ''
  medicine.unit = ''
  medicine.conversion = null
  medicine.keywords = ''
  medicine.producterId = ''
  medicine.stockNum = ''
  medicine.stockDengerNum = ''
  medicine.status = ''
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
  medicine.id = row.id
  medicine.medicinesNumber = row.medicinesNumber
  medicine.medicinesName = row.medicinesName
  medicine.medicinesType = row.medicinesType
  medicine.prescriptionType = row.prescriptionType
  medicine.prescriptionPrice = row.prescriptionPrice
  medicine.unit = row.unit
  medicine.conversion = row.conversion
  medicine.keywords = row.keywords
  medicine.producterId = row.producterId
  medicine.stockNum = row.stockNum
  medicine.stockDengerNum = row.stockDengerNum
  medicine.status = row.status
  keywordList.value = row.keywords ? row.keywords.split(',') : []
  editDialogVisible.value = true
}

function addSubmitForm() {
  formRef.value.validate((valid) => {
    medicine.keywords = keywordList.value.join(',')
    if (valid) {
      post(`/erp/medicines/post`, medicine, () => {
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
    medicine.keywords = keywordList.value.join(',')
    if(valid) {
      post('/erp/medicines/put', medicine, () => {
        ElMessage.success('修改成功!')
        initializePage()
      })
    } else {
      ElMessage.warning('请完整填写注册表单内容!')
    }
  });
}

function handleDelete(row) {
  get(`/erp/medicines/delete/${row.id}`, () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function handleDeleteList() {
  post(`/erp/medicines/delete`, selectedRowList.value.map(row => row.id), () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function exportData() {
  const headers = accessHeader();

  fetch(`http://mugen.net/mugen/api/erp/medicines/get/excel`, {
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
        a.download = `Medicines_${new Date().toLocaleString()}.xlsx`; // 设置文件名
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
  medicinesNumber: [
    { required: true, message: '请输入药品编号', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  medicinesName: [
    { required: true, message: '请输入药品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  medicinesType: [
    { required: true, message: '请输入药品类型', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  prescriptionType: [
    { required: true, message: '请输入处方类型', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  prescriptionPrice: [
    { required: true, message: '请输入处方价格', trigger: 'blur' },
    {
      pattern: /^\d+(\.\d+)?$/,
      message: '请输入正确的数字格式',
      trigger: 'blur'
    }
  ],
  unit: [
    { required: true, message: '请输入单位', trigger: 'blur' }
  ],
  conversion: [
    { required: true, message: '请输入转换比例', trigger: 'blur' },
    {
      pattern: /^\d+(\.\d+)?$/,
      message: '请输入正确的数字格式',
      trigger: 'blur'
    }
  ],
  producterId: [
    { required: true, message: '请输入生产商', trigger: 'blur' }
    // 如果需要限制长度，可以保留 min 和 max 规则
    // { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  stockNum: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    {
      pattern: /^\d+(\.\d+)?$/,
      message: '请输入正确的数字格式',
      trigger: 'blur'
    }
  ],
  stockDangerNum: [ // 修正了字段名称的拼写错误
    { required: true, message: '请输入库存短缺数量', trigger: 'blur' },
    {
      pattern: /^\d+(\.\d+)?$/,
      message: '请输入正确的数字格式',
      trigger: 'blur'
    }
  ],
  status: [
    { required: true, message: '请输入状态', trigger: 'blur' }
    // 如果需要限制长度，可以保留 min 和 max 规则
    // { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
};


</script>

<style scoped>
</style>