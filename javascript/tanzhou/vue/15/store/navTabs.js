import Vuex from 'vuex'

const Home = resolve => require(['../views/Home'], resolve)

const state = {
    domain_to_visitDetail: {
      date: [],
      number: '',
      url: {
        way: '',
        value: ''
      },
      keyword: ''
    },
    activeTabName: "Home",
    freshTabName: '',
    tabTableHeight: 0,
    tabList: [
        {
            label: '工作台',
            name: 'Home',
            disabled: false,
            closable: false,
            component: Home
        }
    ]
}

const mutations = {
    func_domain_to_visitDetail (state, obj) {
      state.domain_to_visitDetail = obj
    },
    freshTabFunc(state, name) {
      state.freshTabName = name
    },
    setActiveTabName(state, name) {
        state.activeTabName = name;
    },
    setTabTableHeight(state, height) {
        state.tabTableHeight = height
    },
    addTab(state, obj) {
      let index = obj.name
      let label = obj.title

        if (state.tabList.filter(f => f.name == index) == 0) {
            let component = resolve => require([`../views/${index}`], resolve)
            state.tabList.push({
                label: label,
                name: index,
                disabled: false,
                closable: true,
                component: component
            })
        }
        state.activeTabName = index;
    },
    closeTab(state, name) {
        let tab = state.tabList.filter(f => f.name == name)[0];
        let index = state.tabList.indexOf(tab);
        if (index != state.tabList.length - 1) {
            state.activeTabName = state.tabList[index + 1].name;
        } else {
            state.activeTabName = state.tabList[index - 1].name;
        }
        state.tabList = state.tabList.filter(f => f.name != name);
        if (name === 'flowAnalysis/VisitDetail') {
          state.domain_to_visitDetail = {
            date: [],
            number: '',
            url: {
              way: '',
              value: ''
            },
            keyword: ''
          }
        }
    },
    closeSelfTabFunc(state, name) {
      if (name == 'Home') {
        return
      }
      let tab = state.tabList.filter(f => f.name == name)[0];
      let index = state.tabList.indexOf(tab);
      if (index != state.tabList.length - 1) {
          state.activeTabName = state.tabList[index + 1].name;
      } else {
          state.activeTabName = state.tabList[index - 1].name;
      }
      state.tabList = state.tabList.filter(f => f.name != name);
    },
    closeOtherTabFunc(state, name) {
      state.tabList = state.tabList.filter(f => f.name == name || f.name == 'Home');
      let tab = state.tabList.filter(f => f.name == name)[0];
      let index = state.tabList.indexOf(tab);
      state.activeTabName = state.tabList[index].name;
    },
    closeAllTabFunc(state, name) {
      state.activeTabName = 'Home'
      state.tabList = state.tabList.filter(f => f.name == 'Home');
    }
}

export default {
    namespaced: true,
    state,
    mutations
}
