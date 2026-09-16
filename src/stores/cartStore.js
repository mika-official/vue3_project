import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user.js'
import { insertCartAPI, findNewCartListAPI, delCartAPI } from '@/apis/cart'

// 定义购物车 store
export const useCartStore = defineStore('cart', () => {
  // 购物车商品列表
  const cartList = ref([])
  const isLogin = computed(
    () => useUserStore().userInfo.token
  )
  // 本地购物车列表字段映射：后端返回 productName/imageUrl/cartId，前端页面用 name/picture/id
  const mapCartItem = (item) => ({
    id: item.cartId,
    productId: item.productId, // SPU id，购物车商品跳详情页用
    skuId: item.skuId,
    selected: item.selected,
    count: item.count,
    name: item.productName,
    picture: item.imageUrl,
    attrsText: item.attrsText,
    price: Number(item.nowPrice ?? 0),
    nowPrice: item.nowPrice,
    nowOriginalPrice: item.nowOriginalPrice,
    stock: item.stock,
    isEffective: item.isEffective,
    postFee: item.postFee,
    discount: item.discount
  })
  // 获取最新购物车列表（登录后合并、下单后刷新都用它）
  const updateNewList = async () => {
    const res = await findNewCartListAPI()
    cartList.value = (res.result || []).map(mapCartItem)
  }
  const updateCartList = updateNewList
  // 添加商品到购物车
  const addCart = async (goods) => {
    const { skuId, count } = goods
    if (isLogin.value) {
      await insertCartAPI({ skuId, count }) // 调用加入购物车接口
      await updateNewList() // 获取最新购物车列表
    } else {
      //未登录，本地存储购物车
      cartList.value.find(item => item.skuId === goods.skuId)
      ? cartList.value.forEach(item => {
        // 如果购物车已存在该商品，则数量累加
          if (item.skuId === goods.skuId) {
            item.count += goods.count
          }
        })
        // 否则添加新商品到购物车
      : cartList.value.push(goods)
    }
  }
  //删除购物车商品
  const delCart = async (skuId) => {
    if (isLogin.value) {
      await delCartAPI([skuId]) // 调用删除购物车接口
      await updateNewList() // 获取最新购物车列表
    } else {
      cartList.value = cartList.value.filter(item => item.skuId !== skuId)
    }
  }
  // 计算购物车商品总数量和总价格
  const allCount = computed(() => {
    return cartList.value.reduce((total, item) => total + item.count, 0)
  })
  const allPrice = computed(() => {
    return cartList.value.reduce((total, item) => total + item.price * item.count, 0)
  }) 
  //单选功能
  const singCheckChange = (skuId, selected) => {
    const item = cartList.value.find(item => item.skuId === skuId)
    if (item) {
      item.selected = selected
    }
  }
  //全选功能
  const isAll = computed(() => {
    return cartList.value.every(item => item.selected)
  })
  const allCheck = (selected) => {
    cartList.value.forEach(item => {
      item.selected = selected
    })
  }
  //已选择商品数量和总价
  const selectedCount = computed(() => {
    return cartList.value.reduce((total, item) => item.selected ? total + item.count : total, 0)
  })
  const selectedPrice = computed(() => {
    return cartList.value.reduce((total, item) => item.selected ? total + item.price * item.count : total, 0)
  })

  //清空购物车
  const clearCart = () => {
    cartList.value = []
  }
  return { cartList, addCart, delCart, allCount, allPrice, singCheckChange, allCheck, isAll, selectedCount, selectedPrice, clearCart, updateNewList, updateCartList }
},
  {
    persist: true
  })
