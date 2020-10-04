<template>
    <el-container class="home-container">
      <el-header>
        <div>
          <img src="../assets/logo.png" alt>
          <span>Vue后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button></el-header>
      <el-container>
        <el-aside :width="iscollapse ? '64px':'200px'">
          <div class="toggle-button" @click="togginCollapse">|||</div>
          <!-- 侧边栏菜单区 -->
          <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409eff"
            unique-opened :collapse="iscollapse"
            :collapse-transition="false" router
            :default-active="activePath">
            <!-- 一级菜单 -->
            <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
              <!-- 模板 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsList[item.id]"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children"
              :key="subItem.id" @click="saveNavState('/'+subItem.path)">
                <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
                <el-menu-item  :index="subItemchildren.id + ''"  v-for="subItemchildren in subItem.children" :key="subItemchildren.id">{{subItemchildren.authName}}</el-menu-item>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      iconsList: {
        125: 'iconfont icon-user1',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      iscollapse: false, // 是否折叠
      activePath: '' // 被激活的链接地址
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    getMenuList() {
      this.$http.get('menus').then((res) => {
        if(!res.data.meta.status === 200) return this.$message.error(res.data.meta.msg)
        this.menulist = res.data.data
      }).catch((err) => {
        console.log(err)
      })
    },
    // 点击按钮，切换菜单形态
    togginCollapse() {
      this.iscollapse = !this.iscollapse
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container{
  height: 100%;
}
.el-header{
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  color: #fff;
  font-size: 20px;
  >div{
    display: flex;
    align-items: center;
    span{
      margin-left: 15px;
    }
    img{
      width: 60px;
      height: 60px;
      border-radius: 50%;
    }
  }
}
.el-aside{
  background-color: #333744;
  .el-menu{
    border: none;
  }
}
.el-main{
  background-color: #eaedf1;
}
.iconfont{
  margin-right: 10px;
}
.toggle-button{
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: .2em;
  cursor: pointer;
}
</style>
