function getConfig() {
  var serverDomain = "https://cg.wjx.cn/wxappnew";
    return {
        serverDomain: serverDomain,
        sojumpDomain: serverDomain,
        imgCDNServer: 'https://cgstatic.wjx.cn',
        oAuthUrl: serverDomain + '/oauth/token',
        wxAuthUrl: serverDomain + '/Authorize/WxOnLogin/',
        wxOAuthUrl: serverDomain + '/Authorize/WxAccessCode/',
        fileCdnDoamin: 'http://ops37z9ot.bkt.clouddn.com/',
        AIProxyDomain: "https://cg.wjx.cn/AIProxy/"
    }
}

module.exports = {
    config: getConfig()
}