<template>
	<div style="margin-bottom: 10px;">
		<el-row>
			<el-input v-model="searchValue.name" style="width: 240px;" size="small" placeholder="请输入职位名称" type="text">
				<template #prepend>
					<el-button @click="handleSearch" :icon="Search" />
				</template>
			</el-input>
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
	
	<el-table :data="positionList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange" max-height=525>
		<el-table-column type="selection" width="55"/>
		<el-table-column prop="id" label="职位编号" width="100">
		</el-table-column>
		<el-table-column prop="name" label="职位名称" width="200">
		</el-table-column>
		<el-table-column prop="operationName" label="操作人" width="140">
		</el-table-column>
		<el-table-column prop="createDate" label="创建时间" width="200">
			<template #default="scope">
				{{ formatISODate(scope.row.createDate) }}
			</template>
		</el-table-column>
		<el-table-column prop="updateDate" label="修改时间" width="200">
			<template #default="scope">
				{{ formatISODate(scope.row.updateDate) }}
			</template>
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
		<el-form :model="position" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="职位名称" prop="name" style="width: 520px; margin-top: 20px;">
				<el-input v-model="position.name"></el-input>
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
		<el-form :model="position" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="职位名称" prop="name" style="width: 520px; margin-top: 20px;">
				<el-input v-model="position.name"></el-input>
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
	
	let positionList = ref([]);
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	
	let selectedRowList = ref([])
	const count = ref(0)
	
	let searchValue = reactive({
		name: '',
		currentPage: 1,
		pageSize: 10
	})
	
	interface Position {
		id: number | null,
		name: string, 
		createDate: Date | null,
		enabled: boolean, 
		updateDate: Date | null, 
		operationId: number,
		isDelete: boolean
	};

	
	let position: Position = reactive({
		id: null, // Integer
		name: '', // String
		createDate: null, // Date
		enabled: true, // Boolean
		updateDate: null, // Date
		operationId: 0, // Integer
		isDelete: false // Boolean
	})
	
	let fileName = ref("multipartFiles")
	let headers =ref(accessHeader())
	let fileList =ref([])
	let postUrl = ref("http://localhost:8000/mugen/api/positions/post/excel")
		
	const formRef = ref()
	// 页面初始化加载数据
	onMounted(() => {
		initializePage();
	});
	
	// 初始化页面数据
	function initializePage() {
		post(`/positions/get`,searchValue , (data: any) => {
			positionList.value = data.positionList
			count.value = data.count
		})
		handleClose()
	};
	
	function handleClose() {
		addDialogVisible.value = false
		editDialogVisible.value = false
		position.id = null
		position.name = ''
		position.createDate = null
		position.enabled = true
		position.updateDate = null 
		position.operationId = 0
		position.isDelete = false
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
	
	function nextAdd() {
		addDialogVisible.value = true
	}
	
	function handleEdit(row: Position) {
		position.id = row.id
		position.name = row.name
		position.createDate = row.createDate
		position.enabled = row.enabled
		position.updateDate = row. updateDate
		position.operationId = row.operationId
		position.isDelete = row.isDelete
		editDialogVisible.value = true
	}
	
	function addSubmitForm() {
	    formRef.value.validate((valid: any) => {
	        if (valid) {
				post(`/positions/post`, position, () => {
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
		formRef.value.validate((valid: any) => {
			if(valid) {
				post('/positions/put', position, () => {
					ElMessage.success('修改成功!')
					initializePage()
				})
			} else {
	            ElMessage.warning('请完整填写注册表单内容!')
	        }
		});
	}
	
	function handleDelete(row) {
		get(`/positions/delete/${row.id}`, () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function handleDeleteList() {
		post(`/positions/delete`, selectedRowList.value.map(row => row.id), () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function exportData() {
		window.open(`http://localhost:8000/mugen/api/positions/get/excel`)
	}
	
	function uploadSuccess(data) {
		if (data.code === 200) {
			ElMessage.success("上传成功!")
		initializePage();
		} else (
			ElMessage.warning(data.message)
		)
	}
	
	function formatISODate(isoDateString: string | number | Date) {
		const date = new Date(isoDateString);
	
		// 获取年份的后两位
		const year = date.getFullYear().toString();
	
		// 获取月份和日期，确保两位数
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
	
		// 获取小时、分钟和秒，确保两位数
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
	
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}
	
	let rules = {
	    name: [
	        { required: true, message: '名称不能为空' },
	        { max: 50, message: '名称不能超过50个字' },
	    ]
	};
</script>

<style scoped>
</style>