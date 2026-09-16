//通过插件方式进行全局组件注册

import imageView from './ImageView/index.vue'
import XtxSku from './XtxSku/index.vue'

export const componentPlugin = {
  install(app) {
    //注册组件
    app.component('XtxImageView', imageView)
    app.component('XtxSku', XtxSku)
  }
}
