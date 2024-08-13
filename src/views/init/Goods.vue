<template>
	
	<el-row style="height: 100%;">
		<el-col :span="4">
			<el-card style="height: 80vh;">
				<el-tree
					ref="treeRef"
					:data="goodsTypeTree"
					node-key="id"
					highlight-current
					:props="{
						id: 'id',
						label: 'name'
					}"
					@node-click="handleNodeClick"
				/>
			</el-card>
		</el-col>
		<el-col :span="20" style="padding-left: 10px;">
			<div style="margin-bottom: 10px;">
				<el-row>
					<el-input v-model="searchValue.name" style="width: 240px;" size="small" placeholder="请输入商品名称" type="text">
						<template #prepend>
							<el-button @click="handleSearch" :icon="Search" />
						</template>
					</el-input>
					<el-input v-model="searchValue.producer" style="width: 200px; margin-left: 5px;" size="small" placeholder="请输入生产厂商" type="text"></el-input>
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
			
			<el-table :data="goodsList" border :header-cell-class-name="headerBg" @selection-change="handleSelectionChange" max-height=525>
				<el-table-column type="selection" width="55"/>
				<el-table-column prop="code" label="商品编号" width="117">
				</el-table-column>
				<el-table-column prop="name" label="商品名称" width="200">
				</el-table-column>
				<el-table-column prop="inventoryQuantity" label="库存数量" width="90">
				</el-table-column>
				<el-table-column prop="model" label="型号" width="100">
				</el-table-column>
				<el-table-column prop="unit" label="商品单位" width="90">
				</el-table-column>
				<el-table-column prop="producer" label="生产产商" width="200">
				</el-table-column>
				<el-table-column prop="purchasingPrice" label="采购价" width="80">
				</el-table-column>
				<el-table-column prop="sellingPrice" label="出库价" width="90">
				</el-table-column>
				<el-table-column prop="lastPurchasingPrice" label="上一次采购价格" width="125">
				</el-table-column>
				<el-table-column prop="maxNum" label="库存上线" width="90">
				</el-table-column>
				<el-table-column prop="minNum" label="库存下线" width="90">
				</el-table-column>
				<el-table-column prop="remarks" label="备注" width="200">
				</el-table-column>
				<el-table-column label="操作" fixed="right" width="135">
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
			
			<div style="padding: 10px 0; position: absolute; bottom: -10px;">
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
				<el-form :model="goods" :rules="rules" ref="formRef" label-width="100px">
					<el-row>
						<el-form-item label="商品名称" prop="name" style="width: 300px;">
							<el-input v-model="goods.name"></el-input>
						</el-form-item>
					</el-row>
					<el-row>
						<el-form-item label="商品型号" prop="model" style="width: 275px;">
							<el-input v-model="goods.model"></el-input>
						</el-form-item>
						<el-form-item label="商品单位" prop="unit" style="width: 225px;">
							<el-autocomplete
							    v-model="goods.unit"
							    :fetch-suggestions="querySearchAsync"
							    placeholder="请输入..."
							    @select="handleSelect"
							/>
						</el-form-item>
					</el-row>
					<el-row>
						<el-form-item label="采购价格" prop="purchasingPrice">
							<el-input-number v-model="goods.purchasingPrice"></el-input-number>
						</el-form-item>
						<el-form-item label="出库价格" prop="sellingPrice">
							<el-input-number v-model="goods.sellingPrice"></el-input-number>
						</el-form-item>				
					</el-row>
					<el-row>
						<el-form-item label="库存上线" prop="maxNum">
							<el-input-number v-model="goods.maxNum"></el-input-number>
						</el-form-item>
						<el-form-item label="库存下线" prop="minNum">
							<el-input-number v-model="goods.minNum"></el-input-number>
						</el-form-item>				
					</el-row>
					<el-form-item label="生产厂商" prop="producer" style="width: 500px;">
						<el-input v-model="goods.producer"></el-input>
					</el-form-item>
					<el-form-item label="备注" prop="remarks" style="width: 500px;">
						<el-input v-model="goods.remarks"></el-input>
					</el-form-item>
					<el-row style="display: flex; justify-content: center; align-items: center; margin-bottom: 25px;">
						<el-button type="primary" style="width: 200px; margin-top: 20px;" @click="addSubmitForm">新增</el-button>
						<el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 65px;" @click="handleClose">取消</el-button>
					</el-row>
				</el-form>
			</el-dialog>
			
			<el-dialog
				v-if="editDialogVisible"
				v-model="editDialogVisible"
				width=620
			    :before-close="handleClose">
				<el-form :model="goods" :rules="rules" ref="formRef" label-width="100px">
					<el-row>
						<el-form-item label="商品名称" prop="name" style="width: 300px;">
							<el-input v-model="goods.name"></el-input>
						</el-form-item>
					</el-row>
					<el-row>
						<el-form-item label="商品型号" prop="model" style="width: 275px;">
							<el-input v-model="goods.model"></el-input>
						</el-form-item>
						<el-form-item label="商品单位" prop="unit" style="width: 225px;">
							<el-autocomplete
							    v-model="goods.unit"
							    :fetch-suggestions="querySearchAsync"
							    placeholder="请输入..."
							    @select="handleSelect"
							/>
						</el-form-item>
					</el-row>
					<el-row>
						<el-form-item label="采购价格" prop="purchasingPrice">
							<el-input-number v-model="goods.purchasingPrice"></el-input-number>
						</el-form-item>
						<el-form-item label="出库价格" prop="sellingPrice">
							<el-input-number v-model="goods.sellingPrice"></el-input-number>
						</el-form-item>				
					</el-row>
					<el-row>
						<el-form-item label="库存上线" prop="maxNum">
							<el-input-number v-model="goods.maxNum"></el-input-number>
						</el-form-item>
						<el-form-item label="库存下线" prop="minNum">
							<el-input-number v-model="goods.minNum"></el-input-number>
						</el-form-item>				
					</el-row>
					<el-form-item label="生产厂商" prop="producer" style="width: 500px;">
						<el-input v-model="goods.producer"></el-input>
					</el-form-item>
					<el-form-item label="备注" prop="remarks" style="width: 500px;">
						<el-input v-model="goods.remarks"></el-input>
					</el-form-item>
					<el-row style="display: flex; justify-content: center; align-items: center; ">
						<el-button type="primary" style="width: 200px; margin-top: 20px;" @click="editSubmitForm">修改</el-button>
						<el-button type="info" style="width: 200px; margin-top: 20px; margin-left: 60px;" @click="handleClose">取消</el-button>
					</el-row>
				</el-form>
			</el-dialog>
			
		</el-col>
	</el-row>
