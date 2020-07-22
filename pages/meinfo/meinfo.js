// miniprogram/pages/class/class.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    focus: false,
    tel: '',
    name: ''
    },
  bindNameInput: function (e) {
    this.setData({
      name: e.detail.value
    },()=>{
      console.log(this.data.name)
    })
  },
  bindTelInput: function (e) {
    this.setData({
      tel: e.detail.value
    },()=>{
      console.log(this.data.tel)
    })
  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value,
      dept: this.data.depts[e.detail.value]
    })
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onQuery();

    this.setData({
      name: app.globalData.userInfo['name'] || '',
      tel: app.globalData.userInfo['tel'] || ''
    })
  },
  onQueryDepts: function(){
    let that = this;
    const db = wx.cloud.database()
    db.collection('depts')
    .get()
    .then(res=>{
      console.log(res);
      let arr = res.data;
      let depts = [];
      let index = 0;
      arr.forEach((item,idx)=>{
        depts.push(item.name);
        if(item.name == app.globalData.userInfo['dept']){
          index = idx;
        }
      })
      that.setData({
        depts,
        index
      })
    })
  },
  onQuery: function(){
    const db = wx.cloud.database()
    db.collection('profiles').doc(app.globalData.openid)
    .get()
    .then(res=>{
      console.log('[数据库] [查询记录] 成功: ', res);
      this.setData({
        userInfo: res.data.userInfo
      })
    })
    .catch(err=>{
      console.error('[数据库] [查询记录] 失败：', err)
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
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
  goOk: function(){
    let {name, tel} = this.data;
    this.update(name, tel);
  },
  update: function(name, tel){
    let openid = app.globalData.openid;
    let userInfo = this.data.userInfo;

    userInfo.name = name;
    userInfo.tel = tel;
    console.log(userInfo);
    app.globalData.userInfo = userInfo;
    
    const db = wx.cloud.database();
    db.collection('profiles').doc(openid).update({
      // data 传入需要局部更新的数据
      data: {
        userInfo
      }
    })
    .then(res=>{
      console.log(res.data);
      wx.showToast({
        title: '更新成功',
        icon: 'success',
        duration: 2000
      })
      this.goMe();
    })
    .catch(err=>{
      console.log(err);
      this.goMe();
    })

  },
  goMe: function(){
    wx.navigateBack({
      delta: 1
    })
  },
  onGetOpenid: function() {
    let that = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login]: ', res)
        that.setData({
          openid: res.result.openid
        })
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  }
})