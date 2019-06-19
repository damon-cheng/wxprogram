
var config = require("config").config;
var util = require("../utils/util");
var openId = wx.getStorageSync('openId') || [];



function getQuestionnaireList(pageindex, pagesize, title) {
    return util.httpGet(config.serverDomain + '/Questionnaire/my/' + pageindex + '/' + pagesize, false, title);
}

function QuestionnaireSet(SecondsLimit, isChoiceRandom, ActivityId, isExtractQuestionRandom, extractQuestionNumber, startTime, endTime, maxAnswerTime) {
  return util.httpPut(config.serverDomain + '/Questionnaire/AnswerSetting/',{
    secondsLimit: SecondsLimit,
    isChoiceRandom: isChoiceRandom,
    activityId: ActivityId,
    isExtractQuestionRandom: isExtractQuestionRandom,
    extractQuestionNumber: extractQuestionNumber,
    startTime: startTime,
    endTime: endTime,
    maxAnswerTime:maxAnswerTime
  });
}

function getQuestionnaire(activityId) {
  return util.httpGet(config.serverDomain + '/Questionnaire/' + activityId);
  
}

function getQuestionnaireViaShortUrl(shortUrl) {
  return util.httpGet(config.serverDomain + '/Questionnaire/shorten-url/' + shortUrl);

}

function getScoreRank(activityId, nickName, headUrl, groupGId) {
  return util.httpGet(config.serverDomain + '/ScoreRank/' + activityId + '?nickName=' + nickName + '&headUrl=' + headUrl + "&OpenGId=" + groupGId + "&isNewVsersion=1");
}

function updateQuestionnaireTitle(activityId, tititle, description, defaultCompleteDisplay) {

    return util.httpPut(config.serverDomain + '/Questionnaire/Title', {
        "activityId": activityId,
        "title": tititle,
        "description": description,
        "defaultCompleteDisplay": defaultCompleteDisplay
    })
}

function addQuestionnaire(title, description, defaultCompleteDisplay, qType) {
    return util.httpPost(config.serverDomain + '/Questionnaire', {
        "title": title,
        "description": description,
        "defaultCompleteDisplay": defaultCompleteDisplay
    });
}

function deleteQuestionnaire(activityId, topic) {
    return util.httpDelete(config.serverDomain + '/Questionnaire/' + activityId, {
      topic: topic
    });
}

function cloneQuestionnaire(activityId) {
  return util.httpPost(config.serverDomain + '/Questionnaire/copy/' + activityId);
}

function addQuestion(activityId, question) {
    return util.httpPost(config.serverDomain + '/Questionnaire/question/' + activityId, question);
}

function addQuestionlist(activityId, questionlist) {
  return util.httpPost(config.serverDomain + '/Questionnaire/questionlist/' + activityId, questionlist);
}

function updateQuestion(activityId, question) {
    return util.httpPut(config.serverDomain + '/Questionnaire/question/' + activityId, question);
}

function copyTemplate(activityId) {
    return util.httpPost(config.serverDomain + '/Questionnaire/copy/' + activityId);
}

function auidt(activityId) {
    return util.httpPut(config.serverDomain + '/Questionnaire/publishment/' + activityId);
}

function deleteQuesiton(activityId, topic) {
    return util.httpDelete(config.serverDomain + '/Questionnaire/question/' + activityId, {
        "topic": topic
    });
}


function getstatistics(activityId) {
    return util.httpGet(config.serverDomain + '/answers/statistics/' + activityId);
}

function getFillBlankAnswer(activityId, questionindex, pageIndex, pageSize) {
    return util.httpGet(config.serverDomain + '/answers/fillBlank/' + activityId + "/" + questionindex + "/" + pageIndex + "/" + pageSize);
}

function setStatus(activityId, status) {
    return util.httpPut(config.serverDomain + '/questionnaire/set-status/' + activityId + "/" + status);
}