</template>

<script setup lang="ts">
	import { ref, onMounted, reactive } from 'vue';
	import { Search } from '@element-plus/icons-vue';
	import { get, post, accessHeader } from '@/net';
	import router from '@/router';
	
	let goodsList = ref([]);
	let goodsTypeTree = ref([])
	const addDialogVisible = ref(false)
	const editDialogVisible = ref(false)
	
	let selectedRowList = ref([])
	const count = ref(0)
	
	let searchValue = reactive({
		name: '',
		producer: '',
		typeId: [],
		currentPage: 1,
		pageSize: 10
	})
	
	let goods = reactive({
		id: null, 
		code: '',
		name: '',
		inventoryQuantity: null, 
		maxNum: null, 
		minNum: null,
		model: '', 
		producer: '', 
		purchasingPrice: null, 
		remarks: '', 
		sellingPrice: null, 
		unit: '', 
		typeId: null, 
		lastPurchasingPrice: null 
	})
	
	let fileName = ref("multipartFiles")
	let headers =ref(accessHeader())
	let fileList =ref([])
	let postUrl = ref("http://localhost:8000/mugen/api/goods/post/excel")
		
	const formRef = ref()
	// 页面初始化加载数据
	onMounted(() => {
		get(`/goodsTypes/get/tree`, (data) => {
			goodsTypeTree.value = data
			searchValue.typeId = collectLeafIds(data[0])
			initializePage();
		})
	});
	
	// 初始化页面数据
	function initializePage() {
		post(`/goods/get`,searchValue , (data: any) => {
			goodsList.value = data.goodsList
			count.value = data.count
		})
		handleClose()
	};
	
	function handleClose() {
		addDialogVisible.value = false
		editDialogVisible.value = false
		goods.id = null
		goods.code = ''
		goods.name = ''
		goods.inventoryQuantity = null
		goods.maxNum = null
		goods.minNum = null
		goods.model = ''
		goods.producer = ''
		goods.purchasingPrice = null
		goods.remarks = ''
		goods.sellingPrice = null
		goods.unit = ''
		goods.lastPurchasingPrice = null
	}
	
	const handleSearch = () => {
		searchValue.currentPage = 1
		initializePage()
	};
	
	const handleSizeChange = (val: number) => {
		searchValue.pageSize = val;
		initializePage();
	};
	
	const handleCurrentChange = (val) => {
		initializePage()
	};
	
	function handleSelectionChange(selection: never[]) {
		selectedRowList.value = selection;
	};
	
	function handleNodeClick(data: any) {
		searchValue.typeId = collectLeafIds(data)
		goods.typeId = data.id
		initializePage()
	}
	
	function querySearchAsync() {
		return new Promise<any>((resolve, reject) => {
			get(`/goodsUnits/get`, (data => {
				const filteredUnits = data.filter(unit => unit.name.toLowerCase().includes(goods.unit.toLowerCase()))
				// 将过滤后的结果映射为自动完成组件需要的格式
				const suggestions = filteredUnits.map(unit => ({
				    value: unit.name,
				    // link: unit.link // 如果有 link 属性，可以根据需要添加
				}))
				resolve(suggestions)
			}))
		});	
	}
	
	function nextAdd() {
		if (searchValue.typeId.length > 1) {
			ElMessage.warning("请选择对应分类后添加")
		} else {
			addDialogVisible.value = true
		}
	}
	
	function handleEdit(row) {
		goods.id = row.id
		goods.code = row.code
		goods.name = row.name
		goods.inventoryQuantity = row.inventoryQuantity
		goods.maxNum = row.maxNum
		goods.minNum = row.minNum
		goods.model = row.model
		goods.producer = row.producer
		goods.purchasingPrice = row.purchasingPrice
		goods.remarks = row.remarks
		goods.sellingPrice = row.sellingPrice
		goods.unit = row.unit
		goods.typeId = row.typeId
		goods.lastPurchasingPrice = row.lastPurchasingPrice
		editDialogVisible.value = true
	}
	
	function handleDelete(row) {
		get(`/goods/delete/${row.id}`, () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function handleDeleteList() {
		post(`/goods/delete`, selectedRowList.value.map(row => row.id), () => {
			ElMessage.success('删除成功!')
			initializePage()
		})
	}
	
	function exportData() {
		window.open(`http://localhost:8000/mugen/api/goods/get/excel`)
	}
	
	function uploadSuccess(data) {
		if (data.code === 200) {
			ElMessage.success("上传成功!")
		initializePage();
		} else (
			ElMessage.warning(data.message)
		)
	}
	
	// 收集所有末端孩子节点的 id
	function collectLeafIds(node) {
		let idlist = []
		if (!node.children) {
			idlist.push(node.id)
			return idlist
		}
		node.children.forEach(n => {
			collectLeafIds(n).forEach(id => {
				idlist.push(id);
			})
		})
		return idlist
	}
	
	const positiveNumberValidator = (rule, value, callback) => {
		if (!Number.isNaN(value) && value >= 0) {
			callback();
		} else {
			callback(new Error('最小为0'));
		}
	};
	
	function addSubmitForm() {
	    formRef.value.validate((valid) => {
	        if (valid) {
				post(`/goods/post`, goods, () => {
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
		formRef.value.validate((valid) => {
			if(valid) {
				post('/goods/put', goods, () => {
					ElMessage.success('修改成功!')
					initializePage()
				})
			} else {
	            ElMessage.warning('请完整填写注册表单内容!')
	        }
		});
	}
	
	function validateMaxNumGreaterThanMinNum(rule, value, callback) {
	  if (goods.maxNum !== null && goods.minNum !== null && goods.maxNum <= goods.minNum) {
	    callback(new Error('库存上线必须大于库存下线'));
	  } else {
	    callback();
	  }
	}
	
	const rules = reactive({
	    name: [
			{ required: true, message: '请输入商品名称', trigger: 'blur' }
	    ],
	    model: [
			{ required: true, message: '请输入商品型号', trigger: 'blur' }
	    ],
	    unit: [
			{ required: true, message: '请输入商品单位', trigger: 'blur' }
	    ],
		purchasingPrice: [
			{ required: true, message: '请输入采购价格', trigger: 'blur' },
			{ type: 'number', message: '采购价格必须为数字值', trigger: 'blur' },
			{ validator: positiveNumberValidator, trigger: 'blur' }
	    ],
	    sellingPrice: [
			{ required: true, message: '请输入出库价格', trigger: 'blur' },
			{ type: 'number', message: '出库价格必须为数字值', trigger: 'blur' },
			{ validator: positiveNumberValidator, trigger: 'blur' }
	    ],
	    maxNum: [
			{ required: true, message: '请输入库存上线', trigger: 'blur' },
			{ type: 'number', message: '库存上线必须为数字值', trigger: 'blur' },
			{ validator: positiveNumberValidator, trigger: 'blur' },
			{ validator: validateMaxNumGreaterThanMinNum, trigger: 'blur' },
	    ],
	    minNum: [
			{ required: true, message: '请输入库存下线', trigger: 'blur' },
			{ type: 'number', message: '库存下线必须为数字值', trigger: 'blur' },
			{ validator: positiveNumberValidator, trigger: 'blur' },
			{ validator: validateMaxNumGreaterThanMinNum, trigger: 'blur' },
	    ],
	    producer: [
			{ required: true, message: '请输入生产厂商', trigger: 'blur' }
	    ],
		remarks: [
			{ trigger: 'blur' }
		]
	  });
</script>

<style scoped>
</style>