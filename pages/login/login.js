// miniprogram/pages/login/login.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    dept: '',
    tel: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.onGetTime();
    this.onGetOpenid();
    this.onQuery();
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
  onQuery: function(){
    // 在小程序代码中：
    wx.cloud.callFunction({
      name: 'fetchBranches',
      data: {

      }
    })
    .then(res=>{
      console.log('callFunction fetchBranches result: ', res);
      let items = res.result.data;
      
      this.setData({
        branches: items
      })
    })
    .catch(err=>{
      console.error('[云函数] [getTime] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
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

  },
  bindNameInput: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindDeptInput: function (e) {
    this.setData({
      dept: e.detail.value
    })
  },
  bindTelInput: function (e) {
    this.setData({
      tel: e.detail.value
    })
  },
  bindBranchChange: function(e){
    console.log('picker branch code 发生选择改变，携带值为', e.detail.value);

    this.setData({
      index: e.detail.value
    })
  },

  toGo: function(){
    let {name, dept, tel} = this.data;

    if(name == ''){
      wx.showModal({
        showCancel: false,
        title: '提示',
        confirmText: '我知道了',
        content: '请先填写姓名信息',
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

    if(tel.length != 11){
      wx.showModal({
        showCancel: false,
        title: '提示',
        confirmText: '我知道了',
        content: '请核对手机信息',
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

    app.globalData.userInfo = {
      name,
      dept,
      tel
    };


    const db = wx.cloud.database();
    db.collection('profiles').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: this.data.openid,
        name,
        dept,
        tel,
        createTime: this.data.time
      }
    })
    .then(res => {
      console.log(res)
      console.log('[数据库] [查询记录] 成功: ', res);
      this.addLife();
      this.examGo();
    })
    .catch((err)=>{
      console.log(err)
      this.examGo();
    })

  },
  addLife: function(){
    const db = wx.cloud.database();
    db.collection('life').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: this.data.openid,
        num: 0
      }
    })
    .then(res => {
      console.log(res)
      console.log('[数据库] [查询记录] 成功: ', res);
    })
    .catch((err)=>{
      console.log(err)

    })

  },
  examGo: function(){
    wx.switchTab({
      url: '../home/home'
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
      console.log('[云函数] [login]: ', res)
      that.setData({
        time: res.result.time
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
    let that = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {}
    })
    .then(res=>{
      console.log('[云函数] [login]: ', res)
      that.setData({
        openid: res.result.openid
      })
    })
    .catch(err=>{
      console.error('[云函数] [login] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  }
})