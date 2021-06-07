// const timeoutPromise = new Promise((resolve, reject) => {
// 	setTimeout(() => {
// 		// reject({
// 		resolve({
// 			message: '获取授权超时'
// 		});
// 	}, 3000);
// });

// const timeoutLoginPromise = new Promise((resolve, reject) => {
// 	setTimeout(() => {
// 		// reject({
// 		resolve({
// 			message: 'login timeou登录超时'
// 		});
// 	}, 3000);
// });

function ByteDanceAPI_init() {
	var app_id = "cli_a0fd2ee67578d00e";
	var app_secret = "84LW4IiPknLhuaIg2jlragn5HuFrquhV";
	/**
	* 计算h5sdk.config的签名参数
	*
	* @param jsticket  之前获取的jsticket
	* @param nonceStr  随机字符串
	* @param timeStamp 当前时间戳
	* @param url       调用h5sdk.config的当前页面URL
	* @return
	*/
	function genSignature(jsticket, nonceStr, timeStamp, url) {
		const verifyStr = `jsapi_ticket=${jsticket}&noncestr=${nonceStr}&timestamp=${timeStamp}&url=${url}`;
		return sha1(verifyStr);
	}

	//生成长度为length的随机字符串
	function generateRdStr(length) {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (var i = 0; i < length; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}

    var data = {
        "app_id": app_id,
        "app_secret": app_secret
    };

    fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/",{
        method: 'POST',
        mode: "cors",
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(json => {
        alert(JSON.stringify(json));
        if(json.code == "0"){
            var tenant_access_token = json.tenant_access_token;
            fetch("https://open.feishu.cn/open-apis/jssdk/ticket/get",{
                method: 'POST',
                mode: "cors",
                headers: {
                    "Content-type": "application/json; charset=utf-8",
                    "Authorization": "Bearer " + tenant_access_token
                }
            })
            .then(response => response.json())
            .then(json => {
                alert(JSON.stringify(json));
                var ticket = json.data.ticket;
                var nonceStr = generateRdStr(16);
                var timestamp = new Date().getTime();
                var my_url = "http://www.skylight.xin";
                var signature = genSignature(ticket, nonceStr, timestamp, my_url);
                alert(JSON.stringify(ticket));
                window.h5sdk.config({
                    appId: app_id,         // 必填，应用ID
                    timestamp: timestamp,     // 必填，生成签名的时间戳，ms级
                    nonceStr: nonceStr,      // 必填，生成签名的随机串
                    signature: signature,     // 必填，签名
                    jsApiList: [
                        'biz.user.getUserInfo',
                        'device.health.getStepCount',
                        'biz.user.openDetail',
                        'biz.contact.open',
                        'device.base.getSystemInfo',
                        'biz.util.getClipboardInfo',
                        'biz.util.openDocument',
                        'biz.util.downloadFile',
                        'device.geolocation.get',
                        'device.geolocation.start',
                        'device.geolocation.stop',
                        'biz.user.getUserInfoEx',
                        'device.connection.getNetworkType'
                    ], // 必填，需要使用的jsapi列表。
                    onSuccess: function (result) {
                        alert("成功调用飞书API：" + JSON.stringify(result));
                        //成功回调
                    },
                    onFail: function () {
                        alert("无法注册飞书API");
                        //失败回调
                    }
                });
            })
            .catch(err => alert('无法使用飞书API，获取ticket失败：' +  JSON.stringify(err)));
        }else{
            alert(json.msg);
        }
    })
    .catch(err => alert('无法使用飞书API，获取token失败：' +  JSON.stringify(err)));

	window.h5sdk.error(error => alert("飞书API鉴权失败：" + JSON.stringify(error)));
}
