var config = require("config").config;
var util = require("../utils/util");
var openId = wx.getStorageSync('openId') || [];


function getRedPackList(pageindex, pagesize, title) {
  return util.httpGet(config.serverDomain + '/HongBao/' + pageindex + '/' + pagesize, false, title);
}

function getRedPack(activityId) {
  return util.httpGet(config.serverDomain + '/HongBao/' + activityId);
}

function join(shortenUrl) {
  return util.httpGet(config.serverDomain + '/HongBao/join/' + shortenUrl);
}

function myScoreTimes(shortenUrl, isPreview) {
  return util.httpGet(config.serverDomain + '/ScoreRank/MyScoreTimes/' + shortenUrl + "?isPreview=" + isPreview);
}

function scoreRankDel(shortenUrl) {
  return util.httpDelete(config.serverDomain + '/ScoreRank/' + shortenUrl);
}

function getExtraction(activityId, status, pageindex, pagesize,) {
  return util.httpGet(config.serverDomain + '/HongBao/extraction/' + activityId + '/' + status + '/' + pageindex + '/' + pagesize,);
}

function getPayment(activityId, money) {
  return util.httpGet(config.serverDomain + '/Payment/Order/' + activityId + '/' + money);
}


function paySucess(orderNumber) {
  return util.httpPut(config.serverDomain + '/Payment/PayOrder/' + orderNumber);
}


function rechargeRed(amountMoney, quantity, isRandomExtraction, extractionRate, activityId, orderNumber ){
  return util.httpPost(config.serverDomain + '/HongBao/',{
    "amountMoney": amountMoney,
    "quantity": quantity,
    "isRandomExtraction": isRandomExtraction,
    "extractionRate": extractionRate,
    "activityId": activityId,
    "orderNumber": orderNumber,
    "hasExtractedNumber": 0,
    "hasExtractedMoney ": 0
  });
}

function extraction(shortenJoinUrl , ShortenUrl,nickName,avatarurl ) {
  return util.httpPost(config.serverDomain + '/HongBao/extraction/', {
    "shortenJoinUrl": shortenJoinUrl ,
    "ShortenUrl": ShortenUrl,
    "nickName": nickName,
    "avatarurl": avatarurl,
    "isNewVersion": true
  });
}

function isHongBao(shortenUrl) {
  return util.httpGet(config.serverDomain + '/HongBao/Activity/' + shortenUrl)
}

function scoreRankNum(shortenUrl) {
  return util.httpGet(config.serverDomain + '/ScoreRank/lanuch/' + shortenUrl)
}

function returnMoney(orderNumber) {
  return util.httpPost(config.serverDomain + '/HongBao/OrderRefund/' + orderNumber)
}

module.exports = {
    getPayment: getPayment,
    getRedPack: getRedPack,
    rechargeRed: rechargeRed,
    getRedPackList: getRedPackList,
    paySucess: paySucess,
    getExtraction: getExtraction,
    extraction: extraction,
    join: join,
    myScoreTimes: myScoreTimes,
    isHongBao: isHongBao,
    scoreRankDel: scoreRankDel,
    scoreRankNum: scoreRankNum,
    returnMoney: returnMoney
}