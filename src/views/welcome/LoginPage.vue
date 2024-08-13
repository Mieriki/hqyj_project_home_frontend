<template>
	<div class="formsy" style="height: 100%; text-align: center; margin: 0 30px;">
		<div style="margin-top: 75px;">
			<div style="font-size: 27px; font-weight: bold;">进销存管理系统</div>
			<div style="font-size: 12px; color: gray; margin-top: 5px;">在进入系统之前，请先输入用户名和密码登录</div>
		</div>
		<div style="margin-top: 50px;">
			<el-form :model="form" :rules="rules" ref="formRef">
				<el-form-item prop="username">
					<el-input v-model="form.username" maxlength="25" type="text" placeholder="员工编号/员工姓名">
						<template #prefix>
							<el-icon><User/></el-icon>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item prop="password">
					<el-input v-model="form.password" maxlength="25" type="password" placeholder="密码">
						<template #prefix>
							<el-icon><Lock/></el-icon>
						</template>
					</el-input>
				</el-form-item>
				<el-row>
					<el-col :span="12" style="text-align: left;">
						<el-form-item prop="remember">
							<el-checkbox v-model="form.remember" label="记住我" />
						</el-form-item>
					</el-col>
					<el-col :span="12" style="text-align: right;">
						<el-link  @click=" ElMessage.warning('请联系管理员重置密码！')">忘记密码？</el-link>
					</el-col>
				</el-row>
			</el-form>
		</div>
		<div style="margin-top: 40px;">
			<el-button @click="userLogin" style="width: 290px;" type="primary">登录</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { User, Lock } from '@element-plus/icons-vue'
	import router from '@/router';
	import { reactive, ref } from "vue";
	import { ElMessage } from 'element-plus';
	import { login, get } from '../../net';
	import { useMeanStore } from '../../store';
	
	const meanStore = useMeanStore()

	const formRef = ref()
	const loginLoading = ref(false)

	const form = reactive({
	  username: '',
	  password: '',
	  remember: false
	})

	const rules = {
	  username: [
		{ required: true, message: '请输入用户名' }
	  ],
	  password: [
		{ required: true, message: '请输入密码'}
	  ]
	}

	function userLogin() {
		formRef.value.validate((isValid) => {
			if(isValid) {
				login(form.username, form.password, form.remember, () => {
					router.push('/');	
				})
			}
		});
	}
</script>

<style scoped>
</style>