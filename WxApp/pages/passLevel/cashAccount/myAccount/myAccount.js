// pages/passLevel/cashAccount/myAccount/myAccount.js
var util = require('../../../../utils/util.js')
var userServices = require('../../../../services/userServices.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // isIncomeExpensesDetails: 0,
    balance: 0,
    pageIndex: 1,
    pageSize: 20,
    items: [],
    userInfo: [],
    nickName: '',
    avatarUrl: '',
    gender: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
      
    // if (!app.globalData.userInfo) {
    //   wx.getUserInfo({
    //     success: function (res) {
    //       var userInfo = res.userInfo;
    //       var nickName = userInfo.nickName;
    //       var avatarUrl = userInfo.avatarUrl;
    //       var gender = userInfo.gender;
    //       that.setData({
    //         nickName: nickName,
    //         avatarUrl: avatarUrl,
    //         gender: gender
    //       })
    //     },
    //     fail: function (res) {
    //       that.setData({
    //         nickName: '',
    //         avatarUrl: null,
    //         gender: null
    //       })
    //     }
    //   })
    // } else {
    //   var userInfo = app.globalData.userInfo;
    //   var nickName = userInfo.nickName;
    //   var avatarUrl = userInfo.avatarUrl;
    //   var gender = userInfo.gender;
    //   that.setData({
    //     nickName: nickName,
    //     avatarUrl: avatarUrl,
    //     gender: gender
    //   })
    // }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this,
      items = that.data.items,
      balance = that.data.balance;

    that.setData({
      items: [],
      pageIndex: 1
    });

    if (app.globalData.userInfo) {
      var userInfo = app.globalData.userInfo;
      var nickName = userInfo.nickName;
      var avatarUrl = userInfo.avatarUrl;
      var gender = userInfo.gender;
      that.setData({
        nickName: nickName,
        avatarUrl: avatarUrl,
        gender: gender
      })
    }

    wx.removeStorageSync("editBank");
    var formatDateTime = function (date) {
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      m = m < 10 ? ('0' + m) : m;
      var d = date.getDate();
      d = d < 10 ? ('0' + d) : d;
      var h = date.getHours();
      var minute = date.getMinutes();
      return y + "-" + m + "-" + d + " " + h + ":" + minute;
    };

    
    userServices.getBalance().then(function (res) {
      balance = res;
      that.setData({
        balance: balance
      });
    });

    // userServices.getIncomeExpensesDetails().then(function(res) {
    //   if (res > 0) {
    //     that.setData({
    //       isIncomeExpensesDetails: 1
    //     });
    //   }
    // });

    userServices.getJoinRecord(that.data.pageIndex, that.data.pageSize).then(function (res) {
      if (res.length > 0) {
        items = res;

        items.forEach(function (value, index) {
          value["createTime"] = formatDateTime(new Date(value.createTime));
        });
        that.setData({
          items: items
        });
      }
    });
  },
  /**
   * 跳转排行榜
   */
  jumpRankTrigger: function(e) {
    var that = this;
    var id = parseInt(e.currentTarget.id);
    
    var shortUrl = that.data.items[id].shortUrl;
    wx.navigateTo({
      url: '../../rank/rank?shortUrl=' + shortUrl
    })
  },
  /**
   * 进入收支明细
   */
  incomeExpensesDetails: function () {
    wx.navigateTo({
      url: '/pages/passLevel/cashAccount/incomeExpensesDetails/incomeExpensesDetails'
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this,
      items = that.data.items;

    userServices.getJoinRecord(that.data.pageIndex + 1, that.data.pageSize).then(function (res) {

      if (res.length > 0) {
        for (var i = 0; i < res.length; i++) {
          items.push(res[i]);
        }

        that.setData({
          items: items,
          pageIndex:  that.data.pageIndex + 1
        });
      } else {
        wx.showToast({
          title: '已经加载到最后一页',
          icon: 'none',
          duration: 2000
        })
      }
    });
  },

  widhDrawTrigger: function () {
    wx.navigateTo({
      url: '/pages/passLevel/cashAccount/balanceWithdraw/balanceWithdraw'
    })
  },
  onGotUserInfo(e) {
    var that = this;
    if (!app.globalData.userInfo) {
      if (e.detail.errMsg == "getUserInfo:ok") {
        app.globalData.userInfo = e.detail.userInfo;
        that.widhDrawTrigger();
      } else {
        wx.showToast({
          title: '授权后才可以提现',
          icon: "none",
          duration: 1000
        })
      }
    } else {
      that.widhDrawTrigger();
    }
  }
})