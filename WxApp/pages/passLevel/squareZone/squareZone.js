var util = require('../../../utils/util.js');
var config = require("../../../services/config").config;
var questionnaireService = require('../../../services/questionnaireService.js');
var userServices = require('../../../services/userServices.js');
var redWrap = require('../../../services/redWrap.js');
var app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [],
    pageIndex: 1,
    pageSize: 5,
    shortenUrl: "",
    isUnsubscribe: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    if (options.notify == 1) {
      that.setData({
        isUnsubscribe: true
      });
    }

    questionnaireService.getHallList().then(function (res) {
      if (res.length > 0) {
        that.setData({
          items: res,
          shortenUrl: res.shortenUrl
        });
      }
    });
  },

  /**
   * 点击参与按钮参与
   */
  joinCgZoneEvent: function (e) {
    var that = this;
    var shortenUrl = e.currentTarget.id;

    wx.navigateTo({
      url: '/pages/passLevel/passShow/passShow?shortUrl=' + shortenUrl
    });
  },

  /**
  * 退订按钮
  */
  unsubscribeEvent: function () {
    var that = this;

    wx.showModal({
      title: '退订',
      content: '',
      success: function (res) {
        if (res.confirm) {
          questionnaireService.unsubscribeLink().then(function (res) {
            wx.showToast({
              title: '退订成功',
              icon: "success",
              duration: 2000
            })
          })
        }
      }
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
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom: function () {
  //   var that = this,
  //     items = that.data.items;


  //   wx.showNavigationBarLoading()
  //   questionnaireService.getHallList(that.data.pageIndex + 1, that.data.pageSize).then(function (res) {
  //     wx.hideNavigationBarLoading();
  //     if (res.length > 0) {
  //       res.forEach(function (value, index) {
  //         items.push(res[index]);
  //       })

  //       that.setData({
  //         items: items,
  //         pageIndex: that.data.pageIndex + 1
  //       });
  //     } else {
  //       wx.showToast({
  //         title: '已经加载到最后一页',
  //         icon: 'none',
  //         duration: 2000
  //       })
  //     }
  //   });
  // },

})