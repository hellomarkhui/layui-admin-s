layui.extend({
  cloudFunction: '{/}../js/cloudFunction'
});
layui.use(['element', 'layer', 'table', 'form', 'jquery', 'cloudFunction',], function () {
    var $ = layui.$;
    var layer = layui.layer;
    var table = layui.table;
    var form = layui.form;
    var cloudFunction = layui.cloudFunction;

    var currentObj = null;//当前选中的行对象 layui
    var currentDetail = null;//当前选中的行数据
    var questionTable = null;//当前table

    $(function(){

      //数据加载
      initTable();

      //返回按钮
      returnBack();

      //照片点击事件，并查看
      imgEvent();

      //提交事件
      submitEvent();

    })

    //table和detail切换
    function tableDetail(){
      $("#table").toggleClass("layui-hide");
      $("#detail").toggleClass("layui-hide");
    }

    function getCols(){
      return [
        [ //表头
          {field: 'index',title: '序号',align: 'center',templet: '<span>{{d.LAY_INDEX}}</span>',},
          {field: 'state',title: '需求类型',align: 'center',}, 
          {field: 'windFarmName',title: '风场名称',align: 'center',}, 
          {field: 'desc',title: '描述',align: 'center',}, 
          {field: 'user',title: '用户',align: 'center',}, 
          {field: 'rectime',title: '时间', align: 'center',}, 
          {field: 'hostName',title: '主机厂家', align: 'center',}, 
          {field: 'industry',title: '所属行业', align: 'center',}
        ]
      ]
    }
    
    //table处理
    function initTable(){
      var option = {
        done: function() {
          $('#datatab').next().css('height', 'auto');
        },
        id: '#datatab',
        limit: 10,
        elem: '#datatab',
        height: 460,
        page: true, //开启分页
        cols: getCols(),
        /* data: [
                {"_id":"6057d84c5f62c982001aa0082d46e877","desc":"无功功率调节偏差大","hostName":"明阳","industry":"书","windFarmName":"王盘山风电场","rectime":"2020-09-17 10:27:08","state":"问题"}
                ,{"_id":"8e5be7055f64566c0010d3a274cd7ca9","state":"问题","windFarmName":"中哈得令风场","desc":"该风电场于xxxx出现异常，并进行相关的处理。。。。。在情况下","hostName":"明阳","industry":"风电行业","rectime":"2020-09-18 14:40:42"}
                ,{"_id":"d81cd5415f64874c000e3f8f0bd00963","desc":"asdf","state":"问题","hostName":"asdf","industry":"asdf","rectime":"2020-09-18 18:09:15","windFarmName":"sdaf"}
        ] */
      }
      var index = layer.load({content: '加载中'});
      //获取数据
      cloudFunction.call("getNewQueList", {},function(res){
        console.log(res);
        layer.close(index);
        res = res.list;
        var optionData = []
        if(res.length){
          res.forEach(function(item){
            item.state = item.state.text; 
            item.user = item.userinfo[0].name;
            optionData.push(item);
          })
        }
        option.data = optionData.reverse();
        questionTable = table.render(option);
      })

      //监听行单击事件
      table.on('row(datatab)', function(obj){
        //console.log(obj.tr) //得到当前行元素对象
        //console.log(obj.data) //得到当前行数据
        tableDetail();
        setDtData(obj.data);
        currentDetail = obj.data;
        currentObj = obj;
        getFileUrl(obj.data);
      });
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

    //设置detail数据
    function setDtData(o){
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

    //提交事件
    function submitEvent() {
      form.on('submit(detailForm)', function(data){
        //console.log(data.elem) //被执行事件的元素DOM对象，一般为button对象
        //console.log(data.form) //被执行提交的form对象，一般在存在form标签时才会返回
        //console.log(data.field) //当前容器的全部表单字段，名值对形式：{name: value}
        $(data.elem).attr("disabled", true);
        var index = layer.load(1)
        cloudFunction.call("questionReview", 
            {
              id: currentDetail._id,
              openid: currentDetail._openid,
              data: data.field
            },function(res){
              $(data.elem).attr("disabled", false);
              layer.close(index);
              if(res.errMsg && res.errMsg.indexOf('ok')>-1){
                layer.alert('提交成功', function(index){
                  //do something
                  $("#back").click();
                  var oldData = layui.table.cache["#datatab"];
                  tableReload(); //重载表格
                  layer.close(index);
                }); 
              }
              else {
                  layer.alert('提交失败：'+res.errMsg);
              }
        })
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
      });
    }

    //表格重载
    function tableReload(){
      var oldData = layui.table.cache["#datatab"];
      oldData.forEach(function(item,i){
        if(!item.length){
          oldData.splice(i,1);
        }
      });
      questionTable.reload({data:oldData});
    }
})