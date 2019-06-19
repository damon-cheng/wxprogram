// pages/passLevel/bankCategory/bankCategory.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 选择综合
   */
  comprehensiveTrigger: function() {
    wx.setStorage({
      key: "refId",
      data: "1"
    });
    wx.switchTab({
      url: '../chooseCheckPoints/chooseCheckPoints',
    });
  },
  historyTrigger: function () {
    wx.setStorage({
      key: "refId",
      data: "2"
    });
    wx.switchTab({
      url: '../chooseCheckPoints/chooseCheckPoints',
    });
  },
  geographyTrigger: function () {
    wx.setStorage({
      key: "refId",
      data: "3"
    });
    wx.switchTab({
      url: '../chooseCheckPoints/chooseCheckPoints',
    });
  },
  literaryTrigger: function () {
    wx.setStorage({
      key: "refId",
      data: "7"
    });
    wx.switchTab({
      url: '../chooseCheckPoints/chooseCheckPoints',
    });
  },
  brainTrigger: function () {
    wx.setStorage({
      key: "refId",
      data: "4"
    });
    wx.switchTab({
      url: '../chooseCheckPoints/chooseCheckPoints',
    });
  },
  televisionTrigger: function () {
    wx.setStorage({
      key: "refId",
      data: "5"
    });
    wx.switchTab({
      url: '../chooseCheckPoints/chooseCheckPoints',
    });
  },
  sportsTrigger: function () {
    wx.setStorage({
      key: "refId",
      data: "6"
    });
    wx.switchTab({
      url: '../chooseCheckPoints/chooseCheckPoints',
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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