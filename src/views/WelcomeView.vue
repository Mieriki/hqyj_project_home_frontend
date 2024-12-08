<template>
	<div class="soto">
		<div class="sotu-back" style="overflow: hidden; width: 100vw; height: 100vh;"></div>
		<div id="sakana-widget-chisato" class="sakana" style="bottom: 10%; right: 10vw; transform: translate(-50%, -50%);"></div>
		<div id="sakana-widget-takina" class="sakana"  style="bottom: 10%; left: 10vw; transform: translate(-50%, -50%);"></div>
		<div class="right-card">
			<router-view v-slot="{ Component }">
			    <transition name="el-fade-in-linear" mode="out-in">
			        <component :is="Component" style="height: 100%"/>
			    </transition>
			</router-view>
		</div>
	</div>
</template>

<script setup lang="ts">
import 'sakana-widget/lib/index.css';
import { onMounted } from 'vue';
import SakanaWidget from 'sakana-widget';

onMounted(() => {
const widget = new SakanaWidget({
    size: 200, // 设置小部件的尺寸为 20px × 20px
    autoFit: true, // 启用自动适应大小，小部件将根据容器自动缩放
    character: 'takina', // 使用角色 'chisato' takina
    controls: false, // 显示控制栏
    rod: true, // 显示弹簧杆
    draggable: true, // 可拖动小部件
    stroke: {
      color: '#b4b4b4', // 设置描边颜色为灰色
      width: 10 // 设置描边宽度为 10px
    },
    threshold: 0.1, // 运动停止阈值
    rotate: 0, // 初始旋转角度为 0 度
    title: true // 禁用标题
  });

  widget.mount('#sakana-widget-chisato');
});

onMounted(() => {
const widget = new SakanaWidget({
    size: 200, // 设置小部件的尺寸为 20px × 20px
    autoFit: true, // 启用自动适应大小，小部件将根据容器自动缩放
    character: 'chisato', // 使用角色 'chisato' takina
    controls: false, // 显示控制栏
    rod: true, // 显示弹簧杆
    draggable: true, // 可拖动小部件
    stroke: {
      color: '#b4b4b4', // 设置描边颜色为灰色
      width: 10 // 设置描边宽度为 10px
    },
    threshold: 0.1, // 运动停止阈值
    rotate: 0, // 初始旋转角度为 0 度
    title: true // 禁用标题
  });

  widget.mount('#sakana-widget-takina');
});
</script>

<style scoped>
	.soto {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		display: flex;
		justify-content: center; /* 水平居中 */
		align-items: center; /* 垂直居中 */
		position: relative; /* 确保子元素可以使用绝对定位 */
		
		
	}
	
	.sotu-back {
		flex: 1;
		background-color: #000000;
		position: absolute;
		/* global 94%+ browsers support */
		background: linear-gradient(90deg,#FFD6FF 0%,#01D1FF 100%); 
		
		/* safari 5.1+,chrome 10+ */
		background: -webkit-linear-gradient(90deg,#FFD6FF 0%,#01D1FF 100%);
		
		/* ff 3.6+ */
		background: -moz-linear-gradient(90deg,#FFD6FF 0%,#01D1FF 100%);
		
		/* opera 11.10+ */ 
		background: -o-linear-gradient(90deg,#FFD6FF 0%,#01D1FF 100%);
		
		/* ie 10+ */
		background: -ms-linear-gradient(90deg,#FFD6FF 0%,#01D1FF 100%);
	}
	
	.right-card {
		width: 60vw;
		height: 500px;
		z-index: 1;
		background-color: var(--el-bg-color);
		border-radius: 20px;
	}
	
	.sakana {
		width: 50px; 
		height: 50px;
		z-index: 2;
		float: left;
		position: absolute;
	}
	
</style>