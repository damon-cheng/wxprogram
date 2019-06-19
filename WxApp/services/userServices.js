var config = require("config").config;
var util = require("../utils/util");

function getUserInfo() {

    var cache = wx.getStorageSync('User');
    if (cache.userName) {
        return new Promise(function (resolve, reject) {
            resolve(cache);
        });

    } else {
        return util.httpGet(config.serverDomain + '/Users/me');
    }

}

function addUser(mobileVerfiyCode, mobile, password) {
    return util.httpPost(config.sojumpDomain + '/handler/wxport/sendloginwx.ashx?mobile=' + mobile + '&mobileCode=' + mobileVerfiyCode + '&pwd=' + password, null, true);
}

function resetPassword(mobileVerfiyCode, mobile, password) {
    return util.httpPost(config.sojumpDomain + '/handler/wxport/forgetpwd.ashx?mobile=' + mobile + '&mobileCode=' + mobileVerfiyCode + '&pwd=' + password, null, true);
}

function verify() {
  return util.httpGet(config.sojumpDomain + '/users/Verify/');
}

function getCodeNumFn(phone, rnd) {
  return util.httpGet(config.sojumpDomain + '/users/VerfiyCode/' + phone + '/' + rnd);
}

function bindMobileFn(code, phone) {
  return util.httpPost(config.sojumpDomain + '/users/' + code, {
    phone: phone
  });
}

function getAutoMobileFn(sessionId, encryptedData, iv) {
  return util.httpPost(config.sojumpDomain + '/users/phone', {
    sessionId: sessionId,
    iv: iv,
    encryptedData: encryptedData
  });
}

function getBalance() {
  return util.httpGet(config.sojumpDomain + '/Users/balance/');
}

function getIncomeExpensesDetails() {
  return util.httpGet(config.sojumpDomain + '/Users/balance-reocrds-count');
}

function getJoinRecord(pageindex, pagesize) {
  return util.httpGet(config.sojumpDomain + '/users/joins/' + pageindex + '/' + pagesize);
}

function getWithDraw() {
  return util.httpPost(config.sojumpDomain + '/users/withdraw/');
}

function getDetails(pageindex, pagesize) {
  return util.httpGet(config.sojumpDomain + '/users/balance-reocrds/' + pageindex + '/' + pagesize);
}

function queryGroupId(sessionId, iv, encryptedData) {
  return util.httpPost(config.sojumpDomain + '/Users/QueryGroupId', {
    sessionId: sessionId, 
    iv: iv, 
    encryptedData: encryptedData
  });
}


module.exports = {
    getUserInfo: getUserInfo,
    addUser: addUser,
    resetPassword: resetPassword,
    verify: verify,
    getCodeNumFn: getCodeNumFn,
    bindMobileFn: bindMobileFn,
    getBalance: getBalance,
    getJoinRecord: getJoinRecord,
    getWithDraw: getWithDraw,
    getDetails: getDetails,
    getIncomeExpensesDetails: getIncomeExpensesDetails,
    queryGroupId: queryGroupId,
    getAutoMobileFn: getAutoMobileFn
}