var util = require('../../../utils/util.js');
var RSA = require('../../../utils/wxapp_rsa.js');
var questionnaireService = require('../../../services/questionnaireService.js');
var userServices = require('../../../services/userServices.js');
var wxRequest = require('../../../services/wxlogin.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sessionId: "",
    groupGId: "",
    isPreview: null, //是否是预览模式
    ticket: "",
    quitMidWay: true,
    shortUrl: 0,
    questions: [],
    qtype: 6,
    status: 0,
    isExtractQuestionRandom: false, //题目随机
    isChoiceRandom: false, //选项随机
    extractQuestionNumber: 0, //随机抽几道
    currentID: 1,
    answerArray: {
      "answers": [],
      "nickName": null,
      "avatarUrl": null,
      "shortUrl": 0,
      "costTime": 0,
      "isNewVersion": false,
      "ticket": "",
      "openGId": "",
      "attachText": ""
    },
    costTime: 0,
    chooseObj: false,
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
    maxChuangGuanTimer: null,
    nickName: null,
    privateKey_pkcs: '-----BEGIN RSA PRIVATE KEY-----MIICXAIBAAKBgQCn3uUXiPB4eVEkZYRp0J6MKjtwax21VJv1bDYrjHwJGstGUVNgwlD88gjBpaGvkNanK1EZEseiNE5H7xeNyejgWyCGyij+87QnxdIjqMgnBtFl+Fa/8M4mnEJeBaoEJkXiBZYr11iZCkzeOb1cjbLnQAntoBBB3JFQfaiLF+EXfwIDAQABAoGAFcUXKpUsskLxXen4YQyX8w9rA+owQRrG2u38nGssjrW11NmpGWw5uoPc1NgY/ r6mx6kbbEf+Ma/c0wFTqaScmX4RFrFjysUPsK2mLeBbitXxz8KXGtAMfC+liY7RbTVEEVglsDqCBOwUI1Ejjgw3O5aP4FJv5Xdt3lHC5bXZHAkCQQDS99UfcJs8iyF8hEvAAeYLKFttpC2lxxJaNoYOaVvYq44wqkuBzAHpUuqzVTO2J8fl964IoQIHf3UrVOujYrC9AkEAy7QKuIgClDxme7N8kM7VIm/ZlS8M2gEEh+AhsRnM4SiC3+Jv4ses197UjVavAjd7WR+gLkZgtv+rzS845mri6wJBAIxOax1nxLZ1SaYITmC6YoZVJsk6gWlZhikdTfbTt1PYdM6E04bVaQgGLzVpmuSwfE/Dc6kle7YE3KYe6kBVaHkCQGQrJbZ2U2ZXiUG9Ej0XKGGlxMYCe/xb0cGLKqYu/LufszOq4sAO1mTU04qpHKgnZkV+MsNuojJ66R2d4goUd38CQHAegJBvpAQ5drfYkOZJ5cDH1NKXEngdh3xHPI2wAwfR1wFiURHROg9+cqYGbF+s2ahiSYEjpFnzGcyWQ/sZBOU=-----END RSA PRIVATE KEY-----', //解密私钥
    publicKey_pkcs: '-----BEGIN PUBLIC KEY-----MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHkTxtW9Zpu48Csk1wfJkvpPN2aqLltUbLcem/9M5iaKtIRj1winlUi1r62UfD2L614AtXRcw2Z8ovPtj7yK5woL4DKxZo9kLNNgLdqDVj69yfM7untqXSU4KoCmLO3d2GdsQmtU6OSOchp6Jqp4VcFv4KwBRmWT/WNmbz5pFNYhAgMBAAE=-----END PUBLIC KEY-----' //加密公钥
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    if (options.isPreview) {
      that.setData({
        isPreview: parseInt(options.isPreview)
      });
    }
    if (options.ticket) {
      that.setData({
        ticket: options.ticket
      });
    }
    if (options.shortUrl) {
      that.setData({
        shortUrl: options.shortUrl,
        // sessionId: wx.getStorageSync("openId").split(":")[0]
      });
    };

    that.getSessionId();

    // var openId = wx.getStorageSync('openId') || '';
    // if (openId && openId.length > 0) {
    //   var expireTimeStamp = openId.split(":")[1];
    //   var timestamp = new Date().getTime();
    //   if (timestamp > expireTimeStamp) {
    //       openId = "",
    //       wx.removeStorageSync("openId");
    //   }else {
    //     openId = openId.split(":")[0];
    //     that.setData({
    //       sessionId: openId
    //     });
    //   }
    // }


    // if (!openId) {
    //   wxRequest.wxLogin().then(function(res) {
    //     return wxRequest.getWxAuthrize(res.code);
    //   }).then(function(res) {
    //     that.setData({
    //       sessionId: res.data
    //     });
    //   })
    // }

    var loadQuestion = function (that) {
      var that = that;

      var deepCopy = function (obj) { //深度copy
        if (typeof obj != 'object') {
          return obj;
        }
        var newobj = {};
        for (var attr in obj) {
          if (attr == "items") {
            newobj[attr] = [];
            for (var i = 0; i < obj[attr].length; i++) {
              newobj[attr].push(deepCopy(obj[attr][i]));
            }
          }
          else {
            newobj[attr] = deepCopy(obj[attr]);
          }
        }
        return newobj;
      }

      if (that.data.shortUrl) {
        questionnaireService.getQuestionnaireViaShortUrl(that.data.shortUrl).then(function (survey) {
          // 后台解密，获取 openGId
          if (wx.getStorageSync("shareTicket")) {
            wx.getShareInfo({
              shareTicket: wx.getStorageSync("shareTicket"),
              success(res) {
                userServices.queryGroupId(that.data.sessionId, res.iv, res.encryptedData).then(function (res) {
                  that.setData({
                    groupGId: res.openGId
                  });
                });
              }
            })
          }


          var questions = survey.questions.filter(function (item) {
            return item.type != "page"
          })

          for (var i = 0; i < questions.length; i++) {
            var type = { typeName: util.getQuestionType(questions[i].type, questions[i].mode, questions[i].isTouPiao) };

            Object.assign(questions[i], type);
          };

          that.setData({
            title: survey.name,
            description: survey.description,
            status: survey.status,
            questions: questions,
            shortUrl: survey.shortUrl,
            qtype: 6,
            isExtractQuestionRandom: survey.isExtractQuestionRandom, //题目随机
            extractQuestionNumber: survey.extractQuestionNumber, //随机抽几道
            isChoiceRandom: survey.isChoiceRandom,//选项随机
            isCanPulish: survey.isCanPulish, //是否是发布者
            startTime: survey.startTime, //开始时间
            endTime: survey.endTime, //结束时间
            hiddenAnswer: true,
            secondsLimit: survey.secondsLimit,
            maxCgTime: survey.secondsLimit,
            maxAnswerTime: survey.maxAnswerTime,
            attachTxt: survey.attachTxt
          });

          if (survey.attachTxt && survey.attachTxt.length) {
            var decrypt_rsa = new RSA.RSAKey();  //私钥解密
            decrypt_rsa = RSA.KEYUTIL.getKey(that.data.privateKey_pkcs);
            //var attachTxt = RSA.b64tohex(survey.attachTxt);
            //var decStr = decrypt_rsa.decrypt(attachTxt);
            var decStr = "";

            var maxLength = 256;

            var string_code = RSA.b64tohex(survey.attachTxt);
            if (string_code.length > maxLength) {
              var lt = string_code.match(/.{1,256}/g);
              lt.forEach(function (entry) {
                var t1 = decrypt_rsa.decrypt(entry);
                decStr += t1;
              });
            } else {
              decStr = decrypt_rsa.decrypt(RSA.b64tohex(survey.attachTxt));
            }

            var decStrArr = decStr.split("￡");
          }



          for (var i = 0; i < questions.length; i++) {
            for (var j = 0; j < questions[i].items.length; j++) {
              questions[i].items[j]["id"] = j + 1;
              questions[i].items[j]["chooseObj"] = false;
              if (survey.attachTxt && survey.attachTxt.length) {
                if (j + 1 == decStrArr[i]) {
                  questions[i].items[j]["rsaValue"] = true;
                } else {
                  questions[i].items[j]["rsaValue"] = false;
                }
              }
            }
          };

          var copy_questions = new Array(); //复制一个随机题目

          for (var index in questions) { //深复制
            copy_questions.push(deepCopy(questions[index]));
          }

          var random_questions = new Array();

          if (that.data.isExtractQuestionRandom && that.data.extractQuestionNumber > 0) {
            if (that.data.questions.length >= that.data.extractQuestionNumber) { //随机抽题目

              for (var i = 0; i < that.data.extractQuestionNumber; i++) {

                if (copy_questions.length > 0) {

                  var arrIndex = Math.floor(Math.random() * copy_questions.length);
                  //索引元素值复制出来
                  random_questions[i] = copy_questions[arrIndex];
                  //删掉此索引元素
                  copy_questions.splice(arrIndex, 1);
                }
              }
            }
          }


          var copy_options = new Array();
          if (random_questions.length === 0) { //如果没有设置题目随机
            for (var index in questions) { //深复制
              random_questions.push(deepCopy(questions[index]));
            }
          }
          for (var index in random_questions) {
            copy_options.push(deepCopy(random_questions[index]));
          }


          if (that.data.isChoiceRandom) {//随机选项
            for (var i = 0; i < random_questions.length; i++) {
              var random_options = new Array();
              for (var j = 0; j < random_questions[i].items.length; j++) {
                var optionIndex = Math.floor(Math.random() * copy_options[i].items.length);
                if (copy_options[i].items.length > 0) {
                  random_options[j] = copy_options[i].items[optionIndex]; //索引元素值复制出来
                  copy_options[i].items.splice(optionIndex, 1); //删掉此索引元素
                }
                if (j === random_questions[i].items.length - 1) {
                  copy_options[i].items = random_options;
                }
              }
            }

          };

          if (that.data.isExtractQuestionRandom && that.data.extractQuestionNumber > 0 || that.data.isChoiceRandom) {
            that.setData({
              questions: copy_options
            });
          } else {
            that.setData({
              questions: questions
            });
          }
          that.timeLimit(); //倒计时开始
        });
      }
    }

    loadQuestion(that);

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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
  },

  /**
   * 点击进行下一题
   */
  answerClick: function (e) {
    var that = this;
    var indexTwo = parseInt(e.currentTarget.dataset.indextwo);
    var currentID = parseInt(e.currentTarget.dataset.index);
    var topic = e.currentTarget.dataset.topic;
    var id = e.currentTarget.dataset.id;
    var itemRadio = e.currentTarget.dataset.itemradio;
    var rsaValue = e.currentTarget.dataset.rsavalue;
    var chooseObj = e.currentTarget.dataset.chooseObj;
    var quitMidWay = that.data.quitMidWay;

    clearInterval(that.data.maxChuangGuanTimer);


    for (var i = 0; i < that.data.questions.length; i++) {
      for (var j = 0; j < that.data.questions[i].items.length; j++) {
        if (i == currentID - 1) {
          if (j == indexTwo) {
            that.data.questions[i].items[j].chooseObj = true;
          } else {
            that.data.questions[i].items[j].chooseObj = false;
          }
        }
      }
    }

    this.setData({
      questions: this.data.questions
    })


    if (that.data.status === 0) {
      wx.showToast({
        title: '此闯关尚未发布！',
        icon: 'none',
        duration: 1000
      });
    } else if (that.data.status === 2) {
      wx.showToast({
        title: '此闯关处于停止状态！',
        icon: 'none',
        duration: 1000
      });
    }

    if (that.data.attachTxt && that.data.attachTxt.length) {
      processFun(rsaValue);
    } else {
      processFun(itemRadio);
    }

    function processFun(process) {
      var answerArray = that.data.answerArray;
      if (!process) { //答题错误，进入失败界面
        var submitTime = new Date();
        var costTime = parseInt((submitTime - that.data.firstCgCounterDate) / 1000); //用户最终答题时间
        if (costTime < 1) { //最少用时0秒
          costTime = 1;
        }

        answerArray["answers"].push({
          "Topice": topic,
          "Choice": id
        });

        var securityString;
        if (that.data.attachTxt && that.data.attachTxt.length > 0) {
          securityString = that.rsaEncryptionAlgorithm(JSON.stringify(answerArray["answers"]));
        } else {
          securityString = ""
        }


        answerArray = that.createSubmiAnswerPaper(costTime, securityString);

        questionnaireService.scoreRank(answerArray, that.data.isPreview).then(function (res) {
          quitMidWay = false;
          that.setData({
            quitMidWay: quitMidWay
          });
          clearInterval(that.data.maxChuangGuanTimer);
          var joinId = that.data.joinId;
          var rank = that.data.rank;
          joinId = res.shortJoinUrl;
          rank = res.rank;
          if (joinId != '') {
            wx.redirectTo({
              url: '/pages/passLevel/passFail/passFail?shortUrl=' + that.data.shortUrl + '&join=' + joinId + "&rank=" + rank + "&costTime=" + costTime + "&groupGId=" + that.data.groupGId
            })
          }
        }).catch(function (res) {

          clearInterval(that.data.maxChuangGuanTimer);
          wx.showToast({
            title: res,
            icon: "none",
            duration: 1000
          })
          setTimeout(function () {
            wx.redirectTo({
              url: '/pages/passLevel/passFail/passFail?shortUrl=' + that.data.shortUrl + '&join=' + 0 + "&rank=" + 0 + "&costTime=" + 0 + "&groupGId=" + that.data.groupGId
            })
          }, 2000);

        });

      } else {  //进入下一题
        that.timeLimit();
        currentID += 1;
        var curTotal = that.data.curTotal + 1;
        if (curTotal >= that.data.questions.length) {
          curTotal = that.data.questions.length;
        }
        answerArray["answers"].push({
          "Topice": topic,
          "Choice": id
        })
        that.setData({
          curTotal: curTotal,
          answerArray: answerArray
        });

        if (answerArray["answers"].length === that.data.questions.length) {
          var submitTime = new Date();
          var costTime = parseInt((submitTime - that.data.firstCgCounterDate) / 1000); //用户最终答题时间
          if (costTime < 1) { //最少用时0秒
            costTime = 1;
          }

          var securityString;
          if (that.data.attachTxt && that.data.attachTxt.length > 0) {
            securityString = that.rsaEncryptionAlgorithm(JSON.stringify(answerArray["answers"]));
          } else {
            securityString = ""
          }

          var answerArray = that.createSubmiAnswerPaper(costTime, securityString);

          questionnaireService.scoreRank(answerArray, that.data.isPreview).then(function (res) {
            quitMidWay = false;
            that.setData({
              quitMidWay: quitMidWay
            });
            clearInterval(that.data.maxChuangGuanTimer);
            var joinId = that.data.joinId;
            var rank = that.data.rank;
            joinId = res.shortJoinUrl;

            rank = res.rank;


            if (joinId != '') {
              wx.redirectTo({
                url: '/pages/passLevel/passSuccess/passSuccess?shortUrl=' + that.data.shortUrl + '&join=' + joinId + "&rank=" + rank + "&costTime=" + costTime + "&groupGId=" + that.data.groupGId
              })
            }
          }).catch(function (res) {
            clearInterval(that.data.maxChuangGuanTimer);
            wx.showToast({
              title: res,
              icon: "none",
              duration: 1000
            });
            setTimeout(function () {
              wx.redirectTo({
                url: '/pages/passLevel/passFail/passFail?shortUrl=' + that.data.shortUrl + '&join=' + 0 + "&rank=" + 0 + "&costTime=" + 0 + "&groupGId=" + that.data.groupGId
              })
            }, 2000);

          });
        }
      }
    }

    this.setData({
      currentID: currentID,
      questions: this.data.questions
    })

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {


  },

  /**
   * 生命周期函数--监听页面卸载    点击页面左上角返回按钮
   */
  onUnload: function () {
    var that = this;
    var quitMidWay = that.data.quitMidWay;

    if (quitMidWay) {
      var submitTime = new Date();
      var costTime = parseInt((submitTime - that.data.firstCgCounterDate) / 1000); //用户最终答题时间
      var answerArray = that.data.answerArray;
      clearInterval(that.data.maxChuangGuanTimer);

      var securityString;
      if (that.data.attachTxt && that.data.attachTxt.length > 0) {
        securityString = that.rsaEncryptionAlgorithm(JSON.stringify(that.data.answerArray["answers"]));
      } else {
        securityString = ""
      }

      var answerArray = that.createSubmiAnswerPaper(costTime, securityString);

      questionnaireService.scoreRank(answerArray, that.data.isPreview);
    }
  },

  /**
   * 时针
   */
  timeLimit: function () {
    var that = this;
    var firstCgCounterDate = that.data.firstCgCounterDate;
    var secondsLimit = that.data.secondsLimit; //倒计时十秒
    var startAngel = 0;
    var startCgCounterDate = new Date(); //点击开始闯关按钮的时间
    var round1Style = that.data.round1Style;
    var round2Style = that.data.round2Style;
    var totalUseTime = that.data.totalUseTime;
    var startNext = false;
    var answerArray = that.data.answerArray;
    var maxChuangGuanTimer = that.data.maxChuangGuanTimer;
    var quitMidWay = that.data.quitMidWay;


    if (!firstCgCounterDate)
      firstCgCounterDate = new Date();

    that.setData({
      maxCgTime: secondsLimit,
      firstCgCounterDate, firstCgCounterDate
    });

    maxChuangGuanTimer = setInterval(function () {
      var currDate = new Date(); //开始倒计时的时间

      startAngel = startAngel + 360 / ((secondsLimit)); //旋转的角度
      var totalMinSec = parseInt((currDate - startCgCounterDate) / 1000); //答题时间（秒）
      var leftCounter = secondsLimit - totalMinSec;   //剩余时间(秒)

      if (leftCounter <= 0) {
        clearInterval(maxChuangGuanTimer);
        round1Style = "transform: rotate(" + 180 + "deg); background-color: rgba(0,145,255,1)";//补白
        that.setData({
          round1Style: round1Style
        });
        totalUseTime = parseInt((new Date() - that.data.firstCgCounterDate) / 1000); //用户所花时间

        var securityString;
        if (that.data.attachTxt && that.data.attachTxt.length > 0) {
          securityString = that.rsaEncryptionAlgorithm(JSON.stringify(that.data.answerArray["answers"]));
        } else {
          securityString = ""
        }

        var answerArray = that.createSubmiAnswerPaper(totalUseTime, securityString);

        questionnaireService.scoreRank(answerArray, that.data.isPreview).then(function (res) {
          quitMidWay = false;
          that.setData({
            quitMidWay: quitMidWay
          });
          clearInterval(that.data.maxChuangGuanTimer);
          var joinId = that.data.joinId;
          var rank = that.data.rank;
          joinId = res.shortJoinUrl;

          rank = res.rank;

          if (joinId != '') {
            wx.redirectTo({
              url: '/pages/passLevel/passFail/passFail?shortUrl=' + that.data.shortUrl + '&join=' + joinId + "&rank=" + rank + "&costTime=" + totalUseTime + "&groupGId=" + that.data.groupGId
            })
          }
        }).catch(function (res) {
          clearInterval(that.data.maxChuangGuanTimer);
          wx.showToast({
            title: res,
            icon: "none",
            duration: 1000
          })
          setTimeout(function () {
            wx.redirectTo({
              url: '/pages/passLevel/passFail/passFail?shortUrl=' + that.data.shortUrl + '&join=' + 0 + "&rank=" + 0 + "&costTime=" + 0 + "&groupGId=" + that.data.groupGId
            })
          }, 2000)

        }); //时间到点，自动跳转到失败页面
      }

      if (totalMinSec <= secondsLimit / 2) {
        round1Style = "transform: rotate(" + startAngel + "deg)"; //前半圈
      } else {
        round2Style = "transform: rotate(" + startAngel + "deg); background-color: rgba(0,145,255,1)";//后半圈
      }

      that.setData({
        totalUseTime: totalUseTime,
        maxCgTime: leftCounter,
        round1Style: round1Style,
        round2Style: round2Style
      });

    }, 1000);

    that.setData({
      maxChuangGuanTimer: maxChuangGuanTimer,
    });
  },

  /**
   * 生成提交答卷
   */
  createSubmiAnswerPaper(costTime, attachText) {
    var that = this;
    var answerArray = that.data.answerArray;

    app.globalData.userInfo ? answerArray["nickName"] = app.globalData.userInfo.nickName : answerArray["nickName"] = '';
    app.globalData.userInfo ? answerArray["avatarUrl"] = app.globalData.userInfo.avatarUrl : answerArray["avatarUrl"] = '';
    answerArray["shortUrl"] = that.data.shortUrl;
    answerArray["costTime"] = costTime; //最终所用时间
    answerArray["ticket"] = that.data.ticket;
    answerArray["openGId"] = that.data.groupGId;

    if (attachText && attachText.length > 0) {
      answerArray["attachText"] = attachText;
      answerArray["answers"] = [];
    }


    return answerArray;
  },

  /**
   * 答案加密
   */
  rsaEncryptionAlgorithm(stringCode) {
    var that = this;

    var encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(that.data.publicKey_pkcs);
    //var encStr = encrypt_rsa.encrypt(stringCode)
    //encStr = RSA.hex2b64(encStr);
    var encStr = "";

    var maxLength = 117;

    var lt = "";
    var ct = "";

    if (stringCode.length > maxLength) {
      lt = stringCode.match(/.{1,117}/g);
      lt.forEach(function (entry) {
        var t1 = encrypt_rsa.encrypt(entry);
        ct += t1;
      });
      encStr = RSA.hex2b64(ct);
    } else {
      var t = encrypt_rsa.encrypt(stringCode);
      encStr = RSA.hex2b64(t);
    }

    return encStr;
  }

})