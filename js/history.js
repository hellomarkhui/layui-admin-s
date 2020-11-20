layui.extend({
  cloudFunction: '{/}../js/cloudFunction'
});
layui.use(['element', 'layer', 'table', 'form', 'jquery', 'laydate', 'cloudFunction'], function () {
    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var element = layui.element;
    var laydate = layui.laydate;
    var layer = layui.layer;
    var cloudFunction = layui.cloudFunction;

    var currentObj = null;//当前选中的行对象 layui
    var currentDetail = null;//当前选中的行数据
    var questionTable = null;
    var tableData = []; //初始化数据

    //初始化
    $(function(){
      //初始化日期
      initDate();
      //查询按钮
      query();
      //设置table
      initTable();
      //返回按钮
      returnBack();
      
      //照片点击事件，并查看
      imgEvent();

    });

    //初始化日期
    function initDate(){
      //初始化日期控件
      var dates = ['#startTime', '#endTime'];
      var now = new Date();
      now.setHours(23);
      now.setMinutes(59);
      now.setSeconds(59);
      var end = now.pattern("yyyy-MM-dd HH:mm:ss");
      var preDate = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 60); //默认两个月前
      preDate.setHours(0);
      preDate.setMinutes(0);
      preDate.setSeconds(0);
      var start = preDate.pattern("yyyy-MM-dd HH:mm:ss");
      var setDate = function(){
        for (var i = 0; i < dates.length; i++) {
          var value = "";
          if (dates[i].indexOf("start") >= 0) {
            value = start;
          } else {
            value = end;
          }
          laydate.render({
              elem: dates[i],
              type: 'datetime',
              value: value,
              max: 0
          });
        }
      }
      setDate();
    }

    //查询按钮
    function query(){
      form.on('submit(query)', function(data){
        //console.log(data.elem) //被执行事件的元素DOM对象，一般为button对象
        //console.log(data.form) //被执行提交的form对象，一般在存在form标签时才会返回
        console.log(data.field) //当前容器的全部表单字段，名值对形式：{name: value}
        var queryfield = data.field;
        var oldData = tableData;
        var newData = oldData.filter(function(item, index){
          if(!(queryfield.startTime <= item.rectime && queryfield.endTime >= item.rectime)){
            return false
          }
          if(queryfield.desc_q?!(item.desc.indexOf(queryfield.desc_q) > -1):false){
            return false
          }
          if(queryfield.evaluate_q?!(item.evaluate.indexOf(queryfield.evaluate_q) > -1):false){
            return false
          }
          if(queryfield.user_q?!(item.user.indexOf(queryfield.user_q) > -1):false){
            return false
          }
          if(queryfield.windFarmName_q?!(item.windFarmName.indexOf(queryfield.windFarmName_q) > -1):false){
            return false
          }
          return true;
        });
        questionTable.reload({data:newData});
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
      });
    }

    //table和detail切换
    function tableDetail(){
      $("#table").toggleClass("layui-hide");
        $("#detail").toggleClass("layui-hide");
    }

    //从detail页面返回
    function returnBack() {
      $("#back").click(function(){
        tableDetail();
        var $voices = $("#voices"), $files = $("#files"), $images=$("#images");
        $voices.empty();
        $files.empty();
        $images.empty();
      })
    }

    //获取表格的表头
    function getCols(){
      return [
        [ //表头
          {field: 'index',title: '序号', minWidth:60, align: 'center',templet: '<span>{{d.LAY_INDEX}}</span>',},
          {field: 'state',title: '需求类型', minWidth:60, align: 'center',}, 
          {field: 'windFarmName',title: '风场名称', minWidth:60, align: 'center',}, 
          {field: 'desc',title: '描述', minWidth:100, align: 'center',}, 
          {field: 'user',title: '用户', minWidth:100, align: 'center',}, 
          {field: 'rectime',title: '时间', minWidth:100, align: 'center',}, 
          {field: 'hostName',title: '主机厂家', minWidth:100, align: 'center',}, 
          {field: 'industry',title: '所属行业', minWidth:100, align: 'center',},
          //隐藏列
          {field: 'evaluate_t',title: '评价时间', hide: true}, 
          {field: 'evaluate',title: '评价', hide: true}, 
          {field: 'money',title: '金币数', hide: true}, 
          {field: 'reply',title: '回复', hide: true,}
        ]
      ]
    }

    //设置table
    function initTable(){
      var option = {
        limit: 10,
        elem: '#datatab',
        id: '#datatab',
        height: 480,
        page: true, //开启分页
        cols: getCols()
      };

      //$("#query-btn").click();

      var index = layer.load(1);
      //获取数据
      cloudFunction.call("getHistoryList", {},function(res){
        console.log(res);
        layer.close(index);
        res = res.list;
        if(res.length){
          res.forEach(function(item){
            item.state = item.state.text;
            item.user = item.userinfo[0].name;
            tableData.push(item);
          })
        }
        option.data = tableData.reverse();
        questionTable = table.render(option);
        $("#query-btn").click();
      })

      table.on('row', function(obj){
        //console.log(obj.tr) //得到当前行元素对象
        //console.log(obj.data) //得到当前行数据
        //obj.del(); //删除当前行
        //obj.update(fields) //修改当前行数据
        tableDetail(); //页面切换
        setDtData(obj.data); //设置详情数据
        currentDetail = obj.data; //
        currentObj = obj;
        getFileUrl(obj.data); //获取文件信息
      });
    }

    //设置detail数据
    function setDtData(o){
      o.evaluate = o.evaluate=='1'?"重要":"一般";//评价
      o.evaluate_t = new Date(o.configtime).pattern("yyyy-MM-dd HH:mm:ss");
      getCols()[0].forEach(function(item){
        $("#"+item.field).text(o[item.field]);
      })
    }

    //获取文件url
    function getFileUrl(data){
      var fileIDs = [];
      var files = data.fileList;
      var voices = data.voice_list;
      var fileLen = files.length; //文件个数
      files.forEach(function(item){
        fileIDs.push(item.fileFileID);
      });
      data.voice_list.forEach(function(item){
        fileIDs.push(item.voiceFileID);
      });
      var indexLoad = layer.load(1);
      cloudFunction.call("getFilesURL",{fileList: fileIDs},function(res){
        var $voices = $("#voices"), $files = $("#files"), $images=$("#images");
        //加载图片
        photoJson = {data:[]};
        files.forEach(function(item,index){
          if(item.type == 'image'){
            $images.append('<li><img src="'+res[index].tempFileURL+'"></li>');
            var img = {
              alt: "",//图片名
              pid: index, //图片id
              src: ""+res[index].tempFileURL, //原图地址
              thumb: "" //缩略图地址
            }
            photoJson.data.push(img);
          }
          else {
            $files.append('<li><a href="'+res[index].tempFileURL+'" target="_blank">'+
                  item.name+'</a></li>')
          }
        });

        voices.forEach(function(item, index){
          $voices.append('<audio src="'+res[index+fileLen].tempFileURL+'" controls="controls"></audio>')
        });
        layer.close(indexLoad);
      })
    }

    //照片点击事件
    function imgEvent(){
      //点击查看照片
      $('#images').on("click",'li', function(e){
        var $target = $(e.target);
        //var index = $target.attr("data-index");
        var index = $('#images').children().index(this);
        //查看该图片
        openPhotos(index);
      })
    }

    //查看照片
    function openPhotos(index){
    	photoJson = {
                title: "", //相册标题
                id: new Date().getTime(), //相册id
                start: index,//初始显示的图片序号，默认0
                data: photoJson.data
		    		  }
        var json = JSON.parse(JSON.stringify(photoJson));
        layer.photos({
    	    photos: json
    	    ,success: function() {
    	    	//以鼠标位置为中心的图片滚动放大缩小
    	    	 $(document).on("mousewheel",".layui-layer-photos",function(ev){
    	    	      var oImg = this;
    	    	      var ev = event || window.event;//返回WheelEvent
    	    	      //ev.preventDefault();
    	    	      var delta = ev.detail ? ev.detail > 0 : ev.wheelDelta < 0;
    	    	      var ratioL = (ev.clientX - oImg.offsetLeft) / oImg.offsetWidth,
    	    	          ratioT = (ev.clientY - oImg.offsetTop) / oImg.offsetHeight,
    	    	          ratioDelta = !delta ? 1 + 0.1 : 1 - 0.1,
    	    	          w = parseInt(oImg.offsetWidth * ratioDelta),
    	    	          h = parseInt(oImg.offsetHeight * ratioDelta),
    	    	          l = Math.round(ev.clientX - (w * ratioL)),
    	    	          t = Math.round(ev.clientY - (h * ratioT));
	    	      	  $(".layui-layer-photos").css({
	    	      		width: w, height: h
	    	      		,left: l, top: t
	    	      	  });
	    	      	  $("#layui-layer-photos").css({width: w, height: h});
	    	      	  $("#layui-layer-photos>img").css({width: w, height: h});	
    	    	 });
    	    }
	        ,end: function(){ //销毁回调
	    		
	    	  }
        });
    }
})

