<template>
  <div>
    <el-container style="height: 100%;min-height: 100vh;">
      <el-aside :width="sideWidth + 'px'"
                style="background-color: #00525f;min-height: 100%;box-shadow: 2px 0 6px rgba(0,21,41,.35); transition: 300ms;">
        <div style="display: flex; align-items: center; justify-content: center; height: 60px;">
          <el-image src="https://t.tutu.to/img/mZhyw" alt=""
                    style="width: 15px; position: relative; top: 5px; margin-right: 5px;"></el-image>
          <b style="color: #FFF;" v-show="logoTextShow">Mugen医疗云平台</b>
        </div>
        <el-menu
            style="height: calc(100vh - 60px);
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-width: none;  /* Firefox */
            -ms-overflow-style: none;  /* IE/Edge */
            transition: 300ms;
            border: none;"
            background-color="#00525f"
            text-color="#FFF"
            unique-opened
            show-timeout=300
            active-text-color="#ffbc98"
            :collapse-transition="false"
            :width="sideWidth + 'px'"
            :collapse="isCollapse"
            router>
          <el-menu-item index="/">
            <el-icon v-show="!logoTextShow" class="iconColor">
              <HomeFilled/>
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
              <template v-for="menu in item.children">
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
              <Fold/>
            </el-icon>
            <el-icon v-show="!logoTextShow" @click="collape">
              <Expand/>
            </el-icon>
          </div>
          <div class="dropdown-container">
            <el-dropdown>
              <div class="dropdown-content">
                <span style="margin-right: 5px; font-size: 14px;"> {{ user.username }} </span>
                <!-- <el-icon><User /></el-icon> -->
                <el-avatar :src="user.picture" :size="25"></el-avatar>
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
                                    :to="item.path">{{ item.name }}
                </el-breadcrumb-item>
              </template>
            </el-breadcrumb>
          </div>

          <div class="content-container-box">
            <div class="content">
              <router-view v-slot="{ Component }" :key="$route.fullPath">
                <transition name="el-fade-in-linear" mode="out-in">
                  <component :is="Component" style="height: 100%"/>
                </transition>
              </router-view>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>

  <el-dialog
      v-if="editDialogVisible"
      v-model="editDialogVisible"
      width=620
      :before-close="handleClose">
    <el-form :model="passwordForm" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="旧密码" prop="oldPassword" style="width: 505px; margin-top: 20px;">
        <el-input type="password" v-model="passwordForm.oldPassword" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword" style="width: 505px; margin-top: 20px;">
        <el-input type="password" v-model="passwordForm.newPassword" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword" style="width: 505px; margin-top: 20px;">
        <el-input type="password" v-model="passwordForm.confirmPassword" autocomplete="off"/>
      </el-form-item>
      <el-row style="display: flex; justify-content: center; align-items: center; ">
        <el-button type="primary" style="width: 200px; margin-top: 20px;" @click="editSubmitForm">修改</el-button>
        <el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消
        </el-button>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import router from '../router';
import {
  Search,
  HomeFilled,
  Tools,
  Files,
  Van,
  Wallet,
  Histogram,
  Box,
  MoreFilled,
  Upload,
  CirclePlus
} from '@element-plus/icons-vue';
import {useMeanStore} from '../store';
import {getUserInfo, logout, get, post} from '../net';
import {reactive} from 'vue'

let logoTextShow: Ref<boolean> = ref(true);
let isCollapse: Ref<boolean> = ref(false);
let sideWidth: Ref<number> = ref(200);

let editDialogVisible: Ref<boolean> = ref(false);

const menuList: Ref<any> = ref();
const meanStore: any = useMeanStore();

const breadList = ref([]);

const user = ref({})

const formRef = ref(null);


function initializePage() {
  get(`/sso/users/get/me`, (data) => {
    user.value = data
    meanStore.setUserInfo(data)
  })
  get(`/sso/menus/get/router`, (data) => {
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

// const newChildRoute = {
//   path: 'cs',
//   name: 'index-new-child',
//   component: () => import('@/components/HelloWorld.vue')
// };


// // 添加新的孩子节点路由到 index 路由中
// const indexRoute = router.options.routes.find(route => route.name === 'index');

// if (indexRoute) {
//   indexRoute.children = indexRoute.children || [];
//   indexRoute.children.push(newChildRoute);

//   // 使用 addRoute 方法来动态添加路由
//   router.addRoute('index', newChildRoute);
// } else {
//   console.error('Index route not found');
// }

// console.log(router.getRoutes())

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

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

let passwordForm: PasswordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

watch(
    () => ({
      route: router.currentRoute.value,
      force: meanStore.force,
      face: meanStore.face,
    }), (newValue, oldValue) => {
      breadList.value = [{path: newValue.route.path, name: newValue.route.name}];
      if (newValue.force) {
        console.log('force change')
        meanStore.setForce(false)
        router.push('/welcome/login')
      }
      if (newValue.face) {
        meanStore.setFace(false)
        initializePage(false)
      }
    }, {immediate: true, deep: true}
);

const rules = {
  // 英文、数字、常用符号
  oldPassword: [
    {required: true, message: '请输入旧密码', trigger: 'blur'},
    {min: 6, max: 50, message: '密码长度在6到16个字符', trigger: 'blur'},
  ],
  newPassword: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {min: 6, max: 50, message: '密码长度在6到50个字符', trigger: 'blur'},
    {
      pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z_@.]{6,50}$/,
      message: '密码必须包含字母、数字或特殊字符',
      trigger: 'blur'
    },
  ],
  confirmPassword: [
    {required: true, message: '请确认新密码', trigger: 'blur'},
    {min: 6, max: 50, message: '密码长度在6到50个字符', trigger: 'blur'},
    {
      pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z_@.]{6,50}$/,
      message: '密码必须包含字母、数字或特殊字符',
      trigger: 'blur'
    },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback('两次输入的密码不一致!');
        } else if (value === passwordForm.oldPassword) {
          callback('新密码不能与旧密码相同!');
        } else {
          callback();
        }
      }, trigger: 'blur'
    },
  ],
};

function handleResetPassword() {
  editDialogVisible.value = true;
  setTimeout(() => {
    formRef.value.resetFields();
  }, 0);
}

function handleClose() {
  editDialogVisible.value = false;
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
}

function editSubmitForm() {
  formRef.value.validate((valid) => {
    if (valid) {
      const data = {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      };
      post('/sso/users/put/password', passwordForm, (data) => {
        ElMessage.success('密码修改成功，请重新登录');
        handleClose();
        userLogout();
      });
    }
  });
}
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
.coll-dev >>> .el-menu--collapse .el-submenu__title span {
  display: none;
}

/*隐藏 > */
.coll-dev >>> .el-menu--collapse .el-submenu__title .el-submenu__icon-arrow {
  display: none;
}

/* 隐藏所有浏览器滚动条 */
.el-menu::-webkit-scrollbar {
  display: none;  /* Chrome/Safari/Edge */
  width: 0;
  height: 0;
}
</style>