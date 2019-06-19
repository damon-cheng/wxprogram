var util = require('../../../utils/util.js')
var questionnaireService = require('../../../services/questionnaireService.js');
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
    url: app.globalData.url + '/images/',
    editIndex: 0,
    delBtnWidth: 160,//删除按钮宽度单位
    array: [],
    questionTypeNames: [],
    textLines: ['1', '2', '3', '4', '5'],
    textFormats: ['无', '整数', '小数', '日期', '手机', '固话', '手机或固话', '邮件',
      '省份城市', '省市区', '高校', '地图', '网址', '身份证号', '学号', 'QQ', '汉字', '中文姓名', '英文'],
    scoreIndex: 3,
    scoreArrary: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    fileSizeArrary: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    fileSizeIndex: 3,
    index: 0,
    indexTextLine: 0,
    indexTextFormat: 0,
    title: "",
    randomChoice: false,
    topic: "",
    numPerRow: 1,
    hasValue: false,
    requir: true,
    minValue: null,
    maxValue: null,
    sizeArrary: [],
    minsizeIndex: null,
    maxsizeIndex: null,
    mode: null,
    hasJump: false,
    anytimeJumpto: "",
    isTouPiao: null,
    touPiaoWidth: null,
    displayNum: null,
    displayPercent: null,
    displayThumb: null,
    ins: "",
    tag: null,
    height: null,
    verify: null,
    ext: '.gif|.png|.jpg|.jpeg|.bmp',
    maxSize: null,
    width: null,
    items: util.getChoiceItems(),
    mustAnswer: true,
    hiddenChocieQusetion: false,
    activityId: 0,
    showModalStatus: false,
    animationData: null,
    icons: [],
    fractionIndex: 0,
    fraction: [5, 10, 15, 20],


    isSpeaking: false,
    outputTxt: "",
    j: 1,//帧动画初始图片 
    callBack: null //回调函数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  bindPickerChange: function (e) {
    var that = this;

    that.setData({
      fractionIndex: e.detail.value
    })
  },
  onLoad: function (options) {
    var that = this;
    app.weToast();

    mp3Recorder.onStart(() => { });

    mp3Recorder.onStop((res) => {

      const { tempFilePath } = res

      questionnaireService.getSignature().then(function (res) {
        var urls = res.host;
        that.processFileUploadForAsr(urls, tempFilePath, res, that.data.callBack);
      });

    });

    that.setData({
      activityId: options.activityId ? parseInt(options.activityId) : 0,
      topic: options.topic ? options.topic : '',
      array: util.getAllAnswerTypes(1),
      questionTypeNames: util.getAllAnswerTypeNames(1),
      icons: util.getAnswerIcons(1)
    });
  },
  onShow: function () {
    if (this.data.topic) {

      var that = this;
      var surveyCache = wx.getStorageSync('survey:edit') || [];
      var questions = surveyCache.questions.filter(function (item) {
        return (item.topic === that.data.topic && item.type != 'page' && item.type != 'cut')
      });

      var question = questions[0];

      for (var i = 0; i < this.data.questionTypeNames.length; i++) {
        if (this.data.questionTypeNames[i] === question.type) {
          this.setData({ index: i });
        }
      }

      var sizeArrary = [];

      if (question.type === "radio") {
        if (question.mode && question.mode > 0) {
          this.setData({ scoreIndex: question.items.length - 2, index: 4 });
        } else {
          this.setData({ index: 0 });
        }
      }

      that.data.fraction.forEach(function (value, index) {
        if (value == question.ceShiValue) {
          that.setData({
            fractionIndex: index
          })
        }
      })

      this.setData({
        title: question.title,
        randomChoice: question.randomChoice,
        topic: question.topic,
        numPerRow: question.numPerRow,
        hasValue: question.numPerRow,
        mustAnswer: question.requir,
        minValue: question.minValue,
        maxValue: question.maxValue,
        sizeArrary: sizeArrary,
        mode: question.mode,
        hasJump: question.hasJump,
        anytimeJumpto: question.anytimeJumpto,
        isTouPiao: question.isTouPiao,
        touPiaoWidth: question.touPiaoWidth,
        displayNum: question.displayNum,
        displayPercent: question.displayPercent,
        displayThumb: question.displayThumb,
        ins: question.ins,
        tag: question.tag,
        height: question.height,
        verify: question.verify,
        maxSize: question.maxSize,
        width: question.width,
        items: question.items,
        hiddenChocieQusetion: question.type == "question",
        ceShiValue: question.ceShiValue,
      })
    }

  },
  formSubmit: function (e) {
    var that = this;
    var question = {
      "activityId": this.data.activityId,
      "title": this.data.title,
      "type": this.data.questionTypeNames[this.data.index],
      "randomChoice": this.data.randomChoice,
      "topic": this.data.topic,
      "numPerRow": this.data.numPerRow,
      "hasValue": this.data.hasValue,
      "requir": this.data.mustAnswer,
      "minValue": this.data.minValue,
      "maxValue": this.data.maxValue,
      "mode": this.data.mode,
      "hasJump": this.data.hasJump,
      "anytimeJumpto": this.data.anytimeJumpto,
      "isTouPiao": this.data.isTouPiao,
      "touPiaoWidth": this.data.touPiaoWidth,
      "displayNum": this.data.displayNum,
      "displayPercent": this.data.displayPercent,
      "displayThumb": this.data.displayThumb,
      "ins": this.data.ins,
      "tag": this.data.tag,
      "height": this.data.height,
      "verify": this.data.verify === "无" ? "0" : this.data.verify,
      "ext": this.data.ext,
      "maxSize": this.data.maxSize,
      "width": this.data.width,
      "items": this.data.items,
      "ceShiValue": 10,
      //"ceShiValue": this.data.fraction[this.data.fractionIndex],
    }



    if (!question.title || question.title == "") {
      wx.showModal({
        title: '',
        content: "请输入标题",
        showCancel: false,
      });
      return;
    }
    if (question.items != null) {
      var items = question.items.filter(function (item) {
        return item.itemTitle === '';
      })

      if (items.length > 0) {

        wx.showModal({
          title: '',
          content: "请输入选项内容",
          showCancel: false,
        });
        return;
      }
    }


    var arryFilder = question.items.filter(function (items) {
      return items.itemRadio == true;
    })

    if (arryFilder.length === 0) {
      wx.showModal({
        title: '',
        content: "请选择一个正确答案",
        showCancel: false,
      }, 1000);
      return;
    }
    var isRepeat = false;
    var itemTitleContent = {};
    question.items.forEach(function (items) {
      if (items.itemTitle != '') {
        if (itemTitleContent[items.itemTitle]) {
          isRepeat = true;
          wx.showModal({
            title: '',
            content: "选项名称不能重复！",
            showCancel: false,
          }, 1000);
        } else {
          itemTitleContent[items.itemTitle] = items.itemTitle;
        }
      }
    })
    if (isRepeat) {
      return;
    }
    var that = this;
    if (this.data.topic) {
      questionnaireService.updateQuestion(this.data.activityId, question).then(function (res) {
        wx.setStorageSync("addSuvery", true);
        wx.navigateBack();
        
      }).catch(function (res) {
        that.wetoast.toast({
          title: res,
          duration: 1000
        })
      });
    } else {
      questionnaireService.addQuestion(this.data.activityId, question).then(function (res) {
        wx.setStorageSync("addSuvery", true);
        wx.navigateBack();
      }).catch(function(res){
        that.wetoast.toast({
          title: res,
          duration: 1000
        })
      });
    }

  },
  swiperChange: function (e) {
    console.log(e)
    var that = this;
    var items = this.data.items;
    var index = e.detail.value;
    items.forEach(function (v, i) {
      v.itemRadio = false;
    })
    items[index].itemRadio = true;
    that.setData({
      items: items
    });
  },
  changeChoiceqQuestionTitle: function (e) {
    this.setData({ title: e.detail.value });
  },
  changeChoiceqQuestionItemTitle: function (e) {
    var index = e.target.dataset.index;
    var items = this.data.items;
    items[index].itemTitle = e.detail.value
    this.setData({ items: items });
  },
  setcont: function (e) {
    var index = e.target.dataset.index;
    var items = this.data.items;
    items[index].itemTitle = e.detail.value
    this.setData({ items2: items });
  },
  addChoiceqQuestionAnswer: function () {
    var items = this.data.items;
    items.push({
      "itemTitle": "",
      "itemRadio": false,
      "itemValue": "-77777",
      "itemJump": 0,
      "itemTextBox": null,
      "itemRequired": null,
      "itemImg": null,
      "itemLabel": null,
      "itemHuChi": null,
      "itemImgText": false,
      "itemDesc": null,
    });
    this.setData({
      items: items
    });

    if (this.data.index === 1) {
      var sizeArrary = this.data.sizeArrary;
      sizeArrary.push(items.length.toString());

      this.setData({ minsizeIndex: 0 });
      this.setData({ maxsizeIndex: 0 });

      this.setData({
        sizeArrary: sizeArrary
      });
    }

  },
  removeChoiceqQuestionAnswer: function (e) {
    var index = e.target.dataset.index;
    var items = this.data.items;
    if (items.length > 2) {
      items.splice(index, 1);
      this.setData({
        items: items
      });
    } else {
      this.wetoast.toast({
        title: "只有两个选项，不能删除",
        duration: 1000
      })
      // return;
    }

    if (this.data.index === 1) {
      var sizeArrary = [];

      for (var i = 0; i < this.data.items.length; i++) {
        sizeArrary.push(i == 0 ? "不限" : i.toString());
      }

      this.setData({ minsizeIndex: 0, maxsizeIndex: 0, sizeArrary: sizeArrary });
    }

  },
  touchS: function (e) {
    //判断是否只有一个触摸点
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  //触摸时触发，手指在屏幕上每移动一次，触发一次
  touchM: function (e) {
    var that = this;
    if (e.touches.length == 1) {
      //记录触摸点位置的X坐标
      var moveX = e.touches[0].clientX;
      //计算手指起始点的X坐标与当前触摸点的X坐标的差值
      var disX = that.data.startX - moveX;
      //delBtnWidth 为右侧按钮区域的宽度
      var delBtnWidth = that.data.delBtnWidth;
      var txtStyle = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变
        txtStyle = "left:0";
      } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
        txtStyle = "left:-" + disX + "rpx";
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "left:-" + delBtnWidth + "rpx";
        }
      }
      //获取手指触摸的是哪一个item
      var index = e.currentTarget.dataset.index;
      var list = that.data.items;
      //将拼接好的样式设置到当前item中
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        items: list
      });
    }
  },
  touchE: function (e) {
    var that = this;
    if (e.changedTouches.length == 1) {
      //手指移动结束后触摸点位置的X坐标
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = that.data.startX - endX;
      var delBtnWidth = that.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "rpx" : "left:0";
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = that.data.items;

      for (var i = 0; i < list.length; i++) { //一次只能删除一条数据
        if (that != list[i]) {
          list[i].txtStyle = "left:0";
        }
      }

      list[index].txtStyle = txtStyle;
      //更新列表的状态
      that.setData({
        items: list
      });
    }
  },
  cancelClick: function () {
    wx.navigateBack({
    })
  },
  /**
   * 按下开始录音
   */
  touchdown: function (e) {
    var that = this;
    var name = e.currentTarget.dataset.name;
    var index = e.currentTarget.dataset.index;
    var callBack = that.data.callBack;
    var items = that.data.items;

    console.log(items)

    if (name == "title") {
      callBack = function (contetnt) {
        that.setData({
          title: contetnt,
        })
      }
    }

    items.forEach(function (v, i) {
      if (items[i] === items[index]) {
        callBack = function(content) {
          v.itemTitle = content;
          that.setData({
            items: items
          })
        }
      }
    })



    util.speaking(that); //调用麦克风
    that.setData({
      isSpeaking: true,
      callBack: callBack,
      items: items
    })

    mp3Recorder.start(mp3RecorderOptions);
  },
  /**
   * 松开完成录音
   */
  touchup: function () {
    console.log("up");

    var that = this;
    this.setData({
      isSpeaking: false,
    })
    mp3Recorder.stop();
  },
  /**
 * 上传录音文件到阿里云接口，处理语音识别和语义，结果输出到界面
 */
  processFileUploadForAsr: function (urls, filePath, res, callBack) {
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

              callBack(lastOutput); //调用回调函数设置返回过来的文字

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
        console.log(res);
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */

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

  }
})