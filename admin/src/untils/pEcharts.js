/**
 * pEChart增强插件ECharts
 * author:wangyinyu
 * date:2020-11-19
 */
import $ from 'jquery';
import echarts from 'echarts';
import request from '@/untils/request';
function setFontSize(size) {
    var windowWidth = document.body.clientWidth
    if (windowWidth > 1024 && windowWidth < 4000) {
        return size * windowWidth / 1920;
    } else if (windowWidth <= 800) {
        return size * windowWidth / 600;
    } else if (windowWidth < 1024) {
        return size * windowWidth / 800;
    } else if (windowWidth == 1024) {
        return size * windowWidth / 1366;
    } else if (windowWidth >= 4000) {
        return size * windowWidth / 1600;
    }
}
//深拷贝
function pEChart(setting) {
    var options = setting.ChartOptions;
    options.renderTo = (typeof setting.renderTo == "string" ? setting.renderTo : $(options.renderTo).attr("id"));
    try {
        echarts.dispose(document.getElementById(setting.renderTo));
    } catch (e) { }
    var myChart = echarts.init(document.getElementById(setting.renderTo));
    //控件初始化事件
    var create = function () {
        request.post(setting.url,setting.queryParam)
        .then(data => {
            if(!data) return false;
            //图形类型
            var _chartType = data.ChartType;
            options = RestOptions(_chartType);
            var legentData = data.Categories.split('|');
            //饼图中间显示总数据
            if (_chartType == "pie") {
                options.title[0].text =0;
                data.Series._Items.forEach(function(item){
                    options.title[0].text+=Number(item.data._Items[0].StringY);
                });
                options.title[0].text=options.title[0].text+(data.YaxisColumns._Items[0].name=='万平方米'?'万m²' : data.YaxisColumns._Items[0].name)
            }
            //组装X轴
            if (_chartType != "pie" && _chartType != "report") {
                if (legentData.length > 0) {
                    if (options.xAxis.length > 0) {
                        if (String.IsNullOrEmptyOrWhiteSpace(options.xAxis[0].type))
                            options.xAxis[0].type = "category";
                        options.xAxis[0].data = legentData;
                    } else {
                        options.xAxis = [{ type: 'category', data: legentData }];
                    }
                }
                //Y轴只需要同样的配置即可
                var yAxis = [];
                var noPieLegend = [];
                //组装Y轴
                $(data.YaxisColumns._Items).each(function (index, item) {

                    var singleyAxis = null;
                    if (options.yAxis.length > index) {
                        singleyAxis = $.extend(true, {}, options.yAxis[index]);
                    }
                    else if (options.yAxis.length > 0) {//如果没有第二组的设定则读取第一组
                        singleyAxis = $.extend(true, {}, options.yAxis[0]);
                    }
                    if (singleyAxis) {
                        if (String.IsNullOrEmptyOrWhiteSpace(singleyAxis["type"]))
                            singleyAxis["type"] = "value";
                        singleyAxis["name"] = item.name;
                        noPieLegend.push(item.key);
                        if (yAxis.length == 0 || (yAxis.length > 0 && yAxis.length < 2 && yAxis[0].name != item.name)) { //Y轴最大支持双轴
                            yAxis.push(singleyAxis)
                        }
                    } else {
                        if (yAxis.length == 0 || (yAxis.length > 0 && yAxis.length < 2 && yAxis[0].name != item.name)) { //Y轴最大支持双轴
                            yAxis.push({ type: "value", name: item.name });
                        }
                        noPieLegend.push(item.key);
                    }
                });
                options.yAxis = yAxis;
                options.legend.data = noPieLegend;
            }
            else {
                //设置图例
                options.legend.data = legentData;
            }

            for (var k = 0; k < data.YaxisColumns._Items.length; k++) {
                var curData = [];
                var max = 0.01;
                var yaxisColumn = data.YaxisColumns._Items[k];
                for (var i = 0; i < data.Series._Items.length; i++) {
                    var item = data.Series._Items[i];
                    if (yaxisColumn.key == item.key) {
                        var childItems = item.data._Items;
                        for (var j = 0; j < childItems.length; j++) {
                            if (childItems[j].y > max) {
                                max = childItems[j].y;
                            }
                            if (_chartType == "pie") {
                                curData.push({ name: childItems[j].categoryKey, value: childItems[j].y });
                            }
                            else {
                                curData.push(childItems[j].y);
                            }
                        }
                    }
                }
                if (typeof (yaxisColumn.chartType) != "undefined" && yaxisColumn.chartType != null && yaxisColumn.chartType != "") {
                    _chartType = yaxisColumn.chartType;
                }
               
                if (options.series.length <= k) {
                    var singSeries = {};
                    var newsingSeries = null;
                    
                    if (options.series.length > 0) {
                        singSeries = $.extend(true, {}, options.series[0]);
                    }

                    newsingSeries = $.extend(true, singSeries, {
                        name: yaxisColumn.key,
                        type: _chartType,
                        data: curData,
                        itemStyle: {
                            normal: {
                                label: {
                                    show: true,		//开启显示
                                    position: 'top',	//在上方显示
                                    textStyle: {	    //数值样式
                                        color: '#fff',
                                        fontSize: 12
                                    },
                                    formatter: function (p) {
                                        if (!p.data) {
                                            return '';
                                        }
                                    },
                                }
                            }
                        }
                    })
                    options.series.push(newsingSeries);
                }
                else {
                    options.series[k]["name"] = yaxisColumn.key;
                    options.series[k]["type"] = _chartType;
                    var neihuan=[];//内环值
                    var isTwoPie=curData.some(function(item){//检测是否是内环图
                        if(item.name !='$' )
                        neihuan.push(item);
                        return item.name =='$' ;
                    })
                    var waihuan=curData.slice(neihuan.length+1,-1);//外环值
                    if(isTwoPie){
                            options.series[0]["data"] = neihuan;
                            options.series[1]["data"] = waihuan;
                    }else{
                        options.series[k]["data"] = curData;
                    }
                }
                if (options.yAxis && options.yAxis.length == 2 && k == 1) {
                    options.series[k]["yAxisIndex"] = 1;
                    options.yAxis[k]["splitLine"]["show"] = false;//双y轴时隐藏其中一根y轴的网格线是为了显示好看
                }
            }

            var flag = false;//这里是为了判断数据为0的时候显示暂无数据
            for (var i = 0; i < options.series.length; i++) {
                for (var j = 0; j < options.series[i].data.length; j++) {
                    if (options.series[i].data[j] != 0) {
                        flag = true;
                        break;
                    }
                }
            }
            if (!flag) {
                var str ='<div style="font-size:26pt;color: #1760D3;width:50%;margin:0 auto;display:flex;align-items:center;height:100%;justify-content: center;"><div style="font-weight: bolder;">暂无数据</div></div>'
                $('#' + setting.renderTo).html(str);
            } else {
                if (options.series[0].stack != undefined) {//处理堆叠柱状图不显示数字问题
                    for (var i = 0; i < options.series.length; i++) {
                        options.series[i].itemStyle.normal.label.show = false
                    }
                }
                if (options.series[0].type == 'line' && options.series.length > 1) {//处理多线图也显示数字问题
                    for (var i = 0; i < options.series.length; i++) {
                        if (options.series[i].hasOwnProperty('itemStyle') && options.series[i].itemStyle.hasOwnProperty('normal') && options.series[i].itemStyle.normal.hasOwnProperty('label'))
                            options.series[i].itemStyle.normal.label.show = false
                    }
                }
                myChart.setOption(options, true);
            }
            if (typeof (setting.EChartSuccess) != "undefined" && typeof (setting.EChartSuccess)=='function') {//提供一个EChartSuccess回调函数
                setting.EChartSuccess(data,options,myChart);
            }
        })
        .catch(err => {
          console.log(err);
        });
    };
    create();
    var RestOptions = function (type) {
        var currentoptions;
        switch (type) {
            case "line":
                currentoptions = $.extend(true,{
                    color: ['#49a9ff', '#f77446', '#fff837', '#24f1ff', '#00e3b0', '#ed2450', '#00e930', '#b86cff'],
                    title: {
                        textStyle: {
                            fontWeight: 'normal',
                            fontSize: 12,
                            color: '#F1F1F3'
                        },
                        left: '6%'
                    },
                    legend: {
                        x: 'center',
                        top: '5%',
                        textStyle: { color: '#fff' },
                        show: true
                    },
                    textStyle: {
                        color: '#fff'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            lineStyle: {
                                color: '#57617B'
                            }
                        }
                    },
                    grid: {
                        left: '2%',
                        right: '2%',
                        bottom: '2%',
                        top: '12%',
                        containLabel: true
                    },
                    xAxis: [{
                        type: 'category',
                        boundaryGap: false,
                        axisLine: {
                            lineStyle: {
                                color: '#026FA7'
                            }
                        },
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                fontSize: 12
                            }
                        },
                        splitLine: {
                            show: false,
                            lineStyle: {
                                color: '#026FA7'
                            }
                        }
                    }],
                    yAxis: [{
                        type: 'value',
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#026FA7'
                            }
                        },
                        axisLabel: {
                            textStyle: {
                                fontSize: 12
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: '#026FA7'
                            }
                        }
                    }],
                    series: [{
                        name: '',
                        type: 'line',
                        smooth: true,
                        symbolSize: 10,
                        data: [],
                        label: {//echarts3.0所需样式
                            normal: {
                                show: true,
                                formatter: function (p) {
                                    if (!p.data) {
                                        return '';
                                    }
                                },
                                textStyle: {
                                    fontSize: setFontSize(12),
                                    color: '#fff'
                                }
                            },
                        },
                    }]
                }, options);
                break;
            case "pie":
                currentoptions = $.extend(true,{
                    title: [{
                        x: 'center',
                        y: 'center',
                        textStyle: {
                            color: '#fff',
                            fontSize: setFontSize(22),
                        }
                    }, {
                        show: false,
                        x: '40%',
                        y: '42%',
                        textStyle: {
                            color: '#fff',
                            fontSize: 12,
                            fontWeight:500
                        }
                    }],
                    tooltip: {
                        show: true,
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    textStyle: {
                        color: '#fff'
                    },
                    itemStyle: {
                        normal: {
                            //好，这里就是重头戏了，定义一个list，然后根据索引取得不同的值，这样就实现了，
                            color: function (params) {
                                // build a color map as your need.
                                var colorList = [
                                    '#00efe9', '#00aeff', '#67e06f', '#00efe9', '#ed7c30',
                                    '#b13efd', '#fe67b2', '#f8ff3c', '#F3A43B', '#60C0DD',
                                    '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
                                ];
                                return colorList[params.dataIndex]
                            }
                        }
                    },
                    legend: {
                        orient: 'vertical',
                        x: '80%',
                        y: 'center',
                        itemHeight: 8,
                        itemWidth: 8,
                        textStyle: {
                            fontSize: setFontSize(14),
                            color: '#fff'
                        },
                    },
                    series: [
                        {
                            radius: ['50%', '65%'],//这个就是饼图大小设置
                            center: ['50%', '50%'],//这个是饼图位置设置
                            avoidLabelOverlap: true,//如果不需要开启该策略，例如圆环图这个例子中需要强制所有标签放在中心位置，可以将该值设为 false。
                            silent: true,//图形是否触发鼠标移上扇形变大响应事件
                            label: {//echarts3.0所需样式
                                normal: {
                                    show: true,
                                    formatter: "{c} ({d}%)",
                                    textStyle: {
                                        fontSize: setFontSize(12),
                                        color: '#fff'
                                    }
                                },
                            },
                            labelLine: {//echarts3.0所需样式
                                normal: {
                                    length: 5,
                                    show: true
                                }
                            },
                        }
                    ]
                }, options);
                break;
            default:
                currentoptions = $.extend(true,{
                    color: ['#49a9ff', '#f77446', '#fff837', '#24f1ff', '#00e3b0', '#ed2450', '#00e930', '#b86cff'],
                    tooltip: {
                        trigger: 'axis'
                    },
                    textStyle: {
                        color: '#fff'
                    },
                    legend: {
                        x: 'center',
                        top: '0%',
                        textStyle: { color: '#fff' },
                        show: true
                    },
                    grid: {
                        left: '2%',
                        right: '2%',
                        bottom: '2%',
                        top: '12%',
                        containLabel: true,
                    },
                    xAxis: [
                        {
                            type: 'category',
                            axisPointer: {
                                type: 'shadow'
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#00BEFA'
                                }
                            },
                            axisTick: {
                                show: true
                            },
                            axisLabel: {
                                rotate: 30,
                                textStyle: {
                                    fontSize: setFontSize(14)
                                },
                            }
                        }
                    ],
                    yAxis: [
                        {
                            axisLine: {
                                lineStyle: {
                                    color: '#00BEFA'
                                }
                            },
                            axisTick: {
                                show: false
                            },
                            splitLine: {
                                lineStyle: {
                                    color: '#00BEFA'
                                }
                            }
                        },
                        {
                            splitLine: {//双y轴实现
                                show: false
                            },
                            type: 'value',
                            min: 0,
                            axisLine: {
                                show: true,
                                lineStyle: {
                                    color: '#00BEFA'
                                }
                            },
                            axisTick: { show: false },
                        }
                    ],
                    series: []
                }, options);
                break;
        }
        return currentoptions;
    }
    //ehcarts节点点击事件
    if (typeof (setting.clickParam) != "undefined" && setting.clickParam != null) {
        myChart.on('click', function (params) {
            if (!String.IsNullOrEmptyOrWhiteSpace(setting.clickParam.url)) {
                for (var key in setting.clickParam) {
                    if (typeof (setting.clickParam[key]) == "function") {
                        if (key.indexOf("_fun") > -1) {
                            setting.clickParam[key.replace("_fun", "")] = setting.clickParam[key](params);
                        }
                        else {
                            setting.clickParam[key + "_fun"] = setting.clickParam[key];
                            setting.clickParam[key] = setting.clickParam[key + "_fun"](params);
                        }
                    }
                }
                showWindow({
                    src: setting.clickParam.url + "?clickParam=" + escape(JSON.stringify(setting.clickParam)),
                    title: setting.clickParam.title,
                    max: true,
                    modal: false
                })
            }
        })
    }
    return myChart;
}
// 将这个插件对象抛出
export default {
    install(Vue, options) {
      Vue.prototype.pEChart = pEChart;
    }
}