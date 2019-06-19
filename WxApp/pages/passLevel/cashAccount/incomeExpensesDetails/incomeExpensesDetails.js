// pages/passLevel/cashAccount/incomeExpensesDetails/incomeExpensesDetails.js
var util = require('../../../../utils/util.js')
var userServices = require('../../../../services/userServices.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1,
    pageSize: 20,
    items: []
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
    var that = this,
        items = that.data.items;

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

    userServices.getDetails(that.data.pageIndex, that.data.pageSize).then(function (res) {
      if (res.length > 0) {
        items = res;

        items.forEach(function (value, index) {
          value["createTime"] = formatDateTime(new Date(value.createTime));
          switch (value.type) {
            case 1: value.title = "充值";
              break;
            case 2: value.title = "购买红包";
              break;
            case 3: value.title = "红包退款";
              break;
            case 4: value.title = "领取红包";
              break;
            case 5: value.title = "提现";
              break;
            case 6: value.title = "提现手续费";
              break;
            case 7: value.title = "提现失败,请重新提现";
              break;
            case 8: value.title = "红包手续费";
          }

          switch (value.type) {
            case 3: value.message = "退款成功";
              break;
            case 4: value.message = "领取成功";
              break;
            case 5: value.message = "提现成功";
              break;
            case 6: value.message = "";
              break;
            case 7: value.message = "提现失败";
            default: 
            value.message = "";
          }

          if (value.type === 7) {
            value.failStyle = "color: #ff0000";
          }
          if (value.amount > 0) {
            value.amountStyle = "color: #2fc202";
          }
        });
        that.setData({
          items: items
        });
      }
    });
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

    userServices.getDetails(that.data.pageIndex + 1, that.data.pageSize).then(function (res) {

      if (res.length > 0) {
        for (var i = 0; i < res.length; i++) {
          items.push(res[i]);
        }

        that.setData({
          items: items,
          pageIndex: that.data.pageIndex + 1
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})