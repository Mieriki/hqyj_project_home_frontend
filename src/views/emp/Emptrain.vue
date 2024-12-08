<template>
	<div style="margin-bottom: 10px;">
		<el-row>
			<el-input v-model="searchValue.eName" style="width: 240px;" size="small" placeholder="请输入员工姓名" type="text">
				<template #prepend>
					<el-button @click="handleSearch" :icon="Search" />
				</template>
			</el-input>
			<el-input v-model="searchValue.trainContent" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入培训内容" type="text"></el-input>
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
	
	<el-table :data="employeeTrainList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange" max-height=525>
		<el-table-column type="selection" width="55"/>
		<el-table-column prop="id" label="编号" width="100">
		</el-table-column>
		<el-table-column prop="ename" label="员工姓名" width="150">
		</el-table-column>
		<el-table-column prop="trainContent" label="培训内容" width="200">
		</el-table-column>
		<el-table-column prop="" label="培训时间" width="200">
			<template #default="scope">
				{{ formatISODate(scope.row.trainDate) }}
			</template>
		</el-table-column>
		<el-table-column prop="remark" label="备注" width="200">
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
		<el-form :model="employeeTrain" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="员工姓名" prop="eid" style="width: 400px; margin-top: 20px;">
				<el-select v-model="employeeTrain.eid" filterable placeholder="请选择姓名" style="width: 200px;">
					<el-option v-for="item in employeeList" :key="item.id" :label="`${item.id}\t${item.name}`" :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="培训时间" prop="trainDate">
				<el-date-picker v-model="employeeTrain.trainDate" type="date" placeholder="选择日期"></el-date-picker>
			</el-form-item>
			<el-form-item label="培训内容" prop="trainContent" style="width: 520px;">
				<el-input v-model="employeeTrain.trainContent"></el-input>
			</el-form-item>
			<el-form-item label="备注" prop="remark" style="width: 520px;">
				<el-input v-model="employeeTrain.remark"></el-input>
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
		<el-form :model="employeeTrain" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="员工姓名" prop="eid" filterable style="width: 400px; margin-top: 20px;">
				<el-select v-model="employeeTrain.eid" placeholder="请选择姓名" style="width: 200px;">
					<el-option v-for="item in employeeList" :key="item.id" :label="`${item.id}\t${item.name}`" :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="培训时间" prop="trainDate">
				<el-date-picker v-model="employeeTrain.trainDate" type="date" placeholder="选择日期"></el-date-picker>
			</el-form-item>
			<el-form-item label="培训内容" prop="trainContent" style="width: 520px;">
				<el-input v-model="employeeTrain.trainContent"></el-input>
			</el-form-item>
			<el-form-item label="备注" prop="remark" style="width: 520px;">
				<el-input v-model="employeeTrain.remark"></el-input>
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
	
	let employeeTrainList = ref([]);
	let employeeList = ref([]);
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	
	let selectedRowList = ref([])
	const count = ref(0)
	
	let searchValue = reactive({
		eName: '',
		trainContent: '',
		currentPage: 1,
		pageSize: 10
	})
	
	interface EmployeeTrains {
		id: null | number, // Integer
		eid: null | number, // Integer
		eName: string,
		trainDate: null | Date, // Date
		trainContent: string, // String
		remark: string // String
	}	
	
	let employeeTrain: EmployeeTrains = reactive({
		id: null, // Integer
		eid: null, // Integer
		eName: '',
		trainDate: null, // Date
		trainContent: '', // String
		remark: '' // String
	})
	
	let fileName = ref("multipartFiles")
	let headers =ref(accessHeader())
	let fileList =ref([])
	let postUrl = ref("http://localhost:8000/mugen/api/employeeTrains/post/excel")
		
	const formRef = ref()
	// 页面初始化加载数据
	onMounted(() => {
		initializePage();
	});
	
	// 初始化页面数据
	function initializePage() {
		post(`/employeeTrains/get`,searchValue , (data) => {
			employeeTrainList.value = data.employeeTrainList
			count.value = data.count
		})
		get(`/employees/get`, (data) => {
			employeeList.value = data
		})
		handleClose()
	};
	
	function handleClose() {
		addDialogVisible.value = false
		editDialogVisible.value = false
		employeeTrain.id = null
		employeeTrain.eid = null
		employeeTrain.eName = ''
		employeeTrain.trainDate = null
		employeeTrain.trainContent = ''
		employeeTrain.remark = ''
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
	
	function nextAdd() {
		addDialogVisible.value = true
	}
	
	function handleEdit(row) {
		employeeTrain.id = row.id
		employeeTrain.eid = row.eid
		employeeTrain.eName = row.eName
		employeeTrain.trainDate = row.trainDate
		employeeTrain.trainContent = row.trainContent
		employeeTrain.remark = row.remark
		editDialogVisible.value = true
	}
	
	function addSubmitForm() {
	    formRef.value.validate((valid) => {
	        if (valid) {
				post(`/employeeTrains/post`, employeeTrain, () => {
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
				post('/employeeTrains/put', employeeTrain, () => {
					
					ElMessage.success('修改成功!')
					initializePage()
				})
			} else {
	            ElMessage.warning('请完整填写注册表单内容!')
	        }
		});
	}
	
	function handleDelete(row) {
		get(`/employeeTrains/delete/${row.id}`, () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function handleDeleteList() {
		post(`/employeeTrains/delete`, selectedRowList.value.map(row => row.id), () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function exportData() {
		window.open(`http://localhost:8000/mugen/api/employeeTrains/get/excel`)
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
	
		return `${year}-${month}-${day}`;
	}
	
	const rules = {
		eid: [
			{ required: true, message: '请选择员工姓名', trigger: 'change' }
		],
		trainDate: [
			{ required: true, message: '请选择培训时间', trigger: 'change' }
		],
		trainContent: [
			{ required: true, message: '请输入培训内容', trigger: 'blur' },
			{ min: 0, max: 255, message: '长度在 0 到 255 个字符', trigger: 'blur' }
		],
		remark: [
			{ required: false, message: '请输入备注', trigger: 'blur' },
			{ min: 0, max: 255, message: '长度在 0 到 200 个字符', trigger: 'blur' }
		]
	};

</script>

<style scoped>
</style>