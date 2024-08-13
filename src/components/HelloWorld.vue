<template>
	<div>
		<h2 class="">{{ store.helloPinia }}</h2>
		
		<el-button type="primary" @click="cs">set</el-button>
		<el-input></el-input>
	</div>
</template>

<script setup lang="ts">
	import { useMeanStore } from "@/store";
	import { get } from '@/net'
	import router from "../router";
	const store = useMeanStore();
	const cs = (mieriki) => {
		store.setPiniaLabel('Hello Mieriki!')
	}
</script>


<style scoped>

</style>