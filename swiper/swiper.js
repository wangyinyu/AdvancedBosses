/** 
 * 此处为轮播插件封装使用原生js
 * author：wangyinyu
 * date：2020-11-10
*/

/** 
 * 先建立对象思路。
 * 1.轮播插件需要接收的参数对象有：图片，滑动时间，向左或向右滑动。
 * 2.默认样式
*/
; (function (window, undefined) {
    var _global;
    function Swiper(option) {//首字母要大写
        var defaultOpt = {
            id: 'id' + new Date().getTime(),
            ImgList: [
                'img/l1.jpg',
                'img/l2.jpg',
                'img/l3.jpg',
            ],//图片列表
            Time: 1000,//滑动时间
            Action: 'left',//滑动方向
            autoplay: true//是否自动播放
        };
        var Opts = deepMerge(defaultOpt, option);
        var $id = document.getElementById(Opts.id);
        var ul = document.createElement('ul');
        $id.style.position = 'relative';
        $id.style.overflow = 'hidden';
        ul.style.position = 'absolute';
        ul.style.top = 0;
        ul.style.bottom = 0;
        ul.style.left = 0;
        ul.style.right = 0;
        ul.style.width = '600%';
        Opts.ImgList.forEach(function (item) {
            var li = document.createElement('li');
            var img = document.createElement('img');
            li.style.float = 'left';
            li.style.width = $id.clientWidth + 'px';
            li.style.height = $id.clientHeight + 'px';
            setwh(img);
            img.src = item;
            li.appendChild(img);
            ul.appendChild(li);
        })
        ul.style.listStyle = 'none';
        $id.appendChild(ul);
        animate(ul, ul.querySelector('li').clientWidth);
    }
    Swiper.prototype = {
        constructor: Swiper,
        clickfun: function (data) {
            alert(data)
        }
    }
    function animate(obj, target) {
        // 首先清除掉定时器
        clearInterval(obj.timer);
        // 用来判断 是+ 还是 -  即说明向左走还是向右走
        var speed = obj.offsetLeft < target ? 15 : -15;
        obj.timer = setInterval(function () {
            var result = target - obj.offsetLeft;//它们的差值不会超过speed
            obj.style.left = obj.offsetLeft - speed + "px";
            if (obj.style.left == (-obj.offsetWidth / 3 + 'px')) {
                obj.style.left = 0
            }
            // 有可能有小数的存在，所以在这里要做个判断             
            if (Math.abs(result) <= Math.abs(speed)) {
                debugger
                clearInterval(obj.timer);
                obj.style.left = target + "px";
            }
        }, 100);
    }
    function setwh(dom) {
        dom.style.width = '100%';
        dom.style.height = '100%';
    }
    //合并对象深拷贝
    function isPlainObject(val) {
        return toString.call(val) === '[object Object]'
    }
    function deepMerge() {
        var result = Object.create(null);//此写法等同于var result = {}，不过能节省hasOwnProperty带来的一点性能消耗
        var objs = [].slice.apply(arguments);
        objs.forEach(function (obj) {
            if (obj) {
                Object.keys(obj).forEach(function (key) {
                    var val = obj[key]
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
                })
            }
        })
        return result
    }
    // 最后将插件对象暴露给全局对象
    _global = (function () { return this || (0, eval)('this'); }());
    if (typeof module !== "undefined" && module.exports) {
        module.exports = Swiper;
    } else if (typeof define === "function" && define.amd) {
        define(function () { return Swiper; });
    } else {
        !('Swiper' in _global) && (_global.Swiper = Swiper);
    }
})(window, undefined)