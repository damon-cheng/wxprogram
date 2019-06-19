var util = require('../../../utils/util.js')
var questionnaireService = require('../../../services/questionnaireService.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    if (options.showConclusion === "false" || !options.showConclusion) {
      this.setData({ hiddenDescription: true });
      wx.setNavigationBarTitle({ title: "编辑标题" });
    }
    else {
      this.setData({ hiddenDescription: false });
      wx.setNavigationBarTitle({ title: "编辑结束语" });
    }

    if (options.activityId) {
      this.setData({ activityId: parseInt(options.activityId) });
    }

    if (options.qtype) {
      this.setData({ qtype: parseInt(options.qtype) });
    }

    var survey = this.data.activityId == 0 ? wx.getStorageSync('survey:0') || []
      : wx.getStorageSync('survey:edit');

    if (survey.title || survey.description) {
      this.setData({
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

    if (this.data.activityId == 0) {
      if (this.data.title) {
        wx.showToast({
          title: '数据正在提交',
          icon: 'loading',
          duration: 10000
        });
        questionnaireService.addQuestionnaire(that.data.title, that.data.description, that.data.conclusion, this.data.qType).then(function (res) {
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

        this.wetoast.toast({
          title: "标题不能空",
          duration: 1000
        })
      }
    } else {
      if (this.data.title) {
        questionnaireService.updateQuestionnaireTitle(this.data.activityId,
          that.data.title, that.data.description, that.data.conclusion, this.data.qType).then(function (res) {
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

  },

  formReset: function () {
    wx.navigateBack({})
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