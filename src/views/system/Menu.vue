<template>
	<div style="margin-bottom: 10px;">
		<el-row>
			<el-input v-model="searchValue.name" style="width: 240px;" size="small" placeholder="请输入联系人" type="text">
				<template #prepend>
					<el-button @click="handleSearch" :icon="Search" />
				</template>
			</el-input>
			<el-button  @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small" type="primary">搜索</el-button>	
			<el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small" @click="exportData">导出<el-icon><Upload /></el-icon></el-button>
		</el-row>
	</div>
	
	<el-table 
		:data="menuList" 
		row-key="id"
		border 
		:header-cell-class-name="headerBg" 
		:tree-props="{ 
			children: 'children'
		}" 
		max-height=570>
		<el-table-column prop="id" label="菜单编号" width="200">
		</el-table-column>
		<el-table-column  label="图标" width="250">
			<template #default="scope">
				<component :is="scope.row.iconCls ? scope.row.iconCls : MoreFilled " class="iconColor"></component>
			</template>
		</el-table-column>
		<el-table-column prop="name" label="菜单名称" width="250">
		</el-table-column>
		<el-table-column prop="path" label="地址" width="250">
		</el-table-column>
		<el-table-column prop="component" label="路由">
		</el-table-column>
		
	</el-table>
</template>

<script setup lang="ts">
	import { ref, onMounted, reactive } from 'vue';
	import { Search, HomeFilled, Tools, Files, Van, Wallet, Histogram, Box, MoreFilled } from '@element-plus/icons-vue';
	import { get, post, accessHeader } from '@/net';
	import router from '@/router';
	
	let menuList = ref([]);
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	
	let selectedRowList = ref([])
	const count = ref(0)
	
	let searchValue = reactive({
		name: ''
	})
	
	let menu = reactive({
	
	})
	
	let fileName = ref("multipartFiles")
	let headers =ref(accessHeader())
	let fileList =ref([])
	let postUrl = ref("http://localhost:8000/mugen/api/menus/post/excel")
		
	const formRef = ref()
	// 页面初始化加载数据
	onMounted(() => {
		initializePage();
	});
	
	// 初始化页面数据
	function initializePage() {
		post(`/menus/get/tree`, searchValue, (data: any) => {
			menuList.value = data
			console.log("menuList page init", menuList)
		})

	};
	
	const handleSearch = () => {
		initializePage()
	};	
	
	function exportData() {
		window.open(`http://localhost:8000/mugen/api/menus/get/excel`)
	}
	
</script>

<style scoped>
	.iconColor {
		width: 18px;
		height: 18px;
		margin-left: 3px;
		margin-top: 3px;
		color: #b1b3b8;
	}
</style>