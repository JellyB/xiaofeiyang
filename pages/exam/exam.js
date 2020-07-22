// miniprogram/pages/exam/exam.js
var app = getApp();
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: '挑战失败',
    currentIndex: 0,
    showModal: false,
    showShareButton: true,
    score: 0,
    times: "30:00",
    maxScore: 0,
    total: 0,
    timenum: 20
  },
  questions: [],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onGetUUID();
    console.log(util.getTime(new Date()))
    console.log(app.globalData);
    let that = this;

    this.onGetTime();
    this.onGetOpenid();
    this.onQueryQuestion();
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
    this.onTime();
  },
  onTime: function(){
    let that = this;
    let timenum = this.data.timenum;
    app.globalData.timeid = setInterval(()=>{
      timenum--;
      if(timenum==0){
        that.nextGo();
      }
      this.setData({
        timenum
      },()=>{
        console.log('倒计时')
      })
    },1000)
  },
  onQueryQuestion: function(){
    let that = this;

    // 在小程序代码中：
    wx.cloud.callFunction({
      name: 'fetchQues',
      data: {
 
      },
      complete: res => {
        console.log('callFunction fetchQues result: ', res);
        let items = res.result.list;
        let questions = [];
        items.map((item,idx)=>{
          // console.log(idx);
          // console.log(item);

          let options = item.options;
          options.forEach((o)=>{
            o.selected = false;
          })
          item.index = idx;
          item.selected = false;
          item.status = false;
          item.options = options;
          questions.push(item);
        })

        that.questions = questions;
        that.setData({
          question: questions[0],
          num: questions.length
        },()=>{
          console.log('已赋值完成')
          console.log('正确答案')
          console.log(this.data.question['answer']);
          console.log(questions[0]);
          wx.hideLoading()
        })
      },
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
    
    let unitMap = app.globalData.unitMap;
    this.setData({
      unitMap
    })

  },
  
  selectGo: function(e){
    console.log(e.currentTarget.dataset);
    let selectedCode = e.currentTarget.dataset.code;
    let questions = this.questions;
    let question = this.data.question;
    if(question.selected){
      return;
    }
    let index = question.index;
    let typecode = question.typecode;
    let options = question.options;
    let answer = question.answer;

    switch(typecode){
      case '01':
          options.map((option)=>{
            option.selected = false;
            if(option.code == selectedCode){
              option.selected = true;
            }
          });
          break;
      case '02':
          options.map((option)=>{
            if(option.code == selectedCode){
              option.selected = !option.selected;
            }
          });
          break;
      case '03':
          options.map((option)=>{
            option.selected = false;
            if(option.code == selectedCode){
              option.selected = true;
            }
          });
        break;  
      default: 
      console.log('其他未涉及题型')
    }

    question.options = options;
    questions[index] = question;

    this.questions = questions;
    this.setData({
      question
    })
  },
  nextGo: function(){

    let that = this;

    clearInterval(app.globalData.timeid)

    let currentIndex = this.data.currentIndex;

    let questions = this.questions;
    let question = this.data.question;
    let index = question.index;
    let options = question.options;
    let answer = question.answer;

    question.selected = true;

    let selectedCodeArr = [];
    options.forEach(option => {
      if(option.selected){
        selectedCodeArr.push(option.code)
      }
    })

    console.log(answer);
    console.log(selectedCodeArr.sort().join(''));
    if(answer == selectedCodeArr.sort().join('')){
      question.status = true;
    }

    console.log(question)

    questions[index] = question;

    this.questions = questions;
    this.setData({
      question
    },()=>{
      
        if(!question.status){
          
          setTimeout( async ()=>{
            wx.showToast({
              title: '挑战失败',
              mask: true,
              icon: 'success',
              duration: 2000,
              complete: function(){

                let questions = that.questions;

                let unitMap = that.data.unitMap;
            
                let score = 0;
                questions.forEach(ques => {
                  if(ques.status){
                    score += unitMap[ques.typecode];
                  }
                })

                that.setData({
                  score,
                  showModal: true
                })
              }
            })

            const db = wx.cloud.database()
            const res = await db.collection('recover').where({
              uuid: this.data.uuid
            }).count();

            console.log(res);
            if(res.total > 0){
              this.setData({
                showShareButton: false
              })
            }

            
            
          },2000)

          return;
        }

        if(this.data.currentIndex == this.data.num-1){

          wx.showToast({
            title: '提交中',
            mask: true,
            icon: 'success',
            duration: 2000
          })

          that.setData({
            message: '挑战成功'
          })
          
          
          this.addHistory()
        }else{
          setTimeout(()=>{
            this.doNext();
          },1000)
        }
      
    })


  },
  doNext: function(){
    let timenum = 20;

    let currentIndex = this.data.currentIndex;
    let questions = this.questions;
    currentIndex++;
    clearInterval(app.globalData.timeid);
    this.setData({
      timenum,
      currentIndex,
      question: questions[currentIndex]
    },()=>{
      this.onTime();
      console.log('正确答案')
      console.log(this.data.question['answer']);
      console.log(questions[currentIndex])
    })
  },
  addHistory: function(){
    let that = this;
    let questions = this.questions;

    let unitMap = this.data.unitMap;

    let score = 0;
    questions.forEach(ques => {
      if(ques.status){
        score += unitMap[ques.typecode];
      }
    })

    let {name, grade, tel, branch} = app.globalData.userInfo;

    let time = this.data.time;
    let time2 = util.getTime(new Date());

    let time1 = this.data.time;

    console.log(time1);
    console.log(time2);
    let difftime = (new Date(time2) - new Date(time1))/1000; //计算时间差,并把毫秒转换成秒
    difftime = Math.abs(difftime);
    
    let minutes = parseInt(difftime%3600/60); // 分钟 -(day*24) 以60秒为一整份 取余 剩下秒数 秒数/60 就是分钟数
   	let seconds = parseInt(difftime%60);  // 以60秒为一整份 取余 剩下秒数
     
    let ytimes = minutes+':'+seconds;

    const db = wx.cloud.database()
    db.collection('historys').add({
      data: {
        // questions: this.questions,
        score,
        name,
        grade,
        tel,
        branch,
        today: this.data.today,
        time1,
        time2,
        ytimes: this.data.ytimes
      }
    })
    .then(res=>{
      console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      if(this.data.total > 0 && this.data.maxScore < score){
        this.updateDaily(time1, time2, score);
      }
      if(this.data.total == 0){
        this.addDaily(time1,time2,score);
      }
      this.setData({
        showModal: true,
        score
      },()=>{
        wx.hideToast();
      })
    })
    .catch(err=>{
      console.error('[数据库] [新增记录] 失败：', err)
      wx.showToast({
        icon: 'none',
        title: '新增记录失败'
      })
    })

  },
  addDaily: function(time1,time2,score){
    let that = this;

    let {name, grade, tel, branch} = app.globalData.userInfo;

    console.log(time1);
    console.log(time2);
    let date1 = new Date(time1.replace(/-/g, '/'));
    let date2 = new Date(time2.replace(/-/g, '/'));

    let difftime = ( Date.parse(date2)- Date.parse(date1) )/1000; //计算时间差,并把毫秒转换成秒
    difftime = Math.abs(difftime);

	  let minutes = parseInt(difftime%3600/60); // 分钟 -(day*24) 以60秒为一整份 取余 剩下秒数 秒数/60 就是分钟数
   	let seconds = parseInt(difftime%60);  // 以60秒为一整份 取余 剩下秒数
     
    let ytimes = minutes+':'+seconds;

    const db = wx.cloud.database()
    db.collection('daily').add({
      data: {
        // questions: this.questions,
        score,
        name,
        grade,
        tel,
        branch,
        today: this.data.today,
        time1,
        time2,
        ytimes: ytimes
      }
    })
    .then(res=>{
      console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
 
    })
    .catch(err=>{
      console.error('[数据库] [新增记录] 失败：', err)
      wx.showToast({
        icon: 'none',
        title: '新增记录失败'
      })
    })

  },
  overGo: function(){
    this.addHistory()
    setTimeout(()=>{
      wx.navigateBack({
        delta: 100
      })
    },1000)

  },
  rankGo: function(){
    console.log('003');
    let url = '../rank/rank';
    wx.redirectTo({
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
  addRecover: function(){

    let time = util.getTime(new Date());
    const db = wx.cloud.database()
    db.collection('recover').add({
      data: {
        uuid: this.data.uuid,
        today: this.data.today,
        action: '分享',
        time
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      this.addRecover();
      console.log(res.target)
      let questions = this.questions;
      let question = this.data.question;
      let index = question.index;
      let options = question.options;
  
      question.selected = false;
      options.forEach(option=>{
        option.selected = false;
      })
      question.options = options;
      this.questions[index] = question;

      this.setData({
        question,
        showModal: false
      })
    }

    return {
      title: "这份题咋这么难？！不信你看",
      path: "pages/index/index?openid="+app.globalData.openid+'&uuid='+this.data.uuid,
      imageUrl: "http://file.xiaomutong.com.cn/img2020071501.jpg"
    };
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
    .then(res => {
      console.log('[云函数] [login]: ', res)
      let openid = res.result.openid;
      that.setData({
        openid:openid
      },async ()=>{
        const db = wx.cloud.database();
        const res = await db.collection('daily').where({
          _openid: openid,
          today: app.globalData.today
        }).count();
        that.setData({
          total: res.total
        })
        console.log(res);
        if(res.total > 0){
          that.queryDaily(openid);
        }
      });
      
    }).catch(err => {
      console.error('[云函数] [login] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },
  queryDaily: function(openid){
    let that = this;
    const db = wx.cloud.database()
    db.collection('daily')
    .where({
      _openid: openid,
      today: app.globalData.today
    })
    .get()
    .then((res)=>{
      console.log('[数据库] [查询记录] 成功: ', res);

      let items = res.data;
      let maxScore = -1;
      let _id = '';
      items.forEach(item=>{
        if(item.score > maxScore){
          maxScore = item.score;
          _id = item._id;
        }
      })
      
      this.setData({
        _id,
        maxScore
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
  updateDaily: function(time1, time2, score){
    console.log(time1);
    console.log(time2);
    let date1 = new Date(time1.replace(/-/g, '/'));
    let date2 = new Date(time2.replace(/-/g, '/'));

    let difftime = ( Date.parse(date2)- Date.parse(date1) )/1000; //计算时间差,并把毫秒转换成秒
    difftime = Math.abs(difftime);
    
	  let minutes = parseInt(difftime%3600/60); // 分钟 -(day*24) 以60秒为一整份 取余 剩下秒数 秒数/60 就是分钟数
   	let seconds = parseInt(difftime%60);  // 以60秒为一整份 取余 剩下秒数
     
    let ytimes = minutes+':'+seconds;
    const db = wx.cloud.database();
    db.collection('daily').doc(this.data._id).update({
      // data 传入需要局部更新的数据
      data: {
        time1,
        time2,
        score,
        ytimes: ytimes
      }
    })
    .then(res=>{
      console.log('[数据库] [更新记录] 成功: ', res);
    })
    .catch(err=>{
      console.log(err);
      wx.showToast({
        title: '更新异常',
        icon: 'success',
        duration: 2000
      })
    })

  },
  onGetUUID: function() {
    let that = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'getUUID',
      data: {},
      success: res => {
        console.log('[云函数] [getUUID]: ', res)
        that.setData({
          uuid: res.result.uuid
        },()=>{
          wx.hideLoading()
        })
      },
      fail: err => {
        console.error('[云函数] [getUUID] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  }
})