import { defineStore } from 'pinia'
import { ref } from 'vue';

const useMeanStore = defineStore('main', () => {
	const helloPinia = ref('Hello Pinia!')
	// 菜单数据
	const menuList = ref([])
	// 权限数据
	const permList = ref([])
	const hasRoute = ref(false)
	const userInfo = ref({})
	
	function setPiniaLabel(mieriki: string) {
		helloPinia.value = mieriki
	}

	function changeRouteStatus(state: any) {
		hasRoute.value = state
		sessionStorage.setItem("hasRoute", state)
	}
	
	function setMenuList(menus: any) {
		menuList.value = menus
		console.log('menus', menuList)
	}
	
	function setPermList(authoritys: any) {
		permList.value = authoritys
	}
	
	function setUserInfo(user: any) {
		userInfo.value = user
		console.log('set user', userInfo)
	}
	
	return {
		helloPinia,
		menuList,
		permList,
		hasRoute,
		userInfo,
		setPiniaLabel,
		changeRouteStatus,
		setMenuList,
		setPermList,
		setUserInfo
	}
})

export { useMeanStore }
