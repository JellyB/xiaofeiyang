// pages/zhu/index.js
var util = require('../../utils/util.js');
var db = wx.cloud.database();
const _ = db.command;
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    notice: '在线答题小程序全新改版',
    i: [],
    name: [],
    shijian: [],
    tie: [],
    datitimes: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
    })
    db.collection('notice').doc('001').get().then(res => {
      this.setData({
        notice: res.data.notice
      })
    })
    this.onGetOpenid();
    var name = app.globalData.name
    var dept = app.globalData.dept

    this.setData({
      name: name,
      dept: dept,
    })

      



  },
  onQuery: function (e) {
    var time = this.data.time
    var e = new Date(time);
    var tie = ((e.getFullYear()) * 10000) + ((e.getMonth() + 1) * 100) + ((e.getDate()))
    console.log(tie)
    this.setData({
      tie: tie
    })
    app.globalData.tie = tie

  },
  noteGo: function (e) {
    wx.navigateTo({
      url: '/pages/noteList/noteList',
    })
  },
  recordGo: function(){
    wx.navigateTo({
      url: '/pages/record/record',
    })
  },
  examGo: async function (e) {
    const db = wx.cloud.database()
    const res = await db.collection('historys').where({
      _openid: this.data.openid,
      today: this.data.today
    }).count();
    console.log(res);

    const liferes = await db.collection('records').where({
      _openid: this.data.openid,
      today: this.data.today
    }).count();

    console.log(liferes);

    if(res.total >= (liferes.total + 3)){
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '每天只有3次答题机会',
        confirmText: '我知道了',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return;
    }

    var time1 = this.data.time1
    var time2 = this.data.time2
    var time = this.data.time

    console.log(time1)
    console.log(time2)
    console.log(time)

    let date1 = new Date(time1.replace(/-/g, '/'));
    let date2 = new Date(time2.replace(/-/g, '/'));

    console.log(Date.parse(date1));
    console.log(Date.parse(date2));
    console.log(Date.parse(new Date()));

    let t1 = Date.parse(date1);
    let t2 = Date.parse(date2);
    let t = Date.parse(new Date());

    if (t1 <= t && t <= t2) {
      wx.navigateTo({
        url: '/pages/examhome/examhome',
      })
    } else if (t < t1) {
      wx.showToast({

        title: '未到考试时间',
        icon: 'loading',
        duration: 2000,

      })
    } else if (t2 < t) {
      wx.showToast({

        title: '考试时间已过',
        icon: 'loading',
        duration: 2000,

      })
    }

  },
  meinfoGo: function (e) {
    wx.navigateTo({
      url: '/pages/meinfo/meinfo',
    })
  },
  articleGo: function (e) {
    wx.navigateTo({
      url: "/pages/article/article",
    })
  }, 
  historyGo: async function (e) {
    wx.navigateTo({
      url: "/pages/history/history",
    })
  },
  rankGo: function (e) {
    wx.navigateTo({
      url: '/pages/rank/rank',
    })
  },
  aboutGo: function (e) {
    wx.navigateTo({
      url: '/pages/about/about',
    })
  },
  onReady: function () {

  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onGetTime();
    this.onQueryTime();
  },
  onQueryTime: function(){
    db.collection('time').doc('001').get().then(res => {
      // res.data 包含该记录的数据
      console.log(res.data)
      // 调用函数时，传入new Date()参数，返回值是日期和时间
      var time = util.formatTime(new Date());

      // 再通过setData更改Page()里面的data，动态更新页面的数据
      this.setData({
        time: time,
        time1: res.data.time1,
        time2: res.data.time2
      });
    
      this.onQuery()
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onGetOpenid: function() {
    // 调用云函数
    let that = this;
    wx.cloud.callFunction({
      name: 'login',
      data: {

      }
    })
    .then(res => {
      console.log('[云函数] [login]: ', res)
      let openid = res.result.openid;
      app.globalData.openid = openid;
      that.setData({
        openid:openid
      },async ()=>{
        wx.hideLoading()
        const db = wx.cloud.database();
        const res = await db.collection('profiles').where({
          _openid: openid
        }).count();
        that.setData({
          total: res.total
        })
        console.log(res);
        if(res.total > 0){
          that.queryProfile(openid);
        }
      });
      
    }).catch(err => {
      console.error('[云函数] [login] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },
  queryProfile: function(openid){
    let that = this;
    const db = wx.cloud.database()
    db.collection('profiles')
    .doc(openid)
    .get()
    .then((res)=>{
      console.log('[数据库] [查询记录] 成功: ', res);
      app.globalData.name = res.data.name;
      app.globalData.dept = res.data.dept;
      this.setData({
        name: res.data.name,
        dept: res.data.dept
      },()=>{
        
      })
    })
    .catch((err)=>{
      console.log(err)
      console.error('[数据库] [查询记录] 失败：', err)
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
    })
  },
  onGetTime: function(){
    let time = util.formatTime(new Date());
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getTime',
      // 传给云函数的参数
      data: {
      },
    })
    .then(res => {
      console.log('[云函数] [getTime]: ', res)
      this.setData({
        today: res.result.today,
        time: res.result.time
      })
    })
    .catch((err)=>{
      console.error('[云函数] [getTime] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
    
  },
})