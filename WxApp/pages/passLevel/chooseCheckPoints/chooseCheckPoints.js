// pages/passLevel/chooseCheckPoints/chooseCheckPoints.js
var util = require('../../../utils/util.js');
var questionnaireService = require('../../../services/questionnaireService.js');
var wxRequest = require('../../../services/wxlogin.js');
var app = getApp();

const mp3Recorder = wx.getRecorderManager();
const mp3RecorderOptions = {
  duration: 60000, //录音时长
  sampleRate: 16000, //采样率
  numberOfChannels: 1, //录音通道数
  encodeBitRate: 48000, //编码码率
  format: 'mp3', //音频格式
  frameSize: 50//指定帧大小
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currented: false, //默认显示自定义，隐藏题库
    isSwitchDes: true,
    activityId: 0,
    refId: "",
    isBank: 1, //是否是题库闯关
    currentId: 0,
    bandNumIndex: 1,
    bandNumArray: [5, 10, 15, 20, 30, 40, 50], //题库抽取题目数
    chooseBankName: "",
    chooseBankArray: [],
    selected1: true,
    selected2: false,
    currentTab: 0, // tab切换 
    secondsLimit: 0, //每题作答时间
    title: "", //闯关名称
    description: "", //闯关说明
    activityId: 0, //问卷ID
    qType: 6,//题目类型
    conclusion: "", //问卷结束语
    placeholderTitle: "编辑闯关名称",
    placeholderDes: "编辑闯关说明（选填）",

    isSpeaking: false,
    outputTxt: "",
    j: 1,//帧动画初始图片 
    currentobj: "", //点击触发的当前对象
    callBack: null //回调函数
  },

  /**
   * 点击题库抽题
   */
  selected1: function () {
    var that = this;
    that.setData({
      selected1: true,
      selected2: false
    });
  },
  /**
   * 点击自定义闯关
   */
  selected2: function () {
    var that = this;
    that.setData({
      selected1: false,
      selected2: true
    });
  },
  /**
   * 选择题库
   */
  chooseBankTrigger: function (e) {
    var that = this;
    var currentId = e.currentTarget.id;
    var chooseBankArray = that.data.chooseBankArray;
    var refId = chooseBankArray[currentId].id;

    that.setData({ //题库
      currentId: currentId,
      refId: refId,
      secondsLimit: chooseBankArray[currentId].seconds
    });
  },
  /**
   * 题库填写闯关名称
   */
  bankInfo: function (e) {
    var that = this;
    that.setData({ title: e.detail.value });

    // var title = that.data.title;
    // var description = that.data.description;
    // wx.navigateTo({
    //   url: '../editQueName/editQueName?isBank=' + that.data.isBank + "&title=" + title + "&description=" + description,
    // })
  },
  /**
   * 闯关描述
   */
  bankDes: function (e) {
    var that = this;
    that.setData({ description: e.detail.value });
  },
  /**
   * 题库填写闯关名称和闯关描述
   */
  switchDes: function () {
    var that = this;

    if (that.data.isSwitchDes) {
      that.data.isSwitchDes = false;
    } else {
      that.data.isSwitchDes = true;
    }

    that.setData({
      isSwitchDes: that.data.isSwitchDes
    });
  },
  /**
   * 题库题目数量选择
   */
  bindPickerBankTitleNum: function (e) {
    var that = this;
    that.setData({
      bandNumIndex: e.detail.value
    })
  },
  /**
   * 每题作答时间
   */
  setTime: function (e) {
    var that = this;
    that.setData({
      secondsLimit: parseInt(that.trim(e.detail.value))
    })
  },
  /**
  *  创建一个题库闯关
  */
  addBandTrigger: function () {
    var that = this;
    var title = that.data.title;
    var description = that.data.description;
    var questionNumber = that.data.bandNumArray[that.data.bandNumIndex]; //题目数量
    var secondsLimit = that.data.secondsLimit; //  每次作答时间
    var maxAnswerTime = 1; //最大作答次数
    var refId = that.data.refId;
    var activityId = that.data.activityId;

    if (!title) {
      wx.showToast({
        title: '标题不能空',
        icon: "none",
        duration: 1000
      });
      return
    }

    if (!secondsLimit) {
      wx.showToast({
        title: '请输入答题时间',
        icon: "none",
        duration: 1000
      })
      return
    } else if (secondsLimit > 60) {
      wx.showToast({
        title: '每题作答时间最大不允许超过60秒',
        icon: "none",
        duration: 1000
      })
      return
    }


    questionnaireService.addBand(title, description, questionNumber, secondsLimit, maxAnswerTime, refId, activityId).then(function (res) {
      if (res) {
        wx.setStorageSync("addSuvery", true);
        if (refId) {
          wx.setStorage({
            key: 'editBank',
            data: {
              activityId: res
            }
          })
        }

        var url = "../setOption/setOption?activityId=" + res;
        wx.removeStorageSync("isBankInfo");
        that.setData({
          title: "",
          description: ""
        });
        wx.navigateTo({
          url: url,
        })
      }
    }).catch(function (res) {
      wx.showToast({
        title: res,
        icon: "none",
        duration: 1000
      });
    });
  },
  trim: function (s) {
    return s.replace(/(^\s*)|(\s*$)/g, "");
  },
  /**
   *  输入闯关名称
   */
  inputTitle: function (e) {
    this.setData({ title: e.detail.value });
  },
  /**
   *  输入闯关说明
   */
  inputDescription: function (e) {
    this.setData({ description: e.detail.value });
  },
  /**
   *  创建自定义闯关
   */
  mySubmit: function (e) {
    var that = this;

    if (that.data.activityId == 0) {
      if (that.data.title) {
        wx.showToast({
          title: '数据正在提交',
          icon: 'loading',
          duration: 10000
        });
        questionnaireService.addQuestionnaire(that.data.title, that.data.description, that.data.conclusion, that.data.qType).then(function (res) {
          if (res) {
            var url = "../editQue/editQue?activityId=" + res;
            wx.removeStorageSync("survey:0");
            wx.setStorageSync("addSuvery", true);
            that.setData({
              title: "",
              description: ""
            });
            wx.navigateTo({ url: url });
          }

        }).catch(function (err) {
          wx.showToast({
            title: err,
            icon: "none",
            duration: 2000
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1,
            })
          }, 2000)

        })
      } else {
        that.wetoast.toast({
          title: "标题不能空",
          duration: 1000
        })
      }
    } else {
      if (that.data.title) {
        questionnaireService.updateQuestionnaireTitle(that.data.activityId,
          that.data.title, that.data.description, that.data.conclusion, that.data.qType).then(function (res) {
            wx.removeStorageSync('survey:edit');
            wx.setStorageSync("addSuvery", true);
            wx.navigateBack();
          }).catch(function (e) {

          });
      } else {
        that.wetoast.toast({
          title: "标题不能空",
          duration: 1000
        })
      }
    }

  },
  /**
   *  点击切换到题库闯关
   */
  goBankTrigger: function () {
    var that = this;
    var currented = that.data.currented;

    currented = true;
    that.setData({
      currented: currented
    });
  },
  /**
   *  点击切换到自定义题目
   */
  goSelfTrigger: function () {
    var that = this;
    var currented = that.data.currented;

    currented = false;
    that.setData({
      currented: currented
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.weToast();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this,
      chooseBankArray = that.data.chooseBankArray,
      bandNumArray = that.data.bandNumArray;
    var chooseBankArray = that.data.chooseBankArray;
    mp3Recorder.onStart(() => { });

    mp3Recorder.onStop((res) => {

      const { tempFilePath } = res


      questionnaireService.getSignature().then(function (res) {
        var urls = res.host;
        that.processFileUploadForAsr(urls, tempFilePath, res);
      });

    });

    questionnaireService.getBank().then(function (res) {//拿到题库
      if (res) {
        chooseBankArray = res;
        // chooseBankArray.push({
        //   'id': 0,
        //   'name': "自定义"
        // })
        that.setData({
          refId: chooseBankArray[0].id,
          chooseBankArray: chooseBankArray,
          secondsLimit: chooseBankArray[that.data.currentId].seconds
        });
      }
    });

    wx.getStorage({
      key: 'isBankInfo',
      success: function (res) {
        if (res.data) {
          that.setData({
            title: res.data.title,
            description: res.data.description
          });
        }
      }
    });

    var cache = wx.getStorageSync('editBank');

    if (cache != '' && cache.activityId > 0) {
      //切换到题库抽题闯关
      that.setData({
        selected1: true,
        selected2: false
      });

      questionnaireService.getQuestionnaire(cache.activityId).then(function (res) {

        bandNumArray.forEach(function (value, index) {
          if (bandNumArray[index] == res.extractQuestionNumber) {
            that.setData({
              bandNumIndex: index
            });
            return false;
          }
        });

        chooseBankArray.forEach(function (value, index) {
          if (chooseBankArray[index].id == res.refId) {
            that.setData({
              currentId: index
            });
            return false;
          }
        });

        that.setData({
          refId: res.refId,
          title: res.name,
          description: res.description,
          extractQuestionNumber: res.extractQuestionNumber,
          secondsLimit: res.secondsLimit
        });
      })
      that.setData({
        activityId: cache.activityId
      });
    } else {
      that.setData({
        activityId: 0,
        title: "",
        description: "",
        bandNumIndex: 1,
        secondsLimit: 10,
        currentId: 0,
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 按下开始录音
   */
  touchdown: function (e) {
    var that = this;
    var currentobj = e.currentTarget.id;
    var callBack = that.data.callBack;
    if (currentobj == "title") {
      callBack = function (contetnt) {
        that.setData({
          title: contetnt,
        })
      }
    }

    if (currentobj == "description") {
      callBack = function (contetnt) {
        that.setData({
          description: contetnt,
        })
      }
    }

    util.speaking(that); //调用麦克风
    that.setData({
      isSpeaking: true,
      currentobj: currentobj,
      callBack: callBack
    })

    mp3Recorder.start(mp3RecorderOptions);
  },
  /**
   * 松开完成录音
   */
  touchup: function () {
    var that = this;
    this.setData({
      isSpeaking: false,
    })
    mp3Recorder.stop();
  },
  /**
   * 上传录音文件到阿里云接口，处理语音识别和语义，结果输出到界面
   */
  processFileUploadForAsr: function (urls, filePath, res) {
    var that = this;
    var fileName = res.dir + Date.parse(new Date()).toString();
    wx.uploadFile({
      url: urls,
      filePath: filePath,
      name: 'file',
      formData: {
        'key': fileName,
        'policy': res.policy,
        'OSSAccessKeyId': res.accessId,
        'signature': res.signature,
        'content-type': 'audio/mp3'
      },
      success: function (res) {
        if (res.statusCode == 204) {
          questionnaireService.getVoiceFile(fileName).then(function (res) {
            if (res.err_msg == "success.") {
              var lastOutput = res.result[0].trim().replace(/，/g, "");
              that.data.callBack(lastOutput); //调用回调函数设置返回过来的文字

              wx.hideToast();
            } else {
              wx.showToast({
                title: "请重新输入语音",
                icon: "none",
                duration: 1000
              });
            }
          }).catch(function () {
            wx.showToast({
              title: "请重新输入语音",
              icon: "none",
              duration: 1000
            });
          });
        }
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: "网络请求失败，请确保网络是否正常",
          showCancel: false,
          success: function (res) {
          }
        });
        wx.hideToast();
      }
    });
  },
  /**
   * 获取用户信息
   */
  onGotUserInfo(e) {
    var that = this;
    console.log("1111111111:", e)
    console.log("1111111111:", e.detail.errMsg)
    console.log("22222222222222:", e.detail.userInfo)
    if (!app.globalData.userInfo) {
      if (e.detail.errMsg == "getUserInfo:ok") {
        app.globalData.userInfo = e.detail.userInfo;
      } else {
        wx.showToast({
          title: '授权后才可以创建闯关！',
          icon: "none",
          duration: 1000
        })
      }
    } else {
      if (e.currentTarget.dataset.qtype == 1) {
        that.mySubmit();
      } else if (e.currentTarget.dataset.qtype == 2) {
        that.addBandTrigger();
      }  
    }
  },
  /**
   *  点击跳转到问卷星小程序
   */
  goWjxProgram(e) {
    wx.navigateToMiniProgram({
      appId: 'wxd947200f82267e58',
      path: 'pages/wjxqList/wjxqList?activityId=31151040',
      envVersion: 'release',
      success(res) {
        console.log("打开成功！！！")
      },
      fail(res) {
        console.log("打开失败！！")
      }
    })
  }
})


