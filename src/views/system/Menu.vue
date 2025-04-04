<template>
  <div style="margin-bottom: 10px;">
    <el-row>
      <!--			<el-input v-model="searchValue.name" style="width: 240px;" size="small" placeholder="请输入联系人" type="text">-->
      <!--				<template #prepend>-->
      <!--					<el-button @click="handleSearch" :icon="Search" />-->
      <!--				</template>-->
      <!--			</el-input>-->
      <!--			<el-button  @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small" type="primary">搜索</el-button>	-->
      <el-button type="primary" style="width: 85px; height: 32px;" size="small" @click="nextAdd">
        新增根目录
        <el-icon>
          <CirclePlus/>
        </el-icon>
      </el-button>
      <el-button type="primary" style="margin-left: 5px;  width: 80px; height: 32px;" size="small" @click="nextAddIcon">
        新增图标
        <el-icon>
          <CirclePlus/>
        </el-icon>
      </el-button>
      <el-button type="primary" style="margin-left: 15px; width: 80px; height: 32px;" size="small" @click="exportData">
        导出
        <el-icon>
          <Upload/>
        </el-icon>
      </el-button>
    </el-row>
  </div>

  <el-table
      :data="menuList"
      row-key="id"
      border
      :tree-props="{
			children: 'children'
		}"
      max-height=570>
    <el-table-column prop="name" label="菜单名称" width="250">
    </el-table-column>
    <el-table-column label="图标" width="200">
      <template #default="scope">
        <component :is="scope.row.iconCls ? scope.row.iconCls : MoreFilled " class="iconColor"></component>
      </template>
    </el-table-column>
    <el-table-column prop="path" label="路由" width="250">
    </el-table-column>
    <el-table-column prop="component" label="地址">
    </el-table-column>
    <el-table-column label="操作" fixed="right" width="250">
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
        <el-button v-if="scope.row.parentId === '-1'" size="small" type="primary" @click="nextAddChild(scope.row)">新增<el-icon><CirclePlus /></el-icon></el-button>
      </template>
    </el-table-column>
    <el-table-column label="排序" width="120" fixed="right">
      <template #default="scope">
        <el-row>
          <IconButton :show-shine="false" @click="sortUp(scope.row)" style="margin-right: 10px;"><ArrowUpBold /></IconButton>
          <IconButton :show-shine="false" @click="sortDown(scope.row)"><ArrowDownBold /></IconButton>
        </el-row>
      </template>
    </el-table-column>
  </el-table>
  <el-dialog
      v-if="addIconDialogVisible"
      v-model="addIconDialogVisible"
      width=620
      :before-close="handleClose">
    <el-form ref="iconFormRef" :model="icon" :rules="iconRules" label-width="100px">
      <el-form-item label="图标名称" prop="iconName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="icon.iconName" placeholder="请输入图标名称"/>
      </el-form-item>
      <el-form-item label="图标代码" prop="iconCode" style="width: 505px; margin-top: 20px;">
        <el-input v-model="icon.iconCode" placeholder="请输入图标代码"/>
      </el-form-item>
      <el-row style="display: flex; justify-content: center; align-items: center; ">
        <el-button type="primary" style="width: 200px; margin-top: 20px;" @click="addIconSubmitForm">新增</el-button>
        <el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消
        </el-button>
      </el-row>
    </el-form>
  </el-dialog>

  <el-dialog
      v-if="addDialogVisible"
      v-model="addDialogVisible"
      width=620
      :before-close="handleClose">
    <el-form ref="formRef" :model="menu" :rules="rules" label-width="100px">
      <el-form-item label="菜单名称" prop="menuName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="menu.menuName" placeholder="请输入菜单名称"/>
      </el-form-item>
      <el-form-item v-if="menu.parentId === -1" label="图标" prop="iconCls" style="width: 505px; margin-top: 20px;">
        <el-select v-model="menu.icon" placeholder="请选择图标">
          <el-option label="无" value="MoreFilled" key="MoreFilled"><template #default><el-icon><MoreFilled class="iconColor"/></el-icon></template></el-option>
          <el-option v-for="item in iconList" :key="item.iconCode" :label="item.iconName" :value="item.iconCode">
            <template #default>
              <component :is="item.iconCode ? item.iconCode : MoreFilled " class="iconSelect"></component>
            </template>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="路由" prop="path" style="width: 505px; margin-top: 20px;">
        <el-input v-model="menu.path" placeholder="请输入路由"/>
      </el-form-item>
      <el-form-item label="地址" prop="component" style="width: 505px; margin-top: 20px;">
        <el-input v-model="menu.component" placeholder="请输入地址"/>
      </el-form-item>
      <el-row style="display: flex; justify-content: center; align-items: center; ">
        <el-button type="primary" style="width: 200px; margin-top: 20px;" @click="addSubmitForm">新增</el-button>
        <el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消
        </el-button>
      </el-row>
    </el-form>
  </el-dialog>

  <el-dialog
      v-if="editDialogVisible"
      v-model="editDialogVisible"
      width=620
      :before-close="handleClose">
    <el-form ref="formRef" :model="menu" :rules="rules" label-width="100px">
      <el-form-item label="菜单名称" prop="menuName" style="width: 505px; margin-top: 20px;">
        <el-input v-model="menu.menuName" placeholder="请输入菜单名称"/>
      </el-form-item>
      <el-form-item v-if="menu.parentId === -1" label="图标" prop="iconCls" style="width: 505px; margin-top: 20px;">
        <el-select v-model="menu.icon" placeholder="请选择图标">
          <el-option label="无" value="MoreFilled" key="MoreFilled"><template #default><el-icon><MoreFilled class="iconColor"/></el-icon></template></el-option>
          <el-option v-for="item in iconList" :key="item.iconCode" :label="item.iconName" :value="item.iconCode">
            <template #default>
              <component :is="item.iconCode ? item.iconCode : MoreFilled " class="iconSelect"></component>
            </template>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="路由" prop="path" style="width: 505px; margin-top: 20px;">
        <el-input v-model="menu.path" placeholder="请输入路由"/>
      </el-form-item>
      <el-form-item label="地址" prop="component" style="width: 505px; margin-top: 20px;">
        <el-input v-model="menu.component" placeholder="请输入地址"/>
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
import {ref, onMounted, reactive} from 'vue';
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
  CirclePlus,
  CirclePlusFilled
} from '@element-plus/icons-vue';
import {get, post, accessHeader} from '@/net';
import router from '@/router';
import { useMeanStore } from '@/store';

