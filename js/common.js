/**
 * Created by A03742 on 2018-04-10.
 */

/**
 * *********  操作实例  **************
 *   var map = new HashMap();
 *   map.put("key1","Value1");
 *   map.put("key2","Value2");
 *   map.put("key3","Value3");
 *   map.put("key4","Value4");
 *   map.put("key5","Value5");
 *   alert("size："+map.size()+" key1："+map.get("key1"));
 *   map.remove("key1");
 *   map.put("key3","newValue");
 *   var values = map.values();
 *   for(var i in values){
*       document.write(i+"："+values[i]+"   ");
*   }
 *   document.write("<br>");
 *   var keySet = map.keySet();
 *   for(var i in keySet){
*       document.write(i+"："+keySet[i]+"  ");
*   }
 *   alert(map.isEmpty());
 */

function HashMap(){
    //定义长度
    var length = 0;
    //创建一个对象
    var obj = new Object();

    /**
     * 判断Map是否为空
     */
    this.isEmpty = function(){
        return length == 0;
    };

    /**
     * 判断对象中是否包含给定Key
     */
    this.containsKey=function(key){
        return (key in obj);
    };

    /**
     * 判断对象中是否包含给定的Value
     */
    this.containsValue=function(value){
        for(var key in obj){
            if(obj[key] == value){
                return true;
            }
        }
        return false;
    };

    /**
     *向map中添加数据
     */
    this.put=function(key,value){
        if(!this.containsKey(key)){
            length++;
        }
        obj[key] = value;
    };

    /**
     * 根据给定的Key获得Value
     */
    this.get=function(key){
        return this.containsKey(key)?obj[key]:null;
    };

    /**
     * 根据给定的Key删除一个值
     */
    this.remove=function(key){
        if(this.containsKey(key)&&(delete obj[key])){
            length--;
        }
    };

    /**
     * 获得Map中的所有Value
     */
    this.values=function(){
        var _values= new Array();
        for(var key in obj){
            _values.push(obj[key]);
        }
        return _values;
    };

    /**
     * 获得Map中的所有Key
     */
    this.keySet=function(){
        var _keys = new Array();
        for(var key in obj){
            _keys.push(key);
        }
        return _keys;
    };

    /**
     * 获得Map的长度
     */
    this.size = function(){
        return length;
    };

    /**
     * 清空Map
     */
    this.clear = function(){
        length = 0;
        obj = new Object();
    };
}

/**
 * 生成UUID
 * @returns {string}
 */
function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}


/**
 * 对象数组排序
 * @param prop
 * @returns {Function}
 */
var compare = function (prop) {
    return function (obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
        }
        if (val1 < val2) {
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }
    }
}

/**
 * 对象数组排序，从大到小
 * @param prop
 * @returns {Function}
 */
var compareBigToSmall = function (prop) {
    return function (obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
        }
        if (val1 > val2) {
            return -1;
        } else if (val1 < val2) {
            return 1;
        } else {
            return 0;
        }
    }
}

/**
 * 计算两个坐标点之间的距离，单位：米 zhanglinbo 20170803
 * @lat1 纬度1
 * @lng1 经度1
 * @lat2 纬度2
 * @lng2 经度2
 */

function getDistance(lat1, lng1, lat2, lng2) {
    var dis = 0;
    var radLat1 = toRadians(lat1);
    var radLat2 = toRadians(lat2);
    var deltaLat = radLat1 - radLat2;
    var deltaLng = toRadians(lng1) - toRadians(lng2);
    var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
    return dis * 6378137;

    function toRadians(d) {  return d * Math.PI / 180;}
}
function downloadTableExl(tableId,fileName) {
    $("#"+tableId).tableExport({type:"excel",escape:"false",fileName:fileName});
}

/**
 * 导出html table为excel
 * zhanglinbo 20180824
 * @param tableId 表格Id
 * @param fileName 导出的文件名称（不带后缀）
 * 使用例子：<a onclick = "downloadExl('fansResourceTable','风机资源')">导出</a>
 */
