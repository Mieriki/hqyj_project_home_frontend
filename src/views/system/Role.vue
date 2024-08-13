<template>
	<div style="margin-bottom: 10px;">
		<el-row>
			<el-input v-model="searchValue.name" style="width: 240px;" size="small" placeholder="请输入角色或角色名称" type="text">
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
	
	<el-table :data="roleList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange" max-height=525>
		<el-table-column type="selection" width="55"/>
		<el-table-column prop="id" label="角色编号" width="280">
		</el-table-column>
		<el-table-column prop="name" label="角色" width="310">
		</el-table-column>
		<el-table-column prop="nameZh" label="角色名称" width="310">
		</el-table-column>
		<el-table-column label="操作" fixed="right">
			<template #default="scope">
				<el-button size="small" type="primary" @click="handleRole(scope.row)">分配权限<el-icon><Avatar /></el-icon></el-button>
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
		<el-form :model="role" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="角色" prop="name" style="width: 505px; margin-top: 20px;">
				<el-input v-model="role.name"></el-input>
			</el-form-item>
			<el-form-item label="角色名称" prop="nameZh" style="width: 505px; margin-top: 20px;">
				<el-input v-model="role.nameZh"></el-input>
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
		<el-form :model="role" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="角色" prop="name" style="width: 505px; margin-top: 20px;">
				<el-input v-model="role.name"></el-input>
			</el-form-item>
			<el-form-item label="角色名称" prop="nameZh" style="width: 505px; margin-top: 20px;">
				<el-input v-model="role.nameZh"></el-input>
			</el-form-item>
			<el-row style="display: flex; justify-content: center; align-items: center; ">
				<el-button type="primary" style="width: 200px; margin-top: 20px;" @click="editSubmitForm">修改</el-button>
				<el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消</el-button>
			</el-row>
		</el-form>
	</el-dialog>
	
	<el-dialog
		v-if="roleDialogVisible"
		v-model="roleDialogVisible"
		:before-close="handleClose"
		width=500>
		<el-tree
			ref="treeRef"
			style="max-width: 500px; margin-left: 30px;"
			:data="roleTree"
			show-checkbox
			node-key="id"
			highlight-current
			:default-checked-keys="checkedKeyList"
			:props="{
				id: 'id',
				label: 'name'
			}"
		/>
		<el-button type="primary" style="width: 200px; margin-top: 20px; margin-left: 5px;" @click="roleSubmitForm">确认</el-button>
		<el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消</el-button>
			
	</el-dialog>
</template>

<script setup lang="ts">
	import { ref, onMounted, reactive } from 'vue';
	import { Search } from '@element-plus/icons-vue';
	import { get, post, accessHeader } from '@/net';
	import router from '@/router';
	import { ElTree } from 'element-plus';
	
	let roleList = ref([]);
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	const roleDialogVisible = ref(false)
	
	let selectedRowList = ref([])
	const treeRef = ref<InstanceType<typeof ElTree>>()
	let roleTree = ref([])
	const checkedKeyList = ref<InstanceType<typeof ElTree>>()
	const count = ref(0)
	
	let searchValue = reactive({
		name: '',
		currentPage: 1,
		pageSize: 10
	})
	
	let role = reactive({
		id: null,
		name: '',
		nameZh: ''
    })
	
	let fileName = ref("multipartFiles")
	let headers =ref(accessHeader())
	let fileList =ref([])
	let postUrl = ref("http://localhost:8000/mugen/api/roles/post/excel")
		
	const formRef = ref()
	// 页面初始化加载数据
	onMounted(() => {
		initializePage();
	});
	
	// 初始化页面数据
	function initializePage() {
		post(`/roles/get`,searchValue , (data: any) => {
			roleList.value = data.roleList
			count.value = data.count
		})
		handleClose()
	};
	
	function handleClose() {
		addDialogVisible.value = false
		editDialogVisible.value = false
		roleDialogVisible.value = false
		role.id = null
		role.name = ''
		role.nameZh = ''
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
	
	function handleRole (row: any) {
		role.id = row.id
		get(`/menus/get/tree/${row.id}`, (data) => {
			roleTree.value = data
			console.log("roleTree", roleTree)
			roleDialogVisible.value = true
		})
		
		get(`/menus/get/tree/default/${row.id}`, (data) => {
			checkedKeyList.value = data
			console.log("checkedKeyList", checkedKeyList)
		})
	} 
	
	function nextAdd() {
		addDialogVisible.value = true
	}
	
	function handleEdit(row: { id: null; name: string; nameZh: string; }) {
		role.id = row.id
		role.name = row.name
		role.nameZh = row.nameZh
		editDialogVisible.value = true
	}
	
	const roleSubmitForm = () => {
		console.log("updata role", treeRef.value!.getCheckedKeys(false))
		post(`/menus/put/tree`, {
			id: role.id,
			menuIdList: treeRef.value!.getCheckedKeys(false)
		}, () => {
			ElMessage.success("权限分配成功")
			checkedKeyList.value =  treeRef.value!.getCheckedKeys(false)
			handleClose()
		})
	}
	
	function addSubmitForm() {
	    formRef.value.validate((valid: any) => {
	        if (valid) {
				post(`/roles/post`, role, () => {
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
				post('/roles/put', role, () => {
					ElMessage.success('修改成功!')
					initializePage()
				})
			} else {
	            ElMessage.warning('请完整填写注册表单内容!')
	        }
		});
	}
	
	function handleDelete(row) {
		get(`/roles/delete/${row.id}`, () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function handleDeleteList() {
		post(`/roles/delete`, selectedRowList.value.map(row => row.id), () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function exportData() {
		window.open(`http://localhost:8000/mugen/api/roles/get/excel`)
	}
	
	function uploadSuccess(data) {
		if (data.code === 200) {
			ElMessage.success("上传成功!")
		initializePage();
		} else (
			ElMessage.warning(data.message)
		)
	}
	
	const rules = {
	    name: [
			{ required: true, message: '请输入角色', trigger: 'blur' },
			{ max: 50, message: '角色长度不能超过50个字符', trigger: 'blur' }
	    ],
	    nameZh: [
	    	{ required: true, message: '请输入角色名称', trigger: 'blur' },
	    	{ max: 50, message: '角色名称长度不能超过50个字符', trigger: 'blur' }
	    ]
	};
</script>

<style scoped>
</style>