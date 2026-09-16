<script setup>
import { getCategoryFilterAPI, getSubCategoryAPI } from "@/apis/category";
import { onMounted,ref } from "vue";
import { useRoute } from "vue-router"
import GoodsItem from "../Home/Components/GoodsItem.vue";

const categoryData=ref({})
const route=useRoute()
onMounted(async () => {
  const id = route.params.id
  const res = await getCategoryFilterAPI(id)
  categoryData.value = res.data.result
})

//获取基础列表数据
const goodList=ref([])
const sortField=ref('publishTime')
onMounted(async () => {
  const id = route.params.id
  const res = await getSubCategoryAPI({ categoryId: id, page: 1, pageSize: 20,sortField: sortField.value })
  goodList.value = res.result.items
})
//切换排序字段
const handleTabChange=()=>{
  console.log('切换排序字段',sortField.value)
  async () => {
    const id = route.params.id
    const res = await getSubCategoryAPI({ categoryId: id, page: 1, pageSize: 20,sortField: sortField.value })
    goodList.value = res.result.items
    console.log('切换排序字段',res)
  }
}
// 分页加载更多数据
const loadMore = ref(false)
const load = async () => {
  if (loadMore.value) return
  loadMore.value = true
  const id = route.params.id
  const res = await getSubCategoryAPI({ categoryId: id, page: goodList.value.length + 1, pageSize: 20,sortField: sortField.value })
  goodList.value = [...goodList.value, ...res.result.items]
  loadMore.value = false
}
</script>

<template>
  <div class="container ">
    <!-- 面包屑 -->
    <div class="bread-container">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/category/${categoryData.parentId}`}">{{ categoryData.parentName }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ categoryData.name }}</el-breadcrumb-item>
    </el-breadcrumb>
    </div>
    <div class="sub-container" @tab-change="handleTabChange">
      <el-tabs v-model="sortField">
        <el-tab-pane label="最新商品" name="publishTime"></el-tab-pane>
        <el-tab-pane label="最高人气" name="orderNum"></el-tab-pane>
        <el-tab-pane label="评论最多" name="evaluateNum"></el-tab-pane>
      </el-tabs>
      <div class="body" v-infinite-scroll="load">
         <!-- 商品列表-->
          <GoodsItem v-for="item in goodList" :key="item.id" :good="item" />
      </div>
    </div>
  </div>

</template>



<style lang="scss" scoped>
.bread-container {
  padding: 25px 0;
  color: #666;
}

.sub-container {
  padding: 20px 10px;
  background-color: #fff;

  .body {
    display: flex;
    flex-wrap: wrap;
    padding: 0 10px;
  }

  .goods-item {
    display: block;
    width: 220px;
    margin-right: 20px;
    padding: 20px 30px;
    text-align: center;

    img {
      width: 160px;
      height: 160px;
    }

    p {
      padding-top: 10px;
    }

    .name {
      font-size: 16px;
    }

    .desc {
      color: #999;
      height: 29px;
    }

    .price {
      color: $priceColor;
      font-size: 20px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }


}
</style>