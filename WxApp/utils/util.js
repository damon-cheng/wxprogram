var config = require("../services/config.js").config;
var wxRequest = require('../services/wxlogin.js');
var Base64 = require('../utils/base64.js');
var app = getApp();


function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
function newformatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getQuestionType(type, mode, isTouPiao) {
  if (type == "radio") {
    return mode === 1 ? " 打分题" : isTouPiao ? "投票单选" : "单选";
  }
  else if (type == "check") {
    return mode === 1 ? " 排序" : isTouPiao ? "投票多选" : "多选";
  }
  else if (type == "question") {
    return "问答";
  }

  else if (type == "fileupload") {
    return "附件题";
  }

  else if (type == "matrix") {
    return "矩阵题";
  }
  else if (type == "radio_down") {
    return "下拉单选题";
  }

  else if (type == "sum") {
    return "比重题";
  }

  else if (type == "slider") {
    return "滑动条";
  }

  else if (type == "gapfill") {
    return "多项填空题";
  }
}

function generateGuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16).substring(1);

  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();

}

function getSurveyOfLocalCache(surveyId) {
  var surveies = wx.getStorageSync('allSurveies') || [];
  var survey = surveies.filter(function (item) {
    return item.surveyId === surveyId
  });

  return survey[0];
}

function showToast(title) {
  title = title || '数据加载中'
  wx.showToast({
    title: title,
    icon: 'loading',
    duration: 15000
  });
}

function showPostProgress() {
  wx.showToast({
    title: '正在操作',
    icon: 'loading',
    duration: 15000
  });
}




function httpGet(url, noToken, title) {
  showToast(title);
  return httpMethod('GET', url);
}

function httpPost(url, data, noToken) {
  return httpMethod('Post', url, data, noToken)
}

function httpDelete(url, data) {
  return httpMethod('Delete', url, data)
}


function httpPut(url, data) {
  return httpMethod('Put', url, data);
}

function httpMethod(verb, url, data, noToken) {
  showPostProgress();

  var openId = wx.getStorageSync('openId') || '';

  if (openId && openId.length > 0) {
    var expireTimeStamp = openId.split(":")[1];
    var timestamp = new Date().getTime();
    if (timestamp > expireTimeStamp) {
      openId = '';
      wx.removeStorageSync('openId');
    } else {
      openId = openId.split(":")[0];
    }
  }

  if (openId) {
    if (!app.globalData.userInfo) {
      return new Promise((resolve, reject) =>
        wx.request({
          url: url,
          header: {
            'content-type': 'application/json',
            'Authorization': 'Basic ' + Base64.encode(openId + ':' + '')
          },
          method: verb, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          success: function (res) {
            wx.hideToast();
            if (res.statusCode == 200) {
              resolve(res.data)
            }
            else if (res.statusCode === 401) {
              wx.removeStorageSync('openId')
              sessionExpireHandle();
            }
            else {
              reject(res.data)
            }
          },
          data: data,
          fail: function (msg) {
            wx.hideToast();
            reject('请求服务器失败，请重试！')
          }
        })
      )
    }
    else {
      return new Promise((resolve, reject) =>
        wx.request({
          url: url,
          header: {
            'content-type': 'application/json',
            'Authorization': 'Basic ' + Base64.encode(openId + ':' + '')
          },
          method: verb, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          success: function (res) {
            wx.hideToast();
            if (res.statusCode == 200) {
              resolve(res.data)
            }
            else if (res.statusCode === 401) {
              wx.removeStorageSync('openId')
              sessionExpireHandle();
            }
            else {
              reject(res.data)
            }
          },
          data: data,
          fail: function (msg) {
            wx.hideToast();
            reject('请求服务器失败，请重试！')
          }
        })
      )
    }

  } else {
    return wxRequest.wxLogin().then(function (res) {
      return wxRequest.getWxAuthrize(res.code);
    })
      .then(function (res) {
        var sessionId = res.data;
        var timestamp = new Date().getTime();
        wx.setStorageSync('openId', sessionId + ":" + (timestamp + (2 * 60 * 60 * 1000 - 1)));
        return new Promise((resolve, reject) =>
          wx.request({
            url: url,
            header: {
              'content-type': 'application/json',
              'Authorization': 'Basic ' + Base64.encode(res.data + ':' + '')
            },
            method: verb, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            data: data,
            success: function (res) {
              wx.hideToast();
              if (res.statusCode == 200) {
                resolve(res.data) //得到数据
              }
              else if (res.statusCode === 401) {
                wx.removeStorageSync('openId')
                sessionExpireHandle();
              }
              else {
                reject(res.data)
              }
            },
            fail: function (msg) {
              wx.hideToast();
              reject('请求服务器失败，请重试！')
            }
          })
        )
      })

  }

}

