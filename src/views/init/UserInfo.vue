<template>
	<el-row>
		<el-col :span="13">
			<el-form :model="admin" :rules="rules" :disabled="!isEdit" ref="formRef" label-width="100px" style="margin-top: 20px; margin-left: 50px;">
        <el-form-item label="用户名" prop="account" style="width: 400px;">
          <el-input v-model="admin.account" disabled></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="username" style="width: 400px; margin-top: 20px;">
          <el-input v-model="admin.username"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender" style="width: 300px; margin-top: 20px;">
          <el-select v-model="admin.gender">
            <el-option :key="0" label="保密" :value="0"></el-option>
            <el-option :key="1" label="男" :value="1"></el-option>
            <el-option :key="2" label="女" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生日" prop="birthDate" style="width: 505px; margin-top: 20px;">
          <el-date-picker v-model="admin.birthDate" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="邮箱" prop="email" style="width: 505px; margin-top: 20px;">
          <el-input v-model="admin.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone" style="width: 505px; margin-top: 20px;">
          <el-input v-model="admin.phone"></el-input>
        </el-form-item>
        <el-form-item label="简介" prop="introduction" style="width: 505px; margin-top: 20px;">
          <el-input type="textarea" :rows="4" style="width: 100%;" v-model="admin.introduction"></el-input>
        </el-form-item>
				<el-form-item>
					<el-button v-show="isEdit" type="primary" style="width: 290px; margin-top: 20px; margin-left: 30px;" @click="submitForm">提交</el-button>
				</el-form-item>
			</el-form>
			
		</el-col>
		<el-col :span="9">
			<el-card style="max-width: 480px; padding: 0">
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
							<el-avatar :src="admin.picture" :size="100"></el-avatar><br>
						</el-upload>
						
						<el-text size="large"> {{ admin.username }} </el-text>
					</div>
				</template>
				<el-descriptions :column="2">
          <el-descriptions-item label="用户名">{{ admin.account }}</el-descriptions-item>
          <el-descriptions-item  label="昵称"><el-tag type="primary">{{ admin.username }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="性别">{{ admin.gender === 0? '保密' : (admin.gender === 1? '男' : '女') }}</el-descriptions-item>
          <el-descriptions-item label="生日">{{ formatDate(admin.birthDate) }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ admin.email }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ admin.phone }}</el-descriptions-item>
          <el-descriptions-item label="简介">{{ admin.introduction }}</el-descriptions-item>
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
    let postUrl = ref(`http://mugen.net/mugen/api/sso/users/put/avater`)

  let admin = reactive({
    id: null,
    account: '',
    username: '',
    deptId: null,
    userType: null,
    gender: 0,
    birthDate: null,
    picture: '',
    education: '',
    phone: '',
    email: '',
    strong: '',
    introduction: '',
    userRank: null,
  });
	
	// 页面初始化加载数据
	onMounted(() => {
		initializePage();
	});

	  // 初始化页面数据
	function initializePage() {
		get(`/sso/users/get/me`, (data) => {
			isEdit.value = false
      admin.id = data.id
      admin.account = data.account
      admin.username = data.username
      admin.deptId = data.deptId
      admin.userType = data.userType
      admin.gender = data.gender
      admin.birthDate = data.birthDate
      admin.picture = data.picture
      admin.education = data.education
      admin.phone = data.phone
      admin.email = data.email
      admin.strong = data.strong
      admin.introduction = data.introduction
      admin.userRank = data.userRank
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
				post('/sso/users/put', admin, () => {
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
	    username: [
	      { required: true, message: '请输入用户名', trigger: 'blur' },
	      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
	    ],
	    gender: [
	      { required: true, message: '请选择性别', trigger: 'change' }
	    ],
	    birthDate: [
	      { required: true, message: '请选择生日', trigger: 'change' }
	    ],
	    email: [
	      { required: true, message: '请输入邮箱', trigger: 'blur' },
	      { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
	    ],
	    phone: [
	      { required: true, message: '请输入手机号', trigger: 'blur' },
	      { type: 'phone', message: '手机号格式不正确', trigger: 'blur' }
	    ],
	    introduction: [
	      { required: true, message: '请输入简介', trigger: 'blur' },
	      { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
	    ]
	}
</script>

<style scoped>
</style>