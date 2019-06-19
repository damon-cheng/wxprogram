// pages/passLevel/transferWx/transferWx.js
var util = require('../../../utils/util.js');
var questionnaireService = require('../../../services/questionnaireService.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isExpired: false
  },
  /**
   * 确认复制
   */
  synchroToWxEvent() {
    var that = this;
    var activityId = that.data.activityId;
    var title = that.data.title;
    var description = "";
    questionnaireService.synchroToWx(activityId, title, description).then(function (res) {
      wx.setStorageSync("addSuvery", true);
      wx.showToast({
        title: '复制成功',
        icon: "success",
        duration: 2000,
        success: function () {
          setTimeout(function () {
            wx.switchTab({
              url: '/pages/passLevel/index',
            })
          }, 2000)
        }
      });
    }).catch(function () {
      wx.showToast({
        title: '复制失败',
        icon: "none",
        duration: 1500
      })
    })
  },
  cancelEvent() {
    wx.switchTab({
      url: '/pages/passLevel/index',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    app.weToast();

    that.setData({
      activityId: options.activityId ? options.activityId : "",
      title: options.title ? options.title : "",
      qcount: options.qcount ? options.qcount : "",
      ts: options.ts ? parseInt(options.ts) + 5 * 60: ""
    });

    var timestamp = new Date().getTime();
    if (timestamp > that.data.ts) {
      that.setData({
        isExpired: true
      });
    }
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

  }
})