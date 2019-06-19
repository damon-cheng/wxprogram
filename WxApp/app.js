//app.js
var wxlogin = require('services/wxlogin.js');
let { WeToast } = require('lib/wetoast/wetoast.js');
var config = require("services/config").config;


App({
  weToast: WeToast,
  onLaunch: function () {

  },
  onShow: function (options) {
    if (options.scene == 1044) {
      wx.setStorageSync("shareTicket", options.shareTicket);
    } else {
      wx.removeStorageSync("shareTicket");
    }

    let that = this;
    wx.getSystemInfo({
      success: res => {
        let modelmes = res.model;
        if (modelmes.search('iPhone X') != -1) {
          that.globalData.isIphoneX = true
        }
      }
    })
  },
  globalData: {
    isIphoneX: false,
    userInfo: null,
    url: config.imgCDNServer,
  }
})

