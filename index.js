//JavaScript代码区域
layui.extend({
  cloudFunction: '{/}js/cloudFunction'
});
layui.use(['element','jquery','layer','form','cloudFunction'], function(){
  var element = layui.element,
      layer = layui.layer,
      form = layui.form,
      $ = layui.$,
      cloudFunction = layui.cloudFunction;

  var user = null;//用户信息
  var indexPassword = -1; //密码窗口索引

  $(function(){
    //用户检测事件
    checkLogin();
    //注销事件
    checkOut();
    //菜单选中事件
    navSelect();
    //修改密码
    setPassword();
  })

  //用户检测事件
  function checkLogin(){
      user = sessionStorage.getItem("user");
      if(!user){
        window.location.href = "/temp/login.html";
      }else {
        user = JSON.parse(sessionStorage.getItem("user"));
        $("#username").text(user.name);
      }
  }

  //注销事件
  function checkOut(){
    $("#checkout").click(function(){
      sessionStorage.setItem("user", '');
      window.location.href = "/temp/login.html";
    })
  }

  //菜单选中事件
  function navSelect(){
    element.on('nav(nav-left)',function(elem){
      /*使用DOM操作获取超链接的自定义data属性值*/
      var url = $(elem).data("url")
      $("#container").find("iframe").attr("src",url);
    });
  }

  //修改密码
  function setPassword(){
    $("#setpassword").click(function(){
      indexPassword = layer.open({
        type: 1,
        content: $("#userpwd"),
        area: ['400px', '300px']
      });
    })

    form.on('submit(submitUserPwd)',function(data){
      //console.log(data.elem) //被执行事件的元素DOM对象，一般为button对象
      //console.log(data.form) //被执行提交的form对象，一般在存在form标签时才会返回
      console.log(data.field) //当前容器的全部表单字段，名值对形式：{name: value}
      var field = data.field;
      if(field.originPwd != user.password){
        layer.alert("原始密码不正确");
      }else if(field.userPwd != field.userPwd2){
        layer.alert("密码与确认密码不相等");
      }else {
        var index = layer.load(1);
        cloudFunction.call("setAdmin",
                  {
                    password:field.userPwd,
                    name: user.name
                   },
        function(res){
          console.log(res)
          layer.close(index);
          if(res.errMsg && res.errMsg.indexOf('ok')>-1){//登录成功
            layer.alert('修改成功', function(index){
              //do something
              layer.close(indexPassword);
              layer.close(index);
            }); 
          }else {
            layer.alert('修改失败', function(index){
                //do something
                console.log(res)
                layer.close(index);
            }); 
          }
        })
      }
      return false;
    })
  }
});