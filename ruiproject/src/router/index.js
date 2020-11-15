import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/login/'
import Home from '@/views/Home/'
import Layout from '@/views/layout/'

Vue.use(Router)
const routes = [

  {
    path: '/',
    // name: '',//拥有默认子路由时不需要名字
    component: Layout,
    children: [
      {
        path: '',//path为空会作为默认子路由渲染 访问父路由时会默认访问子路由home
        name: 'home',
        component: Home
      },
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  }
]
export default new Router({
  routes
})
