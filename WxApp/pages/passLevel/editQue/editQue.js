var util = require('../../../utils/util.js')
var questionnaireService = require('../../../services/questionnaireService.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isrefId: false,
    backStatus: 0, //是否从我的闯关编辑按钮进入  
    isProcess: 0,
    title: '闯关名称',
    description: '感谢您能抽出几分钟时间来填写本问卷，请认真填写',
    conclusion: "您的答卷已经提交，感谢您的参与！",
    activityId: 0,
    shortUrl: '',
    questions: [],
    qtype: 6,
    currentId: ''
  },

  bindShowTool: function (e) {
    var that = this;

    var topic = e.currentTarget.dataset.topic;

    that.setData({
      currentId: topic
    });
  },
  editEleClick: function (e) {
    var that = this;

    var topic = e.currentTarget.dataset.topic;

    wx.navigateTo({
      url: '/pages/passLevel/editTitle/editTitle?activityId=' + this.data.activityId + '&qtype=1' + "&topic=" + topic
    })
  },
  editUpClick: function (e) {
    var that = this;

    if (e.currentTarget.dataset.topic <= 1) {
      this.wetoast.toast({
        title: "已经是第一题，不能再上移！",
        duration: 1000
      })
    } else {
      questionnaireService.questionRank(e.currentTarget.dataset.topic, true, this.data.activityId).then(function (res) {
        var questions = res.filter(function (item) {
          return item.type != "page"
        })

        that.setData({
          questions: questions
        });
      });
    }


  },
  editDownClick: function (e) {
    var that = this;

    if (e.currentTarget.dataset.topic >= this.data.questions.length) {
      this.wetoast.toast({
        title: "已经是最后一题，不能再下移",
        duration: 1000
      })
    } else {
      questionnaireService.questionRank(e.currentTarget.dataset.topic, false, this.data.activityId).then(function (res) {
        var questions = res.filter(function (item) {
          return item.type != "page";
        })

        that.setData({
          questions: questions
        });
      });
    }


  },

  editTitleClick: function () {
    wx.navigateTo({
      url: '/pages/passLevel/editQueName/editQueName?activityId=' + this.data.activityId
    })

  },

  relationMenuClick: function (e) {
    var that = this;

  },
  editConclusion: function () {
    wx.navigateTo({
      url: '/pages/passLevel/editQueName2/editQueName2?showConclusion=true&activityId=' + this.data.activityId
    })

  },
  deleteQuesiton: function (e) {
    var that = this;
    var topic = e.currentTarget.dataset.topic;
    questionnaireService.deleteQuesiton(this.data.activityId, topic).then(function (questions) {

      var questions = questions.filter(function (item) {
        return item.type != "page"
      });

      for (var i = 0; i < questions.length; i++) {
        var typename = { typeName: util.getQuestionType(questions[i].type, questions[i].mode, questions[i].isTouPiao) };

        Object.assign(questions[i], typename);
      };

      that.setData({ questions: questions });

    }).catch(function (res) {
      that.wetoast.toast({
        title: res,
        duration: 1000
      })
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;

    if (options.backStatus == 1) {
      that.setData({
        backStatus: 1
      });
    }
    if (options.activityId) {
      that.setData({ activityId: options.activityId });
    }

    app.weToast();
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

    wx.removeStorageSync("chosenCookie");
    if (this.data.activityId > 0) {
      questionnaireService.getQuestionnaire(that.data.activityId).then(function (survey) {
        var isrefId = false;
        if (survey.refId) {
          isrefId = true;
        } else {
          var questions = survey.questions.filter(function (item) {
            return item.type != "page"
          });

          questions.forEach(function (value, index) {
            value.title = util.convertHtmlToText(value.title);
          });

          for (var i = 0; i < questions.length; i++) {
            var type = { typeName: util.getQuestionType(questions[i].type, questions[i].mode, questions[i].isTouPiao) };

            Object.assign(questions[i], type);
          };
        }


        that.setData({
          title: survey.name,
          description: survey.description,
          questions: questions,
          conclusion: survey.defaultCompleteDisplay,
          activityId: survey.activityId,
          shortUrl: survey.shortUrl,
          qtype: 6,
          isrefId: isrefId
        });

        wx.setStorageSync('survey:edit', {
          title: survey.name,
          description: survey.description,
          conclusion: survey.defaultCompleteDisplay,
          questions: survey.questions
        });

      });
    }
  },
  bindSetting: function (options) {
    var that = this;
    if (that.data.backStatus == 1) { //从我的闯关页面的编辑按钮进入
      wx.navigateBack({});
    } else { //从自定义创建进入
      wx.navigateTo({ url: '/pages/passLevel/setOption/setOption?activityId=' + that.data.activityId });
    }

  },
  bindAddAnswer: function (options) {
    wx.navigateTo({ url: '/pages/passLevel/editTitle/editTitle?activityId=' + this.data.activityId + '&qtype=' + this.data.qtype });
  },
  goIndex: function (options) {
    wx.switchTab({ url: '/pages/passLevel/index' });
  },
  previewQuestionPaper: function (options) {
    wx.navigateTo({ url: '/pages/passLevel/passShow/passShow?shortUrl=' + this.data.shortUrl });
  },
  /**
   * 批量添加题目
   */
  addPicInBulk: function () {
    wx.navigateTo({
      url: '/pages/passLevel/ocrOption/ocrOption?activityId=' + this.data.activityId + '&qtype=' + this.data.qtype
    });
  },
  /**
   * 题库选题
   */
  addBankTopic: function () {
    wx.navigateTo({
      url: '/pages/passLevel/bankSearch/bankSearch?activityId=' + this.data.activityId + '&qtype=' + this.data.qtype
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