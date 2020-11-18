<template>
  <div class="tbComponent" :id="tbobj.id">
    <div class="divhead">
      <div
        v-for="(item, index) of Obj"
        :key="index"
        :style="{ 'text-align': getAlgin(item), width: getwidth(item)}"
      >
        {{ item.name }}
      </div>
    </div>
    <ul>
      <li class="liBottom" v-for="(item, index) of Data" :key="index">
        <div
          v-for="(items, i) of Obj"
          :key="i"
          :style="{ 'text-align': getAlgin(items), width: getwidth(items) }"
          :class="{ divslh: items.title }"
          :title="items.title ? getfield(item, items, index) : ''"
          @click="items.click ? items.click(item) : ''"
        >
          <span
            :style="{
              'background-color': items.backgroundColor ? items.backgroundColor : '',
              padding: getpadding(index, item, items),
            }"
          >
            {{ getfield(item, items, index) }}</span
          >
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import $ from 'jquery';
export default {
  name: "tabList",
  components: {},
  data() {
    return {
      Obj: [],
      Data: [],
    };
  },
  props: {
    tbobj: Object,
  },
  watch: {
    tbobj: {
      handler(val) {
        if (val) this.Obj = val.columns;
      },
      immediate: true,
    },
  },
  methods: {
    //定义滚动动画
    scrollNews(obj) {
      var $self = obj.find("ul");
      var lineHeight = $self.find("li:first").height();
      $self.animate(
        {
          marginTop: -lineHeight + "px",
        },
        600,
        function () {
          $self
            .css({
              marginTop: 0,
            })
            .find("li:first")
            .appendTo($self);
        }
      );
    },
    loadtbData() {
      $.ajax({
        type: "GET",
        url: this.tbobj.url,
        dataType: "json",
        data: this.tbobj.params,
        error: function (e) {},
        success: function (data) {
          this.Data = JSON.parse(data);
        }.bind(this),
      });
    },
    getfield(item, items, index) {
      if (items.name == "序号") return index + 1;
      else return item[items.field];
    },
    getAlgin(item) {
      if (item.textAlgin) {
        return item.textAlgin;
      } else {
        return "center";
      }
    },
    getwidth(item) {
      let sum = 0;
      let reg = /\d+/g; //利用正则匹配获取数字
      let allNum = 0;

      this.Obj.forEach((element) => {
        if (element.width) {
          sum++;
          allNum += Number(element.width.match(reg)[0]);
        }
      });
      if (item.name == "序号") {
        return "10%";
      }
      if (item.width) {
        return item.width;
      } else if (sum !== 0) {
        return (90 - allNum) / (this.Obj.length - (sum + 1)) + "%";
      }
      return 90 / (this.Obj.length - 1) + "%";
    },
    getpadding(index, item, items) {
      let flag = this.Obj.some((item) => item.name == "序号");
      let name = this.getfield(item, items, index);
      if (!flag || name == item[items.field]) {
        return "0 0";
      } else {
        if (index < 9) return "0 9px";
        else return "0 5px";
      }
    },
  },
  mounted() {
    var that = this;
    if (this.tbobj.isScorll) {
      //滚动动画设置开始
      var $this = $("#" + this.tbobj.id);
      var scrollTimer;
      $this
        .hover(
          function () {
            clearInterval(scrollTimer);
          },
          function () {
            scrollTimer = setInterval(function () {
              that.scrollNews($this);
            }, 1000);
          }
        )
        .trigger("mouseleave");
    }
  },
};
</script>
<style lang="less" scoped>
//列表组件样式设置

.tbComponent {
  width: 100%;
  height: 100%;
overflow: hidden;
    ul {
        width: 100%;

        li {
            width  : 100%;
            display: flex;
            padding: 1% 0;

            div {
                text-align: center;

                span {
                    padding: 1px 5px;
                }
            }
        }
    }
}

.divhead {
    width           : 100%;
    display         : flex;
    padding         : 0px;
    position        : relative;
    z-index         : 10;
}

.liBottom {
    border-bottom: 1px solid #043066;
}

.divslh {
    overflow     : hidden;
    text-overflow: ellipsis;
    white-space  : nowrap;
    cursor       : pointer;
}
</style>