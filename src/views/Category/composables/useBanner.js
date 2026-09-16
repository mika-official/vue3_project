
import { getBannerAPI } from "@/apis/home"
import { ref, onMounted } from "vue"


export function useBanner(){
    const bannerList=ref([])
    onMounted(async () => {
        const res=await getBannerAPI({distributionSite:'2'})
        bannerList.value=res.result
        console.log(bannerList.value)
    })
    return {
        bannerList
  }
}