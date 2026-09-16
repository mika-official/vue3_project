// 图片懒加载指令插件
import { useIntersectionObserver } from '@vueuse/core'

export const imgLazy = {
  install(app) {
    // 图片懒加载指令
    app.directive('img-lazy', {
      mounted(el, binding) {
        const { stop } = useIntersectionObserver(
          el,
          ([{ isIntersecting }]) => {
            if (isIntersecting) {
              el.src = binding.value
              stop()
            }
          }
        )
      }
    })
  }
}
