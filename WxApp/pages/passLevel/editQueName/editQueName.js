var util = require('../../../utils/util.js')
var questionnaireService = require('../../../services/questionnaireService.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isBank: 0, //是否是题库抽题跳转过来进行编辑  0 不是  1 是 
    url: app.globalData.url + '/images/',
    placeholderTitle: "编辑闯关名称",
    placeholderDes: "编辑闯关说明",
    title: "",
    description: "",
    conclusion: "",
    qType: 6,
    caveat: false,
    activityId: 0,
    hiddenDescription: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.showConclusion === "false" || !options.showConclusion) {
      that.setData({ hiddenDescription: true });
      wx.setNavigationBarTitle({ title: "编辑标题" });
    }
    else {
      that.setData({ hiddenDescription: false });
      wx.setNavigationBarTitle({ title: "编辑结束语" });
    }

    if (options.isBank == 1) {
      wx.getStorage({
        key: 'isBankInfo',
        success: function (res) {
          if (res.data) {
            that.setData({
              title: res.data.title,
              description: res.data.description
            });
          }
        },
      })

      that.setData({ 
        isBank: parseInt(options.isBank),
        title: options.title,
        description: options.description,
        });
    }

    if (options.activityId) {
      that.setData({ activityId: parseInt(options.activityId) });
    }

    if (options.qtype) {
      that.setData({ qtype: parseInt(options.qtype) });
    }

    var survey = that.data.activityId == 0 ? wx.getStorageSync('survey:0') || []
      : wx.getStorageSync('survey:edit');

    if (survey.title || survey.description) {
      that.setData({
        title: survey.title,
        description: survey.description,
        conclusion: survey.conclusion
      });
    }

    app.weToast();
  },

  formSubmit: function (e) {
    var that = this;
    var title = e.detail.value.title;
    var description = e.detail.value.description;
    var conclusion = e.detail.value.conclusion;
    var isBank = that.data.isBank

    if (isBank) {////是否是题库抽题跳转过来进行编辑
      if (that.data.title) {
        wx.setStorage({
          key: "isBankInfo",
          data: {
            title: title,
            description: description
          }
        });
        wx.switchTab({
          url: '../chooseCheckPoints/chooseCheckPoints',
        });
      } else {
        that.wetoast.toast({
          title: "标题不能空",
          duration: 1000
        })
      }
    } else {
      if (that.data.activityId == 0) {
        if (title) {
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
          this.wetoast.toast({
            title: "标题不能空",
            duration: 1000
          })
        }
      }
    }


  },

  formReset: function () {
    this.setData({
      title: '',
      description: '',
      conclusion: ''
    });
    
    wx.switchTab ({
      url: "../index"
    })
  },
  inputTitle: function (e) {
    this.setData({ title: e.detail.value });
  },
  inputConclusion: function (e) {
    this.setData({ conclusion: e.detail.value });
  },
  inputDescription: function (e) {
    this.setData({ description: e.detail.value });
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
    if (that.data.isBank == 1) {
      wx.getStorage({
        key: 'isBankInfo',
        success: function (res) {
          if (res.data) {
            that.setData({
              title: res.data.title,
              description: res.data.description
            });
          }
        },
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
  onShareAppMessage: function () {

  }
})