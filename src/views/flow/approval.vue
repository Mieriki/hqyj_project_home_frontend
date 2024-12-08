<template>
	<el-empty v-if="!open" description="当前无请假流程" />
	<el-table v-if="open" :data="leaveList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange" max-height=525>
		<el-table-column type="selection" width="55"/>
		<el-table-column prop="id" label="请假编号" width="310">
		</el-table-column>
		<el-table-column prop="username" label="员工姓名" width="120">
		</el-table-column>
		<el-table-column prop="day" label="请假时长" width="100">
		</el-table-column>
		<el-table-column prop="reason" label="请假理由" width="250">
		</el-table-column>
		<el-table-column prop="name" label="审批类型" width="200">
		</el-table-column>
		
		<el-table-column label="操作" fixed="right">
			<template #default="scope">
				<el-button size="small" type="primary" @click="handleEdit(scope.row)">审批通过</el-button>
			</template>
		</el-table-column>
	</el-table>
</template>

<script setup lang="ts">
	import { ref, onMounted, reactive } from 'vue';
	import { Search } from '@element-plus/icons-vue';
	import { get, post, accessHeader } from '@/net';
	import router from '@/router';

	let leaveList = ref([]);

	let open = ref(false)

	const formRef = ref()
	// 页面初始化加载数据
	onMounted(() => {
		initializePage();
	});

	// 初始化页面数据
	function initializePage() {
		get(`/leaves/list`, (data) => {
			leaveList.value = data
			if (leaveList.value.length > 0) {
				open.value = true
			}
		})
		handleClose()
	};

	function handleClose() {

	}
	 
	function handleEdit(row) {
		post(`/leaves/next`, row, () => {
			ElMessage.success('审批成功!')
			open.value = false
			initializePage()
		})
	}
</script>

<style scoped>
</style>