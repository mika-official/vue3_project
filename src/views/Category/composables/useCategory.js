import { getCategoryAPI } from '@/apis/category'
import { ref, onMounted } from 'vue'
import {useRoute, onBeforeRouteUpdate} from 'vue-router'

export function useCategory(){
    //动态路由获取分类数据
    const categoryData = ref({})
    const route=useRoute()
    onMounted(async () => { 
        const res = await getCategoryAPI(route.params.id)
        categoryData.value = res.result
        console.log('获取分类数据',categoryData.value)
    })

    //监听路由变化获取分类数据
    onBeforeRouteUpdate(async (to) => {
        const res = await getCategoryAPI(to.params.id)
        categoryData.value = res.result
        console.log('获取分类数据1',categoryData.value)
    })
    return {
        categoryData
    }
}