var redWrap = require('../../../services/redWrap.js');
var questionnaireService = require('../../../services/questionnaireService.js');
var userServices = require('../../../services/userServices.js');
var wxRequest = require('../../../services/wxlogin.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {},
    sessionId: "",
    groupGId: "",
    openGId: "",
    selected1: true,
    selected2: false,
    result: [],
    imgUrl: "/images/share.png",
    url: app.globalData.url + '/images/',
    userInfo: [],
    items: [],
    nickName: '',
    avatarUrl: '',
    showPage: false,
    openStatus: null, //openStatus字段   null是未申请。 0：正在审核 1:审核通过 2:审核退出 3:审核失败
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var imgUrl = that.data.imgUrl;

    var items = that.data.items;

    wx.showShareMenu({
      // 要求小程序返回分享目标信息
      withShareTicket: true
    });

    if (options.shortUrl) {
      that.setData({
        shortUrl: options.shortUrl,
      })
    }

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

    app.weToast();

    if (!app.globalData.userInfo) {
      that.setData({
        options: options
      })
      that.toLogin();
      return false;
    } else {
      var userInfo = app.globalData.userInfo
      var nickName = userInfo.nickName
      var avatarUrl = userInfo.avatarUrl
      that.setData({
        nickName: nickName,
        avatarUrl: avatarUrl
      })
    }
    

    redWrap.isHongBao(that.data.shortUrl).then(function (res) {
      if (!res) {
        imgUrl = "/images/share.png";
      } else {
        imgUrl = "/images/share-red.png";
      }
      that.setData({
        imgUrl: imgUrl
      })
    });
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    var that = this;
    var userInfo = app.globalData.userInfo;

    // 后台解密，获取 openGId
    if (that.data.shortUrl && userInfo) {
      if (wx.getStorageSync("shareTicket")) {
        wx.getShareInfo({
          shareTicket: wx.getStorageSync("shareTicket"),
          success(res) {
            userServices.queryGroupId(that.data.sessionId, res.iv, res.encryptedData).then(function (res) {
              that.setData({
                groupGId: res.openGId,
                openGId: res.openGId
              });
              that.getScoreRankEvent(that.data.shortUrl, userInfo.nickName, userInfo.avatarUrl, that.data.openGId);
            });
          }
        })
      } else {
        that.getScoreRankEvent(that.data.shortUrl, userInfo.nickName, userInfo.avatarUrl, "");
      }
    }
  },
  /**
   * 清空排行
   */
  delData: function () {
    var that = this;

    if (that.data.openStatus == 1) {
      wx.showToast({
        title: '此闯关已加入闯关广场，不允许清空排行榜！',
        icon: "none",
        duration: 2000
      });
      return false;
    }

    wx.showModal({
      title: '提示',
      content: '确认清空数据',
      success: function (res) {

        if (res.confirm) {
          redWrap.scoreRankDel(that.data.shortUrl).then(function (res) {
            that.setData({
              items: []
            })
          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  /**
   * 点击切换
   */
  groupRankEvent: function () {
    var that = this;
    var result = that.data.result;

    that.setData({
      selected1: true,
      selected2: false,
      groupGId: that.data.openGId
    });
    that.getScoreRankEvent(that.data.shortUrl, that.data.nickName, that.data.avatarUrl, that.data.openGId);
  },
  totalRankEvent: function () {
    var that = this;
    var result = that.data.result;

    that.setData({
      selected1: false,
      selected2: true,
      groupGId: ""
    });
    that.getScoreRankEvent(that.data.shortUrl, that.data.nickName, that.data.avatarUrl, "");
  },
  /**
   * 深复制
   */
  deepCopy: function (obj) {
    var that = this;
    if (typeof obj != 'object') {
      return obj;
    }
    var newobj = {};
    for (var attr in obj) {
      if (attr == "items") {
        newobj[attr] = [];
        for (var i = 0; i < obj[attr].length; i++) {
          newobj[attr].push(that.deepCopy(obj[attr][i]));
        }
      }
      else {
        newobj[attr] = that.deepCopy(obj[attr]);
      }
    }
    return newobj;
  },
  /**
   * 请求获取群排名/总排名
   */
  getScoreRankEvent: function (shortUrl, nickName, avatarUrl, openGId) {
    var that = this;
    var result = that.data.result;

    questionnaireService.getScoreRank(shortUrl, encodeURIComponent(nickName), encodeURIComponent(avatarUrl), openGId).then(function (res) {
      result.length = 0;
      for (var index in res.scoreRanks) {
        result.push(that.deepCopy(res.scoreRanks[index]));
      }

      var resultLoad = res.scoreRanks.slice(0, 20); //加载进来最多显示二十条数据

      that.setData({
        nickName: nickName,
        avatarUrl: avatarUrl,
        myMessage: res.myMessage,
        myRank: res.myRank,
        myScore: res.myScore,
        myCostTime: res.myCostTime,
        title: res.title,
        items: resultLoad,
        showPage: true,
        isCanPublish: res.isCanPublish ? res.isCanPublish : '',
        result: result,
        openStatus: res.openStatus
      });
    });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var result = that.data.result;
    var items = that.data.items;

    if (result.length > 0) {
      var resultLoad = result.splice(0, 20);

      for (var i = 0; i < resultLoad.length; i++) {
        items.push(resultLoad[i]);
      }
      that.setData({
        result: result,
        items: items
      });
    } else {
      wx.showToast({
        title: '没有更多数据',
        icon: 'none',
        duration: 1000
      })
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;

    if (res.from === 'button') {
      var name = app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : '';
      return {
        title: name + '邀请您参与：' + this.data.title,
        path: '/pages/passLevel/passShow/passShow?shortUrl=' + this.data.shortUrl,
        imageUrl: this.data.imgUrl,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    } else {
      return {
        title: this.data.title + "-排行榜",
        path: '/pages/passLevel/rank/rank?shortUrl=' + this.data.shortUrl,
        imageUrl: this.data.imgUrl,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    }
  },
  /**
   * 跳转到登录页
   */
  toLogin() {
    // 前往授权登录界面
    wx.navigateTo({
      url: '/pages/passLevel/authorizedLoginPage/authorizedLoginPage',
    })
  }
})

