<template>
    <page-wrap>

        <!-- 标题栏 -->
        <title-wrap>
          <new-title title="来源分析-搜索引擎" :date="searchData.dateTime" />
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
                <ul class="searchEngineDataDetail">
                    <template v-for="item in searchEngineDataDetail">
                        <li>
                            <p>{{item.name}}</p>
                            <p>{{item.value}}</p>
                        </li>
                    </template>
                </ul>
            </div>

            <el-card class="searchEngine-PieChart">
                <div class="box-card-content">
                    <div id="searchEngine_PieChart"></div>
                </div>
            </el-card>

            <el-card class="searchEngine-LineChart">
                <div class="box-card-content">
                    <div id="searchEngine_LineChart"></div>
                </div>
            </el-card>

        </other-wrap>


        <!-- 表格 -->
        <table-wrap>
            <el-table
                ref="table"
                :row-class-name="tableRowClassName"
                @sort-change="tableSortChange"
                :clearSort="clearSortBool"
                :data="tableData"
                size="mini">
                <el-table-column prop="time" label="日期" sortable="custom"></el-table-column>
                <el-table-column prop="search_num" label="访问次数" sortable="custom">
                  <template slot-scope="scope">
                      <a @click="clickDomain('all', scope.row)" :title="scope.row.search_num">{{scope.row.search_num}}</a>
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
                <el-table-column prop="shenma" label="神马" sortable="custom">
                  <template slot-scope="scope">
                      <a @click="clickDomain('shenma', scope.row)" :title="scope.row.shenma">{{scope.row.shenma}}</a>
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
                searchEngineDataDetail: [],
                searchEngine_PieChart_Data: [],
                searchEngine_LineChart_Data: [],
                tableData: [],
                paginationData: {
                    total: 0,
                    order:'descending',
                    prop:'time',
                    currentPage:1
                },
                dayMark: '',
                loading: false,
                clearSortBool: false
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
            onSubmit (action) {
                let that = this
                if (action !== 'changeCurrentPage') {
                  that.paginationData.currentPage = 1
                }
                if (action !== 'changeSort' && action !== 'changeCurrentPage') {
                  that.$refs.table.clearSort()
                  this.paginationData.prop = 'time'
                  this.paginationData.order = 'descending'
                }
                this.$ajax.post('/search_engine/init',{search:that.searchData,paginate:that.paginationData})
                    .then(function(res) {
                        if (res.data !== undefined) {
                            that.searchEngineDataDetail = res.data.keywordDataDetail
                            that.searchEngine_PieChart_Data = res.data.searchEngineChartData
                            that.searchEngine_LineChart_Data = res.data.searchEngineLineChartData
                            that.tableData = res.data.tableData
                            that.paginationData.total = res.data.total
                            that.createEcharsChart()
                            that.createLineChart()
                        }
                    })
                    .catch(function(err) {
                    })
            },
            ...mapMutations('navTabs', ['addTab', 'func_domain_to_visitDetail']),
            clickDomain (searchType, val) {
              let obj = {
                date: this.searchData.dateTime,
                number: val.search_num,
                url: {
                  way: 'from-searchEngine',
                  value: searchType
                }
              }
              this.addTab({name: 'flowAnalysis/VisitDetail', title: '访问明细'})
              this.func_domain_to_visitDetail(obj)
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
                this.onSubmit()
            },
            showCurrentChange (val) {
                this.paginationData.currentPage = val
                this.onSubmit('changeCurrentPage')
            },
            createEcharsChart () {
                let searchEngine_PieChart_Option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}"
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        data: this.searchEngine_PieChart_Data.map(x => x.name)
                    },
                    series: [
                        {
                            name:'搜索引擎',
                            type:'pie',
                            radius: ['30%', '55%'],
                            center: ['55%', '50%'],
                            label: {
                                normal: {
                                    show: false,
                                    position: 'center'
                                }
                            },
                            data: this.searchEngine_PieChart_Data
                        }
                    ]
                }
                this.$echarts.init(document.getElementById('searchEngine_PieChart')).setOption(searchEngine_PieChart_Option)
            },
            createLineChart () {
                let searchEngine_LineChart_Option = {
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data:this.searchEngine_LineChart_Data.title
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
                        data: this.searchEngine_LineChart_Data.time
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: this.searchEngine_LineChart_Data.source
                }
                this.$echarts.init(document.getElementById('searchEngine_LineChart')).setOption(searchEngine_LineChart_Option)
            },
            onExport () {
                let that = this
                that.$ajax.post('/visit_detail/import', {"type":"1"})
                    .then(function (res) {
                        if (res.data === 'ok') {
                            window.location = 'index.php/search_engine/import?start=' + that.searchData.dateTime[0]
                                + '&end=' + that.searchData.dateTime[1]
                            ;
                        }
                    })
                    .catch(function(err) {
                    })
            },
            tableSortChange (val) {
                this.paginationData.prop = val.prop
                this.paginationData.order = val.order
                this.onSubmit('changeSort')
            },
            tableRowClassName({row, rowIndex}) {
              if (rowIndex === 0) {
                return 'sumClass'
              }
              return ''
            }
        },
        mounted() {
            this.init()
            this.createEcharsChart()
            this.createLineChart()
        }
    }
</script>

<style scoped>
    @import "./../../assets/css/page/searchEngine.css";
</style>