function checkFormpost(items, self, topic) {
    var checkAnswer = true;
    var data = '';
    for (var i = 0; i < items.length; i++) {
        if (topic) {
            if (items[i].topic != topic) {
                continue;
            }
        }
        data += items[i].topic + "$";

        var sortArry = [];
        if (items[i].type === "radio" || items[i].type === "check") {

            var radioCheck = 0;

            items[i].items.forEach(function (value, index, array) {
                sortArry.push(value);
                if (value.checked) {
                    radioCheck++;
                    if (items[i].type === "radio") {
                        data += '' + value.id;
                        return;
                    } else {
                        if (!items[i].mode) {

                            data += '' + value.id;

                            if (index != items[i].items.length - 1) {
                                data += "|";
                            }

                        }
                    }
                }
            });


            if (items[i].mode === 1 && items[i].type === "check") {

                var unsortStr = '';
                sortArry = sortArry.sort((a, b) => a.sort > b.sort ? 1 : -1);


                sortArry.forEach(function (value, index, array) {
                    if (value.checked) {
                        data += data.substr(data.length - 1, 1) === '$' ? value.id.toString() : ',' + value.id.toString()
                    } else {
                        unsortStr += ',-2';
                    }
                });

                data += data.substr(data.length - 1, 1) === '$' ? unsortStr.substr(1) : unsortStr;
            }


            if (radioCheck < 1) {

                if (items[i].requir) {
                    checkAnswer = false;
                    items[i].checkMessage = '请选择选项';
                } else {
                    items[i].checkMessage = '';
                }


            } else {
                if (items[i].type === "check") {

                    if (items[i].minValue && items[i].minValue > 0 && radioCheck > 0 && radioCheck < items[i].minValue) {
                        items[i].checkMessage = '至少选择' + items[i].minValue + '项';
                        checkAnswer = false;
                    } else {
                        if (items[i].maxValue && items[i].maxValue > 0 && radioCheck > 0 && radioCheck > items[i].maxValue) {
                            items[i].checkMessage = '至多选择' + items[i].maxValue + '项';
                            checkAnswer = false;
                        } else {
                            items[i].checkMessage = '';
                        }
                    }
                } else if (items[i].type === "radio") {
                    items[i].checkMessage = '';
                }
            }



        } else if (items[i].type === "question") {
            if (items[i].requir && !items[i].value) {
                items[i].checkMessage = '请输入内容';
                checkAnswer = false;
            } else {
                items[i].checkMessage = '';
            }


            data += '' + (items[i].value);
        } else if (items[i].type === "fileupload") {
            if (items[i].requir && !items[i].savePath) {
                items[i].checkMessage = '请上传附件';
                checkAnswer = false;
            } else {
                items[i].checkMessage = '';
            }
            data += '' + (items[i].savePath + encodeURIComponent(',' + items[i].savePath));
        }


        if (i != items.length - 1) {
            data += "}";
        }
    }

    self.setData({ questions: items });

    if (!checkAnswer) {
        return { status: false, items: items, data: '' };
    } else {
        return { status: true, items: items, data: data };
    }



}


function postAnswers(ispreview, activityId, starttime, rn, data, verfiyCode, qType) {
    var validate_text = verfiyCode;
    var btuserinput = verfiyCode;
    var btcaptchaId = 'DesignerInitializedCaptcha';
    var btinstanceId = '32f64a20107243c6b8e1439b838a4490';
    var submittype = ispreview ? 0 : 1;
    var url = config.sojumpDomain + 'handler/processjq.ashx?curid=' + activityId.toString();
    url += '&source=directphone&submittype=1&rn=' + encodeURIComponent(rn) + "&t=" + new Date().valueOf();
    url += "&Orgin=wxapp&starttime=" + encodeURIComponent(starttime);
    url += "&validate_text=" + encodeURIComponent(validate_text);

    if (qType === 3) {
        return new Promise(function (resolve, reject) {

            wx.login({
                success: function (res) {
                    resolve(res);
                }
            });
        }).then(function (res) {
            return new Promise(function (resolve, reject) {
                wx.request({
                    url: config.wxOAuthUrl + res.code,
                    header: {
                        'content-type': 'text/plain'
                    },
                    success: function (res) {
                        resolve(res);
                    }
                });
            });

        }).then(function (res) {
            url += "&openid=" + res.data["openid"];
            return postQuestionAnswers(url, data);
        })
    } else {
        return postQuestionAnswers(url, data);
    }

}

function postQuestionAnswers(url, data) {
    wx.showToast({
        title: '正在操作',
        icon: 'loading',
        duration: 15000
    });

    var session_id = wx.getStorageSync('AspnetSessionId');//本地取存储的sessionID  
    if (session_id != "" && session_id != null) {
        var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'ASP.NET_SessionId=' + session_id }
    } else {
        var header = { 'content-type': 'application/x-www-form-urlencoded' }
    }

    return new Promise(function (resolve, reject) {

        wx.request({
            url: url,
            method: 'Post',
            header: header,
            data: { submitdata: data },
            success: function (res) {

                if (res.statusCode != 200) {

                    if (res.statusCode === 401) {
                        wx.removeStorageSync('openId') || [];
                        wx.navigateTo({ url: "/pages/index/index" });
                    }
                    reject(res);
                } else {
                    resolve(res.data);
                }
                wx.hideToast();
            }, fail(e) {
                reject(e);
                wx.hideToast();
            }
        });

    })

}

