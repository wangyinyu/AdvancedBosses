<template>
  <div class="leftTop" style="width: 100%; height: 100%">
    <div
      v-for="(item, index) of numarr"
      :key="index"
      class="flex flexbw"
      :style="{ width: '100%', height: height, padding: '1% 0' }"
    >
      <div
        v-for="(items, i) of item.VisiableName"
        :key="i"
        class="flex flexbw"
        style="height: 100%; width: 100%; padding: 0 1%"
      >
        <div class="flex numberDefaut NumLeft">
          {{ items }}
        </div>
        <div
          class="flex numberDefaut NumRight"
          style="width: 40%; height: 100%; color: #2A9EF5"
        >
          {{ item.Data[i] }}
          <span
            style="color: #fff !important; font-size: 1.5rem; margin-left: 5%"
            >{{ item.Unit[i] }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
export default {
    name:'NumList',
  components: {},
  data() {
    return {
      numarr: [],
    };
  },
  props: {
    height: "",
    sort: Array,
    configname: "",
  },
  watch: {},
  methods: {
    getNumber(year) {
      //获取名字数量和单位
      $.ajax({
        type: "GET",
        url: "192.0.0.14:16957/Service/ChartWebSvr.assx/GenerateStatistics",
        dataType: "json",
        data: {
          configName: escape(this.configname),
          configParam: JSON.stringify({
            SelectYear: '2020', //获取输入框年份
          }),
        },
        error: function (e) 
        {
           this.$message.error(JSON.stringify(e.status));
        }.bind(this),
        success: function (data) {
          if (data.error_respone) {
            var msg = data.error_respone.Msg;
            if (
              typeof msg != "undefined" &&
              msg != null &&
              (msg.indexOf("未登陆") > -1 || msg.indexOf("未登录") > -1)
            ) {
            //   $.psEnv.doReLogin($.psEnv.doLoginSuccess);
              return;
            } else {
              this.$message.error(msg);
            }
            return false;
          }
          var Data = data.TxtContent.StaticColumnList._Items;
          var sort = this.sort;
          var namearr = [];
          let newData = Data.concat([]);
          for (let i = 0; i < sort.length; i++) {
            //统计数据对应数据结构
            namearr.push({
              VisiableName: [],
              Data: [],
              Unit: [],
              Name: [],
            });
            for (let j = 0; j < sort[i]; j++) {
              namearr[i].VisiableName.push(newData[j].VisiableName);
              namearr[i].Data.push(newData[j].Data);
              namearr[i].Unit.push(newData[j].Unit);
              namearr[i].Name.push(newData[j].Name);
            }
            newData.splice(0, sort[i]);
          }
          var newArr = namearr.filter((item, index, arr) => {
            if (
              typeof arr[index + 1] != "undefined" &&
              item.Name[0] == arr[index + 1].Name[0]
            ) {
              item.VisiableName[0] =
                item.VisiableName[0] + "/" + arr[index + 1].VisiableName[0];
              item.Data[0] = item.Data[0] + "/" + arr[index + 1].Data[0];
            } else if (
              typeof arr[index - 1] != "undefined" &&
              item.Name[0] == arr[index - 1].Name[0]
            ) {
              return false;
            }
            return item;
          });
          this.numarr = newArr;
        }.bind(this),
      });
    },
  },
  computed: {},
  created() {},
  mounted() {},
};
</script>
<style lang="less" scoped>
</style>