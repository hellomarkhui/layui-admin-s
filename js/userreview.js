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
      //查询按钮
      query();
      //设置table
      initTable();

    });

    //查询按钮
    function query(){
      form.on('submit(query)', function(data){
        //console.log(data.elem) //被执行事件的元素DOM对象，一般为button对象
        //console.log(data.form) //被执行提交的form对象，一般在存在form标签时才会返回
        //console.log(data.field) //当前容器的全部表单字段，名值对形式：{name: value}
        var match = function(source,find){
          
        }
        var queryfield = data.field;
        var newData = tableData.filter(function(item, index){
          if(queryfield.name?!(item.name.indexOf(queryfield.name) > -1):false){
            return false
          }
          if(queryfield.mail?!(item.evaluate.indexOf(queryfield.mail) > -1):false){
            return false
          }
          if(queryfield.tel?!(item.tel.indexOf(queryfield.tel) > -1):false){
            return false
          }
          if(queryfield.company?!(item.company.indexOf(queryfield.company) > -1):false){
            return false
          }
          if(queryfield.position?!(item.position.indexOf(queryfield.position) > -1):false){
            return false
          }
          if(queryfield.review != 'all'?!(item.review == queryfield.review):false){
             return false
          }
          return true;
        });
        questionTable.reload({data:newData});
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
      });
    }

    //获取表格的表头
    function getCols(){
      return [
        [ //表头
          {field: 'index',title: '序号', maxWidth:60, align: 'center',templet: '<span>{{d.LAY_INDEX}}</span>',},
          {field: 'name',title: '姓名', minWidth:100, align: 'center',}, 
          {field: 'mail',title: '电子邮箱', minWidth:100, align: 'center',}, 
          {field: 'tel',title: '联系方式', minWidth:100, align: 'center',}, 
          {field: 'company',title: '所属公司', minWidth:100, align: 'center',}, 
          {field: 'position',title: '职位', minWidth:100, align: 'center',}, 
          {field: 'review',title: '审核状态', minWidth:200, align: 'center',templet: function(d){
            var txt = '未知';
            if(0 == d.review) {
              txt = "未提交";
            }else if(1 == d.review) {
              txt = "待审核";
            }else if(2 == d.review) {
              txt = "已审核";
            }else if(3 == d.review) {
              txt = "未通过（"+d.review_reason+"）";
            }
            return txt;
          },}, 
          {fixed: 'right',title: '审核操作', minWidth:200, align: 'center',toolbar: '#barDemo'}, 
          {field: 'review_reason',title: '未通过审核原因', hide: true}, 
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

      var index = layer.load(1);
      //获取数据
      cloudFunction.call("getUser", {},function(res){
        console.log(res);
        layer.close(index);
        res = res.data;
        if(res.length){
            res.forEach(element => {
              if(!element.review) {
                element.review = '0';
              }else{
                element.review = element.review
              }
              tableData.push(element);
            });
        }
        option.data = tableData.reverse();
        questionTable = table.render(option);
        $("#query-btn").click();
      })

      table.on('row(datatab)', function(obj){
        //console.log(obj.tr) //得到当前行元素对象
        //console.log(obj.data) //得到当前行数据
        //obj.del(); //删除当前行
        //obj.update(fields) //修改当前行数据
      });

      tableTool();
    }

    //监听工具条，审核
    function tableTool(){
      //监听工具条 
      table.on('tool(datatab)', function(obj){ //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
        var data = obj.data; //获得当前行数据
        var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
        var tr = obj.tr; //获得当前行 tr 的 DOM 对象（如果有的话）
        var review = "" //审核状态
        if(layEvent === 'pass'){ //
          review = "2"; //通过
          //do somehing
          layer.confirm('真的通过审核吗', function(index){
            layer.close(index);
            reviewing({ 
              id:data._id, 
              data: {review: review}, 
              success: function(){
                tableReload(obj, review); //修改数据库成功后更新前端表格

              }
            });
          });
        } else if(layEvent === 'noPass'){ //编辑
          review = "3"; //通过
          //do something
          layer.prompt({
            formType: 2,
            value: '',
            title: '请输入不通过审核的原因',
            area: ['400px', '100px'] //自定义文本域宽高
          }, function(value, index, elem){
            layer.close(index);
            var reason = value; //不通过原有
            reviewing({ 
              id:data._id, 
              data: {review: review,
                      review_reason: reason}, 
              success: function(){
                tableReload(obj, review); //修改数据库成功后更新前端表格
              }
            });
          });
        }
      });
    }

    //审核 param {id:'',data:{}, success: callback}
    function reviewing(param){
      var index = layer.load(1)
      cloudFunction.call("userReview", 
            {
              id: param.id,
              data: param.data
            },function(data){
              layer.close(index);
              if(data.errMsg && data.errMsg.indexOf('ok')>-1){
                layer.alert('审核成功', function(index){
                  //do something
                  if(typeof param.success == 'function'){
                    param.success();
                  }
                  layer.close(index);
                }); 
              }
              else {
                  layer.alert('提交失败：'+data.errMsg);
              }
        })
    }

    //表格重载，审核提交数据库成功后执行，obj为表格当前行对象，review为传入的值
    function tableReload(obj, review){
      obj.update({ //修改缓存为已审核或审核未通过
        review: review
      });
      obj.del(); //删除该行
      var data = obj.data; //获得当前行数据
      tableData.forEach(function(item,i){ 
        if(item._id == data._id ){ //改变table基础数据
          item.review = review;
        }
      });
      var oldData = layui.table.cache["#datatab"]; //改变缓存
      oldData.forEach(function(item,i){
        if(!item.length){
          oldData.splice(i,1);
        }
      });
      questionTable.reload({data:oldData});
    }
})