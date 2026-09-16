<script setup>
import { getDetail } from "@/apis/detail";
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import DetailHot from "./components/DetailHot.vue";
import { useCartStore } from "@/stores/cartStore.js";
import { useUserStore } from "@/stores/user.js";
import { addFavorAPI, delFavorAPI, getFavorListAPI } from "@/apis/favor.js";
import { ElMessage } from "element-plus";
// import imageView from '@/components/ImageView/index.vue'
// import XtxSku from '@/components/XtxSku/index.vue'

const goods = ref({});
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const isLogin = computed(() => !!userStore.userInfo.token);

// 当前 sku：用户选完规格后用 skuObj.skuId；未选则用默认（首个）sku 的 id
const currentSkuId = computed(() => {
  if (skuObj.skuId) return skuObj.skuId;
  const skus = goods.value.skus || [];
  // 选首个有库存的 sku 作为默认
  const def = skus.find((s) => s.inventory > 0) || skus[0];
  return def?.id;
});

// 点赞 / 收藏状态
const isLiked = ref(false);
const isCollected = ref(false);

// 拉取用户对本商品的状态：先查 like 列表，再查 collect 列表
const loadFavorStatus = async () => {
  if (!isLogin.value) return;
  try {
    const [likeRes, collectRes] = await Promise.all([
      getFavorListAPI({ action: "like" }),
      getFavorListAPI({ action: "collect" }),
    ]);
    const skuId = currentSkuId.value;
    const likeList = likeRes?.result || [];
    const collectList = collectRes?.result || [];
    // 后端列表项可能是 { skuid } 或 { sku_id } 或直接数字 id；做兼容
    const getSkuId = (item) =>
      item.skuid || item.sku_id || item.skuId || item.id;
    isLiked.value = likeList.some(
      (it) => String(getSkuId(it)) === String(skuId),
    );
    isCollected.value = collectList.some(
      (it) => String(getSkuId(it)) === String(skuId),
    );
  } catch (e) {
    // 查询失败不阻塞详情页渲染
    console.warn("加载点赞收藏状态失败", e);
  }
};

onMounted(async () => {
  const res = await getDetail(route.params.id);
  goods.value = res.result;
  loadFavorStatus();
});

// 商品sku规格选择变化
let skuObj = {};
const changeSku = (sku) => {
  console.log("选择的sku", sku);
  skuObj = sku;
  // 切换规格后刷新状态
  loadFavorStatus();
};

// 商品数量变化
const count = ref(1);
const countChange = (val) => {
  count.value = val;
};

// 加入购物车
const addCart = () => {
  console.log("加入购物车", skuObj, count.value);
  // XtxSku 组件 emit 的字段是 skuId，不是 id
  if (!skuObj.skuId) {
    ElMessage.warning("请选择商品规格");
    return;
  }
  const cartStore = useCartStore();
  cartStore.addCart({
    id: goods.value.id,
    name: goods.value.name,
    picture: goods.value.mainPictures[0],
    price: goods.value.price,
    count: count.value,
    skuId: skuObj.skuId,
    attrsText: skuObj.specsText,
    selected: true,
  });
  ElMessage.success("加入购物车成功");
};

// 切换点赞 / 收藏
const toggleFavor = async (action) => {
  if (!isLogin.value) {
    ElMessage.warning("请先登录");
    router.push("/login");
    return;
  }
  const skuId = currentSkuId.value;
  if (!skuId) {
    ElMessage.warning("暂无可操作的 SKU");
    return;
  }
  const liked = action === "like" ? isLiked : isCollected;
  try {
    if (liked.value) {
      await delFavorAPI({ skuId, action });
      liked.value = false;
      ElMessage.success(action === "like" ? "已取消点赞" : "已取消收藏");
    } else {
      await addFavorAPI({ skuId, action });
      liked.value = true;
      ElMessage.success(action === "like" ? "点赞成功" : "收藏成功");
    }
  } catch (e) {
    // 错误提示已由 http-local 拦截器统一处理
  }
};
</script>

