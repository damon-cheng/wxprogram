// pages/passLevel/cashAccount/myAccount/myAccount.js
var util = require('../../../../utils/util.js')
var userServices = require('../../../../services/userServices.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: true,
    fee: 0.02, //手续费率
    //amount: 0, //输入的提现金额
    // isProcessed: true, //是输入的提现金额
    balance: 0, //我的账户余额
    defaultPrompt: "余额大于等于1元才允许提现",
    fixedPrompt: "提现金额将在三十分钟左右打到您微信零钱当中",
    propmtStyle: ""
  },
  /**  
   * 输入金额事件
   */
  // getAmountTrigger: function (e) {
  //   var that = this;
    
  //   that.checkAccount(e.detail.value);
  // },
  /**  
   * 全部提现 10200x = 10000y
   */
  // allbalanceTrigger: function() {
  //   var that = this;
  //   var allBalance = that.data.balance;
  //   that.data.disabled = false;
  //   var value = ((10000 * allBalance) / 10200).toFixed(2);
    
  //   if (value >= 1) {//大于1元才允许提现
  //     that.setData({
  //       allBalance: value,
  //       disabled: that.data.disabled,
  //       isProcessed: false
  //     });
  //     that.checkAccount(value);
  //   }else {
  //     wx.showToast({
  //       title: "提现金额必须大于1元",
  //       icon: "none",
  //       duration: 1000
  //     });
  //   }
    
  // },
  /**  
   * 检查输入的提现金额
   */
  // checkAccount: function(value) { 
  //   var that = this;
  //   if (/^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/.test(value)) {  
  //     //大于0的正数
  //     if (value > that.data.balance) {
  //       that.data.defaultPrompt = "输入金额超过现金余额";
  //       that.data.propmtStyle = "color: #ff0000";
  //       that.data.disabled = true;//不可用
  //     } else if (value < 1) {
  //       wx.showToast({
  //         title: "提现金额小于1元",
  //         icon: "none",
  //         duration: 2000
  //       });
  //       that.data.disabled = true;//不可用
  //     } else {
  //       // that.data.defaultPrompt = "额外扣除￥" + ((value * 10000 * that.data.fee) / 10000).toFixed(2) + "手续费（费率2%）";
  //       that.data.defaultPrompt = "提现需扣除余额2%的手续费（￥"+ payFee +"）";
  //       that.data.disabled = false;//可用
  //       that.data.propmtStyle = "";
  //     }
      
  //   }
  //   if (value.length === 0) { //清空输入金额时
  //     that.data.defaultPrompt = "提现收2%手续费";
  //     that.data.disabled = true;//不可用
  //     that.data.propmtStyle = "";
  //   }
  //   that.setData({
  //     disabled: that.data.disabled,
  //     amount: value,
  //     defaultPrompt: that.data.defaultPrompt,
  //     propmtStyle: that.data.propmtStyle
  //   });
  // },
  /**
   * 提交提现 
   */
  submitBalanceTrigger: function() {
      var that = this;
          
      userServices.getWithDraw().then(function(res) {
        wx.showToast({
          title: "提现成功！",
          icon: "none",
          duration: 1000
        });
        setTimeout(function () {
          wx.navigateBack();
        }, 2000);
      }).catch(function (res) {
        wx.showToast({
          title: res,
          icon: "none",
          duration: 1000
        });
      });
  },
  /**
   * 进入收支明细
   */
  incomeExpensesDetails: function() {
    wx.navigateTo({
      url: '/pages/passLevel/cashAccount/incomeExpensesDetails/incomeExpensesDetails'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this,
      balance = that.data.balance,
      disabled = that.data.disabled,
      defaultPrompt = that.data.defaultPrompt,
      balance = that.data.balance,
      fee = that.data.fee;

    userServices.getBalance().then(function (res) {

      balance = res;
      if (balance >= 1) {
        var allBalance = balance;
        disabled = false;
      }
      // if (balance >= 1) {
      //    disabled = false;
      //    var payFee = ((balance * fee * 10000) / 10000).toFixed(2); //手续费
      //    var allBalance = (balance * 100 - payFee * 100)/100; //可提现金额
      //    defaultPrompt = "提现需扣除余额2%的手续费（￥" + payFee + "）";
      // } else if (balance >= 1) {  //不收手续费
      //   defaultPrompt = "";
      //   disabled = false;
      //   var allBalance = balance;
      // }
      that.setData({
        // payFee: payFee,
        allBalance: allBalance,
        // defaultPrompt: defaultPrompt,
        disabled: disabled,
        balance: balance
      });
    });
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
    var that = this;
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

  }

})