function downloadExl(tableId,fileName) {
    var data = document.getElementById(tableId);
    const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
    wb.Sheets['Sheet1'] = XLSX.utils.table_to_sheet(data);//通过table_to_sheet转成单页(Sheet)数据
    saveAs(new Blob([s2ab(XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'binary' }))], { type: "application/octet-stream" }), fileName + '.xlsx' );
    //自定义简单的下载文件实现方式
    function saveAs(obj, fileName) {
        var tmpa = document.createElement("a");
        tmpa.download = fileName || "下载";
        tmpa.href = URL.createObjectURL(obj); //绑定a标签
        tmpa.click(); //模拟点击实现下载
        setTimeout(function () { //延时释放
            URL.revokeObjectURL(obj); //用URL.revokeObjectURL()来释放这个object URL
        }, 100);
    }
    //实现转码
    function s2ab(s) {
        if (typeof ArrayBuffer !== 'undefined') {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        } else {
            var buf = new Array(s.length);
            for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }
    }
}


Date.prototype.pattern=function(fmt) {
    var o = {
        "M+" : this.getMonth()+1, //月份
        "d+" : this.getDate(), //日
        "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
        "H+" : this.getHours(), //小时
        "m+" : this.getMinutes(), //分
        "s+" : this.getSeconds(), //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S" : this.getMilliseconds() //毫秒
    };
    var week = {
        "0" : "/u65e5",
        "1" : "/u4e00",
        "2" : "/u4e8c",
        "3" : "/u4e09",
        "4" : "/u56db",
        "5" : "/u4e94",
        "6" : "/u516d"
    };
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    if(/(E+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

/**
 * 获取上一个月
 *
 * @date 格式为yyyy-mm-dd的日期，如：2014-01-25
 */
function getPreMonth(date) {
    var arr = date.split('-');
    var year = arr[0]; //获取当前日期的年份
    var month = arr[1]; //获取当前日期的月份
    var day = arr[2]; //获取当前日期的日
    var days = new Date(year, month, 0);
    days = days.getDate(); //获取当前日期中月的天数
    var year2 = year;
    var month2 = parseInt(month) - 1;
    if (month2 == 0) {
        year2 = parseInt(year2) - 1;
        month2 = 12;
    }
    var day2 = day;
    var days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
        day2 = days2;
    }
    if (month2 < 10) {
        month2 = '0' + month2;
    }
    var t2 = year2 + '-' + month2 + '-' + day2;
    return t2;
}

/**
 * 转换科学计数法
 * @param num_str
 * @returns {*}
 */
function toolNumber(num_str) {
    num_str = num_str.toString();
    if (num_str.indexOf("+") != -1) {
        num_str = num_str.replace("+", "");
    }
    if (num_str.indexOf("E") != -1 || num_str.indexOf("e") != -1) {
        var resValue = "",
            power = "",
            result = null,
            dotIndex = 0,
            resArr = [],
            sym = "";
        var numStr = num_str.toString();
        if (numStr[0] == "-") {
            // 如果为负数，转成正数处理，先去掉‘-’号，并保存‘-’.
            numStr = numStr.substr(1);
            sym = "-";
        }
        if (numStr.indexOf("E") != -1 || numStr.indexOf("e") != -1) {
            var regExp = new RegExp(
                "^(((\\d+.?\\d+)|(\\d+))[Ee]{1}((-(\\d+))|(\\d+)))$",
                "ig"
            );
            result = regExp.exec(numStr);
            if (result != null) {
                resValue = result[2];
                power = result[5];
                result = null;
            }
            if (!resValue && !power) {
                return false;
            }
            dotIndex = resValue.indexOf(".") == -1 ? 0 : resValue.indexOf(".");
            resValue = resValue.replace(".", "");
            resArr = resValue.split("");
            if (Number(power) >= 0) {
                var subres = resValue.substr(dotIndex);
                power = Number(power);
                //幂数大于小数点后面的数字位数时，后面加0
                for (var i = 0; i <= power - subres.length; i++) {
                    resArr.push("0");
                }
                if (power - subres.length < 0) {
                    resArr.splice(dotIndex + power, 0, ".");
                }
            } else {
                power = power.replace("-", "");
                power = Number(power);
                //幂数大于等于 小数点的index位置, 前面加0
                for (var i = 0; i < power - dotIndex; i++) {
                    resArr.unshift("0");
                }
                var n = power - dotIndex >= 0 ? 1 : -(power - dotIndex);
                resArr.splice(n, 0, ".");
            }
        }
        resValue = resArr.join("");

        return sym + resValue;
    } else {
        return num_str;
    }
}

//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}


