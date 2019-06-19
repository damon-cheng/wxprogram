// pages/passLevel/redpackState/redpackState.js
var redWrap = require('../../../services/redWrap.js');
const utils = require('../../../utils/util.js'); 
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.url + '/images/',
    activityId:'',
    status:'',
    showPage:false,
    pageIndex:1,
    pageSize:20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.activityId) {
      this.setData({
        activityId: options.activityId,
        status:options.status
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    redWrap.getExtraction(that.data.activityId, that.data.status, that.data.pageIndex, that.data.pageSize).then(function (res) {
      if(res.length>0){
        res.forEach(function (v, i) {
          v.awardDate = utils.newformatTime(new Date(v.awardDate))
        })
      }
      
      that.setData({
        items: res,
        showPage: true
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  granted:function(){
    this.setData({
      status:1
    })
    var that = this;
    redWrap.getExtraction(that.data.activityId, 1, that.data.pageIndex, that.data.pageSize).then(function (res) {
      if (res.length > 0) {
        res.forEach(function (v, i) {
          v.awardDate = utils.newformatTime(new Date(v.awardDate))
        })
      }

      that.setData({
        items: res,
        showPage: true
      })
    })
  },
  nogrant: function () {
    this.setData({
      status: 0
    })
    var that = this;
    redWrap.getExtraction(that.data.activityId, 0, that.data.pageIndex, that.data.pageSize).then(function (res) {
      if (res.length > 0) {
        res.forEach(function (v, i) {
          v.awardDate = utils.newformatTime(new Date(v.awardDate))
        })
      }

      that.setData({
        items: res,
        showPage: true
      })
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
    wx.showNavigationBarLoading();
    var that = this;
    this.setData({ pageIndex: 1 });
    redWrap.getExtraction(that.data.activityId, that.data.status, 1, that.data.pageSize).then(function (res) {
      wx.showNavigationBarLoading();
      that.setData({
        items: res,
      })
      wx.hideNavigationBarLoading();
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadMore();
  },
  loadMore: function () {

    var that = this;
    redWrap.getExtraction(that.data.activityId, that.data.status, that.data.pageIndex + 1, that.data.pageSize).then(function (res) {
      var items = that.data.items;
      if (res.length > 0) {
        for (var i = 0; i < res.length; i++) {
          items.push(res[i]);
        }

        that.setData({ items: items, pageIndex: that.data.pageIndex + 1 });
      } else {
        setTimeout(function () {
          wx.showToast({
            title: '已经加载到最后一页',
            icon:'none',
            duration:1000
          })
         
        }, 1500);

      }

    })

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})