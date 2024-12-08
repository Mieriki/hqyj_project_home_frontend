<template>
	<div>
		<el-container style="height: 100%;min-height: 100vh">
			<el-aside :width="sideWidth + 'px'" style="background-color: #00525f;min-height: 100%;box-shadow: 2px 0 6px rgba(0,21,41,.35); transition: 300ms;">
				<el-menu 
					style="height: 100%; overflow-x: hidden; transition: 300ms; border: none;"
				    background-color="#00525f"
				    text-color="#FFF"
					unique-opened
					show-timeout=300
				    active-text-color="#ffbc98"
				    :collapse-transition="false"
					:width="sideWidth + 'px'" 
				    :collapse="isCollapse"
					router>
					<div style="display: flex; align-items: center; justify-content: center; height: 60px;">
						<el-image src="https://t.tutu.to/img/UdQtn" alt=""
							style="width: 20px; position: relative; top: 1px; margin-right: 5px;"></el-image>
						<b style="color: #FFF;" v-show="logoTextShow">办公自动化系统 </b>
					</div>
					<el-menu-item index="/">
						<el-icon v-show="!logoTextShow" class="iconColor">
							<HomeFilled />
						</el-icon>
						<template #title>
							<component :is="HomeFilled" class="iconColor"></component>
							<span style="margin-left: 31px;">首页</span>
						</template>
					</el-menu-item>
					<template v-for="item in menuList" class="coll-dev">
						<el-sub-menu v-if="item.leaf" :index="item.id">		
							<template #title>
								<component :is="item.iconCls" class="iconColor"></component>
								<span style="margin-left: 31px;"> {{ item.name }} </span>
							</template>
							<template v-for="menu in item.children" >
								<el-menu-item v-if="menu.leaf" :index="menu.path">
									<samp> {{ menu.name }} </samp>
								</el-menu-item>
							</template>
						</el-sub-menu>
					</template>
				</el-menu>
			</el-aside>
			<el-container>
				<el-header style="font-size: 12px;border-bottom: 1px solid #CCC;line-height: 60px;display: flex;">
					<div style="flex: 1; font-size: 20px; cursor: pointer">
						<el-icon v-show="logoTextShow" @click="collape">
							<Fold />
						</el-icon>
						<el-icon v-show="!logoTextShow" @click="collape">
							<Expand />
						</el-icon>
					</div>
					<div class="dropdown-container">
						<el-dropdown>
							<div class="dropdown-content">
								<span style="margin-right: 5px; font-size: 14px;"> {{ user.name }} </span>
								<!-- <el-icon><User /></el-icon> -->
								<el-avatar :src="user.userFace" :size="25"></el-avatar>
							</div>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item @click="router.push('/main/user-info')">个人信息</el-dropdown-item>
									<el-dropdown-item @click="handleResetPassword">修改密码</el-dropdown-item>
									<el-dropdown-item @click="userLogout">退出登录</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</div>
				</el-header>

				<el-main>
					<div style="margin-bottom: 30px">
						<el-breadcrumb separator="/">
							<el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
							<template v-for="(item, index) in breadList" :key="index">
								<el-breadcrumb-item v-if="item.name && item.path"
									:to="item.path">{{ item.name }}</el-breadcrumb-item>
							</template>
						</el-breadcrumb>
					</div>

					<div class="content-container-box">
						<div class="content">
							<router-view v-slot="{ Component }" :key="$route.fullPath">
								<transition name="el-fade-in-linear" mode="out-in">
									<component :is="Component" style="height: 100%" />
								</transition>
							</router-view>
						</div>
					</div>
				</el-main>
			</el-container>
		</el-container>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted, Menu, watch } from 'vue'
	import router from '../router';
	import { HomeFilled, Tools, Files, Van, Wallet, Histogram, Box, Setting, DataAnalysis } from '@element-plus/icons-vue'
	import { useMeanStore } from '../store';
	import { getUserInfo, logout, get } from '../net';

	let logoTextShow: Ref<boolean> = ref(true);
	let isCollapse: Ref<boolean> = ref(false);
	let sideWidth: Ref<number> = ref(200);
	
	const menuList: Ref<any> = ref();
	const meanStore: any = useMeanStore();
	
	const breadList = ref([]);
	
	const user = ref({})
	
	function initializePage() {
		get(`/admins/get/me`, (data) => {
			user.value = data
			meanStore.setUserInfo(data)
		})
		get(`/menus/get/router`, (data) => {
			menuList.value = data
			meanStore.setMenuList(data)
		})
		console.log("init user", user)
		console.log("init menuList", menuList)
	}
	
	onMounted(() => {
		initializePage();
	});
	
	function userLogout() {
		logout(() => {
			meanStore.changeRouteStatus(false)
			router.push("/welcome/login")
		})
	}

	function collape() {
		isCollapse.value = !isCollapse.value;
		if (isCollapse.value) {
			sideWidth.value = 64;
			logoTextShow.value = false;
		} else {
			sideWidth.value = 200;
			logoTextShow.value = true;
		}
	}
	
	watch(
		() => ({
			route: router.currentRoute.value,
			force: meanStore.force,
			face: meanStore.face,
		}), (newValue, oldValue) => {
			breadList.value = [{ path: newValue.route.path, name: newValue.route.name }];
			if (newValue.force) {
				meanStore.setForce(false)
				router.push('/')
			}
			if (newValue.face) {
				meanStore.setFace(false)
				initializePage(false)
			}
		}, { immediate: true, deep: true }
	);
</script>

<style scoped>
	.dropdown-container {
		position: relative;
		width: 200px;
		/* 调整需要的宽度 */
		text-align: right;
		/* 将内容右对齐 */
		cursor: pointer;
		padding: 10px;
		/* 添加内边距 */
	}

	.dropdown-content {
		display: flex;
		justify-content: space-between;
		/* 在内容区域内平均分布元素 */
		align-items: center;
		/* 垂直居中 */
		padding: 10px;
		width: 100%;
		/* 使用全部宽度 */
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 5px);
		/* 下拉菜单相对于触发按钮底部位置 */
		right: 0;
		width: 150px;
		/* 调整需要的宽度 */
		text-align: left;
		/* 将下拉菜单左对齐 */
	}

	.example-showcase .el-dropdown-link {
		cursor: pointer;
		color: var(--el-color-primary);
		display: flex;
		align-items: center;
	}

	.iconColor {
		position: absolute;
		display: inline;
		width: 18px;
		height: 18px;
		margin-left: 3px;
		color: #b1b3b8;
	}

	svg {
		width: 18px;
		height: 18px;
	}
	
	.el-dropdown-link:focus-visible {
		outline: unset;
	}
	 /*隐藏文字*/
	 .coll-dev >>> .el-menu--collapse  .el-submenu__title span{
	    display: none;
	  }
	  /*隐藏 > */
	 .coll-dev >>> .el-menu--collapse  .el-submenu__title .el-submenu__icon-arrow{
	    display: none;
	  }
</style>