import Vue from 'vue'
import App from './App.vue'
import router from './router'
//引入element
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import echarts from 'echarts'
import JsCommon from "@/untils/JsCommon"
import '@/assets/Css/common.less'
import pEChart from "@/untils/pEcharts"
Vue.prototype.$echarts = echarts;
Vue.use(ElementUI);
Vue.prototype.$Common = JsCommon;//引用公用js
Vue.use(pEChart);
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
