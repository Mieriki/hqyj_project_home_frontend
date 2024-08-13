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
			<el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small" @click="exportData">导出<el-icon><Upload /></el-icon></el-button>
		</el-row>
	</div>
	
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
		<el-table-column prop="remarks" label="备注">
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
</template>

<script setup lang="ts">
	import { ref, onMounted, reactive } from 'vue';
	import { Search } from '@element-plus/icons-vue';
	import { get, post, accessHeader } from '@/net';
	import router from '@/router';
	
	let goodsList = ref([]);
	let goodsTypeTree = ref([])
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	
	let selectedRowList = ref([])
	const count = ref(0)
	
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
		lastPurchasingPrice: null 
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
</script>

<style scoped>
</style>