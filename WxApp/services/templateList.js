var config = require("config").config;
var util = require("../utils/util");

function getTemplateList() {
      return util.httpGet(config.serverDomain + '/templates');
}

function searchTemplate(data){
     return util.httpPost(config.serverDomain + '/templates/search', data);
}


module.exports = {
    getTemplateList: getTemplateList,
    searchTemplate : searchTemplate
}