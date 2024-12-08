<template>
	<div style="margin-bottom: 10px;">
		<el-row>
			<el-input v-model="searchValue.name" style="width: 240px;" size="small" placeholder="请输入工资名称" type="text">
				<template #prepend>
					<el-button @click="handleSearch" :icon="Search" />
				</template>
			</el-input>
			<el-button @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small"
				type="primary">搜索</el-button>

			<el-button type="primary" style="width: 80px; height: 32px;" size="small" @click="nextAdd">新增<el-icon>
					<CirclePlus />
				</el-icon></el-button>

			<el-popconfirm confirm-button-text="删除" cancel-button-text="点错了" :icon="InfoFilled"
				confirm-button-type="danger" icon-color="#ef0004" title="确认要删除此这些客户?" :width="200"
				@confirm="handleDeleteList()">
				<template #reference>
					<el-button type="danger" style="margin-left: 5px; width: 80px; height: 32px;"
						size="small">批量删除<el-icon>
							<Remove />
						</el-icon></el-button>
				</template>
			</el-popconfirm>

			<el-upload list-type="text" accept=".xls, .xlsx" :file-list="fileList" :headers="headers" :action="postUrl"
				:multiple="false" :show-file-list="false" :on-success="uploadSuccess">
				<el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small">导入<el-icon>
						<Download />
					</el-icon></el-button>
			</el-upload>
			<el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small"
				@click="exportData">导出<el-icon>
					<Upload />
				</el-icon></el-button>
		</el-row>
	</div>

	<el-table :data="salaryList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange"
		max-height=525>
		<el-table-column type="selection" width="55" />
		<el-table-column prop="id" label="编号" width="70">
		</el-table-column>
		<el-table-column prop="name" label="工资名称" width="140">
		</el-table-column>
		<el-table-column prop="basicSalary" label="基本工资" width="81">
		</el-table-column>
		<el-table-column prop="bonus" label="奖金" width="81">
		</el-table-column>
		<el-table-column prop="lunchSalary" label="午餐补助" width="81">
		</el-table-column>
		<el-table-column prop="trafficSalary" label="交通补助" width="81">
		</el-table-column>
		<el-table-column prop="allSalary" label="应发工资" width="81">
		</el-table-column>
		<el-table-column prop="pensionBase" label="养老金基数" width="95">
		</el-table-column>
		<el-table-column prop="pensionPer" label="养老金比率" width="95">
		</el-table-column>
		<el-table-column prop="medicalBase" label="医疗基数" width="81">
		</el-table-column>
		<el-table-column prop="medicalPer" label="医疗保险比率" width="109">
		</el-table-column>
		<el-table-column prop="accumulationFundBase" label="公积金基数" width="95">
		</el-table-column>
		<el-table-column prop="accumulationFundPer" label="公积金比率" width="95">
		</el-table-column>
		<el-table-column prop="createDate" label="启用时间" width="200">
			<template #default="scope">
				{{ formatISODate(scope.row.createDate) }}
			</template>
		</el-table-column>
		<el-table-column label="操作" fixed="right" width="150">
			<template #default="scope">
				<el-button size="small" type="warning" @click="handleEdit(scope.row)">编辑</el-button>
				<el-popconfirm confirm-button-text="删除" cancel-button-text="点错了" :icon="InfoFilled"
					confirm-button-type="danger" icon-color="#ef0004" title="确认要删除此客户?" :width="200"
					@confirm="handleDelete(scope.row)">
					<template #reference>
						<el-button type="danger" size="small">删除</el-button>
					</template>
				</el-popconfirm>
			</template>
		</el-table-column>
	</el-table>

	<div style="padding: 10px 0; position: absolute; bottom: 2%;">
		<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
			v-model:current-page="searchValue.currentPage" :page-sizes="[5, 10, 15, 20]"
			:page-size="searchValue.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="count">
		</el-pagination>
	</div>

	<el-dialog v-if="addDialogVisible" v-model="addDialogVisible" width=620 :before-close="handleClose">
		<el-form :model="salary" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="工资名称" prop="name" style="width: 520px;">
				<el-input v-model="salary.name"></el-input>
			</el-form-item>
			<el-row>
				<el-col :span="11">
					<el-form-item label="基本工资" prop="basicSalary" style="width: 520px;">
						<el-input-number v-model="salary.basicSalary" :min="0"></el-input-number>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="奖金" prop="bonus" style="width: 520px;">
						<el-input-number v-model="salary.bonus" :min="0"></el-input-number>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="11">
					<el-form-item label="午餐补助" prop="lunchSalary" style="width: 520px;">
						<el-input-number v-model="salary.lunchSalary" :min="0"></el-input-number>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="交通补助" prop="trafficSalary" style="width: 520px;">
						<el-input-number v-model="salary.trafficSalary" :min="0"></el-input-number>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="11">
					<el-form-item label="应发工资" prop="allSalary" style="width: 520px;">
						<el-input-number v-model="salary.allSalary" :min="0"></el-input-number>
					</el-form-item>			
				</el-col>
				<el-col :span="12">
					<el-form-item label="养老金基数" prop="pensionBase" style="width: 520px;">
						<el-input-number v-model="salary.pensionBase" :min="0"></el-input-number>
					</el-form-item>			
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="11">
					<el-form-item label="养老金比率" prop="pensionPer" style="width: 520px;">
						<el-input-number v-model="salary.pensionPer" :min="0" :max="1" :step="0.01"></el-input-number>
					</el-form-item>			
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="11">
					<el-form-item label="医疗基数" prop="medicalBase" style="width: 520px;">
						<el-input-number v-model="salary.medicalBase" :min="0"></el-input-number>
					</el-form-item>			
				</el-col>
				<el-col :span="13">
					<el-form-item label="医疗保险比率" prop="medicalPer" style="width: 520px;">
						<el-input-number v-model="salary.medicalPer" :min="0" :max="1" :step="0.01"></el-input-number>
					</el-form-item>			
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="11">
					<el-form-item label="公积金基数" prop="accumulationFundBase" style="width: 520px;">
						<el-input-number v-model="salary.accumulationFundBase" :min="0"></el-input-number>
					</el-form-item>			
				</el-col>
				<el-col :span="12">
					<el-form-item label="公积金比率" prop="accumulationFundPer" style="width: 520px;">
						<el-input-number v-model="salary.accumulationFundPer" :min="0" :max="1" :step="0.01"></el-input-number>
					</el-form-item>			
				</el-col>
			</el-row>
			<el-row style="display: flex; justify-content: center; align-items: center; ">
				<el-button type="primary" style="width: 200px; margin-top: 20px;" @click="addSubmitForm">新增</el-button>
				<el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;"
					@click="handleClose">取消</el-button>
			</el-row>
		</el-form>
	</el-dialog>
	
	<el-dialog
		v-if="editDialogVisible"
		v-model="editDialogVisible"
		width=620
	    :before-close="handleClose">
		<el-form :model="salary" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="工资名称" prop="name" style="width: 520px;">
				<el-input v-model="salary.name"></el-input>
			</el-form-item>
			<el-row>
				<el-col :span="11">
					<el-form-item label="基本工资" prop="basicSalary" style="width: 520px;">
						<el-input-number v-model="salary.basicSalary" :min="0"></el-input-number>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="奖金" prop="bonus" style="width: 520px;">
						<el-input-number v-model="salary.bonus" :min="0"></el-input-number>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="11">
					<el-form-item label="午餐补助" prop="lunchSalary" style="width: 520px;">
						<el-input-number v-model="salary.lunchSalary" :min="0"></el-input-number>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="交通补助" prop="trafficSalary" style="width: 520px;">
						<el-input-number v-model="salary.trafficSalary" :min="0"></el-input-number>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="11">
					<el-form-item label="应发工资" prop="allSalary" style="width: 520px;">
						<el-input-number v-model="salary.allSalary" :min="0"></el-input-number>
					</el-form-item>			
				</el-col>
				<el-col :span="12">
					<el-form-item label="养老金基数" prop="pensionBase" style="width: 520px;">
						<el-input-number v-model="salary.pensionBase" :min="0"></el-input-number>
					</el-form-item>			
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="11">
					<el-form-item label="养老金比率" prop="pensionPer" style="width: 520px;">
						<el-input-number v-model="salary.pensionPer" :min="0" :max="1" :step="0.01"></el-input-number>
					</el-form-item>			
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="11">
					<el-form-item label="医疗基数" prop="medicalBase" style="width: 520px;">
						<el-input-number v-model="salary.medicalBase" :min="0"></el-input-number>
					</el-form-item>			
				</el-col>
				<el-col :span="13">
					<el-form-item label="医疗保险比率" prop="medicalPer" style="width: 520px;">
						<el-input-number v-model="salary.medicalPer" :min="0" :max="1" :step="0.01"></el-input-number>
					</el-form-item>			
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="11">
					<el-form-item label="公积金基数" prop="accumulationFundBase" style="width: 520px;">
						<el-input-number v-model="salary.accumulationFundBase" :min="0"></el-input-number>
					</el-form-item>			
				</el-col>
				<el-col :span="12">
					<el-form-item label="公积金比率" prop="accumulationFundPer" style="width: 520px;">
						<el-input-number v-model="salary.accumulationFundPer" :min="0" :max="1" :step="0.01"></el-input-number>
					</el-form-item>			
				</el-col>
			</el-row>
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

	let salaryList = ref([]);
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)

	let selectedRowList = ref([])
	const count = ref(0)

	let searchValue = reactive({
		name: '',
		currentPage: 1,
		pageSize: 10
	})

	interface Salary {
		id : null | number, // Integer
		basicSalary : null | number, // Integer
		bonus : null | number, // Integer
		lunchSalary : null | number, // Integer
		trafficSalary : null | number, // Integer
		allSalary : null | number, // Integer
		pensionBase : null | number, // Integer
		pensionPer : null | number, // Double
		createDate : null | Date, // Date
		medicalBase : null | number, // Integer
		medicalPer : null | number, // Double
		accumulationFundBase : null | number, // Integer
		accumulationFundPer : null | number, // Double
		name : string // String
	}

	let salary : Salary = reactive({
		id: null, // Integer
		basicSalary: null, // Integer
		bonus: null, // Integer
		lunchSalary: null, // Integer
		trafficSalary: null, // Integer
		allSalary: null, // Integer
		pensionBase: null, // Integer
		pensionPer: null, // Double
		createDate: null, // Date
		medicalBase: null, // Integer
		medicalPer: null, // Double
		accumulationFundBase: null, // Integer
		accumulationFundPer: null, // Double
		name: '' // String
	})

	let fileName = ref("multipartFiles")
	let headers = ref(accessHeader())
	let fileList = ref([])
	let postUrl = ref("http://localhost:8000/mugen/api/salarys/post/excel")

	const formRef = ref()
	// 页面初始化加载数据
	onMounted(() => {
		initializePage();
	});

	// 初始化页面数据
	function initializePage() {
		post(`/salarys/get`, searchValue, (data : any) => {
			salaryList.value = data.salaryList
			count.value = data.count
		})
		handleClose()
	};

	function handleClose() {
		addDialogVisible.value = false
		editDialogVisible.value = false
		salary.id = null
		salary.basicSalary = null
		salary.bonus = null
		salary.lunchSalary = null
		salary.trafficSalary = null
		salary.allSalary = null
		salary.pensionBase = null
		salary.pensionPer = null
		salary.createDate = null
		salary.medicalBase = null
		salary.medicalPer = null
		salary.accumulationFundBase = null
		salary.accumulationFundPer = null
		salary.name = ''
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
		salary.id = row.id
		salary.basicSalary = row.basicSalary
		salary.bonus = row.bonus
		salary.lunchSalary = row.lunchSalary
		salary.trafficSalary = row.trafficSalary
		salary.allSalary = row.allSalary
		salary.pensionBase = row.pensionBase
		salary.pensionPer = row.pensionPer
		salary.createDate = row.createDate
		salary.medicalBase = row.medicalBase
		salary.medicalPer = row.medicalPer
		salary.accumulationFundBase = row.accumulationFundBase
		salary.accumulationFundPer = row.accumulationFundPer
		salary.name = row.name
		editDialogVisible.value = true
	}

	function addSubmitForm() {
		formRef.value.validate((valid) => {
			if (valid) {
				post(`/salarys/post`, salary, () => {
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
			if (valid) {
				post('/salarys/put', salary, () => {
					ElMessage.success('修改成功!')
					initializePage()
				})
			} else {
				ElMessage.warning('请完整填写注册表单内容!')
			}
		});
	}

	function handleDelete(row) {
		get(`/salarys/delete/${row.id}`, () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}

	function handleDeleteList() {
		post(`/salarys/delete`, selectedRowList.value.map(row => row.id), () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}

	function exportData() {
		window.open(`http://localhost:8000/mugen/api/salarys/get/excel`)
	}

	function uploadSuccess(data) {
		if (data.code === 200) {
			ElMessage.success("上传成功!")
			initializePage();
		} else (
			ElMessage.warning(data.message)
		)
	}

	function formatISODate(isoDateString : string | number | Date) {
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
			{ required: true, message: '请输入工资名称', trigger: 'blur' }
        ],
        basicSalary: [
			{ required: true, message: '请输入基本工资', trigger: 'blur' }
        ],
        bonus: [
			{ required: true, message: '请输入奖金', trigger: 'blur' }
        ],
        lunchSalary: [
			{ required: true, message: '请输入午餐补助', trigger: 'blur' }
        ],
        trafficSalary: [
			{ required: true, message: '请输入交通补助', trigger: 'blur' }
        ],
        allSalary: [
			{ required: true, message: '请输入应发工资', trigger: 'blur' }
        ],
        pensionBase: [
			{ required: true, message: '请输入养老金基数', trigger: 'blur' }
        ],
        pensionPer: [
			{ required: true, message: '请输入养老金比率', trigger: 'blur' }
        ],
        createDate: [
			{ required: true, message: '请选择启用时间', trigger: 'blur' }
        ],
        medicalBase: [
			{ required: true, message: '请输入医疗基数', trigger: 'blur' }
        ],
        medicalPer: [
			{ required: true, message: '请输入医疗保险比率', trigger: 'blur' }
        ],
        accumulationFundBase: [
			{ required: true, message: '请输入公积金基数', trigger: 'blur' }
        ],
        accumulationFundPer: [
			{ required: true, message: '请输入公积金比率', trigger: 'blur' }
        ]
	};
</script>

<style scoped>
</style>