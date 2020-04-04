var WXBizMsgCrypt = require('wechat-crypto');
var request = require('request');

var wxconfig = {
    // token: "yBiYwwfOblCwjPKvJ",
    token: "Tc18wi",
    // encodingAESKey: "GL3Ajpw5sJXui8hU4EGdo5kgf3zIDL6TjEn7aDcYOYn",
    encodingAESKey: "pWmVyw5XGGJ6EB093ic5FgZPfeym4OQ1dcjOYtUq55d",
    corpId: "ww19577280e5593b4e",
    // secret:"7hU1h5DbsGVsVr6ggcj9jXDwJGS8vkRP3v9xXTPL5AZm4TCKfStY37qmMDrDSfXB",
    secret:"2I2FK-1a5pXJZ3n0ScktQn3_uILDWKXO6_oBe9j9MIg",
    access_token:"",
    city:""
};

function _wxcallback(req,res) {
    var msg_signature = req.query.msg_signature;
    console.log(req)
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    //var token = "rPVYeybnMGSiVqjaWmdg0ozpg3"
    //var encodingAESKey = "WRJfWCIKek2MJlRdi7kHaEXW7ao8d6vYfaJyEYUpwde"
    var cryptor = new WXBizMsgCrypt(wxconfig.token, wxconfig.encodingAESKey, wxconfig.corpId)
    //var cryptor = new WXBizMsgCrypt(token, encodingAESKey, wxconfig.corpId)
    var s = cryptor.decrypt(echostr);
    //console.log("s="+s.message);
    res.send(s.message);
};

exports.wxcallback = _wxcallback;

    exports.init = function () {
    get_accessToken(1);
    var myInterval=setInterval(_update_accessToken_Timer,60 * 60* 1000,"accessToken_Timer");
    // scheduleCronstyle();
};

function _update_accessToken_Timer() {
    get_accessToken(1);
}

/*获取ACCESS_TOKEN*/
function  get_accessToken(refresh) {
    //不需要重新获取token，则直接返回
    if ((refresh == 0) && (wxconfig.access_token > 0))
    {
        // console.log("access_token=%s",wxconfig.access_token);
        return wxconfig.access_token;
    }
    var url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid="+wxconfig.corpId+"&corpsecret="+wxconfig.secret;
    request.get({url:url}, function (e, r, body) {
        var jsonobj =  JSON.parse(body);
        wxconfig.access_token = jsonobj.access_token;
        return wxconfig.access_token;
    });
}

