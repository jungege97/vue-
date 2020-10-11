<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert show-icon title="注意：只允许为三级分类设置相关参数" type="warning" :closable="false"></el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectedCateKeys" :options="CatList" :props="{ expandTrigger: 'hover', label: 'cat_name', value:'cat_id', children:'children' }"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTbaleData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <!-- 动态添加的tag -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput"
                  size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ 新参数</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" align="center"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="delParamsDialog(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <!-- 动态添加的tag -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput"
                  size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ 新参数</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" align="center"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="delParamsDialog(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加 -->
    <el-dialog
      :title="'添加'+titleText" :visible.sync="addDialogVisible" width="50%"
      @close="addDialogClose" :show-close="false">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改 -->
    <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible" width="50%"
      @close="editDialogClose" :show-close="false">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      CatList: [],
      selectedCateKeys: [],
      activeName: 'many',
      manyTbaleData: [],
      onlyTableData: [],
      addDialogVisible: false,
      addForm: {},
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    getCateList() {
      this.$http.get('categories').then((res) => {
        if(res.data.meta.status !== 200) return this.$message.error('获取商品分类失败！')
        this.$message.success('获取商品分类列表成功！')
        this.CatList = res.data.data
      }).catch((err) => err)
    },
    getParamsData() {
      this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } }).then((res) => {
        if(res.data.meta.status !== 200) {
          return this.$message.error('获取列表失败或请留意有无选择商品分类！')
        }
        res.data.data.forEach(item => {
          // 判断一下不等于空才分割
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 添加独立属性
          item.inputValue = ''
          item.inputVisible = false
        })
        if(this.activeName === 'many') {
          this.manyTbaleData = res.data.data
        } else {
          this.onlyTableData = res.data.data
        }
      }).catch((err) => console.log(err))
    },
    handleChange() {
      if(this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTbaleData = []
        this.onlyTableData = []
        this.$message.error('注意：只允许为三级分类设置相关参数哦！')
      } else {
        this.getParamsData()
      }
    },
    handleTabClick() {
      this.getParamsData()
    },
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    addParams() {
      this.$refs.addFormRef.validate(valid => {
        if(!valid) return
        this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        }).then((res) => {
          console.log(res)
          if(res.data.meta.status !== 201) return this.$message.error('添加失败！')
          this.$message.success('添加成功！')
          this.getParamsData()
          this.addDialogVisible = false
        }).catch((err) => console.log(err))
      })
    },
    showEditDialog(attrId) {
      this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: { attr_sel: this.activeName }
      }).then((res) => {
        if(res.data.meta.status !== 200) return this.$message.error('获取信息失败！')
        this.editForm = res.data.data
      }).catch((err) => console.log(err))
      this.editDialogVisible = true
    },
    editParams() {
      this.$refs.editFormRef.validate(valid => {
        if(!valid) return
        this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        }).then((res) => {
          if(res.data.meta.status !== 200) return this.$message.error('编辑失败！')
          this.$message.success('编辑成功！')
          this.getParamsData()
          this.editDialogVisible = false
        }).catch((err) => console.log(err))
      })
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    delParamsDialog(attrId) {
      this.$confirm('此操作将永久删除该参数，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`).then((res) => {
          if(res.data.meta.status !== 200) return this.$message.error('删除失败参数！')
          this.$message.success('删除参数成功！')
          this.getParamsData()
        }).catch((err) => console.log(err))
      }).catch(() => this.$message.info('已取消删除操作'))
    },
    showInput(row) {
      row.inputVisible = true
      // $nextTick方法的作用，就是当页面上的元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // saveAttrVals将对attr_vals的操作，保存到数据库
    saveAttrVals(row) {
      this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      }).then((res) => {
        if(res.data.meta.status !== 200) return this.$message.error('修改参数失败！')
        this.$message.success('修改参数成功！')
      }).catch((err) => console.log(err))
    },
    handleInputConfirm(row) {
      if(row.inputValue.trim().length > 0) {
        row.attr_vals.push(row.inputValue.trim())
        this.saveAttrVals(row)
      }
      row.inputValue = ''
      row.inputVisible = false
    },
    handleClose(i, row) {
      this.$confirm('此操作将永久删除该参数，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.attr_vals.splice(i, 1)
        this.saveAttrVals(row)
      }).catch(() => this.$message.info('已取消删除操作！'))
    }
  },
  computed: {
    isBtnDisabled() {
      if(this.selectedCateKeys.length !== 3) return true
      return false
    },
    cateId() {
      if(this.selectedCateKeys.length === 3) return this.selectedCateKeys[2]
      return null
    },
    titleText() {
      if(this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt{
  margin: 15px 0;
}
.el-tag{
  margin-right:6px;
}
.input-new-tag{
  width: 150px;
}
</style>
