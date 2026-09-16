import httpLocal from '@/utils/http-local'

// 点赞/收藏（body: { skuId, action: 'like' | 'collect' }）
export const addFavorAPI = (data) => {
  return httpLocal({
    url: '/favor',
    method: 'POST',
    data
  })
}

// 取消点赞/收藏
export const delFavorAPI = (data) => {
  return httpLocal({
    url: '/favor',
    method: 'DELETE',
    data
  })
}

// 我的点赞/收藏列表（query: action 可选）
export const getFavorListAPI = (params = {}) => {
  return httpLocal({
    url: '/favor',
    method: 'GET',
    params
  })
}
