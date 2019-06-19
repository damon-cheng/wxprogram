var util = require('../../../utils/util.js');
var config = require("../../../services/config").config;
var questionnaireService = require('../../../services/questionnaireService.js');
var userServices = require('../../../services/userServices.js');
var redWrap = require('../../../services/redWrap.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cgPath: "pages/passLevel/passShow/passShow?shortUrl=",
    appId: "wxebc009f299947ac9",
    nickName: "",
    title: "",
    shortUrl: "",
    activityId: 0,
    status: 0,
    isCanPulish: false,
    imgUrl: "/images/share.png",
    url: app.globalData.url + '/images/',
    modalFlag: true,
    qcodeUrl: "",
    isShare: true,
    isJoin: true,
    isInfo: true,
    formId: "",
    openStatus: null //openStatus字段   null是未申请。 0：正在审核 1:审核通过 2:审核退出 3:审核失败
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var imgUrl = that.data.imgUrl;
    var cgPath = that.data.cgPath;

    app.weToast();

    wx.showShareMenu({
      // 要求小程序返回分享目标信息
      withShareTicket: true
    });

    if (options.shortUrl) {
      that.setData({
        cgPath: cgPath + options.shortUrl,
        shortUrl: options.shortUrl,
      });
    }

    if (options.activityId) {
      that.setData({
        activityId: options.activityId
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


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    if (that.data.activityId) {
      questionnaireService.getQuestionnaire(that.data.activityId).then(function (res) {
        that.setData({
          openStatus: res.openStatus,
          title: res.name,
          description: res.description, //闯关描述
          status: res.status,
          isCanPulish: res.isCanPulish, //是否是发布者
        });
      });

      // questionnaireService.getQuestionnaireViaShortUrl(that.data.shortUrl).then(function (survey) {
      //   that.setData({
      //     title: survey.name,
      //     description: survey.description, //闯关描述
      //     status: survey.status,
      //     isCanPulish: survey.isCanPulish, //是否是发布者
      //   });
      // });
    }
  },
  /**
   *  预览模式 && 答题模式
   */
  previewModeTrigger: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/passLevel/passShow/passShow?shortUrl=' + that.data.shortUrl + "&isPreview=1"
    });
  },
  answerModeTrigger: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/passLevel/passShow/passShow?shortUrl=' + that.data.shortUrl
    });
  },
  /**
   * 复制到剪贴板
   */
  copyTBL: function (e) {
    var that = this;
    var appId = that.data.appId;
    var cgPath = that.data.cgPath;
    // var current = e.currentTarget.dataset.id;
    var setdata = "第一步\n" + "在您的公众号中关联闯关星小程序。\n" + "闯关星的AppID：" + appId + "\n申请后，需我们同意\n" + "第二步\n" + "在公众号中插入本次闯关的页面路径。\n" + cgPath;

    wx.setClipboardData({
      data: setdata,
      success: function (res) {
        wx.showToast({
          title: "复制成功",
          icon: "none",
          duration: 2000
        })
      }
    });
  },
  /**
   * 生成分享图片
   */
  shareImgTrigger: function (e) {
    var that = this;
    var qcodeUrl = that.data.qcodeUrl;
    if (that.data.shortUrl) {
      qcodeUrl = config.serverDomain + "/home/qrcode/" + that.data.shortUrl;
      that.setData({
        qcodeUrl: qcodeUrl,
        modalFlag: false,
        isShare: false
      });
    }
  },
  /**
   * 保存图片到手机
   */
  saveImgToPhotosAlbumTap: function () {
    var that = this;
    var qcodeUrl = that.data.qcodeUrl;

    if (!wx.saveImageToPhotosAlbum) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
      return;
    }

    //可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.writePhotosAlbum" 这个 scope  
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {

          // 接口调用询问  
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              that.downloadImage(qcodeUrl);
            },
            fail() {
              // 用户拒绝了授权  
              // 打开设置页面  
              wx.openSetting({
                success: function (data) {
                  console.log("openSetting: success");
                },
                fail: function (data) {
                  console.log("openSetting: fail");
                }
              });
            }
          })
        } else {
          that.downloadImage(qcodeUrl)
        }
      },
      fail(res) {

      }
    })
  },
  /**
   * 下载文件
   */
  downloadImage: function (qcodeUrl) {
    var that = this;
    wx.downloadFile({
      url: qcodeUrl,
      success: function (res) {
        // 保存图片到系统相册  
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {

            wx.showToast({
              title: "保存成功",
              icon: "success",
              duration: 1000
            });
          },
          fail(res) {
            wx.showToast({
              title: "保存失败",
              icon: "none",
              duration: 1000
            });
          }
        })
      },
      fail: function (res) {

      }
    })
  },
  /**
   * 嵌入公众号
   */
  embeddedPublicNum: function () {
    var that = this;
    that.setData({
      modalFlag: false,
      isJoin: false
    });
  },
  /**
  * 申请加入闯关广场按钮
  */
  joinExperienceZone: function () {
    var that = this;
    var title = "";

    if (that.data.openStatus === null) { //没申请  
      that.setData({
        modalFlag: false,
        isInfo: false,
      });
    } else {
      if (that.data.openStatus === 1) {
        title = "审核已经通过，进入闯关广场";
      } else if (that.data.openStatus === 0) {
        title = "您提交的申请正在审核中，请耐心等待";
      } else if (that.data.openStatus === 2) {
        title = "闯关已经退出闯关广场";
      } else if (that.data.openStatus === 3) {
        title = "您提交的申请，审核不通过。";
      }
      wx.showToast({
        title: title,
        icon: 'none',
        duration: 2500,
        success: function() {
          if (that.data.openStatus === 1) {
            setTimeout(function () {
              wx.navigateTo({
                url: '/pages/passLevel/squareZone/squareZone',
              })
            }, 1500)
          }
        }
      })
    }
  },
  /**
  * 申请本闯关加入到体验区
  */
  formApplyEvent: function (e) {
    var that = this;
    var formId = e.detail.formId;
    that.setData({
      formId: formId
    });
    that.applyLaunch();
  },
  /**
   * 发起申请请求
   */
  applyLaunch: function () {
    var that = this;

    questionnaireService.originApply(that.data.shortUrl, that.data.formId).then(function () {//发起申请
      wx.showToast({
        title: "已成功提交审核，审核通过后，会自动加入闯关广场",
        icon: 'none',
        duration: 2500
      })
    }).catch(function (res) {
      var title = "";
      switch (parseInt(res.message)) {
        case 1: title = "申请失败，请确保闯关红包金额大于等于100元";
          break;
        case 2: title = "已成功提交审核，审核通过后，会自动加入闯关广场";
          break;
        case 3: title = "您提交的申请正在审核中，请耐心等待";
          break;
        case 4: title = "已经加入闯关广场";
          break;
        case 5: title = "闯关已经退出闯关广场";
          break;
        case 6: title = "您提交的申请，审核不通过。";
          break;
      }
      wx.showToast({
        title: title,
        icon: 'none',
        duration: 2500
      })
    });

  },
  /**
   * 关闭生成按钮
   */
  modalFlagClose: function () {
    var that = this;
    that.setData({
      modalFlag: true,
      isShare: true,
      isJoin: true,
      isInfo: true
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var that = this;
    var nickName = app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : '';
    if (res.from === 'button') {
      return {
        title: nickName + '邀请您参与：' + that.data.title,
        path: '/pages/passLevel/passShow/passShow?shortUrl=' + that.data.shortUrl,
        imageUrl: that.data.imgUrl,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    } else {
      return
    }
  }
})