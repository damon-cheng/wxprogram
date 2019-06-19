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
    selectArray: [], //搜索出来的考卷

    selectTopicArray: [], //已选题目数组

    selectedChosenArray: [], //用作点击过题目的数组

    currentActivityId: 0,
    content: []
  },

  /**
   * 输入搜索关键字
   */
  searchInputEvent: function (e) {
    var that = this;
    var value = e.detail.value;
    that.setData({
      searchData: value
    });
  },
  /**
  * 清空搜索框
  */
  searchClearEvent() {
    var that = this;
    that.setData({
      searchData: ""
    });
  },
  /**
  * 选择一个考卷进入
  */
  enterEvent(e) {
    var that = this;
    var currentId = e.currentTarget.dataset.index;
    var activityId = e.currentTarget.dataset.id;
    var selectArray = that.data.selectArray;

    if (!that.data.isEnter) {//没被点击都被隐藏
      selectArray.forEach(function (value, index) {
        if (selectArray[index] != selectArray[currentId]) {
          value.selected = true;
          value.fixed = false;
        } else {
          value.fixed = true;
        }
      })
      questionnaireService.getBankQueTotal(activityId).then(function (res) {
        if (res && res.length > 0) {
          res.forEach(function (value, index) {
            value.isChoose = false;
            value.title = util.convertHtmlToText(value.title);
            value.items.itemTitle = util.convertHtmlToText(value.items.itemTitle);
          })
          that.data.currentActivityId = activityId;

          var selectedChosenArray = wx.getStorageSync("chosenCookie");
          if (selectedChosenArray) {
            res.forEach(function (value, index) {
              selectedChosenArray.forEach(function (value1, index1) {
                if (value1.ActivityId == that.data.currentActivityId) {
                  if (value1.topicObj.topic == value.topic) {
                    value.isChoose = true;
                  }
                }
              })
            })
          }
          that.setData({
            selectTopicArray: res,
            currentActivityId: that.data.currentActivityId
          })
        }
      }).catch(function () {
        wx.showToast({
          title: '未获取到题目！',
          icon: "none",
          duration: 1500
        })
      });
    } else {
      selectArray.forEach(function (value, index) {   //全部都显示闯关
        value.selected = false;
        value.fixed = false;
      })
      // wx.removeStorageSync("chosenCookie");
    }

    wx.pageScrollTo({
      scrollTop: 0
    })

    that.setData({
      selectArray: selectArray,
      isEnter: !that.data.isEnter
    });
  },
  /**
  * 确认搜索
  */
  searchSubmitEvent(e) {
    var that = this;
    var keyWord = e.detail.value;
    var searchData = that.data.searchData;

    if (keyWord) {
      that.publicSearchSubmitEvent(keyWord);
    } else {
      wx.showToast({
        title: '请输入搜索关键字',
        icon: "none",
        duration: 1500
      })
    }

    if (searchData) {
      that.publicSearchSubmitEvent(searchData);
    } else {
      wx.showToast({
        title: '请输入搜索关键字',
        icon: "none",
        duration: 1500
      })
    }
  },
  publicSearchSubmitEvent(keyWord) {
    var that = this;
    var content = that.data.content;

    questionnaireService.lookKeyWord(keyWord).then(function (res) {
      if (res && res.length > 0) {
        res.forEach(function (value) {
          value.selected = false;
          value.content = [];
          var length = keyWord.length;
          var index = value.title.indexOf(keyWord);
          var value1 = value.title.substr(0, index);
          var value2 = value.title.substr(index + length);
          value.content.push(keyWord, value1, value2);
        });
        that.setData({
          content: content,
          selectArray: res
        })
      }
    });
  },
  /**
  * 查看已选题目
  */
  lookSelectedEvent: function () {
    var that = this;
    var selectedChosenArray = that.data.selectedChosenArray

    if (selectedChosenArray && selectedChosenArray.length > 0) {
      wx.navigateTo({
        url: '/pages/passLevel/bankLookSelect/bankLookSelect?activityId=' + that.data.setActivityId + "&currentActivityId=" + that.data.currentActivityId,
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
  * 点击checkbox选择想要的题目
  */
  chooseTopicEvent: function (e) {
    var that = this;
    var currentIndex = e.currentTarget.dataset.index;
    var chooseId = e.currentTarget.dataset.topic;
    var selectTopicArray = that.data.selectTopicArray; //点击某个问卷，显示出来问卷中的题目
    var checkd = e.target.dataset.checked ? false : true;
    var selectedChosenArray = that.data.selectedChosenArray

    console.log("selectTopicArray", selectTopicArray)



    if (checkd) {
      selectTopicArray.forEach(function (value, index) {
        if (value.topic == chooseId) {

          selectedChosenArray.push({  //从添加到列表
            ActivityId: that.data.currentActivityId,
            topicObj: selectTopicArray[index]
          })

          value.isChoose = true;
        }
      });
      wx.setStorageSync("chosenCookie", selectedChosenArray);
    } else {
      selectTopicArray.forEach(function (value, index) {
        if (value.topic == chooseId) {
          value.isChoose = false;
        }
      });
      selectedChosenArray.forEach(function (value, index) {  //从添加的列表中删除
        if (value.topicObj.topic == chooseId) {
          selectedChosenArray.splice(index, 1);
        }
      })

      wx.setStorageSync("chosenCookie", selectedChosenArray);
    }


    that.setData({
      selectTopicArray: selectTopicArray,
      selectedChosenArray: selectedChosenArray
    });
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
          delta: 1
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let isIphoneX = app.globalData.isIphoneX;

    that.setData({
      isIphoneX: isIphoneX,
      setActivityId: options.activityId ? options.activityId : 0
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
    var selectTopicArray = that.data.selectTopicArray;



    if (selectedChosenArray) {
      selectTopicArray.forEach(function (value, index) {
        value.isChoose = false;
      });

      for (var i = 0; i < selectedChosenArray.length; i++) {
        for (var j = 0; j < selectTopicArray.length; j++) {
          if (selectedChosenArray[i].ActivityId == that.data.currentActivityId) {
            if (selectedChosenArray[i].topicObj.topic == selectTopicArray[j].topic) {
              selectTopicArray[j].isChoose = true;
              break;
            }
          }
        }
      }
      that.setData({
        selectTopicArray: selectTopicArray,
        selectedChosenArray: selectedChosenArray
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