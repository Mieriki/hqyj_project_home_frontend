<template>
	<el-row>
		<el-col :span="15">
			<el-form :model="admin" :rules="rules" :disabled="!isEdit" ref="formRef" label-width="100px" style="margin-top: 20px; margin-left: 50px;">
				<el-row>
					<el-form-item label="姓名" prop="name" style="width: 300px;">
						<el-input v-model="admin.name"></el-input>
					</el-form-item>
				</el-row>
				<el-form-item label="座机" prop="telephone" style="width: 500px;">
					<el-input v-model="admin.telephone"></el-input>
				</el-form-item>
				<el-form-item label="电话" prop="phone" style="width: 500px;">
					<el-input v-model="admin.phone"></el-input>
				</el-form-item>
				<el-form-item label="地址" prop="address" style="width: 500px;">
					<el-input v-model="admin.address"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button v-show="isEdit" type="primary" style="width: 290px; margin-top: 20px; margin-left: 30px;" @click="submitForm">提交</el-button>
				</el-form-item>
			</el-form>
			
		</el-col>
		<el-col :span="9">
			<el-card style="max-width: 480px; padding: 0, 100px;">
				<template #header>
					<div style="text-align: -webkit-center">
						<el-upload
							list-type="text"
							accept=".jpg, .png"
							:file-list="fileList"
							:headers="headers"
							:action="postUrl"
							:limit="100"
							:multiple="false"
							:show-file-list="false"
							:on-success="uploadSuccess">
							<el-avatar :src="admin.userFace" :size="100"></el-avatar><br>
						</el-upload>
						
						<el-text size="large"> {{ admin.name }} </el-text>
					</div>
				</template>
				<el-descriptions :column="2">
					<el-descriptions-item label="姓名"> {{ admin.name }} </el-descriptions-item>
					<el-descriptions-item label="员工编号"> {{ admin.id }} </el-descriptions-item>
					<el-descriptions-item label="用户名">
						<el-tag size="small"> {{ admin.userName }} </el-tag>
					</el-descriptions-item>
					<el-descriptions-item label="座机"> {{ admin.telephone }} </el-descriptions-item>
					<el-descriptions-item label="电话"> {{ admin.phone }} </el-descriptions-item>
					<el-descriptions-item label="地址"> {{ admin.address }} </el-descriptions-item>
				</el-descriptions>
				<template #footer>
					<div style="text-align: -webkit-center">
						<el-button v-if="!isEdit" type="primary" style="width: 290px;" @click="edit">修改</el-button>
						<el-button v-if="isEdit" type="primary" style="width: 290px;" @click="edit">取消</el-button>
					</div>
				</template>
			</el-card>
		</el-col>
	</el-row>
</template>

<script setup>
	// 导入依赖
	import { ref, onMounted, reactive } from 'vue';
	import { ElInput, ElButton, ElTable, ElTableColumn, ElPagination, ElMessage } from 'element-plus';
	import { Search, CirclePlus, Remove, Download, Upload, Lock } from '@element-plus/icons-vue';
	import { get, post, accessHeader } from '@/net';
	import router from '@/router';
	// import { useStore } from 'vuex';
	import { useMeanStore } from '@/store'	

	const stroe = useMeanStore()
	
	let isEdit = ref(false)
	const formRef = ref()
	
	let fileName = ref("multipartFiles")
	let headers =ref(accessHeader())
	let fileList =ref([])
	let postUrl = ref(`http://localhost:8000/mugen/api/admins/put/avater`)
	
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
	
	// 页面初始化加载数据
	onMounted(() => {
		initializePage();
	});
	
	  // 初始化页面数据
	function initializePage() {
		get(`/admins/get/me`, (data) => {
			isEdit.value = false
			admin.id = data.id
			admin.name = data.name
			admin.phone = data.phone
			admin.telephone = data.telephone
			admin.address = data.address
			admin.enabled = data.enabled
			admin.userName = data.userName
			admin.userFace = data.userFace
			admin.remark = data.remark
			admin.slot = data.slot
		})
	};
	
	function formatDate(date) {
	    const d = new Date(date);
	    const year = d.getFullYear();
	    const month = String(d.getMonth() + 1).padStart(2, '0');
	    const day = String(d.getDate()).padStart(2, '0');
	    return `${year}年${month}月${day}日`;
	}
	  
	function uploadSuccess(data) {
	  	if (data.code === 200) {
	  		ElMessage.success("更新成功!")
			stroe.setFace(true)
	  	initializePage();
	  	} else (
	  		ElMessage.warning(data.message)
	  	)
	}
	
	function edit() {
		isEdit.value = !isEdit.value
	}
	
	function submitForm() {
		formRef.value.validate((isValid) => {
			if(isValid) {
				post('/admins/put', admin, () => {
					ElMessage.success('修改成功!')
					router.push('/main/user-info')
					
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
	          { min: 0, max: 5, message: '长度在 0 到 5 个字符', trigger: 'blur' }
	        ],
	        telephone: [
	          { required: true, message: '请输入座机号码', trigger: 'blur' },
	          // { pattern: /^(\d{3,4}-)?\d{7,8}$/, message: '请输入正确的座机号码', trigger: 'blur' }
			   { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的座机号码', trigger: 'blur' }
	        ],
	        phone: [
	          { required: true, message: '请输入电话号码', trigger: 'blur' },
	          { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
	        ],
	        address: [
	          { required: true, message: '请输入地址', trigger: 'blur' },
	          { min: 0, max: 100, message: '长度在 0 到 100 个字符', trigger: 'blur' }
	        ]
	}
</script>

<style scoped>
</style>