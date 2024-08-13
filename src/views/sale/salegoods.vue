<template>
	<div style="margin-bottom: 10px;">
		<el-row>
			<el-input v-model="searchValue.name" style="width: 240px;" size="small" placeholder="请输入商品名称" type="text">
				<template #prepend>
					<el-button @click="handleSearch" :icon="Search" />
				</template>
			</el-input>
			<el-input v-model="searchValue.producer" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入生产厂商" type="text"></el-input>
			<el-button  @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small" type="primary">搜索</el-button>
			<el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small" @click="nextAddBatch">出库<el-icon><Upload /></el-icon></el-button>
			<el-button  @click="cart.goodsInList = []; isShow() " style="margin-left: 5px; width: 75px; height: 32px;" size="small" type="warning">清空订单</el-button>
		</el-row>
	</div>
	<el-row>
		<el-col :span="4" v-show="cartShow" style="padding-right: 5px; height: 75vh;">
			<el-card style="height: 75vh;">
				<el-tag
				    v-for="tag in cart.goodsInList"
				    :key="tag.id"
				    closable
				    :disable-transitions="false"
				    @close="handleTagClose(tag)"
				    >
					{{ tag.name }}
				</el-tag>
			</el-card>
		</el-col>
		<el-col :span="cartVw">
			<el-table :data="goodsList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange" max-height=525>
				<el-table-column prop="code" label="商品编号" width="117">
				</el-table-column>
				<el-table-column prop="name" label="商品名称" width="180">
				</el-table-column>
				<el-table-column prop="inventoryQuantity" label="库存数量" width="81">
				</el-table-column>
				<el-table-column prop="model" label="型号" width="95">
				</el-table-column>
				<el-table-column prop="unit" label="商品单位" width="81">
				</el-table-column>
				<el-table-column prop="producer" label="生产产商" width="180">
				</el-table-column>
				<el-table-column prop="purchasingPrice" label="采购价" width="78">
				</el-table-column>
				<el-table-column prop="sellingPrice" label="出库价" width="78">
				</el-table-column>
				<el-table-column prop="lastPurchasingPrice" label="上次采购价格" width="110">
				</el-table-column>
				<el-table-column prop="maxNum" label="库存上线" width="81">
				</el-table-column>
				<el-table-column prop="minNum" label="库存下线" width="81">
				</el-table-column>
				<el-table-column prop="remarks" label="备注" width="200">
				</el-table-column>
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
		
		<el-form :model="cart" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="出库单据" prop="saleNumber" style="width: 500px;">
				<el-input v-model="cart.saleNumber"></el-input>
			</el-form-item>
			<el-form-item label="客户" prop="customerId" style="width: 500px;">
				<el-select v-model="cart.customerId" placeholder="无" filterable>
					<el-option key="" label="无" value="0"></el-option>
					<el-option v-for="item in customerList" :key="item.id" :label="item.name" :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			
			<el-row>
				<el-form-item label="实付金额" prop="amountPaid">
					<el-input-number v-model="cart.amountPaid"></el-input-number>
				</el-form-item>
				<el-form-item label="是否付款" prop="state">
					<el-select v-model="cart.state" placeholder="未支付" style="width: 150px;">
						<el-option :key="0" label="未支付" :value="0"></el-option>
						<el-option :key="1" label="已支付" :value="1"></el-option>
					</el-select>
				</el-form-item>
			</el-row>
			
			<el-form-item label="备注" prop="remarks" style="width: 500px;">
				<el-input v-model="cart.remarks"></el-input>
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
	
	let goodsList = ref([]);
	let customerList = ref([])
	let goodsTypeTree = ref([])
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	const cartShow = ref(false)
	
	let selectedRowList = ref([])
	const count = ref(0)
	let cartVw = ref(24)
	
	const rowTemp = ref(null)
	
	let searchValue = reactive({
		name: '',
		producer: '',
		currentPage: 1,
		pageSize: 10
	})
	
	let goods = reactive({
		id: null, 
		code: '',
		name: '',
		inventoryQuantity: null, 
		maxNum: null, 
		minNum: null,
		model: '', 
		producer: '', 
		purchasingPrice: null, 
		remarks: '', 
		sellingPrice: null, 
		unit: '', 
		typeId: null, 
		lastPurchasingPrice: null,
	})
	
	let cart = reactive({
		saleNumber: '',
		customerId: null,
		amountPayable: null,
		amountPaid: null,
		remarks: '',
		state: 0,
		userId: null,
		goodsInList: []
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
		post(`/goods/get/store`,searchValue , (data: any) => {
			goodsList.value = data.goodsList
			count.value = data.count
		})
		get(`/customers/get`, (data:　any) => {
			customerList.value = data
		})
		handleClose()
	};
	
	function handleClose() {
		addDialogVisible.value = false
		editDialogVisible.value = false
		goods.id = null
		goods.code = ''
		goods.name = ''
		goods.inventoryQuantity = null
		goods.maxNum = null
		goods.minNum = null
		goods.model = ''
		goods.producer = ''
		goods.purchasingPrice = null
		goods.remarks = ''
		goods.sellingPrice = null
		goods.typeId = null
		goods.unit = ''
		goods.lastPurchasingPrice = null
		cart.saleNumber = ''
		cart.customerId = null
		cart.amountPayable = null
		cart.amountPaid = null
		cart.remarks = ''
		cart.state = 0
		cart.userId = null
		isShow()
	}
	
	function handleTagClose(tag) {
		cart.goodsInList = cart.goodsInList.filter(goods => goods.id != tag.id)
		isShow()
	}
	
	function isShow() {
		cartShow.value = cart.goodsInList.length > 0
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
		const flog: boolean = true
		cart.goodsInList.forEach(goods => {
			if (goods.id === row.id) {
				ElMessage.warning("不能重复添加商品")
				flog = false
			}
		})
		if (flog) {
			rowTemp.value = row
			rowTemp.value.sum = 1
			editDialogVisible.value = true
		}
	}
	
	function editSubmitForm() {
		if (rowTemp.value.sum > rowTemp.value.inventoryQuantity) {
			ElMessage.warning("数量不能超过库存")
		} else {
			  cart.goodsInList.push({
				id: rowTemp.value.id,
				name: rowTemp.value.name,
				size: rowTemp.value.sum
			})
			rowTemp.value = null; // 使用 .value 来修改 ref 对象的值
			handleClose();
		}
	  
	}
	
		
	function nextAddBatch() {
		console.log("add goods store", cart.goodsInList)
		if (cart.goodsInList.length > 0) {
			addDialogVisible.value = true
		} else {
			ElMessage.warning("清先添加商品")
		}
	}
	
	function addSubmitForm() {
	    formRef.value.validate((valid) => {
	        if (valid) {
				console.log('cart goodsInList', cart.goodsInList)
				post(`/saleLists/post/cart`, cart, () => {
					ElMessage.success('添加成功!')
					cart.goodsInList = []
					initializePage()
				})
	        } else {
	            // 表单验证失败，不执行提交操作
	            ElMessage.warning('请完整填写注册表单内容!');
	            return false;
	        }
	    });
	};
	
	function validateCustomerId(rule, value, callback) {
	    if (value === 0) {
	        callback(new Error('请选择客户'));
	    } else {
	        callback();
	    }
	}
	
	const rules = {
		saleNumber: [
			{ required: true, message: '请输入入库单据', trigger: 'blur' }
		],
		customerId: [
			{ required: true, message: '请选择客户', trigger: 'change' },
			{ validator: validateCustomerId, trigger: 'change' }
		],
		amountPayable: [
			{ required: true, message: '请输入应付金额', trigger: 'blur' },
			{ type: 'number', message: '金额必须为数字值', trigger: 'blur' },
		],
		amountPaid: [
			{ required: true, message: '请输入实付金额', trigger: 'blur' },
			{ type: 'number', message: '金额必须为数字值', trigger: 'blur' }
		],
		state: [
			{ required: true, message: '请选择是否付款', trigger: 'change' }
		],
		remarks: [
			{ required: false, message: '请输入备注', trigger: 'blur' }
		]
	}
</script>

<style scoped> 
</style>