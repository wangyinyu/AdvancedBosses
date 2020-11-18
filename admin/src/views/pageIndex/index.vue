<template>
  <div class="content">
    <v-gdMap></v-gdMap>
    <div class="BigDiv">
      <div class="header">眉山市住建领域信用信息管理系统</div>
      <div class="DivCon">
        <!-- 左边内容 -->
        <div class="w28 div_left">
          <div class="smallBj">
            <div class="xkLeft flex">
              企业总数<br/>
              200
            </div>
            <div class="xkRight flex">
              <v-NumList
                       ref='tjNum'
                      :sort='[2,2]'
                      :height='"49%"'
                      :configname='"项目审批\\施工许可\\数值统计"'
              ></v-NumList>
            </div>
          </div>
          <div class="smallBj"></div>
          <div class="smallBj"></div>
          <div id="HomeAreaScoreCompanyNumStatic" class="smallBj"></div>
        </div>
        <!--中间内容 -->
        <div class="w40 div_con">

        </div>
        <!-- 右边内容 -->
        <div class="w28 div_right">
          <div class="pmdk">
            <div style="width: 50%">
              <div style="width: 100%; height: 5%"><p>信用排名前十名</p></div>
              <div style="width: 100%; height: 8%">
                <span>排名类别：</span>
                <el-select
                  v-model="value"
                  placeholder="请选择"
                  class="selectClass"
                >
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </div>
              <div style="width: 100%; height: 87%">
                <v-tabList :tbobj="qtobj" ref="qtcs"></v-tabList>
              </div>
            </div>
            <div style="width: 50%">
              <v-tabList :tbobj="qtobj" ref="qtcs"></v-tabList>
            </div>
          </div>
          <div class="smallBj"></div>
          <div class="smallBj"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import gdMap from "@/views/compnonent/gdMap";
import tbList from "@/views/compnonent/tabList";
import NumList from "@/views/compnonent/NumList";
export default {
  name: "pageIndex",
  components: {
    "v-gdMap": gdMap,
    "v-tabList": tbList,
    "v-NumList":NumList
  },
  props: {},
  data() {
    return {
      options: [
        {
          value: "选项1",
          label: "黄金糕",
        },
        {
          value: "选项2",
          label: "双皮奶",
        },
        {
          value: "选项3",
          label: "蚵仔煎",
        },
        {
          value: "选项4",
          label: "龙须面",
        },
        {
          value: "选项5",
          label: "北京烤鸭",
        },
      ],
      value: "选项1",
      qtobj: {
        id: "qt",
        url: "/Service/ChartWebSvr.assx/StaticObject", //请求接口地址
        params: {
          configName: "WFQTCountSort",
          configParam: JSON.stringify({ SelectYear: Number("2020") }),
        }, //请求接口参数
        isScorll: false, //是否开启滚动动画
        columns: [
          {
            //key:表头名字,value：对应字段
            name: "序号",
            //backgroundColor: '#00BBE4'
          },
          {
            name: "标准编号", //列表名称
            field: "标准编号", //字段名称
            textAlgin: "center", //文字显示定位
            width: "50%", //宽度只能传百分比。所有列的宽度加起来只能等于90%。因为组件序号设置了固定宽度10%
            title: true, //是否显示title，并且自带超出显示省略号
            click: function (value) {
              //对应点击回调
              console.dir(value);
            },
          },
          {
            name: "条文号",
            field: "条文号",
          },
          {
            name: "次数",
            field: "次数",
          },
        ],
      },
    };
  },
  created() {},
  computed: {},
  methods: {},
  mounted() {
    this.$nextTick(() => {
       this.$refs.tjNum.getNumber();//获取统计数量
      var configParam = {
        CertTypeNum: escape("全部"),
      };
     this.pEChart({
        ChartOptions: {},
        renderTo: "HomeAreaScoreCompanyNumStatic",
        url:
          "http://192.0.0.24:9999/Service/ChartWebSvr.svrx/GenerateStatistics",
        queryParam: {
          configName: escape("Intranet\\全市本地外地企业数量占比"),
          configParam: JSON.stringify(configParam),
        },
      });
    });
  },
};
</script>

<style scoped lang="less">
//重置elmentUI默认选择框样式
/deep/.el-input__inner {
  background-color: transparent;
  color: #fff;
  border-color: #409EFF;
  height: 25px;
  line-height: 25px;
}
/deep/ .el-input__icon {
  line-height: 25px;
}
/deep/.el-select:hover .el-input__inner {
  border-color: #409EFF;
}
.selectClass {
  width: 100px;
}
</style>

