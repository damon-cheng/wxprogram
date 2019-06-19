var util = require('../../../utils/util.js')
var userServices = require('../../../services/userServices.js');
var wxRequest = require('../../../services/wxlogin.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    code: "获取验证码",
    timeLimit: 60,
    againStyle: "",
    intervalJudge: true,
    mobileNum: null,
    codeNum: null,
    stampCode: "",
    sessionId: ""
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
   * 自动获取手机号码
   */
  getPhoneNumber(e) {
    var that = this;

    that.getSessionId(); 

    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {

    } else {
      userServices.getAutoMobileFn(that.data.sessionId, e.detail.encryptedData, e.detail.iv).then(function (res) {
        that.setData({
          mobileNum: res.purePhoneNumber
        });
        
      })
    }
  },
  /**
   * 获取验证码
   */
  getCode: function (e) {
    var that = this;
    var mobileNum = that.data.mobileNum;
    var timeLimit = that.data.timeLimit;
    var firstTime = new Date();
    var firstStamp = Date.parse(firstTime) + '';
    var code = that.data.code;
    var againStyle = that.data.againStyle;
    var intervalJudge = that.data.intervalJudge;
    var LeftTime = null;


    if (!mobileNum || mobileNum.length == 0) {
      wx.showToast({
        title: '请输入手机号！',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    if (mobileNum.length != 11) {
      wx.showToast({
        title: '手机号长度有误！',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!myreg.test(mobileNum)) {
      wx.showToast({
        title: '手机号有误！',
        icon: 'none',
        duration: 1500
      })
      return false;
    }

    if (that.data.intervalJudge) {
      intervalJudge = false;
      that.setData({
        stampCode: firstStamp,
        intervalJudge: intervalJudge
      });

      var getCodeFn = setInterval(function () {
        var curTime = new Date();
        var total = parseInt((curTime - firstTime) / 1000);
        LeftTime = timeLimit - total;
        againStyle = "color: #d6d6db";

        if (LeftTime <= 0) {
          intervalJudge = true;
          clearInterval(getCodeFn);
        }

        code = LeftTime;

        that.setData({
          code: code + " 秒后重新发送",
          againStyle: againStyle,
          intervalJudge: intervalJudge
        });

        if (LeftTime === 0) {
          that.setData({
            code: "获取验证码",
            againStyle: "color: #1ea0fa"
          });
        }
      }, 1000);

      userServices.getCodeNumFn(mobileNum, firstStamp).then(function (res) {
        if (res) {
          wx.showToast({
            title: '短信已发送！',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '请重新获取！',
            icon: 'none',
            duration: 2000
          })
        }
      }).catch(function (res) {
        wx.showToast({
          title: res,
          icon: 'none',
          duration: 2000
        })
      });

    }
  },
  /**
   * 点击绑定按钮，开始绑定手机号码
   */
  formSubmit: function (e) {
    var that = this;
    var mobileNum = that.data.mobileNum;
    var codeNum = that.data.codeNum;

    if (!mobileNum || mobileNum.length == 0) {
      wx.showToast({
        title: '请输入手机号！',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    if (mobileNum.length != 11) {
      wx.showToast({
        title: '手机号长度有误！',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!myreg.test(mobileNum)) {
      wx.showToast({
        title: '手机号有误！',
        icon: 'none',
        duration: 1500
      })
      return false;
    }

    if (!codeNum) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 1500
      })
      return false;
    } else {
      userServices.bindMobileFn(codeNum, mobileNum).then(function () {
        wx.showToast({
          title: '绑定成功',
          icon: 'none',
          duration: 1000
        });
        setTimeout(function () {
          wx.navigateBack();
        }, 2000);

      }).catch(function (res) {
        wx.showToast({
          title: res,
          icon: 'none',
          duration: 1000
        });
      })
    }
  },
  /**
   * 绑定输入手机号码
   */
  changeMobile: function (e) {
    var that = this;
    that.setData({
      mobileNum: e.detail.value
    });
  },
  /**
   * 绑定输入验证码
   */
  changeCode: function (e) {
    var that = this;
    that.setData({
      codeNum: e.detail.value
    });
  },
  getSessionId() {
    var that = this;
    var openId = wx.getStorageSync('openId') || '';
    if (openId && openId.length > 0) {
      var expireTimeStamp = openId.split(":")[1];
      var timestamp = new Date().getTime();
      if (timestamp > expireTimeStamp) {
        openId = "",
          wx.removeStorageSync("openId");
      } else {
        openId = openId.split(":")[0];
        that.setData({
          sessionId: openId
        });
      }
    }

    if (!openId) {
      wxRequest.wxLogin().then(function (res) {
        return wxRequest.getWxAuthrize(res.code);
      }).then(function (res) {
        that.setData({
          sessionId: res.data
        });
      })
    }
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

  }
})