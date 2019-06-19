// pages/passLevel/passFail/passFail.js
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
    url: app.globalData.url + '/images/',
    imgUrl: "/images/share.png",
    redShow: true,
    groupGId: "",


    result: [],
    userInfo: [],
    items: [],
    nickName: '',
    avatarUrl: '',
    sessionId: "",
    groupGId: "",
    openGId: "",
    groupMoreWord: "加载全部",
    isMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;
    var imgUrl = that.data.imgUrl;

    that.setData({
      shortUrl: options.shortUrl ? options.shortUrl : "",
      joinId: options.join ? options.join : "",
      rank: options.rank ? options.rank : '',
      costTime: options.costTime ? options.costTime : '',
      groupGId: options.groupGId ? options.groupGId : ''
    });

    wx.showShareMenu({
      // 要求小程序返回分享目标信息
      withShareTicket: true
    });


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

    redWrap.isHongBao(options.shortUrl).then(function (res) {
      if (!res) {
        imgUrl = "/images/share.png";
      } else {
        imgUrl = "/images/share-red.png";
      }
      that.setData({
        imgUrl: imgUrl
      })
    });


    redWrap.myScoreTimes(options.shortUrl).then(function (res) {
      if (res) {
        that.setData({
          redShow: false
        })
      }
    });

    if (!app.globalData.userInfo) {
      wx.getUserInfo({
        success: function (res) {
          var userInfo = res.userInfo
          var nickName = userInfo.nickName
          var avatarUrl = userInfo.avatarUrl
          that.setData({
            nickName: nickName,
            avatarUrl: avatarUrl
          })
        },
        fail: function (res) {
          that.setData({
            nickName: '',
            avatarUrl: null
          })
        }
      })
    } else {
      var userInfo = app.globalData.userInfo
      var nickName = userInfo.nickName
      var avatarUrl = userInfo.avatarUrl
      that.setData({
        nickName: nickName,
        avatarUrl: avatarUrl
      })
    }


    if (wx.getStorageSync("shareTicket")) {
      wx.getShareInfo({
        shareTicket: wx.getStorageSync("shareTicket"),
        success(res) {
          userServices.queryGroupId(that.data.sessionId, res.iv, res.encryptedData).then(function (res) {
            that.setData({
              groupGId: res.openGId,
              openGId: res.openGId
            });
            that.getScoreRankEvent(options.shortUrl, nickName, avatarUrl, that.data.openGId);
          });
        }
      })
    }
  },
  /**
* 请求获取群排名/总排名
*/
  getScoreRankEvent: function (shortUrl, nickName, avatarUrl, openGId) {
    var that = this;
    var result = that.data.result;

    questionnaireService.getScoreRank(shortUrl, encodeURIComponent(nickName), encodeURIComponent(avatarUrl), openGId).then(function (res) {
      for (var index in res.scoreRanks) {
        result.push(that.deepCopy(res.scoreRanks[index]));
      }

      var resultLoad = result.splice(0, 6); //第一次加载进来最多显示6条数据

      that.setData({
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
   * 点击加载更多
   */
  groupMoreEvent: function () {
    var that = this;
    var result = that.data.result;
    var items = that.data.items;

    if (result.length > 0) {
      var resultLoad = result.splice(0, 10);

      for (var i = 0; i < resultLoad.length; i++) {
        items.push(resultLoad[i]);
      }
      that.setData({
        result: result,
        items: items
      });
    } else {
      if (!that.data.isMore) {
        that.setData({
          groupMoreWord: "已加载全部"
        })
        that.data.isMore = true;
      }
    }
  },
  lookRank: function () {
    wx.navigateTo({
      url: '/pages/passLevel/rank/rank?shortUrl=' + this.data.shortUrl,
    })
  },
  nextTime: function () {
    wx.redirectTo({
      url: '/pages/passLevel/passShow/passShow?shortUrl=' + this.data.shortUrl
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
    var that = this;
    if (that.data.shortUrl) {
      questionnaireService.getQuestionnaireViaShortUrl(that.data.shortUrl).then(function (survey) {
        that.setData({
          title: survey.name
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  share: function (e) {
    if (e.target.dataset.status !== 1) {
      wx.showToast({
        title: '您还没有发布不能分享，请先发布',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onShareAppMessage: function (res) {
    var that = this;


    var name = app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : '';

    return {
      title: name + '邀请您参与：' + that.data.title,
      path: '/pages/passLevel/passShow/passShow?shortUrl=' + that.data.shortUrl,
      imageUrl: this.data.imgUrl,
      success: function (res) {

      },
      fail: function (res) {
        // 转发失败
      }
    }


  }
})