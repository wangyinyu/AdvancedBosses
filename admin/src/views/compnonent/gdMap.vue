<template>
  <div class="wrapper" id="map"></div>
</template>

<script>
var gaoDeMap;
export default {
  name: "gdMap",
  components: {},
  props: {},
  data() {
    return {};
  },
  watch: {},
  computed: {},
  methods: {
    initGaoDeMap() {
     var zoomIndex = 9.5;
      gaoDeMap = new AMap.Map("map", {
        mapStyle: "amap://styles/5e8a11fb59a6e15b4f13a215340be3d3",
        zoom: zoomIndex,
        center: [103.831788, 30.048318],
        viewMode: "2D",
      });
    var  geocoder = new AMap.Geocoder({
        radius: 200, //范围，默认：500
      });
      meishanLine(); //画出眉山市的轮廓
      // 加载相关组件
      initGaoDeMapData();
    },
  },
  created() {},
  mounted() {
    this.$nextTick(() => this.initGaoDeMap());
  },
};
//初始化高德地图

function meishanLine() {
  ////画出成都市的轮廓
  new AMap.DistrictSearch({
    extensions: "all",
    subdistrict: 0,
  }).search("眉山市", function (status, result) {
    // 外多边形坐标数组和内多边形坐标数组
    var outer = [
      new AMap.LngLat(-360, 90, true),
      new AMap.LngLat(-360, -90, true),
      new AMap.LngLat(360, -90, true),
      new AMap.LngLat(360, 90, true),
    ];
    var holes = result.districtList[0].boundaries;

    var pathArray = [outer];
    pathArray.push.apply(pathArray, holes);
    var polygon = new AMap.Polygon({
      pathL: pathArray,
      //线条颜色，使用16进制颜色代码赋值。默认值为#006600
      strokeColor: "rgb(20,164,173)",
      strokeWeight: 0,
      //轮廓线透明度，取值范围[0,1]，0表示完全透明，1表示不透明。默认为0.9
      strokeOpacity: 0,
      //多边形填充颜色，使用16进制颜色代码赋值，如：#FFAA00
      fillColor: "#011543",
      //多边形填充透明度，取值范围[0,1]，0表示完全透明，1表示不透明。默认为0.9
      fillOpacity: 0.8,
      //轮廓线样式，实线:solid，虚线:dashed
      strokeStyle: "solid",
      /*勾勒形状轮廓的虚线和间隙的样式，此属性在strokeStyle 为dashed 时有效， 此属性在    
                  ie9+浏览器有效 取值： 
                  实线：[0,0,0] 
                  虚线：[10,10] ，[10,10] 表示10个像素的实线和10个像素的空白（如此反复）组成的虚线
                  点画线：[10,2,10]， [10,2,10] 表示10个像素的实线和2个像素的空白 + 10个像素的实 
                  线和10个像素的空白 （如此反复）组成的虚线*/
      strokeDasharray: [10, 2, 10],
    });
    polygon.setPath(pathArray);
    gaoDeMap.add(polygon);
    var geoJSON = require('@/assets/Json/geojson.json');

    var geojson = new AMap.GeoJSON({
      geoJSON: geoJSON,
      // 还可以自定义getMarker和getPolyline
      getPolygon: function (geojson, lnglats) {
        // 计算面积
        var area = AMap.GeometryUtil.ringArea(lnglats[0]);

        return new AMap.Polygon({
          path: lnglats,
          fillOpacity: 0.1, // 面积越大透明度越高
          strokeColor: "rgb(20,164,173)",
          fillColor: "#204066",
          strokeOpacity: 0.8, // 线透明度
          strokeWeight: 2, // 线宽
          strokeStyle: "solid", // 线样式
        });
      },
    });
    geojson.setMap(gaoDeMap);
  });
}

function initGaoDeMapData() {
  var markers = [];
  var arr = [103.831788, 30.048318];

  // 点标记显示内容，HTML要素字符串
  var markerContent =
    "" +
    '<div class="custom-content-marker">' +
    ' <div class="bg"><div class="content"><div class="one"><p></p><span></span></div></div></div>' + //光晕效果
    '<div class="line"></div>' +
    //'<div class="info" onclick="setCenter(' + arr[0] + ',' + arr[1] +')"  style="background-color:rgba(98,170,239,0.7);padding:5px;">' + retData.CollectionList.districts[i].name + ':' + retData.CollectionList.districts[i].Total + '</div>' +
    "</div>";
  let marker = new AMap.Marker({
    position: new AMap.LngLat(arr[0], arr[1]), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
    title: "名字", //arr[i].name,
    content: markerContent,
  });
  marker.on("mousemove", function (eventname, handler, context) {
    marker.setzIndex(1000);
  });
  marker.on("mouseout", function (eventname, handler, context) {
    marker.setzIndex(2);
  });

  marker.setLabel({
    offset: new AMap.Pixel(-160, -60), //设置文本标注偏移量
    content:
      '<div class="info1" onclick="setCenter(' +
      arr[0] +
      "," +
      arr[1] +
      ')" style="background-color:rgba(98,170,239,0.7);padding:5px;">' +
      "名字" +
      ":" +
      "数量" +
      "</div>", //设置文本标注内容
    direction: "right", //设置文本标注方位
  });
  markers.push(marker);
  gaoDeMap.add(markers);
}
function setCenter(arr, arr2) {
    gaoDeMap.setZoomAndCenter(12, [arr, arr2]);
}
</script>
<style lang="less" scoped>
#map{
    width: 100%;
    height: 100%;
}
/deep/.custom-content-marker {
 position: relative;
}

/deep/.line {
    position: absolute;
    top: -33px;
    left: 6px;
    width: 1px;
    height: 35px;
    background: #38a6f0;
}


/deep/.info1{
    width:110px;
    color:#fff;
    border-radius:5px;
    cursor: pointer;
    text-align:center;
}
/deep/.info1:hover{
    z-index:110001;
    background-color: orange !important;
    /*box-shadow: 0px 0px 1px 1px;*/
}

/deep/.amap-marker-label {
    background-color: inherit !important;
}

/deep/.bg .content div {
    background: #38a6f0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    position: relative;
    transform: scaleZ(15) rotateX(50deg);
}

/deep/.bg .content p {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    animation: myfirst 1.5s infinite;
    box-shadow: 0px 0px 3px #38a6f0;
    z-index: 10;
}

/deep/.bg .content span {
    position: absolute;
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    animation: myfirst 1.5s infinite;
    box-shadow: 0px 0px 3px #38a6f0;
    animation-delay: 0.5s;
    z-index: 10;
}

@keyframes myfirst {
    20% {
        transform: scale(1);
    }

    40% {
        transform: scale(1.5);
    }

    60% {
        transform: scale(2);
    }

    80% {
        transform: scale(2.5);
    }

    100% {
        transform: scale(3);
    }
}

/deep/.amap-marker-label {
    position: relative;
    border: initial !important;
    left: -56px !important;
}

</style>