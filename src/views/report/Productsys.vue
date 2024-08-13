<template>
	<el-card>
		<v-chart class="chart" :option="optionRole" autoresize />
	</el-card>
</template>

<script setup>
	import { use } from 'echarts/core';
	import { CanvasRenderer } from 'echarts/renderers';
	import { PieChart, BarChart } from 'echarts/charts';
	import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
	import VChart, { THEME_KEY } from 'vue-echarts';
	import { ref, onMounted, provide } from 'vue';
	import { get } from '@/net';

	use([CanvasRenderer, PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

	provide(THEME_KEY, 'vintage');

	const optionRole = ref({
		title: {
			text: '热销商品',
			left: 'center',
		},
		tooltip: {
			trigger: 'item',
			formatter: '{a} <br/>{b} : {c} ({d}%)',
		},
		legend: {
			orient: 'vertical',
			left: 'left',
			data: [],
		},
		series: [{
			name: '公司人员构成',
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
		}],
	});

	const optionBill = ref({
		title: {
			text: '供应商订单分析',
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
		series: [{
			name: '订单数',
			type: 'bar',
			data: [335, 310, 234, 135, 1548],
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: 'rgba(0, 0, 0, 0.5)',
				},
			},
			itemStyle: {
				color: '#bc3922',
				barBorderRadius: [5, 5, 0, 0],
			},
		}]
	});

	onMounted(() => {
		initializePage();
	});

	function initializePage() {
		get(`/goods/get/card`, (data) => {
			optionRole.value.legend.data = data.map(item => item.name);
			optionRole.value.series[0].data = data.map(item => ({
				name: item.name,
				value: item.inventoryQuantity
			}));
		});
	}
</script>

<style>
	.chart {
		width: 100%;
		height: 75vh;
	}
</style>
