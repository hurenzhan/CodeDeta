<template>
    <page-wrap>

        <!-- 标题栏 -->
        <title-wrap>
          <new-title title="流量分析-搜索词" :date="searchData.dateTime" />
        </title-wrap>

        <!-- 搜索栏 -->
        <search-wrap>
            <el-form ref="form" :model="searchData" size="mini">
              <el-form-item>
                <el-row :gutter="20">

                    <el-col :span="12">
                        <div class="bg">
                            <el-radio-group v-model="dayMark" @change="changeDayMark">
                                <el-radio-button label="昨天"></el-radio-button>
                                <el-radio-button label="最近7天"></el-radio-button>
                                <el-radio-button label="最近30天"></el-radio-button>
                            </el-radio-group>
                            <el-date-picker
                              v-model="searchData.dateTime"
                              type="daterange"
                              value-format="yyyy-MM-dd"
                              @change="changeDate"
                              range-separator="至"
                              start-placeholder="开始日期"
                              end-placeholder="结束日期">
                            </el-date-picker>
                        </div>
                    </el-col>

                    <el-col :span="4">
                        <div class="bg">
                            <el-input v-model="searchData.keyword" placeholder="请输入关键词" style="width:100%;"></el-input>
                        </div>
                    </el-col>

                    <el-col :span="8">
                        <el-button type="primary" @click="onSubmit">查询</el-button>
                        <el-button type="danger" @click="onClear">清空</el-button>
                        <!--<el-button type="success" @click="onExport">导出本页</el-button>-->
                        <el-button type="warning" @click="onExportAll">导出全部</el-button>
                    </el-col>
                </el-row>
              </el-form-item>
            </el-form>
        </search-wrap>


        <!-- 其它的都放在这儿 -->
        <other-wrap>
          <div class="rect">
            <ul class="keywordDataDetail">
              <template v-for="item in keywordDataDetail">
                <li>
                  <p>{{item.title}}</p>
                  <p>{{item.number}}</p>
                </li>
              </template>
            </ul>
          </div>
        </other-wrap>


        <!-- 表格 -->
        <table-wrap>
            <el-table
                ref="table"
                :data="tableData"
                @sort-change="tableSortChange"
                size="mini"
                :row-class-name="tableRowClassName"
                :height="tabTableHeight">
                <el-table-column prop="id" label="序号" width="100px"></el-table-column>
                <el-table-column prop="keyword" label="搜索词" width="300px" sortable="custom"></el-table-column>
                <el-table-column prop="num" label="总次数" sortable="custom">
                  <template slot-scope="scope">
                      <a @click="clickDomain('all', scope.row)" :title="scope.row.num">{{scope.row.num}}</a>
                  </template>
                </el-table-column>
                <el-table-column prop="baidu" label="百度" sortable="custom">
                  <template slot-scope="scope">
                      <a @click="clickDomain('baidu', scope.row)" :title="scope.row.baidu">{{scope.row.baidu}}</a>
                  </template>
                </el-table-column>
                <el-table-column prop="360search" label="360搜索" sortable="custom">
                  <template slot-scope="scope">
                      <a @click="clickDomain('360', scope.row)" :title="scope.row['360search']">{{scope.row['360search']}}</a>
                  </template>
                </el-table-column>
                <el-table-column prop="sougou" label="搜狗" sortable="custom">
                  <template slot-scope="scope">
                      <a @click="clickDomain('sougou', scope.row)" :title="scope.row.sougou">{{scope.row.sougou}}</a>
                  </template>
                </el-table-column>
                <el-table-column prop="google" label="谷歌" sortable="custom">
                  <template slot-scope="scope">
                      <a @click="clickDomain('google', scope.row)" :title="scope.row.google">{{scope.row.google}}</a>
                  </template>
                </el-table-column>
                <el-table-column prop="sm" label="神马" sortable="custom">
                  <template slot-scope="scope">
                      <a @click="clickDomain('shenma', scope.row)" :title="scope.row.sm">{{scope.row.sm}}</a>
                  </template>
                </el-table-column>
            </el-table>
        </table-wrap>


        <!-- 分页 -->
        <pagination-wrap>
            <new-pagination
                :total="paginationData.total"
                :propCurrentPage="paginationData.currentPage"
                :current-page.sync="paginationData.currentPage"
                @initPaginationData="showPaginationData"
                @handleSizeChange="showSizeChange"
                @handleCurrentChange="showCurrentChange"
            />
        </pagination-wrap>

    </page-wrap>
</template>


