<template>
	<div style="margin-bottom: 10px;">
		<el-row>
			<el-input v-model="searchValue.name" style="width: 240px;" size="small" placeholder="请输入公司名称" type="text">
				<template #prepend>
					<el-button @click="handleSearch" :icon="Search" />
				</template>
			</el-input>
			<el-input v-model="searchValue.address" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入地址" type="text"></el-input>
			<el-button  @click="handleSearch" style="margin-left: 5px; width: 75px; height: 32px;" size="small" type="primary">搜索</el-button>
			
			<el-button type="primary" style="width: 80px; height: 32px;" size="small" @click="nextAdd">新增<el-icon><CirclePlus /></el-icon></el-button>
			
			<el-popconfirm
				confirm-button-text="删除"
			    cancel-button-text="点错了"
			    :icon="InfoFilled"
				confirm-button-type="danger"
			    icon-color="#ef0004"
			    title="确认要删除此这些客户?"
				:width="200"
				@confirm="handleDeleteList()"
				>
			    <template #reference>
					<el-button type="danger" style="margin-left: 5px; width: 80px; height: 32px;" size="small" >批量删除<el-icon><Remove /></el-icon></el-button>
			    </template>
			</el-popconfirm>
			
			<el-upload 
				list-type="text"
				accept=".xls, .xlsx"
				:file-list="fileList"
				:headers="headers"
				:action="postUrl"
				:multiple="false"
				:show-file-list="false"
				:on-success="uploadSuccess">
				<el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small">导入<el-icon><Download /></el-icon></el-button>
			</el-upload>
			<el-button type="primary" style="margin-left: 5px; width: 80px; height: 32px;" size="small" @click="exportData">导出<el-icon><Upload /></el-icon></el-button>
		</el-row>
	</div>
	
	<el-table :data="supplierList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange" max-height=525>
		<el-table-column type="selection" width="55"/>
		<el-table-column prop="id" label="供应商编号" width="100">
		</el-table-column>
		<el-table-column prop="name" label="供应商名称" width="200">
		</el-table-column>
		<el-table-column prop="contact" label="联系人" width="140">
		</el-table-column>
		<el-table-column prop="number" label="电话" width="200">
		</el-table-column>
		<el-table-column prop="address" label="地址" width="200">
		</el-table-column>
		<el-table-column prop="remarks" label="备注" width="200">
		</el-table-column>
		<el-table-column label="操作" fixed="right">
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
			</template>
		</el-table-column>
	</el-table>
	
	<div style="padding: 10px 0; position: absolute; bottom: 2%;">
		<el-pagination
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
			v-model:current-page="searchValue.currentPage"
			:page-sizes="[5, 10, 15, 20]"
			:page-size="searchValue.pageSize"
			layout="total, sizes, prev, pager, next, jumper"
			:total="count">
		</el-pagination>
	</div>
	
	<el-dialog
		v-if="addDialogVisible"
		v-model="addDialogVisible"
		width=620
	    :before-close="handleClose">
		<el-form :model="supplier" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="供应商名称" prop="name" style="width: 400px; margin-top: 20px;">
				<el-input v-model="supplier.name"></el-input>
			</el-form-item>
			<el-form-item label="联系人" prop="contact" style="width: 300px;">
				<el-input v-model="supplier.contact"></el-input>
			</el-form-item>
			<el-form-item label="电话" prop="number" style="width: 400px;">
				<el-input v-model="supplier.number"></el-input>
			</el-form-item>
			<el-form-item label="地址" prop="address" style="width: 500px;">
				<el-input v-model="supplier.address"></el-input>
			</el-form-item>
			<el-form-item label="备注" prop="remarks" style="width: 500px;">
				<el-input v-model="supplier.remarks"></el-input>
			</el-form-item>
			<el-row style="display: flex; justify-content: center; align-items: center; ">
				<el-button type="primary" style="width: 200px; margin-top: 20px;" @click="addSubmitForm">新增</el-button>
				<el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消</el-button>
			</el-row>
		</el-form>
	</el-dialog>
	
	<el-dialog
		v-if="editDialogVisible"
		v-model="editDialogVisible"
		width=620
	    :before-close="handleClose">
		<el-form :model="supplier" :rules="rules" ref="formRef" label-width="100px">
			<el-form-item label="供应商名称" prop="name" style="width: 400px; margin-top: 20px;">
				<el-input v-model="supplier.name"></el-input>
			</el-form-item>
			<el-form-item label="联系人" prop="contact" style="width: 300px;">
				<el-input v-model="supplier.contact"></el-input>
			</el-form-item>
			<el-form-item label="电话" prop="number" style="width: 400px;">
				<el-input v-model="supplier.number"></el-input>
			</el-form-item>
			<el-form-item label="地址" prop="address" style="width: 500px;">
				<el-input v-model="supplier.address"></el-input>
			</el-form-item>
			<el-form-item label="备注" prop="remarks" style="width: 500px;">
				<el-input v-model="supplier.remarks"></el-input>
			</el-form-item>
			<el-row style="display: flex; justify-content: center; align-items: center; ">
				<el-button type="primary" style="width: 200px; margin-top: 20px;" @click="editSubmitForm">修改</el-button>
				<el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消</el-button>
			</el-row>
		</el-form>
	</el-dialog>
