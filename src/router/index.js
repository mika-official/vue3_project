import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login/index.vue'
import Layout from '@/views/Layout/index.vue'
import Home from '@/views/Home/index.vue'
import Category from '@/views/Category/index.vue'
import subcategory from '@/views/SubCategory/index.vue'
import Detail from '@/views/Detail/index.vue'
import CartList from '@/views/CartList/index.vue'
import Checkout from '@/views/Checkout/index.vue'
import Pay from '@/views/Pay/index.vue'
import PayBack from '@/views/Pay/PayBack.vue'
import Member from '@/views/Member/index.vue'
import UserInfo from '@/views/Member/components/UserInfo.vue'
import UserOrder from '@/views/Member/components/UserOrder.vue'

// 商家后台
import MerchantLayout from '@/views/Merchant/Layout/index.vue'
import MerchantLogin from '@/views/Merchant/Login/index.vue'
import MerchantDashboard from '@/views/Merchant/Dashboard/index.vue'
import MerchantProducts from '@/views/Merchant/Product/List.vue'
import MerchantOrders from '@/views/Merchant/Order/List.vue'
import { useMerchantStore } from '@/stores/merchantStore'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: Login
    },
    // 商家后台
    {
      path: '/merchant/login',
      component: MerchantLogin
    },
    {
      path: '/merchant',
      component: MerchantLayout,
      children: [
        { path: 'dashboard', component: MerchantDashboard },
        { path: 'products', component: MerchantProducts },
        { path: 'orders', component: MerchantOrders }
      ]
    },
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '/',
          component: Home
        },
        {
          path: '/category/:id',
          component: Category
        },
        {
          path: '/category/sub/:id',
          component: subcategory
        },
        {
          path: '/detail/:id',
          component: Detail
        },
        {
          path: 'cartlist',
          component: CartList
        },
        {
          path: 'checkout',
          component: Checkout
        },
        {
          path: 'pay',
          component: Pay
        },
        {
          path: 'paycallback',
          component: PayBack
        },
        {
          path: 'member',
          component: Member,
          children: [
            {
              path: 'user',
              component: UserInfo
            },
            {
              path: 'order',
              component: UserOrder
            }
        ]
        }
      ]
    }
  ],
  // 滚动行为，每次切换路由时，滚动到顶部
  scrollBehavior() {
    return {
      top: 0
    }
  }
})

// 商家后台登录守卫
router.beforeEach((to, from, next) => {
  if (to.path.startsWith('/merchant') && to.path !== '/merchant/login') {
    const merchantStore = useMerchantStore()
    if (!merchantStore.token) {
      next('/merchant/login')
      return
    }
  }
  next()
})

export default router
