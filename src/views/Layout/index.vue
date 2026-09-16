<script setup>
import LayoutNav from './Components/LayoutNav.vue'
import LayoutFooter from './Components/LayoutFooter.vue'
import LayoutHeader from './Components/LayoutHeader.vue'
import LayoutFixed from './Components/LayoutFixed.vue'
import { RouterView } from 'vue-router';
import { onMounted } from 'vue'
import { useCategoryStore } from '@/stores/category'

onMounted(() => {
  const categoryStore = useCategoryStore()
  categoryStore.getCategory()
})
</script>

<template>
    <LayoutFixed />
    <LayoutNav />
    <LayoutHeader /> 
    <RouterView :key="$route.fullPath" />
    <LayoutFooter />
</template>
