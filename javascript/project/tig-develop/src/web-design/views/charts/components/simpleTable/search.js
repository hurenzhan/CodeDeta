import { calcMetricFeature } from '../../utils/utils'
import { currentMetric } from './utils'
import _uniqBy from 'lodash.uniqby'

export default {
	methods: {
		// 这个接口带上公共的一些查询面板的东西
		async tableSearch(upsetting) {
			let data = []
			upsetting.index = this.index
      if ('type' in upsetting) {

      } else {
        upsetting.type = 0
      }
      // 排序
      if ('sortList' in upsetting) {

      } else {
        upsetting.sortList = this.sortList
      }

      // let moreMetricListArray = []

      // this.metricListFlat && this.metricListFlat.forEach(v => {
      //   this.metricList.forEach(item => {
      //     let code = ''
      //     if (v.metricCode.slice(-2).indexOf('_') === -1) {
      //       code = v.metricCode
      //     } else {
      //       code = v.metricCode.substring(0, v.metricCode.length - 2)
      //     }
      //     if (code === item.metricCode) {
      //       moreMetricListArray.push(item)
      //     }
      //   })
      // })
      // // 所有本期的值
      // moreMetricListArray = _uniqBy(moreMetricListArray, 'metricCode')
      // }
      // 不包括拆分 因为有更多指标的限制 我这边必须传指标过去
      if ('metricsList' in upsetting) {
      } else {
        let metricsList = []
        this.metricList.forEach(v => {
          let {rateType, isProportion, compareType} = calcMetricFeature(v.feature)
          let metricSetting = {
            metricsCode: v.metricCode,
            metricsUnitCode: v.unitSelected,
            rateType, // 同环比类型0本期值,1同比,2环比,3同环比，4对比
            compareType,
            decimals: 2, // 小数位
            thousands: false, // 千分位
            type: 0, // 0数值,1百分比,空字符串表示数据原值返回
            label: v.metricName,
            isProportion
          }
          metricsList.push(metricSetting)
        })
        upsetting.metricsList = metricsList
      }
      // 查询面板的联动
      if (this.queryInfo) {
        upsetting.queryInfo = this.queryInfo
        let isComparDate = false
        isComparDate = this.queryInfo.dateData.some(v => v.value === "ComparDate")
        // 求出哪一列是趋势标记
        this.compareData = []
        if (isComparDate) {
          this.initTrend()
        }
      	if (this.compareData.length !== 0) {
          // 有同环比不能进行对比
          let rateValueList = ['_1', '_2', '_3', '_4']
          let isRate = false
          isRate = this.metricListFlat.some(v => {
            return rateValueList.includes(v.metricCode.slice(-2))
          })
          if (isRate) {
            this.$message({
              message: '有同环比不能进行对比',
              type: 'warning'
            })
            return
          }
          this.compareData.forEach(v => {
            upsetting.metricsList.push(v)
          })
          
      	}
      }
      // 图表与图表的联动
      if (this.linkInfo) {
        upsetting.linkInfo = this.linkInfo
      }
      // 传本期的数值格式过去 如果moreMetricList里没有本期值 就不传 这边是页面上出现的metric
      let format = [] // 数值格式
      // const existMetric = ';' + (this.metricListFlat && this.metricListFlat.map(v =>  v.metricCode).join(';') || '') + ';' 
      this.columnList.filter(v => v.type === 1).forEach(v => {       
        // let code = ';' + v.id + ';'
        if (v.type === 1) {
          let metric = v
          format.push({
            metricsCode: metric.id,
            decimals: metric.decimals,
            thousands: metric.thousands,// 千分位
            type: metric.percentType,// 百分比
          })
        }       
        upsetting.format = format
      })
      // 处理维值
      if ('dimList' in upsetting) {

      } else {
        let dimList = []
        this.dimList.forEach((v) => {
          dimList.push({
            dimId: v.dimCode,
            dimName: v.dimName
          })
        })
        upsetting.dimList = dimList
      }
      upsetting.loadingFalse = false
      upsetting.isTable = true    
      data = await this.updateDataPre(upsetting)
      this.loadingToggle(this.index, false)
      if (!data) {
        data = []
      }
      return data
		}
	}
}