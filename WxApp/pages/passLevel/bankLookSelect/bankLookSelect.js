var util = require('../../../utils/util.js')
var questionnaireService = require('../../../services/questionnaireService.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    letterArray: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    isChoose: false,
    activityId: 0,
    searchData: "",
    isEnter: false,
    currentTopic: 0, //已选题目数量

    selectTopicArray: [], //已选题目数组
    alreadyChosenArray: [], //已经勾选选择的题目数组
    selectedChosenArray: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let isIphoneX = app.globalData.isIphoneX; 

    that.setData({
      isIphoneX: isIphoneX,
      setActivityId: options.activityId ? options.activityId : 0,
      currentActivityId: options.currentActivityId ? options.currentActivityId : 0
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
    var that = this;
    var selectedChosenArray = wx.getStorageSync("chosenCookie");
    that.setData({
      selectedChosenArray: selectedChosenArray
    });
  },
  /**
   * 删除
   */
  deleteChosenEvent(e) {
    var that = this;
    var selectedChosenArray = that.data.selectedChosenArray;
    var currentTopic = e.currentTarget.dataset.topic;

    selectedChosenArray.forEach(function (value, index) {
      if (value.topicObj.topic == currentTopic) {
        selectedChosenArray.splice(index, 1);
        wx.showToast({
          title: '成功移除',
          icon: "success",
          duration: 1500
        })
      }
    });
    that.setData({
      selectedChosenArray: selectedChosenArray
    });
    wx.setStorageSync("chosenCookie", that.data.selectedChosenArray);
  },
  /**
   * 点击继续选题按钮
   */
  continueChooseEvent() {
    var that = this;
    wx.navigateBack();
  },
  /**
   * 完成选题
   */
  finishChosenEvent() {
    var that = this;
    var selectedChosenArray = that.data.selectedChosenArray;
    var result = [];

    selectedChosenArray.forEach(function (value, index) {
      for (var key in value.topicObj) {
        if (key == "isChoose") {
          delete value.topicObj[key];
          result.push(value.topicObj);
        }
      }
    });

    if (selectedChosenArray && selectedChosenArray.length > 0) {
      questionnaireService.addQuestionlist(that.data.setActivityId, result).then(function (res) {
        wx.removeStorageSync("chosenCookie");
        wx.navigateBack({
          delta: 2
        })
      }).catch(function () {
        wx.showToast({
          title: "添加题目失败，请重新选择",
          icon: "none",
          duration: 2000
        });
      })
    } else {
      wx.showToast({
        title: '还未添加题目',
        icon: "none",
        duration: 1500
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