<template>
  <div class="xtx-goods-page">
    <div class="container" v-if="goods.details">
      <div class="bread-container">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item
            :to="{ path: `/category/${goods.categories?.[1]?.id}` }"
          >
            {{ goods.categories?.[1]?.name }}
          </el-breadcrumb-item>
          <el-breadcrumb-item
            :to="{ path: `/category/sub/${goods.categories?.[0]?.id}` }"
          >
            {{ goods.categories?.[0]?.name }}
          </el-breadcrumb-item>

          <el-breadcrumb-item>{{ goods.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- 商品信息 -->
      <div class="info-container">
        <div>
          <div class="goods-info">
            <div class="media">
              <!-- 图片预览区 -->
              <XtxImageView :imageList="goods.mainPictures" />
              <!-- 统计数量 -->
              <ul class="goods-sales">
                <li>
                  <p>销量人气</p>
                  <p>{{ goods.salesCount || 0 }}+</p>
                  <p>
                    <i class="iconfont icon-task-filling"></i>
                    销量人气
                  </p>
                </li>
                <li>
                  <p>商品评价</p>
                  <p>{{ goods.commentCount || 0 }}+</p>
                  <p>
                    <i class="iconfont icon-comment-filling"></i>
                    查看评价
                  </p>
                </li>
                <li>
                  <p>收藏人气</p>
                  <p>{{ goods.collectCount || 0 }}+</p>
                  <p>
                    <i class="iconfont icon-favorite-filling"></i>
                    收藏商品
                  </p>
                </li>
                <li>
                  <p>品牌信息</p>
                  <!-- 部分商品（如首页小奶锅）接口返回 brand 为 null，直接取 name 会导致整个组件渲染失败 -->
                  <p>{{ goods.brand?.name || "暂无" }}</p>
                  <p>
                    <i class="iconfont icon-dynamic-filling"></i>
                    品牌主页
                  </p>
                </li>
              </ul>
            </div>
            <div class="spec">
              <!-- 商品信息区 -->
              <p class="g-name">{{ goods.name }}</p>
              <p class="g-desc">{{ goods.desc }}</p>
              <p class="g-price">
                <span>{{ goods.price }}</span>
                <span v-show="goods.price < goods.oldPrice">{{
                  goods.oldPrice
                }}</span>
              </p>
              <div class="g-service">
                <dl>
                  <dt>促销</dt>
                  <dd>12月好物放送，App领券购买直降120元</dd>
                </dl>
                <dl>
                  <dt>服务</dt>
                  <dd>
                    <span>无忧退货</span>
                    <span>快速退款</span>
                    <span>免费包邮</span>
                    <a href="javascript:;">了解详情</a>
                  </dd>
                </dl>
              </div>
              <!-- sku组件 -->
              <XtxSku :goods="goods" @change="changeSku" />
              <!-- 数据组件 -->
              <el-input-number v-model="count" :min="1" @change="countChange" />
              <!-- 按钮组件 -->
              <div class="action-btns">
                <el-button size="large" class="btn" @click="addCart"
                  >加入购物车</el-button
                >
                <el-button
                  size="large"
                  :type="isLiked ? 'danger' : 'default'"
                  class="btn favor-btn"
                  @click="toggleFavor('like')"
                >
                  <i class="iconfont icon-task-filling" />
                  {{ isLiked ? "已点赞" : "点赞" }}
                </el-button>
                <el-button
                  size="large"
                  :type="isCollected ? 'warning' : 'default'"
                  class="btn favor-btn"
                  @click="toggleFavor('collect')"
                >
                  <i class="iconfont icon-favorite-filling" />
                  {{ isCollected ? "已收藏" : "收藏" }}
                </el-button>
              </div>
            </div>
          </div>
          <div class="goods-footer">
            <div class="goods-article">
              <!-- 商品详情 -->
              <div class="goods-tabs">
                <nav>
                  <a>商品详情</a>
                </nav>
                <div class="goods-detail">
                  <!-- 属性 -->
                  <ul class="attrs">
                    <li
                      v-for="item in goods.details.properties"
                      :key="item.value"
                    >
                      <span class="dt">{{ item.name }}</span>
                      <span class="dd">{{ item.value }}</span>
                    </li>
                  </ul>
                  <!-- 图片 -->
                  <img
                    v-for="img in goods.details.pictures"
                    :src="img"
                    :key="img"
                    :alt="img"
                  />
                </div>
              </div>
            </div>
            <!-- 24热榜+专题推荐 -->
            <div class="goods-aside">
              <!--  24小时  -->
              <DetailHot :hotType="1" />
              <!--  周榜  -->
              <DetailHot :hotType="2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.xtx-goods-page {
  .goods-info {
    min-height: 600px;
    background: #fff;
    display: flex;

    .media {
      width: 580px;
      height: 600px;
      padding: 30px 50px;
    }

    .spec {
      flex: 1;
      padding: 30px 30px 30px 0;
    }
  }

  .goods-footer {
    display: flex;
    margin-top: 20px;

    .goods-article {
      width: 940px;
      margin-right: 20px;
    }

    .goods-aside {
      width: 280px;
      min-height: 1000px;
    }
  }

  .goods-tabs {
    min-height: 600px;
    background: #fff;
  }

  .goods-warn {
    min-height: 600px;
    background: #fff;
    margin-top: 20px;
  }

  .number-box {
    display: flex;
    align-items: center;

    .label {
      width: 60px;
      color: #999;
      padding-left: 10px;
    }
  }

  .g-name {
    font-size: 22px;
  }

  .g-desc {
    color: #999;
    margin-top: 10px;
  }

  .g-price {
    margin-top: 10px;

    span {
      &::before {
        content: "¥";
        font-size: 14px;
      }

      &:first-child {
        color: $priceColor;
        margin-right: 10px;
        font-size: 22px;
      }

      &:last-child {
        color: #999;
        text-decoration: line-through;
        font-size: 16px;
      }
    }
  }

  .g-service {
    background: #f5f5f5;
    width: 500px;
    padding: 20px 10px 0 10px;
    margin-top: 10px;

    dl {
      padding-bottom: 20px;
      display: flex;
      align-items: center;

      dt {
        width: 50px;
        color: #999;
      }

      dd {
        color: #666;

        &:last-child {
          span {
            margin-right: 10px;

            &::before {
              content: "•";
              color: $xtxColor;
              margin-right: 2px;
            }
          }

          a {
            color: $xtxColor;
          }
        }
      }
    }
  }

  .goods-sales {
    display: flex;
    width: 400px;
    align-items: center;
    text-align: center;
    height: 140px;

    li {
      flex: 1;
      position: relative;

      ~ li::after {
        position: absolute;
        top: 10px;
        left: 0;
        height: 60px;
        border-left: 1px solid #e4e4e4;
        content: "";
      }

      p {
        &:first-child {
          color: #999;
        }

        &:nth-child(2) {
          color: $priceColor;
          margin-top: 10px;
        }

        &:last-child {
          color: #666;
          margin-top: 10px;

          i {
            color: $xtxColor;
            font-size: 14px;
            margin-right: 2px;
          }

          &:hover {
            color: $xtxColor;
            cursor: pointer;
          }
        }
      }
    }
  }
}

.goods-tabs {
  min-height: 600px;
  background: #fff;

  nav {
    height: 70px;
    line-height: 70px;
    display: flex;
    border-bottom: 1px solid #f5f5f5;

    a {
      padding: 0 40px;
      font-size: 18px;
      position: relative;

      > span {
        color: $priceColor;
        font-size: 16px;
        margin-left: 10px;
      }
    }
  }
}

.goods-detail {
  padding: 40px;

  .attrs {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 30px;

    li {
      display: flex;
      margin-bottom: 10px;
      width: 50%;

      .dt {
        width: 100px;
        color: #999;
      }

      .dd {
        flex: 1;
        color: #666;
      }
    }
  }

  > img {
    width: 100%;
  }
}

.btn {
  margin-top: 20px;
}

.action-btns {
  display: flex;
  gap: 10px;

  .btn {
    margin-top: 20px;
  }

  .favor-btn {
    :deep(i) {
      margin-right: 4px;
    }
  }
}

.bread-container {
  padding: 25px 0;
}
</style>
