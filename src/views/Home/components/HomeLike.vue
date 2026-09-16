<script setup>
import HomeHot from "./HomeHot.vue";
import { getRecommendAPI } from "@/apis/recommend";

// 走本地后端 /api/recommend（类目关联 + 热门兜底）
// 后端参数名为 topK（非 limit）
const fetchLike = () => getRecommendAPI({ topK: 4 });
</script>

<template>
  <HomeHot
    title="猜你喜欢"
    subTitle="根据您的喜好为您推荐"
    :apiFunc="fetchLike"
  />
</template>
