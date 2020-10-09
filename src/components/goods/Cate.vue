<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table :data="catelist" :columns="columns" :selection-type="false"
      :expand-type="false" show-index index-text="#" border class="treeTable" :show-row-hover="false">
       <template slot="isok" slot-scope="scope">
         <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: #409EFF"></i>
         <i class="el-icon-error" v-else style="color: #F56C6C"></i>
       </template>
       <template slot="rank" slot-scope="scope">
         <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
         <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
         <el-tag type="warning" v-else>三级</el-tag>
       </template>
       <template slot="operate" slot-scope="scope">
         <el-button type="primary" size="mini" icon="el-icon-edit" @click="editCate(scope.row)">编辑</el-button>
         <el-button type="danger" size="mini" icon="el-icon-delete" @click="delCate(scope.row.cat_id)">删除</el-button>
       </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize" :total="total"
        layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </el-card>
    <!-- 添加分类 -->
    <el-dialog
      title="添加分类"
      :visible.sync="cateaddDialogVisible"
      width="50%" :show-close="false" @close="addFormclose">
      <el-form :model="addCateForm" :rules="addformRules" ref="addFormref" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options指定数据源 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children:'children' }"
            @change="parentCateChange" clearable change-on-select collapse-tags>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateaddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addform">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog
      title="提示" :visible.sync="editCateDialogVisible"
      width="50%" :show-close="false" @close="editFormclose">
      <el-form :model="editCateForm" :rules="editformRules" ref="editFormref" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      catelist: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否可用',
          // 表示当前这一列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称 在表格中用template 使用slot属性对应
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'rank'
        },
        {
          label: '操作',
          width: '200px',
          type: 'template',
          template: 'operate'
        }
      ],
      cateaddDialogVisible: false,
      addCateForm: {
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 分类等级默认为0表示添加1级分类
        cat_level: 0
      },
      addformRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      selectedKeys: [],
      editCateDialogVisible: false,
      editCateForm: {
        id: '',
        cat_name: ''
      },
      editformRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    getCateList() {
      this.$http.get('categories', { params: this.queryInfo }).then((res) => {
        if(res.data.meta.status !== 200) return this.$message.error('获取商品列表分类失败！')
        this.total = res.data.data.total
        this.catelist = res.data.data.result
      }).catch((err) => err)
    },
    // 监听pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    getParentCateList() {
      this.$http.get('categories', { params: { type: 2 } }).then((res) => {
        if(res.data.meta.status !== 200) return this.$message.error('获取父级分类失败！')
        this.parentCateList = res.data.data
        console.log(this.parentCateList)
      }).catch((err) => err)
    },
    addCateDialog() {
      this.getParentCateList()
      this.cateaddDialogVisible = true
    },
    parentCateChange() {
      if(this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addform() {
      console.log(this.addCateForm)
      this.$refs.addFormref.validate(valid => {
        if(!valid) return
        this.$http.post('categories', this.addCateForm).then((res) => {
          if(res.data.meta.status !== 201) return this.$message.error('添加分类失败！')
          this.$message.success('添加分类成功！')
          this.getCateList()
        }).catch((err) => err)
        this.cateaddDialogVisible = false
      })
    },
    addFormclose() {
      this.$refs.addFormref.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    editCate(row) {
      const edit = {
        id: row.cat_id,
        cat_name: row.cat_name
      }
      this.editCateForm = edit
      this.editCateDialogVisible = true
    },
    editForm() {
      this.$refs.editFormref.validate(valid => {
        if(!valid) return
        this.$http.put(`categories/${this.editCateForm.id}`, {
          cat_name: this.editCateForm.cat_name
        }).then((res) => {
          if(res.data.meta.status !== 200) return this.$message.error('编辑失败！')
          this.$message.success('编辑成功！')
          this.getCateList()
        }).catch((err) => err)
        this.editCateDialogVisible = false
      })
    },
    editFormclose() {
      this.$refs.editFormref.resetFields()
    },
    delCate(id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`categories/${id}`).then((res) => {
          if(res.data.meta.status !== 200) return this.$message.error('删除失败！')
          this.$message.success('删除成功！')
          this.getCateList()
        }).catch((err) => err)
      }).catch(() => this.$message.info('已取消删除'))
    }
  }
}
</script>

<style lang="less" scoopd>
.treeTable {
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>
