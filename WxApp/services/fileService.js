var config = require("config").config;
var util = require("../utils/util.js");
var qiniuUploader = require("../lib/qiniuUploader-min.js")

function uploadfile(that, imageSrc, activityId, topic, callBackFn) {

    util.httpGet(config.serverDomain + '/files/uptoken?activityId=' + activityId + '&topic=' + topic, true).then(function (res) {
        var uptoken = res;
        var fileExtensonName = imageSrc.substring(imageSrc.lastIndexOf("."));
        qiniuUploader.upload(imageSrc, (res) => {
            callBackFn(res.imageURL, imageSrc);
        }, (error) => {
            that.wetoast.toast({
                title: '上传失败', duration: 1000
            });
        }, {
                uploadURL: 'https://up.qbox.me',
                key: uptoken.fileKey + fileExtensonName,
                uptoken: uptoken.uptoken
            });
    }).catch(function () {
        that.wetoast.toast({
            title: '上传失败', duration: 1000
        });
    });

}


module.exports = {

    uploadfile: uploadfile
}