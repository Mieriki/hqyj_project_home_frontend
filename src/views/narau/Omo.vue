<template>
  <el-row>
    <el-input v-model="searchValue.title" style="width: 240px;" size="small" placeholder="请输入题目" type="text">
      <template #prepend>
        <el-button @click="handleSearch" :icon="Search"/>
      </template>
    </el-input>
    <el-select v-model="searchValue.type" style="width: 200px; margin-left: 5px;" placeholder="请选择类型">
      <el-option label="政治理论与常识" value="politics"></el-option>
      <el-option label="言语理解与表达" value="speech"></el-option>
      <el-option label="数量关系" value="quantity"></el-option>
      <el-option label="逻辑推理" value="logic"></el-option>
      <el-option label="材料应用" value="material"></el-option>
    </el-select>
    <el-input v-model="bangou" style="width: 200px; margin-left: 5px;" placeholder="从第几题开始" type="number"></el-input>
    <!--      <el-input v-model="searchValue.address" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入地址" type="text"></el-input>-->
    <el-button @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small" type="primary">
      搜索
    </el-button>
  </el-row>
  <div class="infinite-list-wrapper" id="box" style="overflow: auto; max-height: 72vh; margin-top: 20px;">
    <ol
        v-infinite-scroll="load"
        class="list"
        :infinite-scroll-disabled="disabled"
        :infinite-scroll-immediate="true"
        style="list-style-type: none;"

    >
      <li v-if="mondaiList.length > 0" v-for="(mondai, index) in mondaiList" :key="mondai.id">
        <MondaiCard :question="mondai" admin></MondaiCard>
      </li>
    </ol>
    <p v-if="loading"><div class="loader" style="margin: auto;"></div></p>
    <p v-if="noMore" style="text-align: center;"><el-text type="secondary" style="text-align: center; width: 100%;">没有更多数据了</el-text></p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { get, post, accessHeader } from '@/net';
import router from '@/router';

const bangou = ref(null)

const total = ref(0)
const count = ref(10)
const loading = ref(false)
const noMore = computed(() => searchValue.currentPage > total.value - 1)
const disabled = computed(() => loading.value || noMore.value)

let mondaiList = ref([]);
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)

let selectedRowList = ref([])

let searchValue = reactive({
  title: '',
  type: '',
  currentPage: 0,
  pageSize: 1
})

function handleSearch() {

  if (bangou.value > 0) {
    searchValue.currentPage = Number(bangou.value) - 1
  } else {
    searchValue.currentPage = 0
  }
  initializePage()

  setTimeout(() => {
    load()
  }, 2000)
}

let fileName = ref("multipartFiles")
let headers =ref(accessHeader())
let fileList =ref([])
let postUrl = ref("http://localhost:8000/mugen/api/customers/post/excel")

const formRef = ref()
// 页面初始化加载数据
onMounted(() => {
  initializePage();
});

// 初始化页面数据
function initializePage() {
  post(`/mondais/get`, searchValue, (data: any) => {
    total.value = Number(data.count)
  })
  handleClose()
};

function handleClose() {
  addDialogVisible.value = false
  editDialogVisible.value = false
  mondaiList.value = []
}

const load = () => {
  console.log('load mondai.....', searchValue)
  loading.value = true
  setTimeout(() => {
    searchValue.currentPage += 1
    post(`/mondais/get`, searchValue, (data: any) => {
      if (data.mondaiList.length === 0) {
        return
      }
      const mondaiItem = data.mondaiList[0]
      get(`/mondais/get/number/${mondaiItem.id}`, (data: any) => {
        mondaiItem.title = `${data}. ${mondaiItem.title}`
        mondaiList.value.push(mondaiItem)
      })
    })
    loading.value = false
  }, 2000)
}
</script>

<style scoped>
/* HTML: <div class="loader"></div> */
.loader {
  width: 45px;
  aspect-ratio: 1;
  --c: no-repeat linear-gradient(#000 0 0);
  background:
      var(--c) 0%   50%,
      var(--c) 50%  50%,
      var(--c) 100% 50%;
  background-size: 20% 100%;
  animation: l1 1s infinite linear;
}
@keyframes l1 {
  0%  {background-size: 20% 100%,20% 100%,20% 100%}
  33% {background-size: 20% 10% ,20% 100%,20% 100%}
  50% {background-size: 20% 100%,20% 10% ,20% 100%}
  66% {background-size: 20% 100%,20% 100%,20% 10% }
  100%{background-size: 20% 100%,20% 100%,20% 100%}
}
</style>