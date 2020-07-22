// miniprogram/pages/home/home.js
var app = getApp();
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    total: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData)
    let that = this;
    this.log(1,options);
    const code = options.openid || '';
    const uuid = options.uuid || '';
    this.setData({
      code,
      uuid
    })

    wx.getSystemInfo({
      success (res) {
        console.log(res.model)
        console.log(res.pixelRatio)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        console.log(res.language)
        console.log(res.version)
        console.log(res.platform)
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight
        })

      }
    })
  },
  
  addRecord: function(){

    let time = util.getTime(new Date());
    const db = wx.cloud.database()
    db.collection('records').add({
      data: {
        code: this.data.code,
        uuid: this.data.uuid,
        today: this.data.today,
        action: '助力',
        time
      }
    })
    .then(res=>{
      console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      // 在返回结果中会包含新创建的记录的 _id  
      this.updateInfo();

    })
    .catch(err=>{
      wx.showToast({
        icon: 'none',
        title: '新增记录失败'
      })
      console.error('[数据库] [新增记录] 失败：', err)
    })

  },
  updateInfo: function(){
    let openid = this.data.code;

    const db = wx.cloud.database()

    const _ = db.command
    db.collection('life').doc(openid).update({
      data: {
        // 表示指示数据库将字段自增 10
        num: _.inc(1)
      }
    }) 
    .then(res=>{
      console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      // 在返回结果中会包含新创建的记录的 _id  

    })
    .catch(err=>{
      wx.showToast({
        icon: 'none',
        title: '新增记录失败'
      })
      console.error('[数据库] [新增记录] 失败：', err)
    })
  },
  log: function(type,options){

    let time = util.getTime(new Date());

    const db = wx.cloud.database()
    db.collection('logs').add({
      data: {
        page: 'pages/index/index',
        type,
        options,
        time
      }
      })
      .then(res=>{
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        // 在返回结果中会包含新创建的记录的 _id  

      })
      .catch(err=>{

      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onGetTime();
    this.onGetOpenid();
    this.onQueryQuesType();
    
  },
  onQueryQuesType: function(){
    let that = this;

    const db = wx.cloud.database()
    db.collection('questype')
    .get()
    .then(res => {
      console.log('[数据库] [查询记录] 成功: ', res)
      let items = res.data;
      let unitMap = {

      };
      items.forEach(item => {
        unitMap[item._id] = parseInt(item.unit);
      });
      console.log(unitMap);
      app.globalData.unitMap = unitMap;
    })
    .catch(err=>{
      console.error('[数据库] [查询记录] 失败：', err)
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
      
    })
  },
  helpGo: function(){
    console.log('001');
    let url = '../help/help';
    wx.navigateTo({
      url: url
    })
  },
  examGo: async function(){
    console.log('002');
    wx.cloud.callFunction({
      name: 'examtime',
      data: {
     
      }
    })
    .then(res => {
      console.log('[云函数] [examtime]: ', res)
      if(res.result.open){
        this.toExam();
      }else{
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '考试时间已过期',
          confirmText: '我知道了',
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    })
    .catch(err=>{
      console.log(err);
    })
  
    

  },
  toExam: async function(){
   
    let total = this.data.total;
    switch(total){
      case 0:
        wx.navigateTo({
          url: '../login/login'
        })
        break;
      case 1:
        wx.switchTab({
          url: '../home/home'
        })
        break;
    }
  },
  rankGo: function(){
    console.log('003');
    let url = '../rank/rank';
    wx.navigateTo({
      url: url
    })
  },
  aboutGo: function(){
    console.log('003');
    let url = '../about/about';
    wx.navigateTo({
      url: url
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
  onGetTime: function() {
    let that = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'getTime',
      data: {}
    })
    .then(res=>{
      console.log('[云函数] [getTime]: ', res)
      app.globalData.today = res.result.today;
      that.setData({
        time: res.result.time,
        today: res.result.today
      })
    })
    .catch(err=>{
      console.error('[云函数] [getTime] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },
  onGetOpenid: function() {
    // 调用云函数
    let that = this;
    wx.cloud.callFunction({
      name: 'login',
      data: {

      }
    })
    .then( (res) => {
      console.log('[云函数] [login]: ', res)
      app.globalData.openid = res.result.openid;
      let openid = res.result.openid;
    

      that.setData({
        openid:openid
      },async ()=>{
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

        
        if( this.data.code != openid && this.data.code.indexOf('oHr225')!=-1){
          const rres = await db.collection('records').where({
            code: this.data.code,
            uuid: this.data.uuid
          }).count();
          if(rres.total == 0){
            this.addRecord();
            wx.showToast({
              title: '助力成功',
              icon: 'success',
              duration: 2000
            })
          }
          if(rres.total > 0){
            wx.showToast({
              title: '已助力过',
              icon: 'success',
              duration: 2000
            })
          }
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
      let {name, tel, branch} = res.data;

      app.globalData.userInfo = {
        name,
        tel,
        branch
      };
    })
    .catch((err)=>{
      console.log(err)
      console.error('[数据库] [查询记录] 失败：', err)
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
    })
  }
})