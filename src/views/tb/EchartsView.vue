<template>
	<div style="padding: 0 10px; margin-bottom: 20px;">
		<el-card>
			<el-row>
				<el-col :span="6">
					<el-statistic title="员工总数" :value="empCount" />
				</el-col>
				<el-col :span="6">
					<el-statistic :value="femaleCount">
						<template #title>
							<div style="display: inline-flex; align-items: center">
								员工男女比例
							</div>
						</template>
						<template #suffix> : {{ maleCount }}</template>
					</el-statistic>
				</el-col>
				<el-col :span="6">
					<el-statistic title="部门总数" :value="deptCount" />
				</el-col>
				<el-col :span="6">
					<el-statistic title="员工培训历史" :value="etCount">
						<template #suffix>
							<el-icon style="vertical-align: -0.125em" @click="router.push('/main/emptrain')">
								<ChatLineRound />
							</el-icon>
						</template>
					</el-statistic>
				</el-col>
			</el-row>
		</el-card>
	</div>


	<el-row>
		<el-col :span="12" style="padding: 0 10px;">
			<el-card>
				<v-chart class="chart" :option="deptTb" autoresize />
			</el-card>
		</el-col>
		<el-col :span="12" style="padding: 0 10px;">
			<el-card>
				<v-chart class="chart" :option="posTb" autoresize />
			</el-card>
		</el-col>
	</el-row>

</template>

<script setup lang="ts">
	import { use } from 'echarts/core';
	import { CanvasRenderer } from 'echarts/renderers';
	import { PieChart, BarChart } from 'echarts/charts';
	import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
	import VChart, { THEME_KEY } from 'vue-echarts';
	import { ref, reactive, provide, onMounted } from 'vue';
	import { get } from '@/net';
	import router from '@/router'

	use([CanvasRenderer, PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

	provide(THEME_KEY, 'vintage');

	onMounted(() => {
		initializePage();
	});
	
	let empCount = ref(0)
	let deptCount = ref(0)
	let maleCount = ref(0)
	let femaleCount = ref(0)
	let etCount = ref(0)

	// 初始化页面数据
	function initializePage() {
		get(`/positions/get/pos-tb`, (data) => {
			const pos = {
				name: '部门人数统计',
				type: 'pie',
				radius: '55%',
				center: ['50%', '60%'],
				data: [],
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)',
					},
				},
			}
			pos.data = data
			posTb.value.series.push(pos)
			// posTb.value.dataset.source = data
			console.log("posTb", posTb)
		})
		get(`/departments/get/dept-tb`, (data) => {
			const dept = {
				name: '部门人数',
				type: 'bar',
				radius: '55%',
				center: ['50%', '60%'],
				data: [],
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)',
					},
				},
			}
			dept.data = data
			deptTb.value.series.push(dept)
			deptTb.value.xAxis.data = data.map(item => item.name)
			console.log("deptTb", deptTb)
		})
		get(`/employees/get/count`, (data) => {
			empCount.value = data
		})
		get(`/departments/get/count`, (data) => {
			deptCount.value = data
		})
		get(`/employees/get/count/female`, (data) => {
			femaleCount.value = data
		})
		get(`/employees/get/count/male`, (data) => {
			maleCount.value = data
		})
		get(`/employeeTrains/get/count`, (data) => {
			etCount.value = data
		})
		// get(`/purchaseLists/get/turnover/day`, (data) => {
		// 	const purchaseList = data.purchaseList;
		// 	const salesList = data.salesList;

		// 	const optionIti = reactive({
		// 		name: '支出',
		// 		type: 'bar',
		// 		data: purchaseList.map(item => item.paid),
		// 		emphasis: {
		// 			itemStyle: {
		// 				shadowBlur: 10,
		// 				shadowOffsetX: 0,
		// 				shadowColor: 'rgba(0, 0, 0, 0.5)',
		// 			},
		// 		},
		// 		itemStyle: {
		// 			color: '#bc1313',
		// 			barBorderRadius: [5, 5, 0, 0],
		// 		},
		// 	});

		// 	const optionNi = reactive({
		// 		name: '收入',
		// 		type: 'bar',
		// 		data: salesList.map(item => item.paid),
		// 		emphasis: {
		// 			itemStyle: {
		// 				shadowBlur: 10,
		// 				shadowOffsetX: 0,
		// 				shadowColor: 'rgba(0, 0, 0, 0.5)',
		// 			},
		// 		},
		// 		itemStyle: {
		// 			color: '#1352bc',
		// 			barBorderRadius: [5, 5, 0, 0],
		// 		},
		// 	});

		// 	optionTurnoverDay.value.legend.data = ['支出', '收入'];
		// 	optionTurnoverDay.value.xAxis.data = purchaseList.map(item => item.date); // 假设日期在这里处理了

		// 	optionTurnoverDay.value.series.push(optionIti);
		// 	optionTurnoverDay.value.series.push(optionNi);
		// });
	}



	const deptTb = ref({
		title: {
			text: '部门人数统计',
			left: 'center',
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
		},
		dataset: {
			dimensions: [
				{ name: 'name', displayName: '部门名称' },
				{ name: 'value', displayName: '部门人数' },
			],
			source: []
		},
		legend: {
			orient: 'vertical',
			left: 'left',
			// data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines'],
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data: [],
			axisLabel: {
				interval: 0,
				rotate: 30,
			},
		},
		yAxis: {
			type: 'value',
		},
		series: [],
	});
	const posTb = ref({
		title: {
			text: '职位人员比例',
			left: 'center',
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
		},
		// dataset: {
		// 	dimensions: [],
		// 	source: []
		// },
		legend: {
			orient: 'vertical',
			left: 'left',
			// data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines'],
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true,
		},
		//   xAxis: {
		// type: 'category',
		// // data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines'],
		// axisLabel: {
		// 	interval: 0,
		// 	rotate: 30, 
		// },
		//   },
		//   yAxis: {
		// type: 'value',
		//   },
		series: [],
	});
</script>


<style>
	.chart {
		width: 100%;
		height: 400px;
	}
</style>