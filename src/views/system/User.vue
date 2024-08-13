<template>
	<div style="margin-bottom: 10px;">
		<el-row>
			<el-input v-model="searchValue.name" style="width: 240px;" size="small" placeholder="请输入姓名或用户名" type="text">
				<template #prepend>
					<el-button @click="handleSearch" :icon="Search" />
				</template>
			</el-input>
			<el-input v-model="searchValue.address" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入地址" type="text"></el-input>
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
	
	<el-table :data="adminList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange" max-height=525>
		<el-table-column type="selection" width="55"/>
		<el-table-column label="头像" fixed width="55">
			<template #default="scope">
				<el-avatar :src="scope.row.userFace" :size="30"></el-avatar>	
			</template>
		</el-table-column>
		<el-table-column prop="id" label="用户编号" width="85">
		</el-table-column>
		<el-table-column prop="name" label="姓名" width="100">
		</el-table-column>
		<el-table-column prop="userName" label="用户名" width="100">
		</el-table-column>
		<el-table-column prop="telephone" label="住宅电话" width="120">
		</el-table-column>
		<el-table-column prop="phone" label="电话" width="140">
		</el-table-column>
		<el-table-column prop="address" label="地址" width="180">
		</el-table-column>
		<el-table-column prop="remark" label="备注" width="160">
		</el-table-column>
		<el-table-column label="操作" fixed="right">
			<template #default="scope">
				<el-button size="small" type="primary" @click="handleRole(scope.row)"><el-icon><Avatar /></el-icon>角色</el-button>
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
		<el-table-column label="启用" fixed="right" width="80">
		    <template #default="scope">
				<el-popconfirm
					confirm-button-text="确认"
					cancel-button-text="点错了"
					:icon="InfoFilled"
					confirm-button-type="danger"
					icon-color="#ef0004"
					title="确认要进行此操作?"
					:width="200"
					@confirm="handleEnabled(scope.row)">
					<template #reference>
						<el-switch v-model="scope.row.enabled" @click="scope.row.enabled = !scope.row.enabled"/>
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
		<el-form :model="admin" :rules="rules" ref="formRef" label-width="100px">
			<el-row>
				<el-col :span="10">
					<el-form-item label="姓名" prop="name" style="width: 260px; margin-top: 20px;">
						<el-input v-model="admin.name"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="10">
					<el-form-item label="用户名" prop="userName" style="width: 260px; margin-top: 20px;">
						<el-input v-model="admin.userName"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item label="住宅电话" prop="telephone" style="width: 400px;">
				<el-input v-model="admin.telephone"></el-input>
			</el-form-item>
			<el-form-item label="电话" prop="phone" style="width: 400px; margin-top: 20px;">
				<el-input v-model="admin.phone"></el-input>
			</el-form-item>
			<el-form-item label="联系地址" prop="address" style="width: 505px; margin-top: 20px;">
				<el-input v-model="admin.address"></el-input>
			</el-form-item>
			<el-form-item label="备注" prop="remark" style="width: 505px; margin-top: 20px;">
				<el-input v-model="admin.remark"></el-input>
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
		<el-form :model="admin" :rules="rules" ref="formRef" label-width="100px">
			<el-row>
				<el-col :span="10">
					<el-form-item label="姓名" prop="name" style="width: 260px; margin-top: 20px;">
						<el-input v-model="admin.name"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="10">
					<el-form-item label="用户名" prop="userName" style="width: 260px; margin-top: 20px;">
						<el-input v-model="admin.userName"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item label="住宅电话" prop="telephone" style="width: 400px;">
				<el-input v-model="admin.telephone"></el-input>
			</el-form-item>
			<el-form-item label="电话" prop="phone" style="width: 400px; margin-top: 20px;">
				<el-input v-model="admin.phone"></el-input>
			</el-form-item>
			<el-form-item label="联系地址" prop="address" style="width: 505px; margin-top: 20px;">
				<el-input v-model="admin.address"></el-input>
			</el-form-item>
			<el-form-item label="备注" prop="remark" style="width: 505px; margin-top: 20px;">
				<el-input v-model="admin.remark"></el-input>
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
		style="display: flex; justify-content: center; align-items: center;">
		<p style="text-align: center; margin: 0 0 20px; margin-right: 30px; font-size: 16px; ">
			权限分配
		</p>
		<div class="edit-dev">
			<el-transfer
			    v-model="organizeList"
			    style="text-align: left; display: inline-block; margin-right: 30px;"
			    filterable
			    :left-default-checked="[]"
			    :right-default-checked="[]"
			    :render-content="renderFunc"
			    :titles="['待分配', '已分配']"
			    :button-texts="['&nbsp;删除&nbsp;', '&nbsp;添加&nbsp;']"
			    :format="{
					noChecked: '${total}',
					hasChecked: '${checked}/${total}',
			    }"
				:props="{
					key: 'id',
					label: 'nameZh'
				}"
			    :data="roleList"
			    @change="handleRoleChange"></el-transfer>
		</div>
	</el-dialog>
