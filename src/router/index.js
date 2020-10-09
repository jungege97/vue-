import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: 'login'
  },
  {
    path: '/login',
    component: () => import('../components/Login')
  },
  {
    path: '/home',
    component: () => import('../components/Home'),
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: () => import('../components/Welcome') },
      { path: '/users', component: () => import('../components/user/Users') },
      { path: '/rights', component: () => import('../components/power/Rights') },
      { path: '/roles', component: () => import('../components/power/Roles') },
      { path: '/categories', component: () => import('../components/goods/Cate') }
    ]
  }
]

const router = new VueRouter({
  routes
})
// beforeEach 导航守卫
// to将要访问的路径
// from从哪个路径跳转而来
// next是一个函数，表示放行 next()放行 next('/login') 强制跳转
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
