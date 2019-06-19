// pages/passLevel/setOption/setOption.js
var questionnaireService = require('../../../services/questionnaireService.js');
var userServices = require('../../../services/userServices.js');
var wxRequest = require('../../../services/wxlogin.js');
var dateTimePicker = require('../../../lib/dateTimePicker.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPhoneNumber: true,
    status: 0,
    refId: null, //题库抽题
    isProcess: 0,//判断是从我的闯关进入 还是在完成编辑后点击进入设置
    shortUrl: "",
    url: app.globalData.url + '/images/',
    time: '',
    isRandom: false,
    isExtractQuestionRandom: false,
    extractQuestionNumber: '',
    dateTimeArray2: null,
    dateTime2: null,
    dateTimeArray1: null,
    dateTime1: null,
    nostartTime: null,
    noendTime: null,
    questions: [],
    maxAnswerTime: 3,
    TimesArray: ["不限制", "每天1次", "每天2次", "每天3次", "限1次", "限2次", "限3次", "限4次", "限5次", "限6次", "限7次", "限8次", "限9次", "限10次"],
    TimesIndex: 4,
    openStatus: null, //openStatus字段   null是未申请。 0：正在审核 1:审核通过 2:审核退出 3:审核失败
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取完整的年月日 时分秒，以及默认显示的数组
    var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    var obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    // 精确到分的处理，将数组的秒去掉
    var lastArray = obj1.dateTimeArray.pop();
    var lastTime = obj1.dateTime.pop();

    this.setData({
      dateTime2: obj.dateTime,
      dateTimeArray2: obj.dateTimeArray,
      dateTimeArray1: obj1.dateTimeArray,
      dateTime1: obj1.dateTime
    });


    var that = this;
    if (options.isProcess == 1) {
      that.data.isProcess = 1;
    }
    that.setData({
      isProcess: that.data.isProcess
    })

    if (options.activityId) {
      that.setData({
        activityId: options.activityId
      })
      questionnaireService.getQuestionnaire(options.activityId).then(function (res) {
        var maxAnswerTime;
        var TimesArray = that.data.TimesArray;
        switch (res.maxAnswerTime) {
          case 0: maxAnswerTime = "不限制"; break;
          case -1: maxAnswerTime = "每天1次"; break;
          case -2: maxAnswerTime = "每天2次"; break;
          case -3: maxAnswerTime = "每天3次"; break;
          case 1: maxAnswerTime = "限1次"; break;
          case 2: maxAnswerTime = "限2次"; break;
          case 3: maxAnswerTime = "限3次"; break;
          case 4: maxAnswerTime = "限4次"; break;
          case 5: maxAnswerTime = "限5次"; break;
          case 6: maxAnswerTime = "限6次"; break;
          case 7: maxAnswerTime = "限7次"; break;
          case 8: maxAnswerTime = "限8次"; break;
          case 9: maxAnswerTime = "限9次"; break;
          case 10: maxAnswerTime = "限10次"; break;
        }
        var TimesIndex = TimesArray.indexOf(maxAnswerTime);

        var formStyle = function (time) { //去掉秒数
          var timeArray = (time.replace("T", " ")).split("+")[0];
          timeArray = timeArray.split(":");
          var len = timeArray.length;
          timeArray.splice(len - 1, 1);
          timeArray = timeArray.join(":");
          return timeArray;
        }

        that.setData({
          status: res.status,
          refId: res.refId,
          time: res.secondsLimit == 0 ? '' : res.secondsLimit,
          isRandom: res.isChoiceRandom,
          isExtractQuestionRandom: res.isExtractQuestionRandom,
          questions: res.questions,
          maxAnswerTime: maxAnswerTime,
          extractQuestionNumber: res.extractQuestionNumber == 0 ? '' : res.extractQuestionNumber,
          // noendTime: res.endTime ? (res.endTime.replace("T", " ")).split("+")[0] : res.endTime,
          noendTime: res.endTime ? formStyle(res.endTime) : res.endTime,
          noendTime1: res.endTime,
          // nostartTime: res.startTime ? (res.startTime.replace("T", " ")).split("+")[0] : res.startTime,
          nostartTime: res.startTime ? formStyle(res.startTime).split("+")[0] : res.startTime,
          nostartTime1: res.startTime,
          TimesIndex: TimesIndex,
          shortUrl: res.shortUrl,
          openStatus: res.openStatus
        });
      });
    }

  },
  bindPickerTimes: function (e) {
    this.setData({
      maxAnswerTime: this.data.TimesArray[e.detail.value]
    })
  },

  changeDateTime1(e) {
    console.log("1111111111", this.data.dateTimeArray1[0][this.data.dateTime1[0]])
    this.setData({
      dateTime1: e.detail.value,
      nostartTime: this.data.dateTimeArray1[0][this.data.dateTime1[0]] + '-' + this.data.dateTimeArray1[1][this.data.dateTime1[1]]
      + '-' + this.data.dateTimeArray1[2][this.data.dateTime1[2]] + ' ' + this.data.dateTimeArray1[3][this.data.dateTime1[3]] + ':' + this.data.dateTimeArray1[4][this.data.dateTime1[4]],
      nostartTime1: this.data.dateTimeArray1[0][this.data.dateTime1[0]] + '-' + this.data.dateTimeArray1[1][this.data.dateTime1[1]]
      + '-' + this.data.dateTimeArray1[2][this.data.dateTime1[2]] + 'T' + this.data.dateTimeArray1[3][this.data.dateTime1[3]] + ':' + this.data.dateTimeArray1[4][this.data.dateTime1[4]] + '+08:00'
    });
  },
  changeDateTime2(e) {

    this.setData({
      dateTime2: e.detail.value,
      noendTime: this.data.dateTimeArray2[0][this.data.dateTime2[0]] + '-' + this.data.dateTimeArray2[1][this.data.dateTime2[1]]
      + '-' + this.data.dateTimeArray2[2][this.data.dateTime2[2]] + ' ' + this.data.dateTimeArray2[3][this.data.dateTime2[3]] + ':' + this.data.dateTimeArray2[4][this.data.dateTime2[4]],
      noendTime1: this.data.dateTimeArray2[0][this.data.dateTime2[0]] + '-' + this.data.dateTimeArray2[1][this.data.dateTime2[1]]
      + '-' + this.data.dateTimeArray2[2][this.data.dateTime2[2]] + 'T' + this.data.dateTimeArray2[3][this.data.dateTime2[3]] + ':' + this.data.dateTimeArray2[4][this.data.dateTime2[4]] + '+08:00'
    });
  },
  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    this.setData({
      dateTimeArray1: dateArr,
      dateTime1: arr
    });
  },
  changeDateTimeColumn2(e) {
    var arr = this.data.dateTime2, dateArr = this.data.dateTimeArray2;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    this.setData({
      dateTimeArray2: dateArr,
      dateTime2: arr
    });
  },
  setTime: function (e) {
    this.setData({
      time: parseInt(this.trim(e.detail.value))
    })
  },
  randomChange: function (e) {
    if (this.data.questions.length == 0) {
      wx.showToast({
        title: '总题数为0，请先添加题目',
        icon: "none",
        duration: 1000
      })
      this.setData({
        isRandom: false
      })
    } else {
      this.setData({
        isRandom: e.detail.value
      })
    }
  },

  randomQuaChange: function (e) {
    if (this.data.questions.length == 0) {
      wx.showToast({
        title: '总题数为0，请先添加题目',
        icon: "none",
        duration: 1000
      })
      this.setData({
        isExtractQuestionRandom: false
      })
    } else {
      this.setData({
        isExtractQuestionRandom: e.detail.value
      })
    }
  },
  setQuaNum: function (e) {

    if (e.detail.value / this.data.questions > 1) {
      wx.showToast({
        title: '随机题数不能大于总题数',
        icon: "none",
        duration: 1000
      })
      this.setData({
        extractQuestionNumber: ''
      })
    } else {
      this.setData({
        extractQuestionNumber: e.detail.value
      })
    }

  },
  ensure: function () {
    this.check(
      this.queSet
    );
  },
  cancal: function () {
    wx.navigateBack({
    })

  },
  queSet: function (ispreview) {
    var times;
    switch (this.data.maxAnswerTime) {
      case "不限制": times = 0; break;
      case "每天1次": times = -1; break;
      case "每天2次": times = -2; break;
      case "每天3次": times = -3; break;
      case "限1次": times = 1; break;
      case "限2次": times = 2; break;
      case "限3次": times = 3; break;
      case "限4次": times = 4; break;
      case "限5次": times = 5; break;
      case "限6次": times = 6; break;
      case "限7次": times = 7; break;
      case "限8次": times = 8; break;
      case "限9次": times = 9; break;
      case "限10次": times = 10; break;
    }
    questionnaireService.QuestionnaireSet(this.data.time, this.data.isRandom, this.data.activityId, this.data.isExtractQuestionRandom, this.data.extractQuestionNumber ? this.data.extractQuestionNumber : this.data.questions.length, this.data.nostartTime1, this.data.noendTime1, times).then(function () {
      wx.showToast({
        title: '设置成功',
        icon: 'success',
        duration: 1000
      })
      if (!ispreview) {
        setTimeout(function () {
          wx.navigateBack({
          })
        }, 1000)
      }
    })
  },
  /**
   * 清空时间
   */
  clearTimeTrigger: function (e) {
    var that = this;
    var current = e.currentTarget.dataset.id;

    if (current == "start") {
      that.data.nostartTime = null;
      that.data.nostartTime1 = null;
    } else if (current == "end") {
      that.data.noendTime = null;
      that.data.noendTime1 = null;
    }

    that.setData({
      nostartTime: that.data.nostartTime,
      noendTime: that.data.noendTime,
      nostartTime1: that.data.nostartTime1,
      noendTime1: that.data.noendTime1,
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

  },
  check(callback, ispreview) {
    var that = this;
    if (!that.data.time || that.data.time == '') {

      wx.showToast({
        title: '请输入时间',
        icon: "none",
        duration: 1000
      })
      return
    } else if (that.data.time > 60) {
      wx.showToast({
        title: '每题作答时间最大不允许超过60秒',
        icon: "none",
        duration: 1000
      })
      return
    } else if (that.data.nostartTime && that.data.noendTime) {

      if (new Date(that.data.nostartTime1) >= new Date(that.data.noendTime1)) {
        wx.showToast({
          title: '开始时间不能大于或等于结束时间',
          icon: "none",
          duration: 1000
        })
        return
      }
    }

    if (!that.data.refId) {
      if (that.data.extractQuestionNumber > that.data.questions.length) {
        wx.showToast({
          title: '随机抽取题数不能大于总题数',
          icon: "none",
          duration: 1000
        })
        return
      }
    }


    callback(ispreview);
  },
  trim(s) {
    return s.replace(/(^\s*)|(\s*$)/g, "");
  },
  /**
   * 点击预览按钮
   */
  previewQuestionPaper: function (options) {
    var that = this;
    var ispreview = true; //是否是从自定义流程中预览进入

    userServices.verify().then(function (res) {
      if (!res) {
        that.setData({
          isPhoneNumber: false
        });
      } else {
        if (!that.data.refId) {
          if (that.data.questions.length === 0) {
            wx.showToast({
              title: '还未添加题目！',
              icon: 'none',
              duration: 2000
            })
            return false;
          }
        }


        that.check(that.queSet, ispreview);

        if (that.data.status != 1) {
          wx.showModal({
            title: '提示',
            content: '是否发布该闯关！',
            success: function (res) {

              if (res.confirm) {
                questionnaireService.auidt(that.data.shortUrl).then(function (res) {
                  wx.setStorageSync("addSuvery", true);
                  that.data.status = 1;
                  that.setData({
                    status: that.data.status,
                  });
                  wx.navigateTo({
                    url: '/pages/passLevel/share/share?shortUrl=' + that.data.shortUrl + "&activityId=" + that.data.activityId
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

        if (that.data.status == 1) {
          questionnaireService.setStatus(that.data.shortUrl, that.data.status).then(function (res) {
            wx.navigateTo({
              url: '/pages/passLevel/share/share?shortUrl=' + that.data.shortUrl + "&activityId=" + that.data.activityId
            })
          })
        }

      }
    })
  },
  modalCancelEvent(e) {
    var that = this;
    that.setData({
      isPhoneNumber: true
    });
  },
  getPhoneNumberEvent() {
    var that = this;
    that.setData({
      isPhoneNumber: true
    });
  },
  phoneThrough(shorturl, id) {
    var that = this;
    questionnaireService.auidt(shorturl).then(function (res) {
      wx.setStorageSync("addSuvery", true);  //进行发布
      that.setData({
        status: 1,
      });
      wx.navigateTo({
        url: '/pages/passLevel/share/share?shortUrl=' + shorturl + "&activityId=" + id
      })
    }).catch(function (res) {
      if (res.status != 200) {
        wx.showToast({
          title: res,
          icon: 'none',
          duration: 2000
        })
      }
    });
  },
  /**
   * 自动获取手机号码
   */
  getPhoneNumber(e) {
    var that = this;

    that.getSessionId();

    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.navigateTo({
        url: '/pages/passLevel/bindPhone/bindPhone'
      })
    } else {
      userServices.getAutoMobileFn(that.data.sessionId, e.detail.encryptedData, e.detail.iv).then(function (res) {
        wx.showToast({
          title: '绑定成功！',
          icon: "success",
          duration: 1500,
          success: function () {
            setTimeout(function () {
              that.phoneThrough(e.currentTarget.dataset.shorturl, e.currentTarget.dataset.id);
            }, 1500)
          }
        })
      }).catch(function () {
        wx.navigateTo({
          url: '/pages/passLevel/bindPhone/bindPhone'
        })
      })
    }

    that.setData({
      isPhoneNumber: true
    });
  },
  /**
   *  获取sessionId
   */
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

  switchChange: function (e) {
  }
})