function getSmsVerifyCode(mobile, type) {
  if (type === 1) {
    return httpGet(config.sojumpDomain + "handler/wxport/sendsmswx.ashx?type=1&mobile=" + mobile, true);
  }
  else {
    return httpGet(config.sojumpDomain + "handler/wxport/sendsmswx.ashx?mobile=" + mobile, true);
  }
}


function getPostAnswerImageVerifyCode(activityId, self) {
  var d = new Date();
  var t = d.getTime() + (d.getTimezoneOffset() * 60000);

  /* var session_id = wx.getStorageSync('AspnetSessionId');//本地取存储的sessionID  
   if (session_id != "" && session_id != null) {
       var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'ASP.NET_SessionId=' + session_id }
   } else {
       var header = { 'content-type': 'application/x-www-form-urlencoded' }
   }*/

  wx.request({
    url: config.serverDomain + '/Files/VerfiyCode/' + activityId + '/' + t,
    method: 'Get',
    success: function (res) {
      var sessionId = res.data.sessionId.split(';')[0].replace("ASP.NET_SessionId=", "");
      wx.setStorageSync('AspnetSessionId', sessionId)
      self.setData({ vcodeImgSrc: 'data:image/gif;base64,' + res.data.base64Text })
    }, fail(e) {

    }
  });
}

function getChoiceItems(type) {

  var itemTitle1 = "", itemTitle2 = "";

  if (type === 6) {
    itemTitle1 = '男';
    itemTitle2 = '女';
  }

  return [{
    "itemTitle": itemTitle1,
    "itemRadio": false,
    "itemValue": "1",
    "itemJump": 0,
    "itemTextBox": null,
    "itemRequired": null,
    "itemImg": null,
    "itemLabel": null,
    "itemHuChi": null,
    "itemImgText": false,
    "itemDesc": null
  },
  {
    "itemTitle": itemTitle2,
    "itemRadio": false,
    "itemValue": "2",
    "itemJump": 0,
    "itemTextBox": null,
    "itemRequired": null,
    "itemImg": null,
    "itemLabel": null,
    "itemHuChi": null,
    "itemImgText": false,
    "itemDesc": null
  }
  ];

}

function toPercent(number, total) {
  return (Math.round(number * 100) / total).toFixed(2).replace('.00', '') + '%';
}

function getAllAnswerTypes(qtype) {
  if (qtype === "3") {
    return ['投票单选', '投票多选', '单选', '多选', '问答', '附件题', '打分题', '排序', '性别', '手机', '日期'];
  } else {
    return ['单选', '多选', '问答', '附件题', '打分题', '排序', '性别', '手机', '日期'];
  }

}

function getAllAnswerTypeNames(qtype) {

  if (qtype === "3") {
    return ['radio', 'check', 'radio', 'check', 'question', 'fileupload', 'radio', 'check', 'radio', 'question', 'question'];
  } else {
    return ['radio', 'check', 'question', 'fileupload', 'radio', 'check', 'radio', 'question', 'question'];
  }

}


function getAnswerIcons(qtype) {
  if (qtype === "3") {
    return ['ico_radio', 'ico_checkbox', 'ico_radio', 'ico_checkbox', 'ico_textarea', 'ico_upload', 'ico_star', 'ico_sort', 'ico_gender', 'ico_mobile', 'ico_date'];
  } else {
    return ['ico_radio', 'ico_checkbox', 'ico_textarea', 'ico_upload', 'ico_star', 'ico_sort', 'ico_gender', 'ico_mobile', 'ico_date'];
  }
}

