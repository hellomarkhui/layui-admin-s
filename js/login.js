layui.extend({
    cloudFunction: '{/}../js/cloudFunction'
});
layui.use(['element', 'layer', 'form', 'jquery', 'cloudFunction'], function () {
    var $ = layui.$;
    var form = layui.form;
    var element = layui.element;
    var layer = layui.layer;
    var cloudFunction = layui.cloudFunction;
    
    var CookieUtil = {
    	setCookie:function (cname,cvalue,exdays){
   	      var d = new Date();
   	      d.setTime(d.getTime()+(exdays*24*60*60*1000));
   	      var expires = "expires="+d.toGMTString();
   	      document.cookie = cname + "=" + cvalue + "; " + expires;
   	    },
    	getCookie:function (cname){
   	      var name = cname + "=";
   	      var ca = document.cookie.split(';');
   	      for(var i=0; i<ca.length; i++) 
   	      {
   	        var c = ca[i].trim();
   	        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
   	      }
   	      return "";
   	    },
   	 	delCookie:function(name) {  
   	        this.setCookie(name, "", -1);  
   	    }
    }

    //初始化
    $(function(){
        form.on('submit(formLogin)', function(data){
            var field = data.field;
            console.log(field);
            var username = field.username;
            var password = field.password;
            var remember = field.remember;
            
            if (!username){
                layer.msg("请输入账户")
                return
            }

            if (!password){
                layer.msg("请输入密码")
                return
            }

            var password_md5 = hex_md5(password); //把密码进行md5加密
            //$('#password').val(password_md5);   //重新设置input框中
            
            if(remember){
            	CookieUtil.setCookie('username',username,30);
            	CookieUtil.setCookie('password', password_md5, 30);
            }else{
            	CookieUtil.delCookie('password');
            	CookieUtil.delCookie('username');
            }
            
            login(username,password,remember);
        });
        
        //输入密码后回车
        $("#password").keypress(function (event) {
            if (event.which == 13) {
                $("#login_bottom").click();
            }
        });
        
        //忘记密码
        $("#forget-password").click(function(event){
        	layer.open({
        		title: '忘记密码？'
        		,content: '请联系管理员'
    		}); 
        })
    });

    function login(username,password,remember){
        var commit = {
            name:username,
            password:password,
            remember:remember
        }
        console.log(commit)
        //用户校验
        var index = layer.load(1); //又换了种风格，并且设定最长等待10秒
        cloudFunction.call("getAdmin",commit,function(res){
            layer.close(index);
            if(res.errMsg && res.errMsg.indexOf('ok')>-1 && res.data.length > 0){//登录成功
                sessionStorage.setItem("user",JSON.stringify({name:username,
                                                password:password}));
                window.location.href = '/index.html';
            }else {
                layer.alert('用户名或密码错误', function(index){
                    //do something
                    
                    layer.close(index);
                  }); 
            }
        })
    }
})