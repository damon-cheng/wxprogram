// pages/passLevel/passShow/passShow.js
var util = require('../../../utils/util.js');
var questionnaireService = require('../../../services/questionnaireService.js');
var userServices = require('../../../services/userServices.js');
var redWrap = require('../../../services/redWrap.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupGId: "",
    sessionId: "",
    isPreview: null, //是否是预览模式
    statusStart: true, //开始答题
    statusRank: true, //查看排行榜
    checkCg: true, //我也要发起闯关
    status: 0,
    imgUrl: "/images/share.png",
    url: app.globalData.url + '/images/',
    timeExpired: "",
    tip: "",
    isCanPulish: false,
    title: "",
    description: "",
    hiddenState: true,
    shortUrl: 0,
    questions: [],
    qtype: 6,
    isExtractQuestionRandom: false, //题目随机
    isChoiceRandom: false, //选项随机
    extractQuestionNumber: 0, //随机抽几道
    show: false,
    hide: true,
    currentID: 1,
    costTime: 0,
    joinId: 0,
    startTime: null,
    endTime: null,
    curTotal: 1,
    shortUrl: '',
    rank: 0,
    maxAnswerTime: 0,
    maxCgTime: 10,
    secondsLimit: 0,
    round1Style: "",
    round2Style: "",
    firstCgCounterDate: null,
    totalUseTime: null,
    nickName: null,
    answerArray: {
      "answers": [],
      "nickName": null,
      "avatarUrl": null,
      "shortUrl": 0,
      "costTime": 0,
      "isNewVersion": false,
      "ticket": ""
    }
  },
  onLoad: function (options) {
    var that = this;
    var imgUrl = that.data.imgUrl;

    if (options.shortUrl) {
      this.setData({
        shortUrl: options.shortUrl,
        //sessionId: wx.getStorageSync("openId").split(":")[0]
      });
    }
    if (options.isPreview) {
      this.setData({
        isPreview: parseInt(options.isPreview)
      });
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

    wx.showShareMenu({
      // 要求小程序返回分享目标信息
      withShareTicket: true
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    var that = this,
      tip = that.data.tip,
      statusStart = that.data.statusStart,
      statusRank = that.data.statusRank;

    var formatDateTime = function (date) {
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      m = m < 10 ? ('0' + m) : m;
      var d = date.getDate();
      d = d < 10 ? ('0' + d) : d;
      var h = date.getHours();
      var minute = date.getMinutes();
      return y + '年' + m + '月' + d + '日' + h + '点' + minute + '分';
    };

    if (that.data.shortUrl) {
      questionnaireService.getQuestionnaireViaShortUrl(that.data.shortUrl).then(function (survey) {


        var titleLength = function(num) {
          if (survey.maxAnswerTime < 0) {//是否设置默认闯关说明
            survey.description = '本次闯关共' + num + '题，每题作答时间' + survey.secondsLimit + '秒，每位微信用户每天有' + Math.abs(survey.maxAnswerTime) + '次作答机会';
          } else if (survey.maxAnswerTime === 0) {
            survey.description = '本次闯关共' + num + '题，每题作答时间' + survey.secondsLimit + '秒.';
          } else {
            survey.description = '本次闯关共' + num + '题，每题作答时间' + survey.secondsLimit + '秒，每位微信用户有' + survey.maxAnswerTime + '次作答机会';
          }
        }

        if (!survey.description) {
          if (survey.extractQuestionNumber > 0) { //判断是否打开了随机题目数
            titleLength(survey.extractQuestionNumber);
          } else {
            titleLength(survey.questions.length);
          }
        }

        if (survey.status === 101) { //闯关是否通过审核
          if (survey.isCanPulish) {//发布者
            tip = "该闯关内容涉及敏感信息，已被暂停访问。";
          } else { //填写者
            tip = "该闯关目前无法访问。";
          }
          that.setData({
            title: survey.name,
            status: survey.status,
            tip: tip, //警告
            description: survey.description, //闯关描述
            checkCg: false,
          })
          return false
        };

        if (survey.status == 0) {//闯关未运行
          tip = "此闯关还未运行";
        }

        if (survey.status == 1) { //闯关运行状态
          that.setData({
            status: survey.status,
            statusStart: false
          });
        }

        if (survey.status === 2) { //闯关暂停
          tip = "该闯关已经被发布者暂停，请稍后再试！";
          that.setData({
            title: survey.name,
            status: survey.status,
            tip: tip, //警告
            description: survey.description, //闯关描述
            statusRank: false
          });
          return false;
        }

        redWrap.myScoreTimes(that.data.shortUrl, that.data.isPreview).then(function (res) { //达到最大闯关次数
          if (!res) {
            tip = "抱歉！你已经达到最大闯关次数，不能再闯关了！ ";
            that.setData({
              tip: tip,
              statusStart: true,
              statusRank: false
            })
            return false;
          }
        })

        if (survey.checkTimeStatus > 0) {
          if (survey.checkTimeStatus == 1) { //闯关还未开始
            tip = "本次闯关将在" + formatDateTime(new Date(survey.startTime)) + "开始，目前暂时无法参与！";
            that.setData({
              statusStart: true,
              checkCg: false,
              timeExpired: "display: none",
            })
          }
          if (survey.checkTimeStatus == 2) {//闯关已经结束
            tip = "本次闯关已在" + formatDateTime(new Date(survey.endTime)) + "结束，目前已经无法参与！";
            that.setData({
              statusStart: true,
              checkCg: false,
              statusRank: false,
              timeExpired: "display: none"
            });
          }
        }

        that.setData({
          title: survey.name,
          tip: tip, //警告
          description: survey.description, //闯关描述
          questions: survey.questions,
          status: survey.status,
          conclusion: survey.defaultCompleteDisplay,
          shortUrl: survey.shortUrl,
          qtype: 6,
          isCanPulish: survey.isCanPulish, //是否是发布者
          startTime: survey.startTime, //开始时间
          endTime: survey.endTime, //结束时间
          secondsLimit: survey.secondsLimit,
          maxCgTime: survey.secondsLimit,
          maxAnswerTime: survey.maxAnswerTime,
        });
      });
    }
  },

  /**
   * 获取用户信息
   */
  onGotUserInfo(e) {
    var that = this;
    if (!app.globalData.userInfo) {
      if (e.detail.errMsg == "getUserInfo:ok") {
        app.globalData.userInfo = e.detail.userInfo;
      } else {
        wx.showToast({
          title: '授权后才可以开始答题',
          icon: "none",
          duration: 1000
        })
      }
    } else {
      that.startAnswer();
    }
  },
  startAnswer: function (e) { //点击开始答题按钮
    var that = this;
    var isPreview = that.data.isPreview ? that.data.isPreview : 2;
    var formId = e.detail.formId;

    if (!app.globalData.userInfo) {
      return;
    }
    redWrap.myScoreTimes(that.data.shortUrl, isPreview).then(function (res) {
      if (res) {

        //redWrap.scoreRankNum(that.data.shortUrl);
        questionnaireService.getTicket(that.data.shortUrl, formId, isPreview).then(function (res) {
          if (res) {
            var ticket = res;
            wx.redirectTo({
              url: '/pages/passLevel/startAnswer/startAnswer?shortUrl=' + that.data.shortUrl + "&ticket=" + ticket + "&isPreview=" + isPreview
            })
          }
        })
      }
    });


  },
  releaseClick: function (e) { //发布闯关
    var that = this;
    var status = that.data.status;
    var shortUrl = that.data.shortUrl;


    userServices.verify().then(function (res) {
      if (!res) {
        wx.showModal({
          title: '提示',
          content: '需要绑定手机号码才能发布闯关',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/passLevel/bindPhone/bindPhone'
              })
            }
          }
        })
      } else {
        if (that.data.questions.length === 0) {
          wx.showToast({
            title: '还未添加题目！',
            icon: 'none',
            duration: 2000
          })
          return false;
        }

        if (that.data.isCanPulish && status != 1) {
          wx.showModal({
            title: '提示',
            content: '是否发布该闯关！',
            success: function (res) {

              if (res.confirm) {
                questionnaireService.auidt(shortUrl).then(function (res) {
                  status = 1;
                  that.setData({
                    status: status,
                    statusStart: false, //显示开始答题
                    statusRank: true, //隐藏查看排行榜
                    tip: ""
                  });
                }).catch(function (res) {
                  wx.showToast({
                    title: res,
                    icon: "none",
                    duration: 1000
                  });
                });
              }
            }
          })

        };

        if (status == 1) {
          questionnaireService.setStatus(shortUrl, status).then(function (res) {
            that.setData({ status: status });

            wx.navigateTo({
              url: '/pages/passLevel/passShow/passShow?shortUrl=' + that.data.shortUrl
            })
          })
        }
      }
    })


  },
  seeRanking: function (e) { //查看排行榜
    wx.redirectTo({
      url: '/pages/passLevel/rank/rank?shortUrl=' + this.data.shortUrl,
    })
  },
  onShareAppMessage: function (res) {
    var that = this;
    var name = app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : '';
    return {
      title: name + '邀请您参与：' + that.data.title,
      path: '/pages/passLevel/passShow/passShow?shortUrl=' + that.data.shortUrl,
      imageUrl: that.data.imgUrl,
      success: function (res) {
        // console.log("9999999999999");
        // console.log("res.shareTickets[0]", res.shareTickets[0]);
        // wx.getShareInfo({
        //   shareTicket: res.shareTickets[0],
        //   success(res) {
        //     userServices.queryGroupId(that.data.sessionId, res.iv, res.encryptedData).then(function (res) {
        //       that.setData({
        //         groupGId: res.openGId
        //       });
        //     });

        //     // 后台解密，获取 openGId
        //   }
        // })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})