function questionRank(topic, up, activityId) {
  return util.httpPut(config.serverDomain + '/Questionnaire/questionRank', {
    up: up,
    topic: topic,
    activityId: activityId
  });
}

function getTicket(shortUrl, formId, isPreview) {
  return util.httpGet(config.serverDomain + '/ScoreRank/lanuch/' + shortUrl + "/" + formId + "?isPreview=" + isPreview);
}

function scoreRank(answerArray, isPreview) {
  return util.httpPost(config.serverDomain + '/ScoreRank' + "?isPreview=" + isPreview, answerArray);
}

function getBank() {
  return util.httpGet(config.serverDomain + '/Questionnaire/tiku-types');
}

function addBand(title, description, questionNumber, secondsLimit, maxAnswerTime, refId, activityId) {
  return util.httpPost(config.serverDomain + '/Questionnaire/tiku', {
    title: title,
    description: description,
    questionNumber: questionNumber,
    secondsLimit: secondsLimit,
    maxAnswerTime: maxAnswerTime,
    refId: refId,
    activityId: activityId
  });
}

function getSignature() {
  return util.httpGet(config.serverDomain + '/Speech-Recognition/upload-Signature');
}

function getVoiceFile(fileName) {
  return util.httpGet(config.AIProxyDomain + '/Speech-Recognition/Proxy/' + fileName);
}

function getQrcode(shortUrl) {
  return util.httpGet(config.serverDomain + '/Questionnaire/qrcode/' + shortUrl);
}

function getOcrSignature() {
  return util.httpGet(config.serverDomain + '/Ocr/upload-Signature');
}

function getOcrUrl(fileName) {
  return util.httpGet(config.AIProxyDomain + '/Orc/proxy/' + fileName);
}

function originApply(shortUrl, formId) { //发起申请
  return util.httpPost(config.serverDomain + '/Questionnaire/OpenHongbaoActivity/' + shortUrl + "/" + formId);
}

function getHallList() { 
  return util.httpGet(config.serverDomain + '/Questionnaire/OpenHongbaoActivityies');
}

function unsubscribeLink() { //退订
  return util.httpPost(config.serverDomain + '/Questionnaire/OpenActivity-Blacklist');
}

function lookKeyWord(keyword) { //搜索关键字
  return util.httpPost(config.serverDomain + '/Questionnaire/Tiku-Template-KeyWord', {
    keyWord: keyword
  });
}

function getBankQueTotal(activityId) { //获取题目
  return util.httpGet(config.serverDomain + '/Questionnaire/Tiku-Template-Questions/' + activityId);
}

function synchroToWx(activityId, title, description) { //扫描从PC端二维码同步问卷
  return util.httpPost(config.serverDomain + '/Questionnaire/Wjx-Migration/' + activityId, {
    title: title,
    description: description
  });
}

function getOpenActivityStatus() { //获取闯关广场状态
  return util.httpGet(config.serverDomain + '/Questionnaire/OpenActivity-Show');
}
 

module.exports = {
    getQuestionnaireList: getQuestionnaireList,
    getQuestionnaire: getQuestionnaire,
    addQuestionnaire: addQuestionnaire,
    deleteQuestionnaire: deleteQuestionnaire,
    updateQuestionnaireTitle: updateQuestionnaireTitle,
    addQuestion: addQuestion,
    addQuestionlist: addQuestionlist,
    updateQuestion: updateQuestion,
    copyTemplate: copyTemplate,
    postAnswers: postAnswers,
    auidt: auidt,
    deleteQuesiton: deleteQuesiton,
    checkFormpost: checkFormpost,
    getstatistics: getstatistics,
    getFillBlankAnswer: getFillBlankAnswer,
    cloneQuestionnaire: cloneQuestionnaire,
    setStatus: setStatus,
    getQuestionnaireViaShortUrl: getQuestionnaireViaShortUrl,
    getScoreRank: getScoreRank,
    QuestionnaireSet: QuestionnaireSet,
    questionRank: questionRank,
    scoreRank: scoreRank,
    getBank: getBank,
    addBand: addBand,
    getTicket: getTicket,
    getSignature: getSignature,
    getVoiceFile: getVoiceFile,
    getQrcode: getQrcode,
    getOcrSignature: getOcrSignature,
    getOcrUrl: getOcrUrl,
    originApply: originApply,
    getHallList: getHallList,
    unsubscribeLink: unsubscribeLink,
    lookKeyWord: lookKeyWord,
    getBankQueTotal: getBankQueTotal,
    synchroToWx: synchroToWx,
    getOpenActivityStatus: getOpenActivityStatus
}