import request from '@/utils/http'

export const getDetail = (id) => {
  return request({
    url: '/goods',
    method: 'GET',
    params: {
      id
    }
  })
}

export const getHotGoodsAPI = ({ id, type, limit = 3}) => {
  return request({
    url: '/goods/hot',
    method: 'GET',
    params: {
      id,
      type,
      limit
    }
  })
}