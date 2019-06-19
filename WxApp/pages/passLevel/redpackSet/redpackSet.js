// pages/passLevel/redpackSet/redpackSet.js

var redWrap = require('../../../services/redWrap.js');
var userServices = require('../../../services/userServices.js');
var questionnaireService = require('../../../services/questionnaireService.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.url + '/images/',
    items: [],
    pageIndex: 1,
    pageSize: 20,
    activityId: '',
    showPage: false,
    openStatus: null, //openStatus字段   null是未申请。 0：正在审核 1:审核通过 2:审核退出 3:审核失败
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    if (options.activityId) {
      this.setData({
        activityId: options.activityId
      })
    }

    questionnaireService.getQuestionnaire(that.data.activityId).then(function (res) {
      that.setData({
        openStatus: res.openStatus
      });
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    redWrap.getRedPack(that.data.activityId).then(function (res) {
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
  addRed: function () {
    wx.navigateTo({
      url: '/pages/passLevel/redpackMoney/redpackMoney?activityId=' + this.data.activityId,
    })
  },
  returnMoney: function (e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '剩余红包数量将会清零，剩余金额会退还到您的账户余额中。是否确认?',
      success: function (res) {
        if (res.confirm) {
          var orderNum = e.currentTarget.dataset.ordernum;
          redWrap.returnMoney(orderNum).then(function (res) {
            that.onReady()
          })
        }
      }
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
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  }
})