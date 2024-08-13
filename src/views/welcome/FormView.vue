<template>
	<div class="soto">
		<div class="sotu-back">
			<el-image style="width: 100%; height: 100%; border-radius: 20px 0 0 20px;" fit="cover"  
				src="https://t.tutu.to/img/mo8Nw"></el-image>
		</div>
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
</script>

<style scoped>
	.soto {
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
	}
	
	.sotu-back {
		width: 100%;
		height: 100%;
		flex: 1;
	}
	
	.right-card {
		width: 400px;
		height: 100%;
		z-index: 1;
		border-radius: 20px 0 0 20px;
	}
	
	.welcome-title {
		position: absolute;
		bottom: 30px;
		padding-left: 30px;
		padding-right: 430px;
		background-color: #ffffffAA;
		text-shadow: 0 0 10px #ffffff;
	}
</style>