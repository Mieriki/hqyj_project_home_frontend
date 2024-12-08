<template>
	<el-row style="height: 100%;">
		<el-col :span="4">
			<el-card style="height: 80vh; padding-left: 0px;">
				<el-tree
					ref="treeRef"
					:data="employeeTypeTree"
					node-key="id"
					highlight-current
					:props="{
						id: 'id',
						label: 'name'
					}"
					@node-click="handleNodeClick"
					style="left: -10px; width: 110%;"
				/>
			</el-card>
		</el-col>
		<el-col :span="20" style="padding-left: 10px;">
			<div style="margin-bottom: 10px;">
				<el-row>
					<el-input v-model="searchValue.name" style="width: 400px; " size="small" placeholder="请输入员工姓名" type="text">
						<template #prepend>
						    <el-button @click="handleSearch" :icon="Search" />
						</template>
						<template #append>
							<el-select v-model="searchValue.posId" placeholder="岗位" style="width: 140px;">
								<el-option key=0 :label="searchValue.posId === '0' ? '岗位' : '无'" value='0'></el-option>
								<el-option v-for="item in positionList" :key="item.id" :label="item.name" :value="item.id"></el-option>
							</el-select>
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
			
			<el-table :data="employeeList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange" max-height=525>
				<el-table-column type="selection" width="45"/>
				<el-table-column prop="id" label="员工编号" width="81" fixed>
				</el-table-column>
				<el-table-column prop="name" label="员工姓名" width="81" fixed>
				</el-table-column>
				<el-table-column prop="gender" label="性别" width="55">
				</el-table-column>
				<el-table-column prop="birthday" label="出生日期" width="117">
					<template #default="scope">
						{{ formatISODate(scope.row.birthday) }}
					</template>
				</el-table-column>
				<el-table-column prop="idCard" label="身份证号" width="180">
				</el-table-column>
				<el-table-column prop="wedlock" label="婚姻状况" width="81">
				</el-table-column>
				<el-table-column prop="nationName" label="民族" width="80">
				</el-table-column>
				<el-table-column prop="email" label="邮箱" width="190">
				</el-table-column>
				<el-table-column prop="phone" label="电话" width="120">
				</el-table-column>
				<el-table-column prop="departmentName" label="所属部门" width="100">
				</el-table-column>
				<el-table-column prop="posName" label="职位" width="120">
				</el-table-column>
				<el-table-column label="操作" fixed="right" width="135">
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
			
			<div style="padding: 10px 0; position: absolute; bottom: -10px;">
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
		<el-form :model="employee" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="员工姓名" prop="name" style="width: 400px; margin-top: 20px;">
				<el-input v-model="employee.name"></el-input>
			</el-form-item>
			<el-row>
				<el-col :span="12">
					<el-form-item label="生日" prop="birthday">
						<el-date-picker v-model="employee.birthday" type="date" placeholder="选择日期"></el-date-picker>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="民族" prop="nationId" style="width: 250px;">
						<el-select v-model="employee.nationId" placeholder="民族" style="width: 140px;">
							<el-option v-for="item in nationList" :key="item.id" :label="item.name" :value="item.id"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="9">
					<el-form-item label="性别" prop="gender" style="width: 400px;">
						<el-radio-group v-model="employee.gender" style="position: absolute;">
						      <el-radio value="男" size="large">男</el-radio>
						      <el-radio value="女" size="large">女</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
				<el-col :span="9">
					<el-form-item label="婚姻状况" prop="wedlock" style="width: 400px;">
						<el-radio-group v-model="employee.wedlock" style="position: absolute;">
						      <el-radio value="未婚" size="large">未婚</el-radio>
						      <el-radio value="已婚" size="large">已婚</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item label="部门" prop="departmentId" style="width: 400px;">
				<el-select v-model="employee.departmentId" placeholder="部门" style="width: 140px;">
					<el-option v-for="item in departmentList" :key="item.id" :label="item.name" :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="职位" prop="posId" style="width: 400px;">
				<el-select v-model="employee.posId" placeholder="职位" style="width: 140px;">
					<el-option v-for="item in positionList" :key="item.id" :label="item.name" :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="身份证号" prop="idCard" style="width: 400px;">
				<el-input v-model="employee.idCard"></el-input>
			</el-form-item>
			<el-form-item label="邮箱" prop="email" style="width: 400px;">
				<el-input v-model="employee.email"></el-input>
			</el-form-item>
			<el-form-item label="电话号码" prop="phone" style="width: 400px;">
				<el-input v-model="employee.phone"></el-input>
			</el-form-item>
			<el-form-item label="联系地址" prop="address" style="width: 400px;">
				<el-input v-model="employee.address"></el-input>
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
		<el-form :model="employee" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="员工姓名" prop="name" style="width: 400px; margin-top: 20px;">
				<el-input v-model="employee.name"></el-input>
			</el-form-item>
			<el-row>
				<el-col :span="12">
					<el-form-item label="生日" prop="birthday">
						<el-date-picker v-model="employee.birthday" type="date" placeholder="选择日期"></el-date-picker>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="民族" prop="nationId" style="width: 250px;">
						<el-select v-model="employee.nationId" placeholder="民族" style="width: 140px;">
							<el-option v-for="item in nationList" :key="item.id" :label="item.name" :value="item.id"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="9">
					<el-form-item label="性别" prop="gender" style="width: 400px;">
						<el-radio-group v-model="employee.gender" style="position: absolute;">
						      <el-radio value="男" size="large">男</el-radio>
						      <el-radio value="女" size="large">女</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
				<el-col :span="9">
					<el-form-item label="婚姻状况" prop="wedlock" style="width: 400px;">
						<el-radio-group v-model="employee.wedlock" style="position: absolute;">
						      <el-radio value="未婚" size="large">未婚</el-radio>
						      <el-radio value="已婚" size="large">已婚</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item label="部门" prop="departmentId" style="width: 400px;">
				<el-select v-model="employee.departmentId" placeholder="部门" style="width: 140px;">
					<el-option v-for="item in departmentList" :key="item.id" :label="item.name" :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="职位" prop="posId" style="width: 400px;">
				<el-select v-model="employee.posId" placeholder="职位" style="width: 140px;">
					<el-option v-for="item in positionList" :key="item.id" :label="item.name" :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="身份证号" prop="idCard" style="width: 400px;">
				<el-input v-model="employee.idCard"></el-input>
			</el-form-item>
			<el-form-item label="邮箱" prop="email" style="width: 400px;">
				<el-input v-model="employee.email"></el-input>
			</el-form-item>
			<el-form-item label="电话号码" prop="phone" style="width: 400px;">
				<el-input v-model="employee.phone"></el-input>
			</el-form-item>
			<el-form-item label="联系地址" prop="address" style="width: 400px;">
				<el-input v-model="employee.address"></el-input>
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
	
	let employeeList = ref([]);
	let employeeTypeTree = ref([])
	let positionList = ref([]);
	let nationList = ref([]);
	let departmentList = ref([]);
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	
	let selectedRowList = ref([])
	const count = ref(0)
	
	let searchValue = reactive({
		name: '',
		posId: '0',
		departmentIdList: [],
		currentPage: 1,
		pageSize: 10
	})
	
	interface Employee {
		id: null | number,
		name: string,
		gender: string,
		birthday: null | Date,
		idCard: string,
		wedlock: string,
		nationId: null | number,
		nationName: string,
		email: string,
		phone: string,
		address: string,
		departmentId: null | number,
		departmentName: string,
		posId: null | number,
		posName: string
	}		
	
	let employee: Employee = reactive({
		id: null, // 员工编号
		name: '', // 员工姓名
		gender: '', // 性别
		birthday: null, // 出生日期
		idCard: '', // 身份证号
		wedlock: '', // 婚姻状况
		nationId: null, // 民族
		nationName: '',
		email: '', // 邮箱
		phone: '', // 电话号码
		address: '', // 联系地址
		departmentId: null, // 所属部门
		departmentName: '',
		posId: null, // 职位ID
		posName: ''
	})
	
	let fileName = ref("multipartFiles")
	let headers =ref(accessHeader())
	let fileList =ref([])
	let postUrl = ref("http://localhost:8000/mugen/api/employees/post/excel")
		
	const formRef = ref()
	// 页面初始化加载数据
	onMounted(() => {
		post(`/departments/get/tree`,{ name: '' } , (data) => {
			employeeTypeTree.value = data
			searchValue.departmentIdList = collectLeafIds(data[0])
			console.log("collectLeafIds init", collectLeafIds(data[0]))
			initializePage();
		})
		get(`/positions/get`, (data) => {
			positionList.value = data
		})
		get(`/nations/get`, (data) => {
			nationList.value = data
		})
		get(`/departments/get`, (data) => {
			departmentList.value = data
		})
	});
	
	// 初始化页面数据
	function initializePage() {
		post(`/employees/get`,searchValue , (data: any) => {
			employeeList.value = data.employeeList
			count.value = data.count
		})
		handleClose()
	};
	
	function handleClose() {
		addDialogVisible.value = false
		editDialogVisible.value = false
		employee.id = null
		employee.name = ''
		employee.gender = ''
		employee.birthday = null
		employee.idCard = ''
		employee.wedlock = ''
		employee.nationId = null
		employee.nationName = ''
		employee.email = ''
		employee.phone = ''
		employee.address = ''
		employee.departmentId = null
		employee.departmentName = ''
		employee.posId = null
		employee.posName = ''

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
	
	function handleNodeClick(data) {
		searchValue.departmentIdList = collectLeafIds(data)
		console.log("departmentIdList", searchValue.departmentIdList)
		employee.departmentId = data.id
		initializePage()
	}
	
	function nextAdd() {
		addDialogVisible.value = true
	}
	
	function handleEdit(row: Employee) {
		employee.id = row.id
		employee.name = row.name
		employee.gender = row.gender
		employee.birthday = row.birthday
		employee.idCard = row.idCard
		employee.wedlock = row.wedlock
		employee.nationId = row.nationId
		employee.nationName = row.nationName
		employee.email = row.email
		employee.phone = row.phone
		employee.address = row.address
		employee.departmentId = row.departmentId
		employee.departmentName = row.departmentName
		employee.posId = row.posId
		employee.posName = row.posName
		editDialogVisible.value = true
	}
	
	function addSubmitForm() {
	    formRef.value.validate((valid: any) => {
	        if (valid) {
				post(`/employees/post`, employee, () => {
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
				post('/employees/put', employee, () => {
					ElMessage.success('修改成功!')
					initializePage()
				})
			} else {
	            ElMessage.warning('请完整填写注册表单内容!')
	        }
		});
	}
	
	function handleDelete(row) {
		get(`/employees/delete/${row.id}`, () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function handleDeleteList() {
		post(`/employees/delete`, selectedRowList.value.map(row => row.id), () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function exportData() {
		window.open(`http://localhost:8000/mugen/api/employees/get/excel`)
	}
	
	function uploadSuccess(data) {
		if (data.code === 200) {
			ElMessage.success("上传成功!")
		initializePage();
		} else (
			ElMessage.warning(data.message)
		)
	}
	
	function collectLeafIds(node) {
		let idlist = []
		if (!node.children) {
			idlist.push(node.id)
			return idlist
		}
		idlist.push(node.id)
		node.children.forEach(n => {
			collectLeafIds(n).forEach(id => {
				idlist.push(id);
			})
		})
		return idlist
	}
	
	function formatISODate(isoDateString: string | number | Date) {
		const date = new Date(isoDateString);
	
		// 获取年份的后两位
		const year = date.getFullYear().toString();
	
		// 获取月份和日期，确保两位数
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
	
		return `${year}-${month}-${day}`;
	}
	
	const rules = {
		name: [
			{ required: true, message: '请输入员工姓名', trigger: 'blur' },
			{ min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
		],
		birthday: [
			{ required: true, message: '请选择生日', trigger: 'change' }
		],
		nationId: [
			{ required: true, message: '请选择民族', trigger: 'change' }
		],
		gender: [
			{ required: true, message: '请选择性别', trigger: 'change' }
		],
		wedlock: [
			{ required: true, message: '请选择婚姻状况', trigger: 'change' }
		],
		idCard: [
			{ required: true, message: '请输入身份证号', trigger: 'blur' },
			{ pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
		],
		email: [
			{ required: true, message: '请输入邮箱地址', trigger: 'blur' },
			{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
		],
		phone: [
			{ required: true, message: '请输入电话号码', trigger: 'blur' },
			{ pattern: /^1[3456789]\d{9}$/, message: '请输入正确的电话号码', trigger: 'blur' }
		],
		address: [
			{ required: true, message: '请输入联系地址', trigger: 'blur' },
			{ min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
		],
		posId: [
			{ required: true, message: '请选择职位', trigger: 'change' }
		],
		departmentId: [
			{ required: true, message: '请选择部门', trigger: 'change' }
		]
	};

</script>

<style scoped>
</style>