<template>
	<el-empty v-if="!isLeave" description="当前无请假流程, 点击创建请假流程"
		image="https://p9-heycan-hgt-sign.byteimg.com/tos-cn-i-3jr8j4ixpe/3fc442ba70364ba6808aa72d72e0d013~tplv-3jr8j4ixpe-resize:1920:1920.gif?lk3s=43402efa&x-expires=1756189147&x-signature=AjP76fY8cUQZKZaic9NjdvWItdY%3D"
		@click="open = true" />
	<div v-if="isLeave && leaveId" style="display: flex; flex-direction: column; align-items: center; justify-content: center; ">
		<h3>请假进度</h3>
		<el-image :src="`http://localhost:8000/mugen/api/leaves/get/${leaveId}`"></el-image>
	</div>
	

	<el-dialog v-if="open" v-model="open" width=620 :before-close="handleClose">
		<el-form :model="leave" :rules="rules" ref="formRef" label-width="100px">
			<el-row>
				<el-col :span="11">
					<el-form-item label="姓名" prop="name" style="width: 250px; margin-top: 20px;">
						<el-input v-model="leave.name"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="请假天数" prop="day" style="width: 400px; margin-top: 20px;">
						<el-input-number v-model="leave.day"></el-input-number>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item label="请假理由" prop="reason" style="width: 520px;">
				<el-input v-model="leave.reason" type="textarea"></el-input>
			</el-form-item>
			<el-row style="display: flex; justify-content: center; align-items: center; ">
				<el-button type="primary" style="width: 200px; margin-top: 20px;" @click="addSubmitForm">新增</el-button>
				<el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;"
					@click="handleClose">取消</el-button>
			</el-row>
		</el-form>
	</el-dialog>
</template>

<script setup lang="ts">
	import { ref, onMounted, reactive } from 'vue';
	import { Search } from '@element-plus/icons-vue';
	import { get, post, accessHeader } from '@/net';
	import router from '@/router';

	const formRef = ref()

	let isLeave = ref(false)
	let open = ref(false)
	let leaveId = ref(null)

	const leave = reactive({
		id: null,
		name: "",
		day: null,
		reason: "",
		roleName: ""
	});

	onMounted(() => {
		initializePage();
	});

	// 初始化页面数据
	function initializePage() {
		get(`/leaves/check`, (data) => {
			if (data != null && data != "") {
				open.value = false
				leaveId.value = data
				isLeave.value = true
				console.log("leave_id", leaveId)
			}
		})
		
		handleClose()
	};
	
	function getLeaveRes() {
		
	}

	function handleClose() {
		leave.id = null
		leave.name = ""
		leave.day = null
		leave.reason = ""
		leave.roleName = ""
		isLeave.value = false
		open.value = false
	}

	function addSubmitForm() {
		formRef.value.validate((valid) => {
			if(valid) {
				post('/leaves/flow', leave, () => {
					ElMessage.success('修改成功!')
					
					initializePage()
				})
			} else {
	            ElMessage.warning('请完整填写注册表单内容!')
	        }
		});
	}

	const rules = {
		name: [
			{ required: true, message: '请输入姓名', trigger: 'blur' },
			{ min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
		],
		day: [
			{ required: true, message: '请输入请假天数', trigger: 'blur' },
			{ type: 'number', min: 1, max: 365, message: '请假天数必须在 1 到 365 之间', trigger: 'blur' }
		],
		reason: [
			{ required: true, message: '请输入请假理由', trigger: 'blur' },
			{ min: 10, max: 200, message: '长度在 10 到 200 个字符', trigger: 'blur' }
		]
	};
</script>

<style scoped>
</style>