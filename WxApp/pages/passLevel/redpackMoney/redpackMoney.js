// pages/passLevel/redpackMoney/redpackMoney.js
var redWrap = require('../../../services/redWrap.js');
var userServices = require('../../../services/userServices.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.url + '/images/',
    money: '',
    amountMoney: '',
    quantity: '',
    activityId: '',
    index: 9,
    isRandomExtraction: true,
    array: ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
    accountFloat:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this

    app.weToast()
    if (options.activityId) {
      this.setData({
        activityId: options.activityId
      })
    }
    userServices.getBalance().then(function (res) {
      that.setData({
        account: Math.floor(res),
        accountFloat:res
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
  selChance: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  bindMoney: function (e) {
    var money = parseInt(this.trim(e.detail.value));
    var lv = this.data.account > money ? 0 : Math.ceil((money - this.data.account) * 2 / 100);
    this.setData({
      money: money,
      amountMoney: money,
      lv: lv
    })
  },
  bindQua: function (e) {
    var quantity = parseInt(this.trim(e.detail.value));
    this.setData({
      quantity: quantity
    })
  },
  norandom: function () {
    this.setData({
      isRandomExtraction: false
    })
    wx.showToast({
      title: '每个红包金额固定',
      icon: 'none',
      duration: 2000
    })

  },
  random: function () {
    this.setData({
      isRandomExtraction: true
    })
    wx.showToast({
      title: '每个红包金额随机',
      icon: 'none',
      duration: 2000
    })

  },
  pay: function () {
    var that = this;
    this.check(
      that.getPayment
    );
  },

  // 充值红包！！！！！！！！！
  getPayment() {
    var that = this;
    redWrap.rechargeRed(that.data.money, that.data.quantity, that.data.isRandomExtraction, parseInt(that.data.array[that.data.index]) / 100, that.data.activityId, '').then(function (res) {
      if (res.orderNumber==0){
        wx.navigateTo({
          url: '/pages/passLevel/redpackSet/redpackSet?activityId=' + that.data.activityId,
        })
      }else{
      wx.requestPayment({
        'timeStamp': res.wxPayData.timeStamp,
        'nonceStr': res.wxPayData.nonceStr,
        'package': res.wxPayData.package,
        'signType': 'MD5',
        'paySign': res.wxPayData.paySign,
        'success': function (res) {
          wx.showLoading({
            title: '加载中',
          })

          setTimeout(function () {
            wx.navigateTo({
              url: '/pages/passLevel/redpackSet/redpackSet?activityId=' + that.data.activityId,
            })
          }, 1000)

        },
        'fail': function (res) {

        }
      })
      }

    }).catch(function (res) {
      wx.showToast({
        title: res,
        icon: 'none',
        duration: 1000
      })
    })
    

  },
  check(callback) {
    if (this.data.amountMoney == '' || !this.data.amountMoney) {

      wx.showToast({
        title: '请输入红包总金额',
        icon: 'none',
        duration: 1000
      })

      return
    } else if (!this.data.quantity || this.data.quantity == '') {

      wx.showToast({
        title: '请输入红包个数',
        icon: 'none',
        duration: 1000
      })
      return
    } else if (this.data.money / this.data.quantity < 1) {

      wx.showToast({
        title: '单个红包金额不能低于1元',
        icon: 'none',
        duration: 2000
      })
      return
    } else if (this.data.money / this.data.quantity > 200) {

      wx.showToast({
        title: '单个红包金额不能大于200元',
        icon: 'none',
        duration: 2000
      })
      return
    } else if (this.data.quantity > 1000) {

      wx.showToast({
        title: '单个红包金额不能超过1000个',
        icon: 'none',
        duration: 2000
      })
      return
    } else {
      callback();
    }
  },
  trim(s) {
    return s.replace(/(^\s*)|(\s*$)/g, "");
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
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})