import IconButton from "@/components/IconButton.vue";

let menuList = ref([]);

const meanStore = useMeanStore();

const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

const addIconDialogVisible = ref(false)
const editIconDialogVisible = ref(false)

let selectedRowList = ref([])
let iconList = ref([])
const count = ref(0)

let searchValue = reactive({
  name: ''
})

let menu = reactive({
  id: null,
  path: '',
  component: '',
  menuName: '',
  icon: '',
  parentId: 0,
})

let icon = reactive({
  id: null,
  iconName: '',
  iconCode: '',
})

let fileName = ref("multipartFiles")
let headers = ref(accessHeader())
let fileList = ref([])
let postUrl = ref("http://mieriki.net/mugen/api/sso/menus/post/excel")

const formRef = ref()
const iconFormRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  post(`/sso/menus/get/tree`, searchValue, (data: any) => {
    menuList.value = data
    console.log("menuList page init", menuList)
  })
  get('/sso/icons/get', (data: any) => {
    iconList.value = data
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  addIconDialogVisible.value = false
  editIconDialogVisible.value = false
  menu.id = null
  menu.menuName = ''
  menu.icon = ''
  menu.path = ''
  menu.component = ''
  menu.parentId = 0
  icon.id = 0
  icon.iconName = ''
  icon.iconCode = ''
}

const handleSearch = () => {
  initializePage()
};

function handleEdit(row) {
  menu.id = row.id
  menu.menuName = row.name
  menu.icon = row.iconCls
  menu.path = row.path
  menu.component = row.component
  menu.parentId = row.parentId
  editDialogVisible.value = true
}

function nextAdd() {
  menu.parentId = -1
  addDialogVisible.value = true
}

function nextAddChild(row) {
  menu.parentId = row.id
  addDialogVisible.value = true
}

function nextAddIcon() {
  addIconDialogVisible.value = true
}

function addSubmitForm() {
  formRef.value.validate((valid: any) => {
    if (valid) {
      post('/sso/menus/post', menu, (data: any) => {
        ElMessage.success('添加成功!')
        initializePage()
      })
    } else {
      // 表单验证失败，不执行提交操作
      ElMessage.warning('请完整填写注册表单内容!');
      return false;
    }
  });
}

function addIconSubmitForm() {
  iconFormRef.value.validate((valid: any) => {
    if (valid) {
      post('/sso/icons/post', icon, (data: any) => {
        ElMessage.success('添加成功!')
        initializePage()
      })
    } else {
      // 表单验证失败，不执行提交操作
      ElMessage.warning('请完整填写注册表单内容!');
      return false;
    }
  });
}

function editSubmitForm() {
  formRef.value.validate((valid: any) => {
    if (valid) {
      post('/sso/menus/put', menu, (data: any) => {
        ElMessage.success('修改成功!')
        initializePage()
      })
    } else {
      // 表单验证失败，不执行提交操作
      ElMessage.warning('请完整填写注册表单内容!');
      return false;
    }
  });
}

function handleDelete(row) {
  if (row.children && row.children.length > 0) {
    ElMessage.warning('请先删除子菜单!');
    return false;
  }
  get(`/sso/menus/delete/${row.id}`, () => {
    ElMessage.success('删除成功!')
    initializePage()
  })
}

function exportData() {
  window.open(`http://mieriki.net/mugen/api/sso/menus/get/excel`)
}

function sortUp(row) {
  get(`/sso/menus/get/sort/up/${row.id}`, () => {
    ElMessage.success('上移成功!')
    meanStore.setFace(true)
    initializePage()
  })
}

function sortDown(row) {
  get(`/sso/menus/get/sort/down/${row.id}`, () => {
    ElMessage.success('下移成功!')
    meanStore.setFace(true)
    initializePage()
  })
}

const rules = {
  name: [
    {required: true, message: '请输入菜单名称', trigger: 'blur'},
    {min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur'}
  ],
  path: [
    {required: true, message: '请输入地址', trigger: 'blur'},
    {min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur'}
  ],
  component: [
    {required: true, message: '请输入路由', trigger: 'blur'},
    {min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur'}
  ],
};

const iconRules = {
  iconName: [
    {required: true, message: '请输入图标名称', trigger: 'blur'},
    {min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur'}
  ],
  iconCode: [
    {required: true, message: '请输入图标代码', trigger: 'blur'},
    {min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur'}
  ],
};
</script>

<style scoped>
.iconColor {
  width: 18px;
  height: 18px;
  margin-left: 3px;
  margin-top: 3px;
  color: #b1b3b8;
}

.iconSelect {
  width: 18px;
  height: 18px;
  margin-top: 3px;
  color: #0056c6;
}

.iconButton {
  /* 基础配置 */
  --primary-color: #409eff;
  --hover-color: #337ecc;
  --shadow-color: rgba(0, 0, 0, 0.1);
  margin-right: 10px;
  /* 核心样式 */
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  position: relative;
  overflow: visible; /* 允许溢出显示动画 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 裁剪层容器 */
.iconButton::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 3px 5px var(--shadow-color);
  transition: inherit;
}

/* 动态流光效果 */
.iconButton::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
      45deg,
      transparent 35%,
      rgba(255,255,255,0.2) 50%,
      transparent 65%
  );
  transform: rotate(45deg);
  animation: shine 3s infinite;
  opacity: 0.5;
}

/* 图标样式 */
.iconButton .el-icon {
  position: relative;
  z-index: 2;
  font-size: 16px;
  transition: transform 0.25s ease;
}

/* 悬停状态 */
.iconButton:hover {
  background-color: var(--hover-color);
}
.iconButton:hover::before {
  box-shadow: 0 4px 8px var(--shadow-color);
  transform: translateY(-1px);
}
.iconButton:hover .el-icon {
  transform: translateY(-1px);
}

/* 点击状态 */
.iconButton:active {
  transform: scale(0.92);
}
.iconButton:active .el-icon {
  transform: scale(0.85);
}

/* 流光动画 */
@keyframes shine {
  0% { transform: translateX(-150%) rotate(45deg); }
  100% { transform: translateX(150%) rotate(45deg); }
}

@media (prefers-color-scheme: dark) {
  .iconButton {
    --shadow-color: rgba(255,255,255,0.1);
    --primary-color: #3375b9;
  }
}

</style>