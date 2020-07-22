// miniprogram/pages/article/article.js
const util = require('../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    circular: false,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onQuery();
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
  generate: function(){
    return util.formatTime(new Date());
  },
  
  selectArticle: function(e){
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let articles = this.data.articles;
    
    wx.navigateTo({
      url: '../detail/detail?id='+id
    })
  },
  onQuery: function(openid){
    let that = this;

    const db = wx.cloud.database()
    db.collection('article').get().then(res => {
      console.log('[数据库] [查询记录] 成功: ', res)
      let articles = res.data;
      let arr = [];
      articles.forEach((element,idx) => {
        element.index = idx;
        arr.push(element);
      });
      that.setData({
        articles: arr
      });

    })
  },
  onQueryByType: function(typeid){
    let that = this;

    const db = wx.cloud.database()
    db.collection('article')
    .where({
      typeid: typeid
    })
    .get()
    .then(res => {
      console.log('[数据库] [查询记录] 成功: ', res)
      let articles = res.data;
      that.setData({
        articles
      });

    })
  },
  goType1: function(){
    this.onQueryByType('01');
  },
  goType2: function(){
    this.onQueryByType('02');
  }
})