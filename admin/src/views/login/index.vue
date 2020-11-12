<template>
  <div class="al">
    <div id="HomeAreaScoreCompanyNumStatic"></div>
    <v-gdMap></v-gdMap>
  </div>
</template>
<script>
import $ from "jquery";
import "@/assets/js/pEcharts.js";
import gdMap from "@/views/compnonent/gdMap";
export default {
  name: "login",
 components: {
      'v-gdMap': gdMap
  },
  props: {},
  data() {
    return {};
  },
  created() {},
  computed: {},
    methods: {},
  mounted() {
    this.$nextTick(() => {
      var configParam = {
        CertTypeNum: escape("全部"),
      };
      var jhc = new $.pEChart({
        ChartOptions: {},
        renderTo: "HomeAreaScoreCompanyNumStatic",
        url:"http://192.0.0.24:9999/Service/ChartWebSvr.svrx/GenerateStatistics",
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
.al{
    width: 100%;
    height: 100%;
}
#HomeAreaScoreCompanyNumStatic {
  width: 400px;
  height: 300px;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 100000;
}
</style>
