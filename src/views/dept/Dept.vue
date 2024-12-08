<template>
	<div style="margin-bottom: 10px;">
		<el-row>
			<el-input v-model="searchValue.name" style="width: 240px;" size="small" placeholder="部门名称" type="text">
				<template #prepend>
					<el-button @click="handleSearch" :icon="Search" />
				</template>
			</el-input>
			<el-button  @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small" type="primary">搜索</el-button>

			<el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small" @click="exportData">导出<el-icon><Upload /></el-icon></el-button>
		</el-row>
	</div>
	
	<el-table 
		:data="departmentList" 
		row-key="id"
		border 
		:header-cell-class-name="headerBg" 
		:tree-props="{ 
			children: 'children'
		}" 
		default-expand-all
		max-height=570>
		<el-table-column prop="name" label="部门名称" width="300">
		</el-table-column>
		<el-table-column  label="状态" width="180">
			<template #default="scope">
				<el-tag v-if="scope.row.enabled" type="primary">正常</el-tag>
				<el-tag v-if="!scope.row.enabled" type="danger">异常</el-tag>
			</template>
		</el-table-column>
		<el-table-column prop="id" label="部门编号" width="180">
		</el-table-column>
		<el-table-column prop="isParent" label="是否为末尾" width="180">
			<template #default="scope">
				{{ !scope.row.isParent ? "是" : "否" }}
			</template>
		</el-table-column>
		<el-table-column prop="depPath" label="地址" width="250">
		</el-table-column>
		<el-table-column label="操作" fixed="right">
			<template #default="scope">
				<el-button type="primary" size="small" @click="nextAdd(scope.row)">新增</el-button>
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
	
	<el-dialog
		v-if="addDialogVisible"
		v-model="addDialogVisible"
		width=620
	    :before-close="handleClose">
		<el-form :model="department" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="部门名称" prop="name" style="width: 520px; margin-top: 20px;">
				<el-input v-model="department.name"></el-input>
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
		<el-form :model="department" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="部门名称" prop="name" style="width: 520px; margin-top: 20px;">
				<el-input v-model="department.name"></el-input>
			</el-form-item>
			<el-form-item label="部门名称" prop="name" style="width: 520px; margin-top: 20px;">
				<el-select v-model="department.enabled">
					<el-option key=true label="启用" :value="true"></el-option>
					<el-option key=false label="禁用" :value="false"></el-option>
				</el-select>
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
	
	let departmentList = ref([]);
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	
	let selectedRowList = ref([])
	const count = ref(0)
	
	let searchValue = reactive({
		name: ''
	})
	
	interface Department {
		id: number; 
		parentId: number; 
		enabled: boolean; 
		name: string; 
		depPath: string; 
		isParent: boolean; 
	}
	
	let department: Department = reactive({
		id: 0,
		name: '',
		parentId: 0,
		depPath: '',
		enabled: false,
		isParent: false,
	})
	
	let fileName = ref("multipartFiles")
	let headers =ref(accessHeader())
	let fileList =ref([])
	let postUrl = ref("http://localhost:8000/mugen/api/departments/post/excel")
		
	const formRef = ref()
	// 页面初始化加载数据
	onMounted(() => {
		initializePage();
	});
	
	// 初始化页面数据
	function initializePage() {
		post(`/departments/get/tree`,searchValue , (data: any) => {
			departmentList.value = data
		})
		
		handleClose()
	};
	
	function handleClose() {
		addDialogVisible.value = false
		editDialogVisible.value = false
		department.id = 0
		department.parentId = 0
		department.enabled = false
		department.name = ''
		department.depPath = ''
		department.isParent = false
	}
	
	const handleSearch = () => {
		initializePage()
	};
	
	const handleSizeChange = (val: any) => {
		initializePage();
	};
	
	const handleCurrentChange = (val) => {
		initializePage()
	};
	
	function handleSelectionChange(selection: never[]) {
		selectedRowList.value = selection;
	};
	
	function nextAdd(row: Department) {
		department.parentId = row.id
		addDialogVisible.value = true
	}
	
	function handleEdit(row: Department) {
		department.id = row.id
		department.parentId = row.parentId
		department.enabled = row.enabled
		department.name = row.name
		department.depPath = row.depPath
		department.isParent = row.isParent
		editDialogVisible.value = true
	}
	
	function addSubmitForm() {
	    formRef.value.validate((valid: any) => {
	        if (valid) {
				post(`/departments/post`, department, () => {
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
				post('/departments/put', department, () => {
					ElMessage.success('修改成功!')
					initializePage()
				})
			} else {
	            ElMessage.warning('请完整填写注册表单内容!')
	        }
		});
	}
	
	function handleDelete(row: Department) {
		get(`/departments/delete/${row.id}`, () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function handleDeleteList() {
		post(`/departments/delete`, selectedRowList.value.map(row => row.id), () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function exportData() {
		window.open(`http://localhost:8000/mugen/api/departments/get/excel`)
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