<script>
    import PageWrap from './../../components/pageStructure/PageWrap.vue'
    import TitleWrap from './../../components/pageStructure/titleWrap.vue'
    import OtherWrap from './../../components/pageStructure/OtherWrap.vue'
    import SearchWrap from './../../components/pageStructure/SearchWrap.vue'
    import TableWrap from './../../components/pageStructure/TableWrap.vue'
    import paginationWrap from './../../components/pageStructure/paginationWrap.vue'
    import NewTitle from './../../components/base/NewTitle.vue'
    import NewPagination from './../../components/base/NewPagination.vue'

    import { getDates }  from './../../assets/js/baseFunc/baseSelfFunc'
    import { mapState, mapMutations } from 'vuex'


    export default {
        components: {
            PageWrap, TitleWrap, SearchWrap, OtherWrap, TableWrap, paginationWrap, NewTitle, NewPagination
        },
        data () {
            return {
                searchData: {
                    dateTime: '',
                    keyword: ''
                },
                keywordDataDetail: [
                  {
                    title: '访问次数',
                    number: 0
                  },
                  {
                    title: '搜索引擎',
                    number: 0
                  },
                  {
                    title: '百度',
                    number: 0
                  },
                  {
                    title: '360搜索',
                    number: 0
                  },
                  {
                    title: '搜狗',
                    number: 0
                  },
                  {
                    title: '谷歌',
                    number: 0
                  },
                  {
                    title: '神马',
                    number: 0
                  }
                ],
                tableData: [],

                paginationData: {
                    total: 0,
                    order:'descending',
                    prop:'num',
                    currentPage:1
                },
                dayMark: '昨天',
                loading: false
            }
        },
        mounted () {
            this.init()
            this.onSubmit()
        },
        computed: {
          ...mapState('navTabs',[
              'tabTableHeight'
          ])
        },
        methods: {
            initSearchData () {
              this.dayMark = '昨天'
              this.searchData.dateTime = [getDates('yesterday'), getDates('yesterday')]
              this.searchData.keyword = ''
            },
            init () {
              this.initSearchData();
            },
            tableSortChange (val) {
                this.paginationData.prop = val.prop
                this.paginationData.order = val.order
                this.onSubmit('changeSort')
            },
            onSubmit (action) {
              let that = this
              if (action !== 'changeCurrentPage') {
                that.paginationData.currentPage = 1
              }
              if (action !== 'changeSort' && action !== 'changeCurrentPage') {
                that.$refs.table.clearSort()
                this.paginationData.prop = 'num'
                this.paginationData.order = 'descending'
              }
              that.loading = true
              that.$ajax.post('/keyword/index', {"searchdata":that.searchData,"paginate":that.paginationData})
                  .then(function (res) {
                      if (res.data) {
                          that.tableData = res.data.tableData
                          that.keywordDataDetail = res.data.keywordDataDetail
                          that.paginationData.total = res.data.total
                      }
                      that.loading = false
                  })
                  .catch(function(err) {
                  })
            },
            onClear () {
                this.initSearchData()
                this.onSubmit()
            },
            onExport () {
                let that = this
                that.loading = true
                that.$ajax.post('/keyword/export', {"type":"1"})
                    .then(function (res) {
                        if (res.data === 'ok') {
                            window.location = 'index.php/keyword/export?keyword=' + that.searchData.keyword + '&start_time=' + that.searchData.dateTime[0] + '&end_time=' + that.searchData.dateTime[1] + '&pageSize=' + that.paginationData.pageSize + '&currentPage=' + that.paginationData.currentPage;
                        }
                    })
                    .catch(function(err) {
                        console.log('err',err)
                    })
            },
            onExportAll () {
                let that = this
                that.loading = true
                that.$ajax.post('/keyword/export', {"type":"1"})
                    .then(function (res) {
                        if (res.data) {
                            window.location = 'index.php/keyword/export?keyword=' + that.searchData.keyword + '&start_time=' + that.searchData.dateTime[0] + '&end_time=' + that.searchData.dateTime[1];
                        }
                    })
                    .catch(function(err) {
                        console.log('err',err)
                    })
            },
            changeDayMark (val) {
                switch (val) {
                    case '昨天':
                        this.searchData.dateTime = [getDates('yesterday'), getDates('yesterday')]
                        break
                    case '最近7天':
                        this.searchData.dateTime = [getDates('sevenDay'), getDates('yesterday')]
                        break
                    case '最近30天':
                        this.searchData.dateTime = [getDates('thirtyDay'), getDates('yesterday')]
                        break
                }
                this.onSubmit()
            },
            changeDate (val) {
              if (val !== null) {
                if (val[0] === getDates('yesterday') && val[1] === getDates('yesterday')) {
                  this.dayMark = '昨天'
                } else if (val[0] === getDates('sevenDay') && val[1] === getDates('yesterday')) {
                  this.dayMark = '最近7天'
                } else if (val[0] === getDates('thirtyDay') && val[1] === getDates('yesterday')) {
                  this.dayMark = '最近30天'
                } else {
                  this.dayMark = ''
                }
              } else {
                this.dayMark = ''
              }
              this.onSubmit()
            },
            showPaginationData (data) {
                this.paginationData.pageSizes = data.pageSizes
                this.paginationData.pageSize = data.pageSize
                this.paginationData.currentPage = data.currentPage
                this.paginationData.total = data.total
            },
            showSizeChange (val) {
                this.paginationData.pageSize = val;
                this.onSubmit()
            },
            showCurrentChange (val) {
                this.paginationData.currentPage = val
                this.onSubmit('changeCurrentPage')
            },
            tableRowClassName({row, rowIndex}) {
              if (rowIndex === 0) {
                return 'sumClass'
              }
              return ''
            },
            ...mapMutations('navTabs', ['addTab', 'func_domain_to_visitDetail']),
            clickDomain (searchType, val) {
              let obj = {
                date: this.searchData.dateTime,
                number: val.num,
                url: {
                  way: 'from-searchEngine',
                  value: searchType
                },
                keyword: val.keyword
              }
              this.addTab({name: 'flowAnalysis/VisitDetail', title: '访问明细'})
              this.func_domain_to_visitDetail(obj)
            }
        }
    }
</script>

<style scoped>
  @import "./../../assets/css/page/keyWord.css";
</style>