</template>

<script setup lang="ts">
	import { ref, onMounted, reactive } from 'vue';
	import { Search } from '@element-plus/icons-vue';
	import { get, post, accessHeader } from '@/net';
	import router from '@/router';
	
	let supplierList = ref([]);
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	
	let selectedRowList = ref([])
	const count = ref(0)
	
	let searchValue = reactive({
		name: '',
		contact: '',
		address: '',
		currentPage: 1,
		pageSize: 10
	})
	
	let supplier = reactive({
		id: null,     
		address: '',  
		contact: '',
		name: '',
		number: '',
		remarks: '',
		isDel: null   
	})
	
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
		post(`/suppliers/get`,searchValue , (data: any) => {
			supplierList.value = data.supplierList
			count.value = data.count
		})
		handleClose()
	};
	
	function handleClose() {
		addDialogVisible.value = false
		editDialogVisible.value = false
		supplier.id = null
		supplier.address = ''
		supplier.contact = ''
		supplier.name = ''
		supplier.number = ''
		supplier.remarks = ''
		supplier.isDel = null
	}
	
	const handleSearch = () => {
		searchValue.currentPage = 1
		initializePage()
	};
	
	const handleSizeChange = (val) => {
		searchValue.pageSize = val;
		initializePage();
	};
	
	const handleCurrentChange = (val) => {
		initializePage()
	};
	
	function handleSelectionChange(selection) {
		selectedRowList.value = selection;
	};
	
	
	function nextAdd() {
		addDialogVisible.value = true
	}
	
	function handleEdit(row) {
		supplier.id = row.id
		supplier.address = row.address
		supplier.contact = row.contact
		supplier.name = row.name
		supplier.number = row.number
		supplier.remarks = row.remarks
		editDialogVisible.value = true
	}
	
	function addSubmitForm() {
	    formRef.value.validate((valid: any) => {
	        if (valid) {
				post(`/suppliers/post`, supplier, () => {
					ElMessage.success('添加成功!')
					initializePage()
				})
	        } else {
	            // 表单验证失败，不执行提交操作
	            ElMessage.warning('请完整填写注册表单内容!');
	            return false;
	        }
	    });
	};
	
	function editSubmitForm() {
		formRef.value.validate((valid: any) => {
			if(valid) {
				post('/suppliers/put', supplier, () => {
					ElMessage.success('修改成功!')
					initializePage()
				})
			} else {
	            ElMessage.warning('请完整填写注册表单内容!')
	        }
		});
	}
	
	function handleDelete(row) {
		get(`/suppliers/delete/${row.id}`, () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function handleDeleteList() {
		post(`/suppliers/delete`, selectedRowList.value.map(row => row.id), () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function exportData() {
		window.open(`http://localhost:8000/mugen/api/suppliers/get/excel`)
	}
	
	function uploadSuccess(data) {
		if (data.code === 200) {
			ElMessage.success("上传成功!")
		initializePage();
		} else (
			ElMessage.warning(data.message)
		)
	}
	
	let rules = {
	    name: [
	        { required: true, message: '姓名不能为空' },
	        { max: 50, message: '姓名不能超过50个字' },
	    ],
		contact: [
			{ required: true, message: '联系人不能为空' },
			{ max: 20, message: '联系人不能超过20个字' },
		],
	    number: [
	        { required: true, message: '联系电话不能为空' },
	        { max: 20, message: '联系电话不能超过20个字' },
			{
			    pattern: /^(\d+|\d+-\d+)$/,
			    message: '电话格式不正确'
			}
		],
	    remarks: [
	        { max: 200, message: '备注不能超过200个字' },
	    ],
		address: [
	        { required: true, message: '地址不能为空' },
	        { max: 100, message: '地址不能超过100个字' },
	    ]
	};
</script>

<style scoped>
</style>