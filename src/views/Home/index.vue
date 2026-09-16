<script setup >
import HomeProduct from './components/HomeProduct.vue'
import HomeCategory from './components/HomeCategory.vue'
import HomeBanner from './components/HomeBanner.vue';
import HomeHot from './components/HomeHot.vue';
import HomeLike from './components/HomeLike.vue';
import HomeNew from './components/HomeNew.vue';
</script>

<template>
  <div class="container">
    <HomeCategory />
    <HomeBanner />
  </div>
    <HomeLike />
    <HomeHot />  
    <HomeNew />  
    <HomeProduct />
</template>
