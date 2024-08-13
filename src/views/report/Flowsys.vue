<template>
	<el-row>
		<el-col :span="12" style="padding: 0 10px;">
			<el-card>
				<v-chart class="chart" :option="optionTurnoverYear" autoresize />
			</el-card>
		</el-col>
		<el-col :span="12" style="padding: 0 10px;">
			<el-card>
				<v-chart class="chart" :option="optionTurnoverMonth" autoresize />
			</el-card>
		</el-col>
	</el-row>
	<el-row style="margin-top: 10px;">
		<el-col :span="12" style="padding: 0 10px;">
			<el-card>
				<v-chart class="chart" :option="optionTurnoverDay" autoresize />
			</el-card>
		</el-col>
		<!-- <el-col :span="12" style="padding: 0 10px;">
			<el-card>
				<v-chart class="chart" :option="optionTurnoverMonth" autoresize />
			</el-card>
		</el-col> -->
	</el-row>


</template>

<script setup>
	import { use } from 'echarts/core';
	import { CanvasRenderer } from 'echarts/renderers';
	import { PieChart, BarChart } from 'echarts/charts';
	import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
	import VChart, { THEME_KEY } from 'vue-echarts';
	import { ref, reactive, provide, onMounted } from 'vue';
	import { get } from '@/net';

	use([CanvasRenderer, PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

	provide(THEME_KEY, 'vintage');

	onMounted(() => {
		initializePage();
		console.log("optionTurnoverYear", optionTurnoverYear)
	});

	// 初始化页面数据
	function initializePage() {
			get(`/purchaseLists/get/turnover/year`, (data) => {
				const purchaseList = data.purchaseList;
				const salesList = data.salesList;
	
				const optionIti = reactive({
					name: '支出',
					type: 'bar',
					data: purchaseList.map(item => item.paid),
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)',
						},
					},
					itemStyle: {
						color: '#bc1313',
						barBorderRadius: [5, 5, 0, 0],
					},
				});
	
				const optionNi = reactive({
					name: '收入',
					type: 'bar',
					data: salesList.map(item => item.paid),
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)',
						},
					},
					itemStyle: {
						color: '#1352bc',
						barBorderRadius: [5, 5, 0, 0],
					},
				});
	
				optionTurnoverYear.value.legend.data = ['支出', '收入'];
				optionTurnoverYear.value.xAxis.data = purchaseList.map(item => item.date); // 假设日期在这里处理了
	
				optionTurnoverYear.value.series.push(optionIti);
				optionTurnoverYear.value.series.push(optionNi);
			});
			
			get(`/purchaseLists/get/turnover/month`, (data) => {
				const purchaseList = data.purchaseList;
				const salesList = data.salesList;
				
				const optionIti = reactive({
					name: '支出',
					type: 'bar',
					data: purchaseList.map(item => item.paid),
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)',
						},
					},
					itemStyle: {
						color: '#bc1313',
						barBorderRadius: [5, 5, 0, 0],
					},
				});
				
				const optionNi = reactive({
					name: '收入',
					type: 'bar',
					data: salesList.map(item => item.paid),
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)',
						},
					},
					itemStyle: {
						color: '#1352bc',
						barBorderRadius: [5, 5, 0, 0],
					},
				});
				
				optionTurnoverMonth.value.legend.data = ['支出', '收入'];
				optionTurnoverMonth.value.xAxis.data = purchaseList.map(item => item.date); // 假设日期在这里处理了
				
				optionTurnoverMonth.value.series.push(optionIti);
				optionTurnoverMonth.value.series.push(optionNi);
				
				
			});
			
			get(`/purchaseLists/get/turnover/day`, (data) => {
				const purchaseList = data.purchaseList;
				const salesList = data.salesList;
				
				const optionIti = reactive({
					name: '支出',
					type: 'bar',
					data: purchaseList.map(item => item.paid),
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)',
						},
					},
					itemStyle: {
						color: '#bc1313',
						barBorderRadius: [5, 5, 0, 0],
					},
				});
				
				const optionNi = reactive({
					name: '收入',
					type: 'bar',
					data: salesList.map(item => item.paid),
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)',
						},
					},
					itemStyle: {
						color: '#1352bc',
						barBorderRadius: [5, 5, 0, 0],
					},
				});
				
				optionTurnoverDay.value.legend.data = ['支出', '收入'];
				optionTurnoverDay.value.xAxis.data = purchaseList.map(item => item.date); // 假设日期在这里处理了
				
				optionTurnoverDay.value.series.push(optionIti);
				optionTurnoverDay.value.series.push(optionNi);
			});
		}
	
	

	const optionTurnoverYear = ref({
	    title: {
			text: '年流水分析',
			left: 'center',
	    },
	    tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
	    },
	    legend: {
			orient: 'vertical',
			left: 'left',
			data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines'],
	    },
	    grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true,
	    },
	    xAxis: {
			type: 'category',
			data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines'],
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
	const optionTurnoverMonth = ref({
	    title: {
			text: '月流水分析',
			left: 'center',
	    },
	    tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
	    },
	    legend: {
			orient: 'vertical',
			left: 'left',
			data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines'],
	    },
	    grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true,
	    },
	    xAxis: {
			type: 'category',
			data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines'],
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
	
	const optionTurnoverDay = ref({
	    title: {
			text: '日流水分析',
			left: 'center',
	    },
	    tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
	    },
	    legend: {
			orient: 'vertical',
			left: 'left',
			data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines'],
	    },
	    grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true,
	    },
	    xAxis: {
			type: 'category',
			data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines'],
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
</script>


<style>
	.chart {
		width: 100%;
		height: 400px;
	}
</style>