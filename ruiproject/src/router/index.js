import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/login'

Vue.use(Router)
const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  }
]
export default new Router({
  routes
})
