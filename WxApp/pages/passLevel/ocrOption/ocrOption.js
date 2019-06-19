var questionnaireService = require('../../../services/questionnaireService.js');
var designtxt = require('../../../utils/designtxt.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: "",
    activityId: 0,
    contenttxt_format: "",
    contenttxt: "",
    questions: [],
    isStartOcr: false, //是否开始上传
    isPreview: true,
    modalFlag: true
  },
  /**
  * 重新拍照按钮/返回编辑按钮
  */
  chooseImageTrigger: function () {
    var that = this;
    if (that.data.isPreview) {  //拍照
      wx.chooseImage({
        count: 1, // 可以选择的图片张数
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机
        success: function (res) {
          var tempFilePaths = res.tempFilePaths;
          console.log("tempFilePaths ", tempFilePaths);
          var urls = "https://pubnewfr.paperol.cn";
          var isStartOcr = true;

          questionnaireService.getOcrSignature().then(function (res) {
            console.log(res);

            var fileName = res.dir; //文件名
            wx.uploadFile({
              url: urls,
              filePath: tempFilePaths[0],
              name: 'file',
              formData: {
                'key': fileName,
                'policy': res.policy,
                'OSSAccessKeyId': res.accessId,
                'signature': res.signature,
                'content-type': 'image/jpeg'
              },
              success: function (res) {
                if (res.statusCode == 204) {
                  wx.showLoading({
                    title: '正在转换...',
                  })
                  questionnaireService.getOcrUrl(fileName).then(function (res) {
                    setTimeout(function () {
                      wx.hideLoading()
                    }, 1000)

                    var contenttxt = res;
                    that.data.contenttxt_format = contenttxt.replace(/<br\s*\/?>/gi, "\r\n");
                    var questionlist = designtxt.generateQs(contenttxt, that.data.activityId);

                    if (questionlist.length > 0) {
                      that.setData({
                        isStartOcr: isStartOcr,
                        contenttxt: contenttxt,
                        questions: questionlist,
                        contenttxt_format: that.data.contenttxt_format
                      });
                    } else {
                      wx.showToast({
                        title: '您添加的图片的文档格式不符合录入要求',
                        icon: "none",
                        duration: 2000
                      });
                    }
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
          });
        },
        fail: function () {
        },
        complete: function () {
        }
      })
    } else { //返回编辑
      that.setData({
        isPreview: !that.data.isPreview
      });
    }

  },
  /**
   * 确定预览按钮/确定保存按钮
   */
  addQueTrigger: function () {
    var that = this;

    if (that.data.isPreview) {
      that.setData({ //切换到确定预览按钮
        isPreview: !that.data.isPreview
      });
    } else {//切换到确定保存按钮
      if (that.data.questions.length > 0) {
        questionnaireService.addQuestionlist(that.data.activityId, that.data.questions).then(function (res) {
          wx.navigateBack({
            delta: 1
          })
        }).catch(function () {
          wx.showToast({
            title: "数据上传失败，请重新上传",
            icon: "none",
            duration: 2000
          });
        })
      }
    }

  },
  /**
 * 自动化识别
 */
  contenttxtTrigger: function (e) {
    console.log(e.detail.value);
    var that = this;
    var modifyContent = e.detail.value;
    modifyContent = modifyContent.replace(/\n/g, '<br/>');
    var questionlist = designtxt.generateQs(modifyContent, that.data.activityId);
    that.setData({
      questions: questionlist
    });
  },
  /**
   * 说明提示
   */
  promptTrigger: function () {
    var that = this;
    that.setData({
      modalFlag: false
    });
  },
  /**
   * 关闭提示
   */
  modalFlagClose: function () {
    var that = this;
    that.setData({
      modalFlag: true
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.activityId) {
      that.setData({
        activityId: options.activityId
      });
    }
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

  }
})