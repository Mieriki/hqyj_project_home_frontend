<template>
	<el-row style="margin-bottom: 10px;">
		<!-- 搜索框 -->
		<div>
			<el-input v-model="searchValue.purchaseNumber" style="width: 360px; margin-left: 5px;" size="small"
				placeholder="请输入商品名称" type="text">
				<template #prepend>
					<el-button @click="handleSearch" :icon="Search" />
				</template>
				<template #append>
					<el-select v-model="searchValue.state" placeholder="是否支付" style="width: 120px;">
						<el-option key="" label="无" value=""></el-option>
						<el-option :key="0" label="未支付" :value="0"></el-option>
						<el-option :key="1" label="已支付" :value="1"></el-option>
					</el-select>
				</template>
			</el-input>
		</div>
		<el-button @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small"
			type="primary">搜索</el-button>
		<el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small"
			@click="exportData">导出<el-icon>
				<Upload />
			</el-icon></el-button>
	</el-row>
	
	<el-table :data="cartList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange"
		max-height="525">
		<el-table-column prop="id" label="订单编号" width="100">
		</el-table-column>
		<el-table-column prop="amountPaid" label="实付金额" width="120">
		</el-table-column>
		<el-table-column prop="amountPayable" label="应付金额" width="120">
		</el-table-column>
		<el-table-column prop="saleDate" label="进货日期" width="160">
			<template #default="{ row }">
				{{ formatDate(row.saleDate) }}
			</template>
		</el-table-column>
		
		<el-table-column prop="saleNumber" label="销售单号" width="180">
		</el-table-column>
		<el-table-column prop="customer" label="客户" width="200">
		</el-table-column>
		<el-table-column prop="user" label="操作员" width="120">
		</el-table-column>
		<el-table-column prop="remarks" label="备注" width="200">
		</el-table-column>
		<el-table-column prop="state" label="交易状态" fixed="right" width="100">
			<template #default="{ row }">
				<!-- {{ row.state === 1 ? '已支付' : '未支付' }} -->
				<el-popconfirm 
					confirm-button-text="确定" 
					cancel-button-text="点错了" 
					:icon="InfoFilled"
					confirm-button-type="danger" 
					icon-color="#ef0004" title="确认更改次账单的支付状态?" 
					:width="200"
					@confirm="handlePay(row)">
					<template #reference>
						 <el-switch
						    v-model="row.pay"
						    inline-prompt
						    active-text="已支付"
						    inactive-text="未支付"
							@click="row.pay = !row.pay"
						  />
					</template>
				</el-popconfirm>
			</template>
		</el-table-column>
		<el-table-column label="操作" fixed="right" width="75">
			<template #default="{ row }">
				<el-button size="small" type="success" @click="handleEdit(row)">详情</el-button>
			</template>
		</el-table-column>
	</el-table>
	
	<div style="padding: 10px 0; position: absolute; bottom: 2%;">
		<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
			v-model:current-page="searchValue.currentPage" :page-sizes="[5, 10, 15, 20]"
			:page-size="searchValue.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="count">
		</el-pagination>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted, reactive } from 'vue';
	import { Search } from '@element-plus/icons-vue';
	import { get, post, accessHeader } from '@/net';
	import router from '@/router';
	
	let cartList = ref([]);
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	
	let selectedRowList = ref([])
	const count = ref(0)
	
	let searchValue = reactive({
		saleNumber: '',
		state: '',
		currentPage: 1,
		pageSize: 10
	})
	
	let cart = reactive({
		id: null,
		amountPaid: null,
		amountPayable: null,
		saleDate: null,
		remarks: '',
		state: null,
		saleNumber: '',
		customer: '',
		user: ''
	})
	
	let fileName = ref("multipartFiles")
	let headers = ref(accessHeader())
	let fileList = ref([])
	let postUrl = ref("http://localhost:8000/mugen/api/saleLists/post/excel")
	
	const formRef = ref()
	// 页面初始化加载数据
	onMounted(() => {
		initializePage();
	});
	
	// 初始化页面数据
	function initializePage() {
		post(`/saleLists/get`, searchValue, (data) => {
			cartList.value = data.cartList.map(cart => {
				cart.pay = cart.state === 1 ? true : false
				cart.saleDate = new Date(cart.saleDate).toLocaleDateString('zh-CN')
				return cart
			});
			console.log('cartList', cartList)
			count.value = data.count
		})
		handleClose()
	};
	
	function handleClose() {
		addDialogVisible.value = false
		editDialogVisible.value = false
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
	
	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('zh-CN');
	}
	
	function handlePay(row) {
		post(`/saleLists/put`, {
			id:　row.id,
			state: row.pay ? 0 : 1
		}, () => {
			ElMessage.success("状态已更新")
			initializePage()
		})
	}
</script>

<style scoped>
</style>