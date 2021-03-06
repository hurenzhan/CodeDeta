<template>
    <page-wrap>

        <!-- 标题栏 -->
        <title-wrap>
          <new-title title="来源分析-来源分类" :date="searchData.dateTime" />
        </title-wrap>

        <!-- 搜索栏 -->
        <search-wrap>
            <el-form ref="form" :model="searchData" size="mini">
                <el-form-item>
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
                    <el-button type="success" @click="onExport">导出表格</el-button>
                </el-form-item>
            </el-form>
        </search-wrap>


        <!-- 其它的都放在这儿 -->
        <other-wrap>
            <div class="rect">
                <ul class="fromSortDataDetail">
                    <template v-for="item in fromSortDataDetail">
                        <li>
                            <p>{{item.name}}</p>
                            <p>{{item.value}}</p>
                        </li>
                    </template>
                </ul>
            </div>

            <el-card class="fromSort-PieChart">
                <div class="box-card-content">
                    <div id="fromSort_PieChart"></div>
                </div>
            </el-card>

            <el-card class="fromSort-LineChart">
                <div class="box-card-content">
                    <div id="fromSort_LineChart"></div>
                </div>
            </el-card>

        </other-wrap>


        <!-- 表格 -->
        <table-wrap>
            <el-table
                ref="table"
                :data="tableData"
                size="mini"
                @sort-change="tableSortChange"
                :row-class-name="tableRowClassName">
                <el-table-column prop="time" label="日期"  sortable="custom"></el-table-column>
                <el-table-column prop="num" label="访问次数"  sortable="custom">
                  <template slot-scope="scope">
                      <a @click="clickDomain('number', scope.row)" :title="scope.row.num">{{scope.row.num}}</a>
                  </template>
                </el-table-column>
                <el-table-column prop="from_mark" label="直接输入网址或书签"  sortable="custom">
                  <template slot-scope="scope">
                      <a @click="clickDomain('from-direct', scope.row)" :title="scope.row.from_mark">{{scope.row.from_mark}}</a>
                  </template>
                </el-table-column>
                <el-table-column prop="from_engines" label="搜索引擎"  sortable="custom">
                  <template slot-scope="scope">
                      <a @click="clickDomain('from-searchEngine', scope.row)" :title="scope.row.from_engines">{{scope.row.from_engines}}</a>
                  </template>
                </el-table-column>
                <el-table-column prop="from_other" label="其他外部链接"  sortable="custom">
                  <template slot-scope="scope">
                      <a @click="clickDomain('from-other', scope.row)" :title="scope.row.from_other">{{scope.row.from_other}}</a>
                  </template>
                </el-table-column>
            </el-table>
        </table-wrap>


        <!-- 分页 -->
        <pagination-wrap>
            <new-pagination
                :total="paginationData.total"
                :propCurrentPage="paginationData.currentPage"
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
                },
                fromSortDataDetail: [],
                fromSort_PieChart_Data: [],
                fromSort_LineChart_Data: [],
                tableData: [],
                paginationData: {
                  total: 0,
                  pageSize: 0,
                  pageSizes: [],
                  currentPage: 0
                },
                dayMark: '',
                loading: false
            }
        },
        methods: {
            init () {
                this.initSearchData()
                this.onSubmit()
            },
            initSearchData () {
                this.dayMark = '昨天'
                this.searchData.dateTime = [getDates('yesterday'), getDates('yesterday')]
            },
            onSubmit () {
                let that = this
                that.paginationData.currentPage = 1
                that.$refs.table.clearSort()
                this.paginationData.prop = ''
                this.paginationData.order = 'descending'

                this.$ajax.post('/from_sort/init',{searchData: that.searchData, paginationData: that.paginationData})
                    .then(function(res) {
                        if (res.data !== undefined) {
                            that.fromSortDataDetail = res.data.keywordDataDetail
                            that.fromSort_PieChart_Data = res.data.searchEngineChartData
                            that.fromSort_LineChart_Data = res.data.searchEngineLineChartData
                            that.tableData = res.data.tableData
                            that.paginationData.total = res.data.total
                            that.createPieChart()
                            that.createLineChart()
                        }
                    })
                    .catch(function(err) {
                    })
            },
            onPage (action) {
                let that = this
                if (action !== 'changeCurrentPage') {
                  that.paginationData.currentPage = 1
                }
                if (action !== 'changeSort' && action !== 'changeCurrentPage') {
                  that.$refs.table.clearSort()
                  this.paginationData.prop = ''
                  this.paginationData.order = 'descending'
                }
                this.$ajax.post('/from_sort/page',{searchData: that.searchData, paginationData: that.paginationData,sum: that.tableData[0]})
                    .then(function(res) {
                        if (res.data !== undefined) {
                            that.tableData = res.data.tableData
                            that.paginationData.total = res.data.total
                        }
                    })
                    .catch(function(err) {
                    })
            },
            onExport () {
                let that = this
                window.location = 'index.php/from_sort/export?start_time=' + that.searchData.dateTime[0] + '&end_time=' + that.searchData.dateTime[1] ;
            },
            onClear () {
                this.initSearchData()
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
                this.paginationData.pageSize = val
                this.onPage()
            },
            showCurrentChange (val) {
                this.paginationData.currentPage = val
                this.onPage('changeCurrentPage')
            },
            createPieChart () {
                let searchEngineChart_option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}"
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        data: this.fromSort_PieChart_Data.map(x => x.name)
                    },
                    series: [
                        {
                          name:'来源分类',
                          type:'pie',
                          radius: ['30%', '55%'],
                          center: ['55%', '50%'],
                          label: {
                              normal: {
                                  show: false,
                                  position: 'center'
                              }
                          },
                          data: this.fromSort_PieChart_Data
                        }
                    ]
                }
                this.$echarts.init(document.getElementById('fromSort_PieChart')).setOption(searchEngineChart_option)
            },
            createLineChart () {
                let lineChart_Option = {
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: this.fromSort_LineChart_Data.title
                    },
                    grid: {
                        left: '3%',
                        right: '8%',
                        bottom: '3%',
                        containLabel: true
                    },
                    toolbox: {
                        feature: {
                            saveAsImage: {}
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: this.fromSort_LineChart_Data.time
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: this.fromSort_LineChart_Data.source
                }
                this.$echarts.init(document.getElementById('fromSort_LineChart')).setOption(lineChart_Option)
            },
            tableSortChange (val) {
                this.paginationData.prop = val.prop
                this.paginationData.order = val.order
                this.onPage('changeSort')
            },
            tableRowClassName({row, rowIndex}) {
              if (rowIndex === 0) {
                return 'sumClass'
              }
              return ''
            },
            ...mapMutations('navTabs', ['addTab', 'func_domain_to_visitDetail']),
            clickDomain (from, val) {
              let obj = {
                date: this.searchData.dateTime,
                number: val.num,
                url: {
                  way: '',
                  value: ''
                }
              }
              if (from === 'from-direct') {
                obj.url.way = from
              } else if (from === 'from-searchEngine') {
                obj.url.way = from
                obj.url.value = 'all'
              } else if (from === 'from-other') {
                obj.url.way = from
              }

              this.addTab({name: 'flowAnalysis/VisitDetail', title: '访问明细'})
              this.func_domain_to_visitDetail(obj)
            }
        },
        mounted() {
            this.init()
            this.createPieChart()
            this.createLineChart()
        }
    }
</script>

<style scoped>
    @import "./../../assets/css/page/fromSort.css";
</style>
