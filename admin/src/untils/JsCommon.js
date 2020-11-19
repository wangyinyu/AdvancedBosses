
// 测试浏览器
var inBrowser = typeof window !== 'undefined';
var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
var isPhantomJS = UA && /phantomjs/.test(UA);
var isFF = UA && UA.match(/firefox\/(\d+)/);
//判断是否为对象
function isPlainObject(val) {
    return toString.call(val) === '[object Object]'
}
export default {
    formatterdate(val, row){
        if (val != null) {
            var date = new Date(val);
            try {
                val = val.replace(/T/g, ' ');
                val = val.replace(/-/g, ':').replace(' ', ':');
                var valArry = val.split(':');
                var date;
                if (valArry.length > 3) {
                    date = new Date(valArry[0], (valArry[1] - 1), valArry[2], valArry[3], valArry[4], valArry[5]);
                }
                else {
                    date = new Date(valArry[0], (valArry[1] - 1), valArry[2]);
                }
            } catch (e) {
                date = new Date(val);
            }
            var month = date.getMonth() + 1;
            var month = month < 10 ? ("0" + month) : month;

            var day = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();

            var _date = date.getFullYear() + '-' + month + '-' + day;

            return _date == "1-01-01" || _date == "1901-01-01" ? "" : _date;
        }
    },
    resetValue(val){
        if (val != null && typeof (val) != "undefined" && this.formatterdate(val) != '1-01-01') {
            return val;
        }
        return "";
    },
    //合并对象深拷贝开始
    deepMerge(...objs){//...为拓展运算符，objs作用类似于var objs = [].slice.apply(arguments);
        const result = Object.create(null);//此写法等同于const result = {}，不过能节省hasOwnProperty带来的一点性能消耗
        objs.forEach(obj => {
            if (obj) {
                Object.keys(obj).forEach(key => {
                    const val = obj[key]
                    if (isPlainObject(val)) {
                        // 这里判断 原对象上 相同键是否是一个 对象
                        // 如果是将 新的对象合并到原对象上 (递归)
                        if (isPlainObject(result[key])) {
                            result[key] = deepMerge(result[key], val)
                        } else {
                            result[key] = deepMerge(val)
                        }
                    } else {
                        result[key] = val
                    }
                })/*  */
            }
        })
        return result
    },
     //使用递归的方式实现数组、对象的深拷贝
    deepClone (obj){
        //判断拷贝的要进行深拷贝的是数组还是对象，是数组的话进行数组拷贝，对象的话进行对象拷贝
        var objClone = Array.isArray(obj) ? [] : {};
        //进行深拷贝的不能为空，并且是对象或者是
        if (obj && typeof obj === "object") {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (obj[key] && typeof obj[key] === "object") {
                        objClone[key] = deepClone(obj[key]);
                    } else {
                        objClone[key] = obj[key];
                    }
                }
            }
        }
        return objClone;
    }
}

