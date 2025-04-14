<template>
  <div style="margin-bottom: 10px;">
    <el-row>
      <el-input v-model="searchValue.medicinesName" style="width: 400px;" size="small" placeholder="请输入药品名称" type="text">
        <template #prepend>
          <el-button @click="handleSearch" :icon="Search" />
        </template>
        <template #append>
          <el-select v-model="searchValue.dangerStock" placeholder="库存预警" style="width: 140px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="黄色预警" value="yellow"></el-option>
            <el-option label="红色预警" value="red"></el-option>
          </el-select>
        </template>
      </el-input>
      <el-input v-model="searchValue.producer" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入生产厂商" type="text"></el-input>
      <el-button  @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small" type="primary">搜索</el-button>
      <el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small" @click="nextAddBatch">入库<el-icon><Download /></el-icon></el-button>
      <el-button @click="purchase.medicineInList = []; isShow() " style="margin-left: 5px; width: 75px; height: 32px;" size="small" type="warning">清空订单</el-button>
    </el-row>
  </div>
  <el-row>
    <el-col :span="4" v-show="cartShow" style="padding-right: 5px; height: 75vh;">
      <el-card style="height: 75vh;">
        <el-tag
            v-for="tag in purchase.medicineInList"
            :key="tag.id"
            closable
            :disable-transitions="false"
            @close="handleTagClose(tag)"
            style="margin-right: 5px;"
        >
          {{ tag.medicinesName }}
        </el-tag>
      </el-card>
    </el-col>
    <el-col :span="cartVw">
      <el-table :data="medicineList" border :row-class-name="tableRowClassName" @selection-change="handleSelectionChange" max-height=525>
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
        <el-table-column label="采购价格" prop="purchasePrice" width="120" sortable="custom"/>
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
        <el-table-column label="操作" fixed="right" width="110">
          <template #default="scope">
            <el-button size="small" type="primary" @click="nextAdd(scope.row)"><el-icon><Download /></el-icon>加入订单</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="padding: 10px 0; position: absolute; top: 70vh;">
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

    <el-form :model="purchase" :rules="rules" ref="formRef" label-width="100px">
      <el-table :data="purchase.medicineInList" style="width: 100%;">
        <el-table-column prop="medicinesId" label="药品ID" width="250" />
        <el-table-column prop="medicinesName" label="药品名称" width="220" />
        <el-table-column prop="size" label="数量" width="100" />
      </el-table>
      <el-form-item label="审核信息" prop="info" style="width: 505px; margin-top: 20px;">
        <el-input v-model="purchase.info" placeholder="请输入审核信息" type="textarea" rows="4" ></el-input>
      </el-form-item>
      <el-row style="display: flex; justify-content: center; align-items: center; margin-bottom: 25px;">
        <el-button type="primary" style="width: 200px; margin-top: 20px;" @click="addSubmitForm">新增</el-button>
        <el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 65px;" @click="handleClose">取消</el-button>
      </el-row>
    </el-form>
  </el-dialog>

  <el-dialog
      v-if="editDialogVisible"
      v-model="editDialogVisible"
      width=620
      :before-close="handleClose">
    <el-input-number v-model="rowTemp.sum" style="width: 459px; margin-left: 65px;"></el-input-number>
    <el-row style="display: flex; justify-content: center; align-items: center; ">
      <el-button type="primary" style="width: 200px; margin-top: 20px;" @click="editSubmitForm">添加</el-button>
      <el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消</el-button>
    </el-row>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { get, post, accessHeader } from '@/net';
import router from '@/router';

let medicineList = ref([]);
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let selectedRowList = ref([])

let keywordList = ref([])
let keyword = ref('')

let medicineTypeList = ref([])
let prescriptionTypeList = ref([])

let producterList = ref([])
const cartShow = ref(false)

const count = ref(0)
let cartVw = ref(24)

const rowTemp = ref(null)

