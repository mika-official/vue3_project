import httpLocal from '@/utils/http-local'

// 加入购物车
export const insertCartAPI = ({ skuId, count }) => {
  return httpLocal({
    url: '/member/cart',
    method: 'POST',
    data: {
        skuId,
        count
    }
  })
}

// 获取购物车列表
export const findNewCartListAPI = () => {
  return httpLocal({
    url: '/member/cart',
    method: 'GET'
  })
}

// 删除购物车商品
export const delCartAPI = (ids) => {
  return httpLocal({
    url: `/member/cart`,
    method: 'DELETE',
    data: {
        ids
    }
  })
}

// 合并购物车（本地后端路径为 /merge）
export const mergeCartAPI = (data) => {
  return httpLocal({
    url: '/merge',
    method: 'POST',
    data
  })
}