function tableTestData(){
  return [
    {"_id":"6057d84c5f62c982001aa0082d46e877","desc":"无功功率调节偏差大","hostName":"明阳","industry":"书","windFarmName":"王盘山风电场","rectime":"2020-09-17 10:27:08","state":"问题","evaluate":"0"}
    ,{"_id":"8e5be7055f64566c0010d3a274cd7ca9","state":"问题","windFarmName":"中哈得令风场","desc":"该风电场于xxxx出现异常，并进行相关的处理。。。。。在情况下","hostName":"明阳","industry":"风电行业","rectime":"2020-09-18 14:40:42","evaluate":"0"}
    ,{"_id":"d81cd5415f64874c000e3f8f0bd00963","desc":"asdf","state":"问题","hostName":"asdf","industry":"asdf","rectime":"2020-09-18 18:09:15","windFarmName":"sdaf","evaluate":"0"}
    ,{"_id":"b8df3bd65f6813db002ae720406d398a","windFarmName":"hill","desc":"测试","hostName":"明阳","industry":"风电","state":"问题","rectime":"2020-09-21 10:45:45","evaluate":"0"}
    ,{"_id":"1b64dd7b5f681478002ece9f32074281","windFarmName":"XX风电场","desc":"风电场有功延迟","hostName":"东汽","state":"问题","industry":"新能源","rectime":"2020-09-21 10:48:23","evaluate":"0"}
    ,{"_id":"e373396c5f6818e0002f26c81dd83191","desc":"现场问题测试","rectime":"2020-09-21 11:07:11","windFarmName":"1234","industry":"风电","state":"问题","hostName":"illness","evaluate":"1"}
    ,{"_id":"c54bd3a25f69b0c60039c2037a28f92d","desc":"测试","hostName":"测试","industry":"测试","state":"问题","windFarmName":"别是","rectime":"2020-09-22 16:07:33","evaluate":"1"}
    ,{"_id":"c54bd3a25f69b1240039c4de28516393","hostName":"明阳","rectime":"2020-09-22 16:09:05","windFarmName":"测试","desc":"侧室","industry":"风电","state":"问题","evaluate":"1"}
    ,{"_id":"d81cd5415f69cf41003d23ec7e5797a3","windFarmName":"XX风电场","desc":"测试","hostName":"东气","industry":"新能源","rectime":"2020-09-22 18:17:35","state":"问题","evaluate":"1"}
    ,{"_id":"e656fa635f69d0010049cbde4c0d687b","desc":"测试","rectime":"2020-09-22 18:20:47","state":"需求","windFarmName":"11风电场","hostName":"金风","industry":"新能源","evaluate":"1"}
    ,{"_id":"e373396c5f69d1030046ec346d4ba29b","state":"问题","desc":"测试","hostName":"测试","industry":"风电","rectime":"2020-09-22 18:25:03","windFarmName":"北师","evaluate":"1"}
  ]
}