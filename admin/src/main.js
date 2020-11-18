import Vue from 'vue'
import App from './App.vue'
import router from './router'
//引入element
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import echarts from 'echarts'
import '@/assets/Css/common.less'
import axios from 'axios'
import  qs from 'qs'
import pEChart from "@/assets/js/pEcharts.js"
Vue.prototype.$qs = qs
Vue.prototype.$axios = axios
Vue.prototype.$echarts = echarts;
Vue.use(ElementUI)
Vue.use(pEChart)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
