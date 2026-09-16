<script setup>
import { onMounted, ref } from "vue";
import HomePanel from "./HomePanel.vue";
import { getNewAPI } from "@/apis/home";

const props = defineProps({
  title: {
    type: String,
    default: "热门商品",
  },
  subTitle: {
    type: String,
    default: "大牌折扣 不容错过",
  },
  apiFunc: {
    type: Function,
    default: null,
  },
});

const store = ref(null);
onMounted(async () => {
  const fetcher = props.apiFunc || getNewAPI;
  const res = await fetcher();
  store.value = res.result;
});
</script>

<template>
  <HomePanel :title="title" :subTitle="subTitle">
    <ul class="goods-list">
      <li v-for="item in store" :key="item.id">
        <RouterLink :to="`/detail/${item.id}`">
          <img v-img-lazy="item.picture" alt="" />
          <p class="name">{{ item.name }}</p>
          <p class="price">&yen;{{ item.price }}</p>
        </RouterLink>
      </li>
    </ul>
  </HomePanel>
</template>

<style scoped lang="scss">
.goods-list {
  display: flex;
  justify-content: space-between;
  height: 406px;

  li {
    width: 306px;
    height: 406px;

    background: #f0f9f4;
    transition: all 0.5s;

    &:hover {
      transform: translate3d(0, -3px, 0);
      box-shadow: 0 3px 8px rgb(0 0 0 / 20%);
    }

    img {
      width: 306px;
      height: 306px;
    }

    p {
      font-size: 22px;
      padding-top: 12px;
      text-align: center;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .price {
      color: $priceColor;
    }
  }
}
</style>