</template>

<script setup>
	import { ref, onMounted, reactive } from 'vue';
	import { Search } from '@element-plus/icons-vue';
	import { get, post, accessHeader } from '@/net';
	import router from '@/router';
	import { useMeanStore } from '../../store';
	
	const meanStore = useMeanStore()
	
	let adminList = ref([]);
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	const roleDialogVisible = ref(false)
	
	let selectedRowList = ref([])
	let organizeList = ref([])
	let roleList = ref([])
	const count = ref(0)
	
	let searchValue = reactive({
		name: '',
		address: '',
		currentPage: 1,
		pageSize: 10
	})
	
	let admin = reactive({
		id: null,
		name: '',
		phone: '',
		telephone: '',
		address: '',
		enabled: null,
		userName: '',
		userFace: '',
		remark: '',
		slot: ''
	});

	
	let fileName = ref("multipartFiles")
	let headers =ref(accessHeader())
	let fileList =ref([])
	let postUrl = ref("http://localhost:8000/mugen/api/admins/post/excel")
		
	const formRef = ref()
	// 页面初始化加载数据
	onMounted(() => {
		initializePage();
	});
	
	// 初始化页面数据
	function initializePage() {
		post(`/admins/get`, searchValue, (data) => {
			adminList.value = data.adminList
			count.value = data.count
		})
		handleClose()
	};
	
	function handleClose() {
		addDialogVisible.value = false
		editDialogVisible.value = false
		roleDialogVisible.value = false
		admin.id = null
		admin.name = ''
		admin.phone = ''
		admin.telephone = ''
		admin.address = ''
		admin.enabled = null
		admin.userName = ''
		admin.userFace = ''
		admin.remark = ''
		admin.slot = ''
	}
	
	const handleEnabled = (row) => {
		row.enabled = !row.enabled
		post(`/admins/put/enabled`, row, () => {
			if(row.enabled) {
				ElMessage.success('已启用')
			} else {
				ElMessage.warning('已禁用, 将禁止此帐号的一切行为!')
			}
		}, () => {
			ElMessage.warning('您没有此权限')
			initializePage()
		})
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
	
    function handleRole(row) {
		get(`/roles/get/assignment/${row.id}`, (data) => {
			organizeList.value = data.organizeList.map(role => role.id)
			roleList.value = data.roleList
			admin.id = row.id
			roleDialogVisible.value = true
			console.log("organizeList init", organizeList)
		})
	}
	
	function handleRoleChange() {
		console.log("organizeList", organizeList)
		post(`/roles/put/assignment/${admin.id}`, organizeList.value,
		    () => {
		        ElMessage.success("角色分配成功");
		    });
	}
	
	function nextAdd() {
		addDialogVisible.value = true
	}
	
	function handleEdit(row) {
		admin.id = row.id
		admin.name = row.name
		admin.phone = row.phone
		admin.telephone = row.telephone
		admin.address = row.address
		admin.enabled = row.enabled
		admin.userName = row.userName
		admin.userFace = row.userFace
		admin.remark = row.remark
		admin.slot = row.slot
		editDialogVisible.value = true
	}
	
	function addSubmitForm() {
	    formRef.value.validate((valid) => {
	        if (valid) {
				post(`/admins/post`, admin, () => {
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
				post('/admins/put', admin, () => {
					ElMessage.success('修改成功!')
					initializePage()
				})
			} else {
	            ElMessage.warning('请完整填写注册表单内容!')
	        }
		});
	}
	
	function handleDelete(row) {
		get(`/admins/delete/${row.id}`, () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function handleDeleteList() {
		post(`/admins/delete`, selectedRowList.value.map(row => row.id), () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function exportData() {
		window.open(`http://localhost:8000/mugen/api/admins/get/excel`)
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
			{ required: true, message: '请输入姓名', trigger: 'blur' },
			{ max: 50, message: '姓名长度不能超过50个字符', trigger: 'blur' }
	    ],
	    userName: [
			{ required: true, message: '请输入用户名', trigger: 'blur' },
			{ max: 20, message: '用户名长度不能超过20个字符', trigger: 'blur' }
	    ],
	    telephone: [
	        { pattern: /^\d+$/, message: '请输入正确的住宅电话，只能包含数字', trigger: 'blur' }
	    ],
	    phone: [
	        { required: true, message: '请输入电话号码', trigger: 'blur' },
	        { pattern: /^(13|18|19)\d{9}$/, message: '请输入正确的11位手机号码', trigger: 'blur' }
	    ],
	    address: [
			{ required: true, message: '请输入请输入地址', trigger: 'blur' },
			{ max: 100, message: '地址长度不能超过100个字符', trigger: 'blur' }
	    ],
	    remark: [
			{ max: 200, message: '备注长度不能超过200个字符', trigger: 'blur' }
	    ]
	};
</script>

<style scoped>
	.edit-dev >>> .el-transfer-panel{

	}
	.edit-dev >>> .el-transfer-panel__body{
	    height:400px;
	} 
</style>