let searchValue = reactive({
  medicinesName: '',
  medicinesType: '',
  prescriptionType: '',
  dangerStock: '',
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
  purchasePrice: string,
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
  purchasePrice: '',
  unit: '',
  conversion: null,
  keywords: '',
  producterId: '',
  stockNum: '',
  stockDengerNum: '',
  status: '',
})

let purchase = reactive({
  id: null,
  tradeTotalAmount: null,
  applyUserId: null,
  applyUserName: '',
  storageOptUser: '',
  storageOptTime: null,
  auditMsg: '',
  status: '',
  info: '',
  medicineInList: []
})

let fileName = ref("multipartFiles")
let headers =ref(accessHeader())
let fileList =ref([])
let postUrl = ref("http://localhost:8000/mugen/api/goods/post/excel")

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
  // purchase.medicineInList = []
  purchase.id = null
  purchase.tradeTotalAmount = null
  purchase.applyUserId = null
  purchase.applyUserName = ''
  purchase.storageOptUser = ''
  purchase.storageOptTime = null
  purchase.auditMsg = ''
  purchase.status = ''
  purchase.info = ''
  isShow()
}

function handleTagClose(tag) {
  purchase.medicineInList = purchase.medicineInList.filter(purc => purc.medicinesId != tag.medicinesId)
  isShow()
}

function isShow() {
  cartShow.value = purchase.medicineInList.length > 0
  if (cartShow.value) {
    cartVw.value = 20
  } else {
    cartVw.value = 24
  }
}

const handleSearch = () => {
  searchValue.currentPage = 1
  initializePage()
};

const handleSizeChange = (val: number) => {
  searchValue.pageSize = val;
  initializePage();
};

const handleCurrentChange = (val) => {
  initializePage()
};

function handleSelectionChange(selection: never[]) {
  selectedRowList.value = selection;
};

function nextAdd(row: any) {
  const exists = purchase.medicineInList.some(purc => purc.medicinesId === row.id);
  if (exists) {
    ElMessage.warning("不能重复添加药品");
  } else {
    rowTemp.value = row;
    rowTemp.value.sum = 1;
    editDialogVisible.value = true;
  }
}

function editSubmitForm() {
  purchase.medicineInList.push({
    medicinesId: rowTemp.value.id,
    medicinesName: rowTemp.value.medicinesName,
    size: rowTemp.value.sum
  })
  console.log("add medicine to store", purchase.medicineInList)
  rowTemp.value = null; // 使用 .value 来修改 ref 对象的值
  handleClose();
}


function nextAddBatch() {
  console.log("add medicine store", purchase.medicineInList)
  if (purchase.medicineInList.length > 0) {
    addDialogVisible.value = true
  } else {
    ElMessage.warning("清先添加商品")
  }
}

function addSubmitForm() {
  formRef.value.validate((valid) => {

    if (valid) {
      console.log('ins medicine store', purchase.medicineInList)
      post(`/erp/purchases/post`, purchase, () => {
        ElMessage.success('添加成功!')
        purchase.medicineInList = []
        initializePage()
      })
    } else {
      // 表单验证失败，不执行提交操作
      ElMessage.warning('请完整填写注单内容!');
      return false;
    }
  });
};

function validateCustomerId(rule, value, callback) {
  if (value === 0) {
    callback(new Error('请选择供应商'));
  } else {
    callback();
  }
}

const tableRowClassName = ({row, rowIndex}: {
  row: Log,
  rowIndex: number
}) => {
  if (row.stockNum < row.stockDengerNum) {
    return 'error-row';
  } else if (row.stockNum < row.stockDengerNum * 1.2) {
    return 'warning-row';
  } else {
    return '';
  }
}

const rules = {
  info: [
      { required: true, message: '请输入审核信息', trigger: 'blur' }
  ],
}
</script>
<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
.el-table .error-row {
  --el-table-tr-bg-color: var(--el-color-error-light-9);
}
.el-table .handler {
  --el-table-tr-bg-color: var(--el-color-black);
}
</style>
<style scoped>
</style>