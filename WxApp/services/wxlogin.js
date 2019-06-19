var config = require("config.js").config;

function getWxAuthrize(code, cb) {
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.wxAuthUrl + code,
      header: {
        'content-type': 'text/plain'
      },
      success: function (res) {
        if (res.statusCode === 200) {
          resolve(res);
        }
      },fail(e) {
        reject(e);
      }
    })
  })
}

function setUserInfo(res) {
  return new Promise((resolve, reject) => {
    var sessionId = res.sessionId;
    wx.request({
      url: config.serverDomain + '/Authorize/setUserInfo',
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      data: {
        "sessionId": res.sessionId,
        "encryptedData": res.encryptedData,
        "iv": res.iv
      },
      success: function (res) {
        if (res.statusCode === 200) {
          var timestamp = new Date().getTime();
          wx.setStorageSync('openId', sessionId + ":" + (timestamp + (2 * 60 * 60 * 1000 - 1)));
          typeof cb == "function" && cb();
          resolve(sessionId);
        }else{
          reject('请求服务器失败，请重试！');
        }
       
      }, fail(e) {

      }
    })
  });

}


function wxLogin() {
  return new Promise((resolve, reject) => wx.login({
    success: resolve,
    fail: reject
  }))
}

function getUserInfo() {
  return login().then(res => new Promise((resolve, reject) =>
    wx.getUserInfo({
      success: resolve,
      fail: reject
    })
  ))
}

function getUserSetting() {
  return new Promise((resolve, reject) => wx.getSetting({
    success: function success(res) {
      wx.hideToast();
      console.log(res.authSetting);
      var authSetting = res.authSetting;
      if (isEmptyObject(authSetting)) {
        ;
      } else {
        // 没有授权的提醒
        if (authSetting['scope.userInfo'] === false) {
          wx.showModal({
            title: '用户未授权',
            content: '如需正常使用小程序，请点击确定后，在“设置”中允许小程序使用您的“用户信息”，并重启小程序。',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: function success(res) {
                    console.log('openSetting success', res.authSetting);
                  }
                });
              }
            }
          })
        }
      }
    }
  }))
}

function isEmptyObject(e) {
  var t;
  for (t in e)
    return !1;
  return !0
}

module.exports = {
    getWxAuthrize: getWxAuthrize,
    wxLogin: wxLogin,
    getUserInfo: getUserInfo,
    setUserInfo: setUserInfo,
    getUserSetting: getUserSetting

}