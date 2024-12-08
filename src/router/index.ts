import { createRouter, createWebHistory } from 'vue-router'
import { useMeanStore } from '../store'
import { getMenuRouter, getUserInfo, unauthorized } from '../net'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'index',
			component: () => import('@/views/IndexView.vue'),
			children: [
				{
					path: '/',
					name: '首页',
					component: () => import('@/views/tb/EchartsView.vue')
				},
				{
					path: '/main/user-info',
					name: '个人信息',
					component: () => import('@/views/init/AccountInfoView.vue')
				},
			]
		}, {
			path: '/welcome',
			name: 'welcome',
			component: () => import('@/views/WelcomeView.vue'),
			children: [
				{
					path: '',
					name: 'welcome-form',
					component: () => import('@/views/welcome/FormView.vue'),
					children: [
						{
							path: 'login',
							name: 'welcome-login',
							component: () => import('@/views/welcome/LoginPage.vue')
						},
					]
				}
			]
		}, {
			path: '/test',
			name: 'test',
			component: () => import('@/components/HelloWorld.vue')
		},
	]
})

async function fetchMenuData() {
	try {
		const data = await getMenuRouter();
		console.log('Data received:', data);
		return data
	} catch (error) {
		console.error('Error fetching menu router:', error);
		// 处理请求失败的情况
	}
}

async function fetchUserData() {
	try {
		const data = await getUserInfo();
		return data
	} catch (error) {
		console.error('Error fetching user router:', error);
		// 处理请求失败的情况
	}
}

router.beforeEach(async (to, from, next) => {
    const meanStore = useMeanStore();
    const isUnauthorized = unauthorized();

    if (!meanStore.hasRoute && !isUnauthorized) {
        console.log("正在初始化菜单.......");
        try {
            const userInfo = await fetchUserData();
            meanStore.setUserInfo(userInfo);

            const routerList = await fetchMenuData();
            meanStore.setMenuList(routerList);

            routerList.forEach((menu) => {
                if (menu.children && menu.leaf) {
                    menu.children.forEach((e) => {
                        if (e.component && e.leaf) {
                            let route = {
                                name: e.name,
                                path: e.path,
                                component: () => import(/* @vite-ignore */ '../views' + e.component + '.vue')
                            };
                            router.addRoute("index", route);
                        }
                    });
                }
            });

            meanStore.changeRouteStatus(true);
            // console.log('已加载的路由', router.getRoutes());
			next(to.path)
        } catch (error) {
            console.error('初始化菜单失败:', error);
            // 处理菜单加载失败的情况
        }
    }

   try {
	   if (to.name.startsWith('welcome') && !isUnauthorized) {
	       next("/");
	   } else if (!to.name.startsWith('welcome') && isUnauthorized) {
	       next('/welcome/login');
	   } else {
	       next();
	   }
   } catch {
		next('/')
   }
});


export default router