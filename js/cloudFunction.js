layui.define(['jquery', 'layer'], function(exports){
    var $ = layui.$;
    const APPID = "wx4df8160e1f59562f";
    const APPSECRET = "6d278bf76a1fb145bb0e166f67c3f9dd";
    const URL = `/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;
    var Access_Token = '';

    // name:'云函数名称',param: {参数}}
    function invokecloudfunction(access_token, name, param) {
        const FUNCTION_NAME = 'sum';
        const ENV = 'quant-cloud-qurvj';
        const INVOKE_CLOUD_FUNCTION_URL = `/tcb/invokecloudfunction?access_token=${access_token}&env=${ENV}&name=${name}`;

        return new Promise((resolve, reject)=>{
            $.ajax({
                type: "post",
                ///tcb/invokecloudfunction?access_token=ACCESS_TOKEN&env=ENV&name=FUNCTION_NAME
                url: INVOKE_CLOUD_FUNCTION_URL,
                // 1 需要使用JSON.stringify 否则格式为 a=2&b=3&now=14...
                // 2 需要强制类型转换，否则格式为 {"a":"2","b":"3"}
                data: JSON.stringify(param),
                //请求头部设置
                contentType: "application/json; charset=utf-8",
              //  dataType: "json",
                success: function(res) {
                    if(res.errmsg == 'ok')
                        resolve(res)
                    else 
                        reject(res);
                }
            });
        })
        
    }
    // 获取token
    function getAccessToken() {
        return new Promise((resolve, reject)=>{
            $.getJSON({
                url: URL,
                success: (res) => {
                    if(res.errmsg){
                        reject(res)
                    }
                    else if(res.access_token){
                        resolve(res.access_token)
                    }
                }
            })
        })
    }

    // name:'云函数名称',param: {参数}, callback: function回调
    function call(name, param, callback){
        getAccessToken().then( res => {
            return invokecloudfunction(res, name, param)
        }).then(res => {
            if(typeof callback == 'function' && res.errmsg == 'ok'){
                callback(JSON.parse(res.resp_data))
            }
            else console.log(res)
        }).catch( err => {
            console.log(err)
        })
    }

    exports('cloudFunction', {
        call:call,
        getAccessToken: getAccessToken,
        invokecloudfunction: invokecloudfunction
    });
})