function sessionExpireHandle() {
  var pages = getCurrentPages();
  var currentPage = pages[pages.length - 1];
  if (currentPage == undefined || currentPage == null) return;

  var options = currentPage.options    //如果要获取url中所带的参数可以查看options
  var url = currentPage.route
  if (url.indexOf("passLevel/index") > 0 || url.indexOf("passLevel/chooseCheckPoints/chooseCheckPoints") > 0 || url.indexOf("passLevel/cashAccount/myAccount/myAccount") > 0) {
    currentPage.onShow();
  } else {
    currentPage.onLoad(options);
    setTimeout(function () {
      currentPage.onShow();
    }, 200)
  }
}

function processFileUploadForAsr(urls, filePath, res, callBack) {

}

function speaking(self) {
  var that = this;
  //话筒帧动画 
  var i = 1;
  //弹幕定时器
  var timer;
  self.timer = setInterval(function () {
    i++;
    i = i % 5;
    self.setData({
      j: i
    })
  }, 200);
}

function convertHtmlToText(inputText) {
  var returnText = "" + inputText;

  //反转  str.replace(/<\s?img[^>]*>/gi,'');
  returnText = returnText.replace(/<\/?[^>]*>/g, '');
  returnText = returnText.replace(/<\s?img[^>]*>/gi, '');
  returnText = returnText.replace(/&quot;/ig, '"');
  returnText = returnText.replace(/&amp;/ig, '&');
  returnText = returnText.replace(/&lt;/ig, '<');
  returnText = returnText.replace(/&gt;/ig, '>');
  returnText = returnText.replace(/&nbsp;/ig, ' ');

  returnText = returnText.replace(/<\/div>/ig, '\r\n');
  returnText = returnText.replace(/<\/li>/ig, '\r\n');
  returnText = returnText.replace(/<li>/ig, '  *  ');
  returnText = returnText.replace(/<\/ul>/ig, '\r\n');
  //-- remove BR tags and replace them with line break
  returnText = returnText.replace(/<br\s*[\/]?>/gi, "\r\n");

  //-- remove P and A tags but preserve what's inside of them
  returnText = returnText.replace(/<p.*?>/gi, "\r\n");
  // returnText = returnText.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ($1)");

  // //-- remove all inside SCRIPT and STYLE tags
  // returnText = returnText.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
  // returnText = returnText.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
  // //-- remove all else
  // returnText = returnText.replace(/<(?:.|\s)*?>/g, "");

  // //-- get rid of more than 2 multiple line breaks:
  // returnText = returnText.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "\r\n\r\n");

  // //-- get rid of more than 2 spaces:
  // returnText = returnText.replace(/ +(?= )/g, '');

  // //-- get rid of html-encoded characters:
  // returnText = returnText.replace(/ /gi, " ");
  // returnText = returnText.replace(/&/gi, "&");
  // returnText = returnText.replace(/"/gi, '"');
  // returnText = returnText.replace(/</gi, '<');
  // returnText = returnText.replace(/>/gi, '>');

  return returnText;

}

module.exports = {
  formatTime: formatTime,
  newformatTime: newformatTime,
  getQuestionType: getQuestionType,
  generateGuid: generateGuid,
  getSurveyOfLocalCache: getSurveyOfLocalCache,
  httpGet: httpGet,
  httpPost: httpPost,
  httpPut: httpPut,
  httpDelete: httpDelete,
  getChoiceItems: getChoiceItems,
  showPostProgress: showPostProgress,
  getSmsVerifyCode: getSmsVerifyCode,
  getPostAnswerImageVerifyCode: getPostAnswerImageVerifyCode,
  toPercent: toPercent,
  getAllAnswerTypes: getAllAnswerTypes,
  getAllAnswerTypeNames: getAllAnswerTypeNames,
  getAnswerIcons: getAnswerIcons,
  processFileUploadForAsr: processFileUploadForAsr,
  speaking: speaking,
  convertHtmlToText: convertHtmlToText
}
