//相关工具方法,及jquery增强
import jQuery from 'jquery';
import $ from "jquery";
import "@/assets/js/jquery.cookie.js";
function Jump(url) {
    document.location.href = url;
}
(function (window, $, undefined) {
    $.fn.pgrid = function (opt) {
        var me = this,
            gd = null,
            columns = null,
            total = 0,
            currentPage = 1,
            datacount = 0,
            remoteData = null,
            CurrentPageIndex = 1;

        CurrentPageIndex = opt.pageNumber || 1;

        $(window).resize(function () {
            gd.datagrid('resize', {
                height: getHeight()
            });
            var $box = $(gd).prev().find('.datagrid-body');
            var h = $box.height();
            $box.height(h - 10);
        });

        //渲染自定义的分页控件
        function renderPager(el, opt, numbers) {
            el = $(el);

            var box = el.parents('.datagrid');
            if (box.next('.pager-box').length == 0) {
                box.after('<div class="pager-box"><div class="pager"></div></div>');
            }

            box.next('.pager-box').find('.pager').pager(total, {
                items_per_page: opt.pageSize,
                num_display_entries: 5,
                num_edge_entries: 1,
                next_text: ' ',
                prev_text: ' ',
                count: numbers,
                current_page: currentPage - 1,
                callback: function (page_index, jq, firstload) {
                    if (firstload) {
                        return;
                    }
                    try {
                        if (!isClickQuery) {
                            isClickQuery = true;
                        }

                    } catch (e) {
                    }
                    var _totalPages = Math.ceil(total / opt.pageSize);
                    if (page_index < _totalPages) {
                        currentPage = page_index + 1;
                        SetPageIndex({ PageIndex: currentPage });
                        renderGrid(currentPage);
                    }
                }
            });
        }

        //计算grid的高度
        function getHeight() {
            var fullHeight = $(window).outerHeight(),
                buildHeight = function () { },
                haspager = $(me).parents('.datagrid').next('.pager-box').length > 0;
            //外网高度计算
            var getHeight1 = function () {
                return fullHeight
                    - $('.container-top').outerHeight() //减去顶部
                    - $('.container-bottom').outerHeight() //减去底部
                    - $('.container-middle > .toolbar').outerHeight() //减去工具栏
                    - (opt.pagination ? 43 : 0)

                //return fullHeight - 155 - 37 - 45;
            }

            //内网高度计算
            var getHeight2 = function () {
                return fullHeight - $('.Search-tools').outerHeight() - (opt.pagination ? 48 : 0);
            }

            //内网高度计算
            var getHeight3 = function () {
                return $('#tabContent').height() - $('.Search-tools').outerHeight() - (opt.pagination ? 48 : 0) - 40;
            }

            if (typeof (getContentHeight) !== typeof (undefined)) {
                buildHeight = getContentHeight; //如果自定义了高度计算函数则使用自定义的函数
            } else if ($('.layout-websitew').length > 0) {
                buildHeight = getHeight1; //使用外网高度计算函数
            } else if ($('#tabContent').length > 0) {
                buildHeight = getHeight3; //使用外网高度计算函数
            } else {
                buildHeight = getHeight2; //使用内网高度计算函数
            }

            return buildHeight();
        }

        function renderGrid(pageindex) {
            currentPage = pageindex;
            return $(me).datagrid($.extend({}, opt, {
                height: getHeight(),
                pagination: false,
                fit: false
            }));
        }

        opt = $.extend(true, {
            extend: true,
            fitColumns: true,
            method: "post",
            pageSize: 10,
            nowrap: false,
            rownumbers: true,
            singleSelect: true,
            pagination: true,
            loadMsg: null,
            loader: function (param, success, error) {
                if (typeof (opt.url) != "undefined") {
                    var hasMask = true;

                    if (typeof (opt.mask) != typeof (undefined)) {
                        hasMask = false;
                    }
                    $.get(opt.url, $.extend({}, param, {
                        pageIndex: currentPage || 1,
                        pageSize: opt.pageSize || 10
                    }), success);
                }
            },
            loadFilter: function (data) {
                if (!data) {
                    return { total: 0, rows: [] };
                }

                if (typeof (data) === 'string') {
                    data = JSON.parse(data);
                }

                if (data.Data) {
                    data = data.Data;
                }

                var result = {};

                if (data._Items) {
                    total = data.TotalCount;
                    result = {
                        total: data.TotalCount,
                        rows: data._Items
                    };
                } else {
                    total = data.TotalCount;
                    result = {
                        total: data.length,
                        rows: data
                    };
                }

                remoteData = data;

                datacount = result.rows.length;

                return result;
            },
            view: $.fn.datagrid.defaults.view
        }, opt);


        $.extend(true, $.fn.datagrid.defaults.view, {
            onAfterRender: function () {
                me.find('.datagrid-view').next().empty();

                //绑定操作列的事件
                var btns = me.parents('.datagrid').find('a[method]');
                btns.unbind('click');

                btns.bind('click', function (e) {
                    var method = $(this).attr('method'),
                        index = parseInt($(this).data('rowindex')),
                        rows = gd.datagrid('getRows');

                    var func = window;
                    $.each(method.split('.'), function (i, name) {
                        func = func[name];
                    });

                    if (typeof (func) !== typeof (undefined) && $.isFunction(func)) {
                        $.proxy(func, this)(rows[index], gd, e);
                    }
                });

                if (opt.pagination !== false) {
                    var numbers = 0;
                    if (opt.groupField && this.groups) {
                        numbers = this.groups.length;
                    } else {
                        numbers = datacount;
                    }

                    renderPager(me, opt, numbers);
                }
            }
        });
        gd = renderGrid(CurrentPageIndex);

        /**
         * 获取服务端返回的原始数据
         * @returns {} 
         */
        gd.getData = function () {
            return remoteData;
        }

        if (gd) {
            if (opt.pagination) {
                renderPager(me, opt, datacount);
            }
        }

        return gd;
    }

    //预定义列
    $.fn.pgrid.cols = {};
    $.fn.pgrid.cols.actionformater = function (value, row, index) {
        if (row.ActionList) {
            var actions = [];
            $.each(row.ActionList._Items, function (i, o) {
                var style = '';
                if (o.Color && o.Color != 'blue') {
                    style = 'style="color:' + o.Color + '"';
                }

                if (o.OperateType === 'js') {
                    actions.push('<a class="btn-operate" href="javascript:;" method="' + o.Action + '" data-rowindex="' + index + '" ' + style + '>' + o.Name + '</a>');
                } else {
                    for (var property in row) {
                        if (row.hasOwnProperty(property)) {
                            o.Action = o.Action.replace('{' + property + '}', escape(row[property]));
                        }
                    }

                    o.Action += '&time=' + Date.parse(new Date());

                    actions.push('<a class="btn-operate" href="javascript:p.jmp(\'' + o.Action + '\');" ' + style + ' >' + o.Name + '</a>');
                }
            });

            return actions.join(' ');
        }
        else {
            return '';
        }
    };

    $.fn.pgrid.cols.actionformaterCols = function (value, row, index) {
        if (row.ActionList) {
            var actions = [];
            $.each(row.ActionList._Items, function (i, o) {
                var style = '';
                if (o.Color && o.Color != 'blue') {
                    style = 'style="color:' + o.Color + '"';
                }

                if (o.OperateType === 'js') {
                    actions.push('<a class="btn-operate" href="javascript:;" method="' + o.Action + '" data-rowindex="' + index + '" ' + style + '>' + o.Name + '</a>');
                } else {
                    for (var property in row) {
                        if (row.hasOwnProperty(property)) {
                            o.Action = o.Action.replace('{' + property + '}', escape(row[property]));
                        }
                    }

                    o.Action += '&time=' + Date.parse(new Date());

                    actions.push('<a class="btn-operate" href="' + o.Action + '" ' + style + ' >' + o.Name + '</a>');
                }
            });
            if (actions.length > 3) {
                var view = '';
                $.each(actions, function (_i, _e) {
                    if (_i % 2 == 1) {
                        view = view + ' ' + _e + '<br>';
                    } else {
                        view = view + ' ' + _e;
                    }
                });
                var _html = '<div style="line-height:22px;">' + view + '</div>';
                return _html;
            } else {
                return actions.join(' ');
            }
        }
        else {
            return '';
        }
    };

    $.fn.pgrid.cols.action = {
        field: 'ActionList',
        title: '操作',
        align: 'center',
        width: 100,
        formatter: $.fn.pgrid.cols.actionformater
    };

    //扩展pgrid开始

    $.fn.pgridEx = function (opt) {
        var me = this,
            gd = null,
            columns = null,
            total = 0,
            currentPage = 1,
            datacount = 0,
            remoteData = null;

        opt = $.extend(true, {
            data: [],
            extend: true,
            fitColumns: true,
            method: "post",
            pageSize: 10,
            nowrap: false,
            rownumbers: true,
            singleSelect: true,
            pagination: true,
            loadMsg: null,
            view: $.fn.datagrid.defaults.view
        }, opt);

        $.extend(true, $.fn.datagrid.defaults.view, {
            onAfterRender: function () {
                me.find('.datagrid-view').next().empty();

                //绑定操作列的事件
                var btns = me.parents('.datagrid').find('a[method]');
                btns.unbind('click');

                btns.bind('click', function (e) {
                    var method = $(this).attr('method');
                    var rows = {
                        Guid: $(this).attr('dataGuid')
                    };

                    var func = window;
                    $.each(method.split('.'), function (i, name) {
                        func = func[name];
                    });

                    if (typeof (func) !== typeof (undefined) && $.isFunction(func)) {
                        $.proxy(func, this)(rows, null, e);
                    }
                });
            }
        });

        function getHeightEx() {
            return 200;
        }

        gd = $(me).datagrid($.extend({}, opt, {
            pagination: false,
            fit: false
        }));

        return gd;
    }

    //预定义列
    $.fn.pgridEx.cols = {};
    $.fn.pgridEx.cols.actionformater = function (value, row, index) {
        if (row.ActionList) {
            var actions = [];
            $.each(row.ActionList._Items, function (i, o) {
                var style = '';
                if (o.Color && o.Color != 'blue') {
                    style = 'style="color:' + o.Color + '"';
                }

                if (o.OperateType === 'js') {
                    actions.push('<a class="btn-operate" href="javascript:;" method="' + o.Action + '" datarowindex="' + index + '" ' + '" dataGuid="' + row.Guid + '" ' + style + '>' + o.Name + '</a>');
                } else {
                    for (var property in row) {
                        if (row.hasOwnProperty(property)) {
                            o.Action = o.Action.replace('{' + property + '}', escape(row[property]));
                        }
                    }

                    o.Action += '&time=' + Date.parse(new Date());

                    actions.push('<a class="btn-operate" href="javascript:p.jmp(\'' + o.Action + '\');" ' + style + ' >' + o.Name + '</a>');
                }
            });

            return actions.join(' ');
        }
        else {
            return '';
        }
    };

    $.fn.pgridEx.cols.actionformaterCols = function (value, row, index) {
        if (row.ActionList) {
            var actions = [];
            $.each(row.ActionList._Items, function (i, o) {
                var style = '';
                if (o.Color && o.Color != 'blue') {
                    style = 'style="color:' + o.Color + '"';
                }

                if (o.OperateType === 'js') {
                    actions.push('<a class="btn-operate" href="javascript:;" method="' + o.Action + '" datarowindex="' + index + '" ' + '" dataGuid="' + row.Guid + '" ' + style + '>' + o.Name + '</a>');
                } else {
                    for (var property in row) {
                        if (row.hasOwnProperty(property)) {
                            o.Action = o.Action.replace('{' + property + '}', escape(row[property]));
                        }
                    }

                    o.Action += '&time=' + Date.parse(new Date());

                    actions.push('<a class="btn-operate" href="' + o.Action + '" ' + style + ' >' + o.Name + '</a>');
                }
            });
            if (actions.length > 3) {
                var view = '';
                $.each(actions, function (_i, _e) {
                    if (_i % 2 == 1) {
                        view = view + ' ' + _e + '<br>';
                    } else {
                        view = view + ' ' + _e;
                    }
                });
                var _html = '<div style="line-height:22px;">' + view + '</div>';
                return _html;
            } else {
                return actions.join(' ');
            }
        }
        else {
            return '';
        }
    };

    $.fn.pgridEx.cols.action = {
        field: 'ActionList',
        title: '操作',
        align: 'center',
        width: 100,
        formatter: $.fn.pgridEx.cols.actionformater
    };

    //扩展pgrid结束

    //tree grid
    $.fn.ptreegrid = function (opt) {
        var me = this,
            gd = null,
            columns = null,
            total = 0,
            currentPage = 1,
            datacount = 0,
            idField = 'Id',
            treeField = 'Index',
            CurrentPageIndex = 1,
            rowStyler = function (row) {
                if (row.isGroupFirst) {
                    return 'background-color:#E9F3F9;font-weight:600';
                }
            };
        CurrentPageIndex = opt.pageNumber || 1;

        $(window).resize(function () {
            gd.treegrid('resize', {
                height: getHeight()
            });
        });

        //渲染自定义的分页控件
        function renderPager(el, opt, numbers) {
            el = $(el);
            var box = el.parents('.datagrid');
            if (box.next('.pager-box').length == 0) {
                box.after('<div class="pager-box"><div class="pager"></div></div>');
            }

            box.next('.pager-box').find('.pager').pager(total, {
                items_per_page: opt.pageSize,
                num_display_entries: 5,
                num_edge_entries: 1,
                next_text: ' ',
                prev_text: ' ',
                count: numbers,
                current_page: currentPage - 1,
                callback: function (page_index, jq, firstload) {
                    if (firstload) {
                        return;
                    }

                    var _totalPages = Math.ceil(total / opt.pageSize);
                    if (page_index < _totalPages) {
                        currentPage = page_index + 1;
                        SetPageIndex({ PageIndex: currentPage });
                        renderGrid(currentPage);
                    }
                }
            });
        }

        //计算grid的高度
        function getHeight() {
            var fullHeight = $(window).outerHeight(),
                buildHeight = function () { },
                haspager = $(me).parents('.datagrid').next('.pager-box').length > 0;

            //外网高度计算
            var getHeight1 = function () {
                return fullHeight
                    - $('.container-top').outerHeight() //减去顶部
                    - $('.container-bottom').outerHeight() //减去底部
                    - $('.container-middle > .toolbar').outerHeight() //减去工具栏
                    - (opt.pagination ? 43 : 0)

                //return fullHeight - 155 - 37 - 45;
            }

            //内网高度计算
            var getHeight2 = function () {
                return fullHeight - $('.Search-tools').outerHeight() - (opt.pagination ? 48 : 0);
            }

            //内网高度计算
            var getHeight3 = function () {
                return $('#tabContent').height() - $('.Search-tools').outerHeight() - (opt.pagination ? 48 : 0) - 40;
            }

            if (typeof (getContentHeight) !== typeof (undefined)) {
                buildHeight = getContentHeight; //如果自定义了高度计算函数则使用自定义的函数
            }
            else if ($('.layout-websitew').length > 0) {
                buildHeight = getHeight1; //使用外网高度计算函数
            }
            else if ($('#tabContent').length > 0) {
                buildHeight = getHeight3; //使用外网高度计算函数
            }
            else {
                buildHeight = getHeight2; //使用内网高度计算函数
            }

            return buildHeight();
        }

        function renderGrid(pageindex) {
            currentPage = pageindex;
            return $(me).treegrid($.extend({}, opt, {
                height: getHeight(),
                pagination: false,
                fit: false
            }));
        }

        opt = $.extend(true, {
            extend: true,
            fitColumns: true,
            method: "post",
            pageSize: 10,
            nowrap: false,
            rownumbers: true,
            singleSelect: true,
            pagination: true,
            loadMsg: null,
            rowStyler: opt.rowStyler ? opt.rowStyler : rowStyler,
            idField: opt.idField ? opt.idField : idField,
            treeField: opt.treeField ? opt.treeField : treeField,
            loader: function (param, success, error) {
                if (typeof (opt.url) != "undefined") {
                    $.get(opt.url, {
                        data: $.extend({}, param, {
                            pageIndex: currentPage || 1,
                            pageSize: opt.pageSize || 10
                        }),
                        success: success,
                        error: error,
                        mask: true,
                        maskmsg: null
                    });
                }
            },
            loadFilter: function (data) {
                if (!data) {
                    return { total: 0, rows: [] };
                }

                if (typeof (data) === 'string') {
                    data = JSON.parse(data);
                }

                if (data.length > 0) {
                    total = data[0].TotalCount;
                    data = {
                        total: total,
                        rows: data
                    };
                }
                else {
                    total = data.length;
                    data = {
                        total: total,
                        rows: data
                    };
                }

                datacount = data.rows.length;

                return data;
            },
            view: $.fn.treegrid.defaults.view,
            onBeforeLoad: function (row, param) {
                //如果row==null表示不是节点展开
                return row === null;
            }
        }, opt);

        $.extend(true, $.fn.treegrid.defaults.view, {
            onAfterRender: function () {
                $(".tree-icon").remove();
                $(".tree-indent").remove();
                $(".tree-collapsed").addClass("tree-collapsed-align");
                $(".tree-title").addClass("tree-collapsed-align");

                var numdiv = me.parents('.datagrid').find('.datagrid-row').find('td:first').find('div');

                $.each(numdiv, function () {
                    var item = $(this);
                    item.addClass('grid-numdiv');
                    if (item.parents('.treegrid-tr-tree').length === 0
                        && item.find('.tree-expanded').length === 0
                        && item.find('.tree-collapsed').length === 0) {
                        item.prepend('<span class="tree-hit tree-expanded"></span>');
                    }
                });

                //绑定操作列的事件
                var btns = me.parents('.datagrid').find('a[method]');
                btns.unbind('click');

                btns.bind('click', function (e) {
                    var method = $(this).attr('method'),
                        parentIndex = parseInt($(this).attr('parentIndex')),
                        childrentIndex = parseInt($(this).attr('childrenIndex')),
                        btnId = $(this).attr('btnId');

                    var func = window;
                    $.each(method.split('.'), function (i, name) {
                        func = func[name];
                    });

                    if (typeof (func) !== typeof (undefined) && $.isFunction(func)) {
                        if (btnId) {
                            var row = gd.treegrid('find', btnId);
                            $.proxy(func, this)(row, gd, e);
                        } else {
                            var rows = gd.treegrid('getData');
                            $.proxy(func, this)(rows[parentIndex].children[childrentIndex], gd, e);
                        }
                    }
                });
                if (opt.pagination !== false) {
                    var numbers = 0;
                    if (opt.groupField && this.groups) {
                        numbers = this.rows.length;
                    }
                    else {
                        numbers = datacount;
                    }

                    renderPager(me, opt, numbers);
                }
            }
        });

        gd = renderGrid(CurrentPageIndex);


        return gd;
    }

    $.fn.ptreegrid.cols = {};
    $.fn.ptreegrid.cols.field = function (obj) {
        return {
            field: obj.field,
            title: obj.title,
            align: obj.align,
            width: obj.width,
            formatter: obj.cell || obj.formatter,//最好不要乱改别人的定义名
            styler: obj.styler
        };
    }

    //预定义流程操作按钮列(注：此方式只支持两层树结构)
    $.fn.ptreegrid.cols.defaultWorkflowformater = function (value, row, index) {
        if (row.ActionList) {
            var actions = [];
            $.each(row.ActionList, function (i, o) {
                var style = '';
                if (o.Color && o.Color != 'blue') {
                    style = 'style="color:' + o.Color + '"';
                }

                if (o.OperateType === 'js') {
                    if (row.IdFalg) {
                        actions.push('<a class="btn-operate" btnId="' + row.IdFalg + '" href="javascript:;" method="' + o.Action + '" parentIndex="' + row.ParentInex + '" childrenIndex="' + (parseInt(row.Index) - 1) + '" ' + style + '>' + o.Name + '</a>');
                    } else {
                        actions.push('<a class="btn-operate" href="javascript:;" method="' + o.Action + '" parentIndex="' + row.ParentInex + '" childrenIndex="' + (parseInt(row.Index) - 1) + '" ' + style + '>' + o.Name + '</a>');
                    }

                } else {
                    for (var property in row) {
                        if (row.hasOwnProperty(property)) {
                            o.Action = o.Action.replace('{' + property + '}', escape(row[property]));
                        }
                    }

                    o.Action += '&time=' + Date.parse(new Date());

                    actions.push('<a class="btn-operate" href="' + o.Action + '" ' + style + ' >' + o.Name + '</a>');
                }
            });
            if (actions.length > 3) {
                var view = '';
                $.each(actions, function (_i, _e) {
                    if (_i % 2 == 1) {
                        view = view + ' ' + _e + '<br>';
                    } else {
                        view = view + ' ' + _e;
                    }
                });
                var _html = '<div style="line-height:22px;">' + view + '</div>';
                return _html;
            } else {
                return actions.join(' ');
            }
        }
        else {
            return '';
        }
    }

    /**
    *  附件表格
    *  @opt         :配置参数
    *       title   :表头的标题文字
    *       mode    :列的模式，默认模式为$.fn.affixgrid.fields.view，可以通过重写$.fn.affixgrid.fields字面量中的某一个属性，来达到修改列顺序、
    *                列宽、列标题、显示或隐藏某些列的目的。
    *       unique  :分类模版唯一标识符，unique和objectid同时只能填写一个值，如果填写多个值以unique的值为准
    *       objectid:申请表数据标识
    *       uploader:object  该参数用来设置p.uploader的opt。
    */
    $.fn.affixgrid = function (opt) {
        var url = null,
            me = this,
            srcEl = $(me).clone(),
            columns = [],
            gd = null,
            gridbox = null,
            srcdata = null,
            hiderows = null;

        opt = $.extend({
            mode: $.fn.affixgrid.fields.view
        }, opt);

        if (null == opt.data) {
            return;
        }

        if (opt.title !== false && !opt.title) {
            opt.title = '相关材料';
        }

        srcdata = $.extend(true, {}, opt.data); //将最原始的数据保存起来备用
        columns.push({
            title: '序号',
            field: 'rownumber',
            align: 'center',
            width: 51
        });

        for (var name in opt.mode) {
            if (!opt.mode.hasOwnProperty(name)) {
                continue;
            }

            var current = opt.mode[name];

            switch (name) {
                case 'MaterialInfo_Name':
                    columns.push({
                        width: current.width,
                        field: 'MaterialInfo',
                        align: current.align,
                        title: current.title || '文件或证明材料',
                        formatter: (function (current) {
                            return function (value, row, index) {
                                var result = '',
                                    icon = '<span style="color:red;font-size:20px;vertical-align:middle;font-weight:bold;">*</span>';
                                if (opt.mode.additional) {
                                    if (row.Must) {
                                        result += icon;
                                    }
                                }
                                else if (current.edit && (row.IsRequired || row.Must)) {
                                    result += icon;
                                }

                                return result + value.Name;
                            }
                        }(current))
                    });
                    break;

                case 'DocumentNumber':

                    if (current.visible) {

                        columns.push({
                            width: current.width,
                            field: 'DocumentNumber',
                            align: current.align,
                            title: current.title || '材料编号',
                            formatter: (function (current) {
                                return function (value, row, index) {
                                    if (!value) {
                                        value = '';
                                    }
                                    if (current.edit) {
                                        if ((opt.mode.additional && row.Must) || !opt.mode.additional) {
                                            var required = '';
                                            if (row.IsRequired && row.IsRequiredNumber) {
                                                required = ' data-options="required:true" ';
                                            }

                                            return '<input type="text" value="' + value + '" class="easyui-textbox DocumentNumber"' + required + ' />';
                                        }
                                    }

                                    return '<span>' + value + '</span>';
                                }
                            }(current))
                        });
                    }
                    break;

                case 'Upload':
                    if (current.visible) {
                        columns.push({
                            width: current.width,
                            field: 'Upload',
                            align: current.align,
                            title: current.title || '上传文件',
                            formatter: (function (current) {
                                return function (value, row, index) {
                                    if ((opt.mode.additional && row.Must) || !opt.mode.additional) {
                                        return '<div data-index="' + index + '" class="upload-btn' + ((row.IsRequired || row.Must) ? ' upload-btn-must' : '') + '" data-extensions="' + (row.extensions ? row.extensions : "") + '">&nbsp;</div>';
                                    }

                                    return '';
                                }
                            }(current))
                        });
                    }
                    break;

                case 'Materials':
                    if (current.visible) {
                        columns.push({
                            width: current.width,
                            field: 'Materials',
                            align: current.align,
                            title: current.title || '附件列表',
                            formatter: (function (current) {
                                return function (value, row, index) {
                                    var result = null;
                                    if (row.Materials && row.Materials._Items && row.Materials._Items.length > 0) {

                                        result = [];
                                        $.each(row.Materials._Items, function (i, o) {
                                            var html = '<li data-id="' + o.MD5 + '" class="affix-item">';
                                            if (!o.IsUrl) {
                                                html += '<a href="' + env.current + '/down.aspx?id=' + o.MD5 + '" class="btn-download" title="下载文件"></a>';
                                            }
                                            html += '<a data-id="' + o.MD5 + '" class="view-file-btn" href="' + env.current + '/view.aspx?id=' + o.MD5 + '&meteral=' + row.MaterialGuid + '&dataid=' + (row.DataGuid || '') + '" target="_blank"><span class="affixname" ' + (o.IsUrl ? 'style="margin-left:0px;"' : '') + '>' + (o.FriendlyFileName || '暂无') + '</span></a><span class="affix-size">(' + (o.FileSize / 1024 / 1024).toFixed(2) + 'MB)</span> ';
                                            if (current.edit && o.IsOwner) {
                                                if ((opt.mode.additional && row.Must) || !opt.mode.additional) {
                                                    html += ' <a class="lbtn btn-ajax-delete" data-id="' + o.MD5 + '" data-mid="' + row.Guid + '" href="javascript:;"></a>';
                                                }
                                            }
                                            html += '</li>';

                                            result.push(html);
                                        });

                                        result = result.join('');
                                    }
                                    else {
                                        result = '<span class="empty">暂无附件</span>';
                                    }

                                    return result;
                                }
                            }(current))
                        });
                    }
                    break;

                case 'RecMaterial_Result':
                    if (current.visible) {
                        columns.push({
                            width: current.width,
                            field: 'RecMaterial',
                            align: current.align,
                            title: current.title || '审查',
                            formatter: (function (current) {
                                return function (value, row, index) {
                                    if (current.edit && row.Materials && row.Materials._Items && row.Materials._Items.length > 0) {
                                        if (opt.mode.modename == 'accept') {
                                            if ((opt.mode.additional && row.Must) || !opt.mode.additional) {
                                                return '应收（' + row.PayCount + '）份，实收（<input type="text" class="Result Paycount" value="' + (value.Result || '') + '" style="width:30px;" />）份';
                                            }

                                            return '应收（' + row.PayCount + '）份，实收（' + (value.Result || '') + '）份';
                                        }
                                        else if (opt.mode.modename == 'audit') {
                                            return '<label><input type="checkbox" name="result-yes-' + index + '" value="符合" data-index="' + index + '" data-id="' + row.Guid + '" ' + (value.Result == '符合' ? ' checked' : '') + ' />符合</label> <label style="color:red;"><input type="checkbox" name="result-no-' + index + '" value="不符合" data-index="' + index + '" data-id="' + row.Guid + '" ' + (value.Result == '不符合' ? ' checked' : '') + ' />不符合</label>';
                                        }
                                    }

                                    return '';
                                }
                            }(current))
                        });
                    }
                    break;

                case 'RecMaterial_Content':
                    if (current.visible) {
                        columns.push({
                            width: current.width,
                            field: 'RecMaterial_Content',
                            align: current.align,
                            title: current.title || '整改内容',
                            formatter: (function (current) {
                                return function (value, row, index) {
                                    if (row.Materials && row.Materials._Items && row.Materials._Items.length > 0) {
                                        var content = '';
                                        if (row.RecMaterial && row.RecMaterial.Content) {
                                            content = row.RecMaterial.Content;
                                        }

                                        return '<textarea class="Content" style="width:90%;">' + content + '</textarea>';
                                    }

                                    return '';
                                }
                            }(current))
                        });
                    }
                    break;

                case 'Correction':
                    if (current.visible) {
                        columns.push({
                            width: current.width,
                            field: 'RecMaterial',
                            align: current.align,
                            title: current.title || '整改意见',
                            formatter: (function (current) {
                                return function (value, row, index) {
                                    if (value) {
                                        return p.toview(value.Content);
                                    }

                                    return '';
                                }
                            }(current))
                        });
                    }
                    break;
            }
        }
        if ($(me).parent('.affixgrid-box').length == 0) {
            $(me).wrap('<div class="affixgrid-box"></div>');
            if (opt.title !== false) {
                $(me).before('<div class="affixgrid-title"><b>' + opt.title + '</b></div>');
            }
        }


        gridbox = $(me).parent('.affixgrid-box');
        gd = $(me).datagrid({
            data: opt.data._Items,
            queryParams: {
                unique: opt.unique,
                objectid: opt.objectid,
                pageIndex: 0,
                pageSize: -1,
                orderBy: '',
                opt: 0
            },
            striped: false,
            autoRowHeight: true,
            rownumbers: false,
            nowrap: false,
            singleSelect: false,
            checkOnSelect: false,
            selectOnCheck: false,
            loadMsg: null,
            columns: [columns],
            view: $.extend($.fn.datagrid.defaults.view, {
                onAfterRender: function () {
                    var box = $(me).parents('.datagrid'),
                        getRow = function (index) {
                            index = parseInt(index);

                            var row = $(me).datagrid('getRows')[index];

                            if (row) {
                                row.Materials._Items = row.Materials._Items || [];
                            }

                            return row;
                        },
                        fixHeight = function () {
                            $(me).datagrid('fixRowHeight');
                        },
                        getCell = function (index, field) {
                            var td = box.find('tr[datagrid-row-index="' + index + '"]')
                                .find('td[field="' + field + '"]')
                                .find('.datagrid-cell');

                            return td;
                        };

                    //初始化附件编号
                    box.find('.DocumentNumber').textbox();

                    //文件删除按钮事件绑定
                    gridbox.find('.btn-ajax-delete').unbind('click');
                    gridbox.find('.btn-ajax-delete').bind('click', function () {
                        var $me = $(this);
                        $.messager.confirm('提示信息', '确定删除吗？', function (r) {
                            if (r) {
                                var guid = $me.data('id'),
                                    mid = $me.data('mid'),
                                    rows = gd.datagrid('getRows');

                                $.each(gd.datagrid('getRows'), function (i, o) {
                                    if (o.Materials._Items) {
                                        o.Materials._Items = $.map(o.Materials._Items, function (o1) {
                                            if (o1.MD5 == guid && o.Guid == mid) {
                                                return null;
                                            }
                                            return o1;
                                        });
                                    }
                                });

                                if ($me.parents('.datagrid-cell').find('li').length <= 1) {
                                    $me.parents('.datagrid-cell').html('<span class="empty">暂无附件</span>');
                                }
                                $me.parents('li').remove();
                                fixHeight();
                            }
                        });
                    });

                    //审核按钮事件绑定
                    gridbox.find('.btn-audit').unbind('click');
                    gridbox.find('.btn-audit').click(function () {
                        var _this = $(this),
                            dataid = _this.data('id'),
                            index = _this.data('index'),
                            r = getRow(index),
                            cell = getCell(index, 'RecMaterial');

                        r.RecMaterial.Content = _this.data('val');
                        if (r.RecMaterial.Content === '符合') {
                            cell.html('<span class="status-ok Content">' + r.RecMaterial.Content + '</span>');
                        } else {
                            cell.html('<span class="status-failed Content">' + r.RecMaterial.Content + '</span>');
                        }
                    });

                    //文件上传按钮事件绑定
                    $.each(box.find('.upload-btn'), function (i, o) {
                        var index = $(o).data('index');
                        var extensions = $(o).data("extensions");
                        var upOpt = $.extend({}, {
                            picker: o,
                            data: index,
                            filesQueued: function (uploader, files, index) {
                                var r = getRow(index),
                                    cell = getCell(index, 'Materials'),
                                    result = [],
                                    getFile = function (id) {
                                        var result = null;
                                        $.each(files, function (i, o) {
                                            if (o.id == id) {
                                                result = o;
                                                return false;
                                            }
                                        });

                                        return result;
                                    };

                                $.each(files, function (i, o) {
                                    var html = '<li data-id="' + o.id + '" class="affix-item" complete="false">';
                                    html += ' <span class="affixname">' + o.name + '</span><span class="affix-size">(' + (o.size / 1024 / 1024).toFixed(2) + 'MB)</span> ';
                                    html += ' <span class="progressbar" file-id="' + o.id + '" >校验文件：0%</span>';
                                    html += ' <span class="failed" style="display:none;">失败！</span>';
                                    html += ' <a class="lbtn lbtn-info btn-retry" file-id="' + o.id + '" style="display:none;" href="javascript:;">重试</a>';
                                    html += ' <a class="lbtn btn-delete" file-id="' + o.id + '" style="display:none;" href="javascript:;" title="点击后删除该附件"></a>';
                                    html += '</li>';

                                    result.push(html);
                                });

                                if (cell.find('.empty').length > 0) {
                                    cell.html('');
                                }

                                cell.append(result.join(''));

                                cell.find('.btn-delete').unbind('click');
                                cell.find('.btn-delete').bind('click', function () {
                                    var $me = $(this);
                                    $.messager.confirm('提示信息', '确定删除吗？', function (r) {
                                        if (r) {
                                            var li = $me.parents('li'),
                                                fileId = li.data('id'),
                                                file = getFile(fileId);

                                            if ($me.parents('.datagrid-cell').find('li').length <= 1) {
                                                $me.parents('.datagrid-cell').html('<span class="empty">暂无附件</span>');
                                            }

                                            li.remove();

                                            fixHeight();
                                            if (null != file) {
                                                uploader.removeFile(file, true);
                                            }
                                        }
                                    });
                                });

                                cell.find('.btn-retry').unbind('click');
                                cell.find('.btn-retry').bind('click', function () {
                                    var $me = $(this);
                                    uploader.retry();

                                    $me.hide();
                                });

                                fixHeight();
                            },
                            md5Progress: function (uploader, file, percentage, index) {
                                box.find('.progressbar[file-id="' + file.id + '"]').show().html('校验文件：' + percentage + '%');
                            },
                            md5Complete: function (uploader, file, val, index) {
                                box.find('.progressbar[file-id="' + file.id + '"]').hide().html('');
                            },
                            uploadStart: function (uploader, file, index) {

                            },
                            uploadProgress: function (uploader, file, percentage, index) {
                                box.find('.progressbar[file-id="' + file.id + '"]').show().html('上传文件：' + percentage + '%');
                            },
                            uploadSuccess: function (uploader, file, index) {
                                var cell = getCell(index, 'Materials');
                                var li = cell.find('li[data-id="' + file.id + '"]'),
                                    affixname = li.find('.affixname');

                                li.attr('tempid', file.guid);
                                li.attr('filename', file.name);
                                li.attr('filesize', o.size);
                                li.attr('complete', 'true');

                                affixname.before('<a href="' + env.current + '/down.aspx?id=' + file.guid + '" class="btn-download" title="下载文件"></a>');
                                affixname.wrap('<a class="view-file-btn"  href="' + env.current + '/view.aspx?id=' + file.guid + '" target="_blank"></a>');

                                li.find('.btn-delete').show();
                            },
                            uploadError: function (uploader, file, index) {
                                var box = getCell(index, 'Materials').find('li[data-id="' + file.id + '"]');
                                box.find('.failed').show();
                                box.find('.btn-retry').show();
                            },
                            uploadComplete: function (uploader, file, index) {
                                var cell = getCell(index, 'Materials'),
                                    item = cell.find('li[data-id="' + file.id + '"]');

                                item.attr('complete', 'true');
                                item.find('.progressbar').hide();
                            }
                        }, opt.uploader);
                        if (extensions)
                            upOpt.extensions = extensions;
                        p.uploader(upOpt);
                    });

                    $('.view-file-btn').off('click');
                    $('.view-file-btn').on('click', function (e) {
                        e.stopPropagation();

                        var me = $(this),
                            url = me.attr('href');

                        p.dialog({
                            src: url,
                            title: '附件查看',
                            shadow: false,
                            border: false,
                            max: true,
                            noheader: true,
                            cls: 'affix-dialog'
                        });

                        return false;
                    });

                    //结论选择控制
                    gridbox.find('input[name*=result]').click(function () {
                        var me = this,
                            $this = $(this);

                        if (me.checked) {

                            $.each($this.parents('.datagrid-cell').find('input[name*=result]'), function (i, o) {
                                if (o.name !== me.name) {
                                    o.checked = false;
                                }
                            });
                        }
                    });
                }
            }),
            onLoadSuccess: function () {
                reRenderRow($(this), this);
            }
        });

        //是否所有上传都已完毕
        function iscomplete() {
            var items = gridbox.find('.affix-item[complete="false"]');

            return items.length == 0;
        }

        //重新渲染行
        function reRenderRow(instance, ctx) {
            var opts = instance.datagrid('options'),
                rows = instance.datagrid('getRows'),
                rownumber = 1;
            for (var i = 0; i < rows.length; i++) {
                var tr = null;
                if (ctx) {
                    tr = opts.finder.getTr(ctx, i);
                }
                else {
                    tr = gd.parents('.datagrid').find('.datagrid-view2').find('tr[datagrid-row-index="' + i + '"]');
                }
                tr.find('div[class*="-rownumber"]').html(rownumber);

                if (rows[i].Hide || rows[i].clientHide) {
                    tr.hide();
                }
                else if (!rows[i].Hide && !rows[i].clientHide) {
                    tr.show();

                    rownumber++;
                }
            }

            instance.datagrid('resize');
        }

        /**
         *   显示或隐藏行
         *   @rows   :行号、附件TypeId，附件名称
         *   @isshow :true=显示，false=隐藏
         */
        function showOrHideRows(rows, isshow) {
            var dataRows = gd.datagrid('getRows');

            for (var i = 0, len = dataRows.length; len--; i++) {
                var d1 = dataRows[i],
                    flag = false;
                for (var j = 0, jlen = rows.length; jlen--; j++) {
                    var d2 = rows[j];

                    if ($.type(d2) === 'number' && i === d2) {
                        flag = true;
                        break;
                    }
                    else if ($.type(d2) === 'string' && d1.TypeId === d2) {
                        flag = true;
                        break;
                    }
                    else if ($.type(d2) === 'string' && d1.MaterialInfo && (d1.MaterialInfo.Name === d2 || d1.MaterialInfo.Alias === d2)) {
                        flag = true;
                        break;
                    }
                }

                if (flag) {
                    d1.clientHide = true;
                }
                else {
                    d1.clientHide = false;
                }
            }

            reRenderRow(gd);
        }

        //获取审核意见
        function getOption(r, row, userowdata) {
            var rec = {
                BusinessMaterialGuid: row.Guid,
                Result: '',
                Content: '',
                _row: userowdata ? row : null
            };

            if (opt.mode.modename == 'preaccept') {
                rec.Content = $.trim(r.find('.Content').val());
            }
            else if (opt.mode.modename == 'accept') {
                rec.Result = $.trim(r.find('.Result').val());
            }
            else if (opt.mode.modename == 'audit') {
                rec.Result = $.trim(r.find('input:checked[name*="result"]').val());
                rec.Content = $.trim(r.find('.Content').val());
            }

            return rec;
        }

        /**
        *   调整控件大小
        *   @param :与easyui的resize方法的参数一致
        */
        this.resize = function (param) {
            gd.datagrid('resize', param);
        };

        ///获取材料审核意见
        this.getMaterialrec = function (userowdata) {
            var rows = gd.datagrid('getRows'),
                box = $(me).parents('.affixgrid-box'),
                getRow = function (index) {
                    var tr = box.find('tr[datagrid-row-index="' + index + '"]');

                    if (tr.length > 0) {
                        return tr;
                    }

                    return null;
                },
                getCell = function (index, field) {
                    var r = getRow(index);
                    if (r) {
                        var c = r.find('td[field="' + field + '"]').find('.datagrid-cell');
                        if (c.length > 0) {
                            return c;
                        }
                    }

                    return null;
                },
                result = [];

            $.each(rows, function (i, o) {
                result.push(getOption(getRow(i), o, userowdata));
            });

            return { _Items: result };
        }

        /**
        *   获取附件信息（包括材料审核意见）
        *   @isAdditional :如果处于补充模式，此参数才有用，如果为true则表示只获取补充的材料信息
        */
        this.getValue = function (isAdditional) {
            //debugger;
            var rows = gd.datagrid('getRows'),
                box = $(me).parents('.affixgrid-box'),
                getRow = function (index) {
                    var tr = box.find('tr[datagrid-row-index="' + index + '"]');
                    if (tr.length > 0) {
                        return tr;
                    }
                    return null;
                },
                getCell = function (index, field) {
                    var r = getRow(index);
                    if (r) {
                        var c = r.find('td[field="' + field + '"]').find('.datagrid-cell');
                        if (c.length > 0) {
                            return c;
                        }
                    }

                    return null;
                };

            $.each(rows, function (i, o) {
                var r = getRow(i);

                //材料编号
                if (opt.mode.DocumentNumber && opt.mode.DocumentNumber.edit) {
                    var txtDocumentNumber = r.find('.DocumentNumber');
                    if (txtDocumentNumber.length > 0) {
                        o.DocumentNumber = $.trim(txtDocumentNumber.val());
                    }
                }

                //附件列表
                if (opt.mode.Materials && opt.mode.Materials.edit) {
                    var cell = getCell(i, 'Materials');
                    $.each(cell.find('li[tempid]'), function (j, li) {
                        if (!o.Materials._Items) {
                            o.Materials._Items = [];
                        }

                        var md5 = $(li).attr('tempid'),
                            name = $(li).attr('filename'),
                            size = parseFloat($(li).attr('filesize') || 0);

                        o.Materials._Items = $.map(o.Materials._Items, function (o1) {
                            if (o1.MD5 === md5) {
                                return null;
                            }

                            return o1;
                        });

                        o.Materials._Items.push({
                            MD5: md5,
                            FriendlyFileName: name,
                            FileSize: size
                        });
                    });
                }

                o.RecMaterial = getOption(r, o);
            });

            if (opt.mode.additional && isAdditional) {
                rows = $.map(rows, function (o) {
                    if (o.Must) {
                        return o;
                    }

                    return null;
                });
            }

            return { _Items: rows };
        }

        /**
        *   设置附件值
        */
        this.setValue = function (data) {
            if (data._Items) {
                data = data._Items;
            }
            gd.datagrid('loadData', data);
        }

        /**
        *   将外部材料合并到当前附件列表
        *   @data   :外部材料附件列表
        */
        this.merge = function (data) {
            var items = null;
            if (!data) {
                return;
            }
            if (data._Items) {
                data = data._Items;
            }
            items = $.extend(true, {}, srcdata);
            $.each(items._Items, function (i, d) {
                if (d.SourceTypeIds) {
                    var tokens = d.SourceTypeIds.split(',');
                    $.each(tokens, function (z, t) {
                        var item = t.split('=');

                        if (item.length === 2) {
                            $.each(data, function (j, d1) {
                                if (item[0] === d1.SystemID && item[1] == d1.TypeId) {
                                    $.each(d1.Materials._Items, function () {
                                        var file1 = this,
                                            flag = true;

                                        $.each(d.Materials._Items, function () {
                                            var file2 = this;

                                            if (file1.MD5 === file2.MD5) {
                                                flag = false;
                                            }

                                            return flag;
                                        });

                                        if (flag) {
                                            d.Materials._Items.push(file1);
                                        }

                                        d.DocumentNumber = d.DocumentNumber || '';
                                        if (d1.DocumentNumber) {
                                            flag = true;

                                            $.each(d.DocumentNumber.split('、'), function (k, x) {
                                                if (x === d1.DocumentNumber) {
                                                    flag = false;
                                                }

                                                return flag;
                                            });

                                            if (flag) {
                                                if (d.DocumentNumber) {
                                                    d.DocumentNumber += '、';
                                                }
                                                d.DocumentNumber += d1.DocumentNumber;
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else if (d.TypeId) {
                    $.each(data, function (j, d1) {
                        if (d.TypeId === d1.TypeId) {
                            $.each(d1.Materials._Items, function () {
                                var file1 = this,
                                    flag = true;

                                $.each(d.Materials._Items, function () {
                                    var file2 = this;

                                    if (file1.MD5 === file2.MD5) {
                                        flag = false;
                                    }

                                    return flag;
                                });


                                if (flag) {
                                    d.Materials._Items.push(file1);
                                }

                                d.DocumentNumber = d.DocumentNumber || '';
                                if (d1.DocumentNumber) {
                                    flag = true;

                                    $.each(d.DocumentNumber.split('、'), function (k, x) {
                                        if (x === d1.DocumentNumber) {
                                            flag = false;
                                        }

                                        return flag;
                                    });

                                    if (flag) {
                                        if (d.DocumentNumber) {
                                            d.DocumentNumber += '、';
                                        }
                                        d.DocumentNumber += d1.DocumentNumber;
                                    }
                                }
                            });
                        }
                    });
                }
            });

            $(me).datagrid('loadData', items._Items);

            if (hiderows) {
                me.hideRows(hiderows);
            }
        }

        //验证输入
        this.valid = function () {
            if (!iscomplete()) {
                $.messager.alert('提示', '附件尚未上传完毕，请等待。', 'info');

                return false;
            }

            var rows = gd.datagrid('getRows'),
                box = $(me).parents('.affixgrid-box'),
                getRow = function (index) {
                    var tr = box.find('tr[datagrid-row-index="' + index + '"]');

                    if (tr.length > 0) {
                        return tr;
                    }

                    return null;
                },
                getCell = function (index, field) {
                    var r = getRow(index);
                    if (r) {
                        var c = r.find('td[field="' + field + '"]').find('.datagrid-cell');
                        if (c.length > 0) {
                            return c;
                        }
                    }

                    return null;
                };

            var flag = true;

            if (opt.mode.modename === 'edit' || opt.mode.modename === 'correction') {
                $.each(rows, function (i, o) {
                    var r = getRow(i);
                    if (o.Hide || o.clientHide) {
                        return true;
                    }

                    if ((!opt.mode.additional && o.IsRequired) || (opt.mode.additional && o.Must)) {
                        var txtNumber = r.find('.DocumentNumber'),
                            number = $.trim(txtNumber.val()),
                            affixs = r.find('.affix-item');

                        if (o.IsRequiredNumber) {
                            if (!number) {
                                flag = false;
                                $.messager.alert('提示信息', '请填写“' + o.MaterialInfo.Name + '”材料编号。', 'info', function () {
                                    txtNumber.focus();
                                });

                                return flag;
                            }
                        }

                        if (affixs.length < 1) {
                            flag = false;
                            $.messager.alert('提示信息', '请上传“' + o.MaterialInfo.Name + '”相关文件。');

                            return flag;
                        }
                    }
                });
            }
            else if (opt.mode.modename === 'preaccept') {
                //$.each(rows, function (i, o) {
                //    var r = getRow(i);

                //    if (o.IsRequired) {
                //        var txtContent = r.find('.Content'),
                //            content = $.trim(txtContent.val());

                //        if (!content && o.Materials && o.Materials._Items.length > 0) {
                //            flag = false;
                //            $.messager.alert('提示', '请填写“' + o.MaterialInfo.Name + '”材料说明。', 'info', function () {
                //                txtContent.focus();
                //            });

                //            return flag;
                //        }
                //    }
                //});
            }
            else if (opt.mode.modename === 'accept') {
                //$.each(rows, function (i, o) {
                //    var r = getRow(i);

                //    if (o.IsRequired) {

                //        var txtContent = r.find('.Content'),
                //            content = $.trim(txtContent.val());

                //        if (!content && o.Materials && o.Materials._Items.length > 0) {
                //            flag = false;
                //            $.messager.alert('提示', '请填写“' + o.MaterialInfo.Name + '”实收份数。', 'info', function () {
                //                txtContent.focus();
                //            });

                //            return flag;
                //        }
                //    }
                //});
            }
            else if (opt.mode.modename === 'audit') {
                $.each(rows, function (i, o) {
                    var r = getRow(i);
                    if (o.Hide || o.clientHide) {
                        return true;
                    }

                    var cell = getCell(i, 'RecMaterial').find('input:checked[name*="result"]');

                    if (cell.val() === '不符合') {
                        var cell1 = getCell(i, 'RecMaterial_Content').find('.Content');
                        if (!$.trim(cell1.val())) {
                            flag = false;

                            $.messager.alert('提示信息', '请填写整改内容。', 'info', function () {
                                cell1.get(0).focus();
                            });
                        }

                        return flag;
                    }
                });
            }

            return flag;
        }

        //是否全部通过
        this.isAllPass = function () {
            var rec = me.getMaterialrec(true),
                flag = true;

            if (opt.mode.modename == 'preaccept') {

            }
            else if (opt.mode.modename == 'accept') {

            }
            else if (opt.mode.modename == 'audit') {
                $.each(rec._Items, function (i, o) {
                    if (o._row && (!o._row.Hide && !o._row.clientHide) && o._row.Materials && o._row.Materials._Items.length > 0) {
                        //if (o._row && !o._row.Hide && o._row.Materials && o._row.Materials._Items.length > 0) {
                        flag = o.Result === '符合';
                    }
                    return flag;
                });
            }
            return flag;
        }

        //销毁控件
        this.destroy = function () {
            $(me).parents('.affixgrid-box').replaceWith(srcEl);
            //gd.datagrid('getPanel').panel('destroy');
        }

        /**
        *   隐藏行
        *   @rows   :行号、附件TypeId、附件名称、附件别名
        */
        this.hideRows = function (rows) {
            hiderows = rows;
            showOrHideRows(rows, false);
        }

        this.grid = gd;

        var resizeCount = 0,
            timer = setInterval(function () {
                resizeCount++;
                if (resizeCount > 9) {
                    clearInterval(timer);
                }
                gd.datagrid('resize');
            }, 100);

        return this;
    }

    //附件列表的默认列组合模式
    $.fn.affixgrid.fields = {
        //查看模式
        view: {
            modename: 'view',
            MaterialInfo_Name: {
                title: '文件或证明材料',
                width: 430
            },
            DocumentNumber: {
                edit: false,
                visible: true,
                title: '材料编号',
                width: 170
            },
            Materials: {
                edit: false,
                visible: true,
                title: '附件列表',
                width: 470
            }
        },

        //编辑模式
        edit: {
            modename: 'edit',
            additional: false, //是否是补充材料
            MaterialInfo_Name: {
                edit: true,
                title: '文件或证明材料',
                width: 400
            },
            DocumentNumber: {
                edit: true,
                visible: true,
                title: '材料编号',
                width: 170
            },
            Materials: {
                edit: true,
                visible: true,
                title: '附件列表',
                width: 460
            },
            Upload: {
                edit: true,
                visible: true,
                title: '上传',
                align: 'center',
                width: 40
            }
            //,
            //Description: {
            //    visible: true,
            //    title: '材料说明',
            //    align: 'left',
            //    width: 200
            //}
        },

        //整改模式
        correction: {
            modename: 'correction',
            MaterialInfo_Name: {
                edit: true,
                title: '文件或证明材料',
                width: 300
            },
            DocumentNumber: {
                edit: true,
                visible: true,
                title: '材料编号',
                width: 170
            },
            Materials: {
                edit: true,
                visible: true,
                title: '附件列表',
                width: 360
            },
            Upload: {
                edit: true,
                visible: true,
                title: '上传',
                align: 'center',
                width: 40
            },
            //Description: {
            //    visible: true,
            //    title: '材料说明',
            //    align: 'left',
            //    width: 200
            //},
            Correction: {
                visible: true,
                title: '整改内容',
                width: 200
            }
        },

        //预受理模式
        preaccept: {
            modename: 'preaccept',
            MaterialInfo_Name: {
                title: '文件或证明材料',
                width: 315
            },
            DocumentNumber: {
                edit: false,
                visible: true,
                title: '材料编号',
                width: 140
            },
            Materials: {
                edit: false,
                visible: true,
                title: '附件列表',
                width: 400
            },
            RecMaterial_Content: {
                edit: true,
                visible: true,
                title: '整改内容',
                align: 'center',
                width: 215
            }
        },

        //受理模式
        accept: {
            modename: 'accept',
            MaterialInfo_Name: {
                title: '文件或证明材料',
                width: 315
            },
            DocumentNumber: {
                edit: false,
                visible: true,
                title: '材料编号',
                width: 140
            },
            Materials: {
                edit: false,
                visible: true,
                title: '附件列表',
                width: 400
            },
            RecMaterial_Result: {
                edit: true,
                visible: true,
                title: '收取情况',
                width: 215
            }
        },

        //审查模式
        audit: {
            modename: 'audit',
            MaterialInfo_Name: {
                title: '文件或证明材料',
                width: 300
            },
            DocumentNumber: {
                edit: false,
                visible: true,
                title: '材料编号',
                width: 140
            },
            Materials: {
                edit: false,
                visible: true,
                title: '附件列表',
                width: 295
            },
            RecMaterial_Result: {
                edit: true,
                visible: true,
                title: '审查',
                width: 120,
                align: 'center'
            },
            RecMaterial_Content: {
                edit: true,
                visible: true,
                title: '整改内容',
                align: 'center',
                width: 215
            }
        }
    };


    /**
    *  附件上传
    *  @opt         :配置参数
    *       data    :附件列表 (AttachFileInfoList)
    *       edit    :是否可以编辑
    *       mode    :可选值为：textbox
    *       required:是否必填
    *       render  :渲染文件的回调函数
    *       srcdata :该参数在调用render的时候将被原样传回
    *       uploader:上传控件的相关参数
    *       uploadsuccess:上传成功回调函数
    */
    $.fn.uploader = function (opt) {
        var me = this,
            $me = $(me),
            instance = null,
            box = null,
            tipbox = null,
            valbox = null;

        opt = $.extend(true, {
            multiple: true,
            edit: true,
            editable: false,
            iconWidth: 25,
            isListFile: false,
            NoticeFinishMsg: '附件尚未上传完毕，请等待。',
            NoticeMsg: '请上传附件。',
            icons: [{
                iconCls: 'icon-file'
            }],
            render: null,
            uploader: null,
            uploadsuccess: function () { }
        }, opt);

        if (!opt.multiple) {
            opt.uploader = opt.uploader || {};
            $.extend(true, opt.uploader, { multiple: false });
        }

        function isTextBox() {
            return opt.mode === 'textbox';
        }

        function getPicker() {
            if (isTextBox()) {
                return box.find('.icon-file')[0];
            }
            else {
                return $me[0];
            }
        }
        function iscomplete() {
            var items = box.find('.affix-item[complete="false"]');
            return items.length == 0;
        }

        $me.wrap('<div class="upload-textbox-box' + (!isTextBox() ? ' upload-btn-box' : '') + '" ></div>');
        box = $me.parent('.upload-textbox-box');
        if (!opt.isListFile) {
            box.append('<div class="upload-textbox-tip" style="top:' + (isTextBox() ? (opt.height || 27) : $me.height()) + 'px; min-width:' + (1) + 'px"><ul class="item-box" style="display:none;"></ul></div>');
        }
        box.append('<input type="hidden" class="val" />');
        tipbox = box.find('.upload-textbox-tip');
        valbox = box.find('input.val');



        if (isTextBox()) {
            instance = $me.textbox(opt);
        }

        function addId(id, name) {
            if (isTextBox()) {
                var txt = $.trim(instance.textbox('getText'));

                if (!txt) {
                    txt = [];
                }
                else {
                    txt = txt.split(',');
                }
                txt.push(name);

                instance.textbox('setText', txt.join(','));
            }

            var val = $.trim(valbox.val());
            if (!val) {
                val = [];
            }
            else {
                val = val.split(',');
            }
            val.push(id);
            valbox.val(val.join(','));
        }

        function removeId(id, name) {
            var val = $.trim(valbox.val());
            if (!val) {
                val = [];
            }
            else {
                val = val.split(',');
            }

            val = $.map(val, function (o) {
                if (o == id) {
                    return null;
                }

                return o;
            });

            valbox.val(val.join(','));

            if (isTextBox()) {

                var txt = $.trim(instance.textbox('getText'));
                if (!txt) {
                    txt = [];
                }
                else {
                    txt = txt.split(',');
                }
                txt = $.map(txt, function (o) {
                    if (o == name) {
                        return null;
                    }

                    return o;
                });

                instance.textbox('setText', txt.join(','));
            }
        }

        function clearId() {
            valbox.val('');

            if (isTextBox()) {
                instance.textbox('setText', '');
            }
        }

        function initItems(data) {
            var result = [];

            $.each(data, function (i, o) {
                if (typeof (o.FriendlyFileName) == typeof (undefined) || o.FriendlyFileName == null || o.FriendlyFileName == "") {
                    o.FriendlyFileName = "附件";
                }
                addId(o.MD5, o.FriendlyFileName);

                var html = '<li data-id="' + o.MD5 + '" class="affix-item2" complete="true">';
                html += "<table><tr>";
                html += '<td><a href="' + env.current + '/down.aspx?id=' + o.MD5 + '" class="btn-download" title="下载文件"></a><span  class="oSizeSpan" style="display:none">' + o.size + '</span></td>';
                html += '<td><a data-id="' + o.MD5 + '" href="' + env.current + '/view.aspx?id=' + o.MD5 + '&meteral=' + o.MaterialGuid + '" target="_blank" class="view-file-btn2"><span class="affixname">' + o.FriendlyFileName + '</span></a><span class="affix-size">(' + (o.FileSize / 1024 / 1024).toFixed(2) + 'MB)</span></td>';
                if (opt.edit && o.IsOwner) {
                    html += '<td><a class="lbtn btn-ajax-delete btn-singlefile-nomaldelete" data-id="' + o.MD5 + '" href="javascript:;"></a></td>';
                }
                html += '</tr></table>';
                html += '</li>';

                result.push(html);
            });

            result = result.join('');

            if (opt.render) {
                opt.render(result, opt.srcdata);
            }
            else {
                tipbox.append(result);
            }

            $('.btn-singlefile-nomaldelete').unbind('click');
            $('.btn-singlefile-nomaldelete').bind('click', function () {
                var $this = $(this),
                    getFile = function (id) {
                        var result = null;
                        $.each(data, function (i, o) {
                            if (o.MD5 == id) {
                                result = o;
                                return false;
                            }

                            return true;
                        });

                        return result;
                    };

                $.messager.confirm('提示信息', '确定删除吗？', function (r) {
                    if (r) {
                        var li = $this.parents('li'),
                            fileId = li.data('id'),
                            file = getFile(fileId);
                        //修改删除附件不成功
                        var hidden = $this.parents('td').next().find('.val');
                        var mids = new String(hidden.val()).split(',');
                        $.each(mids, function (index, val) {
                            if (val == fileId) {
                                mids.splice(index, 1);
                                return;
                            }
                        });
                        hidden.val(mids.join(','));
                        li.remove();
                        if (null != file) {
                            removeId(file.MD5, file.FriendlyFileName);
                        }
                    }
                });
            });
        }

        //初始化数据绑定
        if (opt && opt.data && opt.data._Items) {
            initItems(opt.data._Items);
        }

        if (opt.edit) {
            p.uploader($.extend(true, {
                picker: getPicker(),
                filesQueued: function (uploader, files, index) {
                    if (!opt.multiple) {
                        clearId();
                    }
                    var result = [],
                        getFile = function (id) {
                            var result = null,
                                _files = uploader.getFiles();

                            if (_files) {
                                $.each(_files, function (i, o) {
                                    if (o.id == id) {
                                        result = o;
                                        return false;
                                    }
                                });
                            }

                            return result;
                        };

                    $.each(files, function (i, o) {
                        var html = '<li data-id="' + o.id + '" class="affix-item2" complete="false">';
                        html += '<table valign="middle"><tr>';
                        html += ' <td><span class="affixname">' + o.name + '</span></td> ';
                        html += ' <td><span class="affix-size">(' + (o.size / 1024 / 1024).toFixed(2) + 'MB)</span><span  class="oSizeSpan" style="display:none">' + o.size + '</span></td> ';
                        html += ' <td><span class="progressbar singlefileprogressbar" file-id="' + o.id + '" >校验文件：0%</span></td>';
                        html += ' <td><span class="failed" style="display:none;">失败！</span></td>';
                        html += ' <td><a class="lbtn lbtn-info btn-retry btn-singlefile-retry" file-id="' + o.id + '" style="display:none;" href="javascript:;">重试</a></td>';
                        html += ' <td><a class="lbtn btn-delete btn-singlefile-delete" file-id="' + o.id + '" style="display:none;" href="javascript:;" title="点击后删除该附件"></a></td>';
                        html += '</tr></table>';
                        html += '</li>';

                        result.push(html);
                    });

                    result = result.join('');

                    if (opt.render) {
                        opt.render(result, opt.srcdata, opt.multiple);
                    }
                    else if (opt.multiple) {
                        box.find('.item-box').show().append(result);
                    }
                    else {
                        box.find('.item-box').show().html(result);
                    }

                    //var itembox = $('.item-box');

                    $('.btn-singlefile-delete').unbind('click');
                    $('.btn-singlefile-delete').bind('click', function () {
                        var $this = $(this);
                        $.messager.confirm('提示信息', '确定删除吗？', function (r) {
                            if (r) {
                                var li = $this.parents('li'),
                                    fileId = li.data('id'),
                                    file = getFile(fileId);

                                li.remove();

                                if (null != file) {
                                    removeId(file.guid, file.name);
                                    uploader.removeFile(file, true);
                                }
                            }
                        });
                    });

                    $('.btn-singlefile-retry').unbind('click');
                    $('.btn-singlefile-retry').bind('click', function () {
                        var $this = $(this);
                        uploader.retry();

                        $this.hide();
                    });
                },
                md5Progress: function (uploader, file, percentage, index) {
                    $('.singlefileprogressbar[file-id="' + file.id + '"]').show().html('校验文件：' + percentage + '%');
                },
                md5Complete: function (uploader, file, val, index) {
                    $('.singlefileprogressbar[file-id="' + file.id + '"]').hide().html('');
                },
                uploadStart: function (uploader, file, index) {

                },
                uploadProgress: function (uploader, file, percentage, index) {
                    $('.singlefileprogressbar[file-id="' + file.id + '"]').show().html('上传文件：' + percentage + '%');
                },
                uploadSuccess: function (uploader, file, index) {
                    var li = $('.affix-item2[data-id="' + file.id + '"]'),
                        affixname = li.find('.affixname');

                    li.attr('tempid', file.guid);

                    affixname.parent('td').before('<td><a href="' + env.current + '/down.aspx?id=' + file.guid + '" class="btn-download" title="下载文件"></a></td>');
                    affixname.wrap('<a href="' + env.current + '/view.aspx?id=' + file.guid + '" target="_blank" class="view-file-btn2"></a>');

                    li.find('.btn-delete').show();

                    addId(file.guid, file.name);

                    li.attr('complete', 'true');

                    opt.uploadsuccess(file);
                },
                uploadError: function (uploader, file, index) {
                    var thisbox = $('.affix-item2[data-id="' + file.id + '"]');

                    thisbox.find('.failed').show();
                    thisbox.find('.btn-retry').show();
                },
                uploadComplete: function (uploader, file, index) {
                    var item = $('.affix-item2[data-id="' + file.id + '"]');
                    item.attr('complete', 'true');

                    item.find('.progressbar').hide();
                }
            }, opt.uploader));
        }

        $('.view-file-btn2').off('click');
        $('.view-file-btn2').on('click', function (e) {
            e.stopPropagation();

            var me = $(this),
                url = me.attr('href');

            p.dialog({
                src: url,
                title: '附件查看',
                shadow: false,
                border: false,
                max: true,
                noheader: true,
                cls: 'affix-dialog'
            });

            return false;
        });

        //验证输入
        this.valid = function () {
            if (!iscomplete()) {
                $.messager.alert('提示', opt.NoticeFinishMsg, 'info');

                return false;
            }

            if (opt.required) {
                var vals = me.getValue();

                if (vals.length == 0) {
                    $.messager.alert('提示', opt.NoticeMsg, 'info');

                    return false;
                }
            }

            return true;
        }


        //获取已上传文件的ID
        this.getValue = function () {
            var val = valbox.val();

            if (!val) {
                val = [];
            }
            else {
                val = val.split(',');
            }

            return val;
        }

        this.getTotalValue = function () {

            var val = valbox.val();
            var arry = [];
            if (!val) {
                val = [];
            }
            else {
                val = val.split(',');
            }
            for (var i = 0; i < val.length; i++) {
                var friendlyFileName = "";
                var oSize = 0;
                $("body").find('.affixname').each(function (index) {
                    if (index == i) {
                        friendlyFileName = $(this).text();
                    }
                })
                $("body").find('.oSizeSpan').each(function (index) {
                    if (index == i) {
                        try {
                            oSize = parseInt($(this).text());
                        } catch (e) { }
                    }
                })
                var fileExtNames = friendlyFileName.split('.');
                var fileExtName = "";
                if (fileExtNames.length > 0)
                    fileExtName = "." + fileExtNames[fileExtNames.length - 1];
                arry.push({ MD5: val[i], FriendlyFileName: friendlyFileName, FileSize: oSize, FileExtName: fileExtName, FileName: friendlyFileName });

            }

            return arry;
        }


        this.getMoreTotalValue = function (fileID) {

            var val = valbox.val();
            var arry = [];
            if (!val) {
                val = [];
            }
            else {
                val = val.split(',');
            }
            for (var i = 0; i < val.length; i++) {
                var friendlyFileName = "";
                var oSize = 0;
                $("#" + fileID).find('.affixname').each(function (index) {
                    if (index == i) {
                        friendlyFileName = $(this).text();
                    }
                })
                $("#" + fileID).find('.oSizeSpan').each(function (index) {
                    if (index == i) {
                        try {
                            oSize = parseInt($(this).text());
                        } catch (e) { }
                    }
                })
                var fileExtNames = friendlyFileName.split('.');
                var fileExtName = "";
                if (fileExtNames.length > 0)
                    fileExtName = "." + fileExtNames[fileExtNames.length - 1];
                arry.push({ MD5: val[i], FriendlyFileName: friendlyFileName, FileSize: oSize, FileExtName: fileExtName, FileName: friendlyFileName });

            }

            return arry;
        }


        this.getListTotalValue = function (fileID, rowIndex) {

            var val = valbox.val();
            var arry = [];
            if (!val) {
                val = [];
            }
            else {
                val = val.split(',');
            }
            for (var i = 0; i < val.length; i++) {
                var friendlyFileName = "";
                var oSize = 0;


                $('td[' + fileID + '="tdattachname' + rowIndex + '"]').find('.affixname').each(function (index) {
                    if (index == i) {
                        friendlyFileName = $(this).text();
                    }
                })
                $('td[' + fileID + '="tdattachname' + rowIndex + '"]').find('.oSizeSpan').each(function (index) {
                    if (index == i) {
                        try {
                            oSize = parseInt($(this).text());
                        } catch (e) { }
                    }
                })
                var fileExtNames = friendlyFileName.split('.');
                var fileExtName = "";
                if (fileExtNames.length > 0)
                    fileExtName = "." + fileExtNames[fileExtNames.length - 1];
                arry.push({ MD5: val[i], FriendlyFileName: friendlyFileName, FileSize: oSize, FileExtName: fileExtName, FileName: friendlyFileName });

            }

            return arry;
        }



        return this;
    };

    /**
    *  tab标签页
    *  @opt         :配置参数
    *       data    :附件列表 (AttachFileInfoList)
    *       edit    :是否可以编辑
    *       mode    :可选值为：textbox
    */
    $.fn.ptab = function (opt, clasname) {
        clasname = clasname || 'tab-style1';
        $(this).addClass(clasname);

        opt = $.extend(true, {
            border: false
        }, opt);

        return $(this).tabs(opt);
    }

    /**
    *  combo扩展
    *  @opt         :配置参数，与easyui全部一致
    */
    $.fn.comboex = function (opt) {
        var onSelect = opt.onSelect,
            onUnselect = opt.onUnselect,
            onShowPanel = opt.onShowPanel,
            autoUnselect = false,
            autoSelect = false;

        opt.onSelect = function (row) {
            var panel = $(this).combobox('panel'),
                opts = $(this).combobox('options'),
                data = $(this).combobox('getData');

            if (opts.multiple) {
                var checkbox = [];

                var allval = null;

                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    if (d[opts.textField] === '全部') {
                        allval = d[opts.valueField];
                        break;
                    }
                }


                if (autoSelect) {
                    autoSelect = false;

                    panel.find('.multiple-combo-checkbox[data-val="' + allval + '"]').each(function () {
                        this.checked = true;
                    });

                    return;
                }

                if (row[opts.textField] == '全部') {
                    checkbox = panel.find('.multiple-combo-checkbox');
                    var values = [];
                    $.each(data, function (i, o) {
                        values.push(o[opts.valueField]);
                    });

                    $(this).combobox('setValues', values);
                }
                else {
                    if (null != allval && data.length - 1 === $(this).combobox('getValues').length) {
                        autoSelect = true;
                        $(this).combobox('select', allval);
                    }

                    checkbox = panel.find('.multiple-combo-checkbox[data-val="' + row[opts.valueField] + '"]');
                }

                checkbox.each(function (i, o) {
                    o.checked = true;
                });
            }

            if (onSelect) {
                onSelect(row);
            }
        }

        opt.onUnselect = function (row) {
            var panel = $(this).combobox('panel'),
                opts = $(this).combobox('options'),
                data = $(this).combobox('getData');

            var allval = null;

            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                if (d[opts.textField] === '全部') {
                    allval = d[opts.valueField];
                    break;
                }
            }

            if (opts.multiple) {
                var checkbox = [];
                if (autoUnselect) {
                    autoUnselect = false;

                    if (allval) {
                        panel.find('.multiple-combo-checkbox[data-val="' + allval + '"]').each(function () {
                            this.checked = false;
                        });
                    }

                    return;
                }

                if (row[opts.textField] == '全部') {
                    checkbox = panel.find('.multiple-combo-checkbox');
                    $(this).combobox('setValues', []);
                }
                else {
                    checkbox = panel.find('.multiple-combo-checkbox[data-val="' + row[opts.valueField] + '"]');

                    if ($.inArray(allval, $(this).combobox('getValues')) > -1) {
                        autoUnselect = true;
                        $(this).combobox('unselect', '全部');
                    }
                }

                checkbox.each(function (i, o) {
                    o.checked = false;
                });
            }
            if (onUnselect) {
                onUnselect(row);
            }
        }

        opt.onShowPanel = function () {
            var panel = $(this).combobox('panel'),
                opts = $(this).combobox('options'),
                vals = $(this).combobox('getValues');
            if (opts.multiple) {
                panel.find('.multiple-combo-checkbox').each(function (i, o) {
                    var d = $(o).data('val'),
                        flag = false;
                    $.each(vals, function (i1, o1) {
                        if (d == o1) {
                            flag = true;
                            o.checked = true;
                        }
                    });

                    if (!flag) {
                        o.checked = false;
                    }
                });
            }

            if (onShowPanel) {
                onShowPanel();
            }
        }

        opt = $.extend(true, {
            panelHeight: 'auto',
            loader: function (param, success, error) {
                if (opt.url) {
                    $.get(opt.url, {
                        data: param,
                        success: success,
                        error: error,
                        mask: false
                    });
                }
            },
            loadFilter: function (data) {
                if (!data) {
                    return [];
                }

                if (typeof (data) === 'string') {
                    data = JSON.parse(data);
                }

                if (data.Data) {
                    data = data.Data;
                }

                if (data._Items) {
                    data = data._Items;
                }

                return data;
            },
            formatter: function (row) {
                var opts = $(this).combobox('options'),
                    result = '';

                if (opts.multiple) {
                    result = '<input type="checkbox" class="multiple-combo-checkbox" data-val="' + row[opts.valueField] + '" /><span>' + row[opts.textField] + '</span>'
                }
                else {
                    result = row[opts.textField];
                }

                return result;
            }
        }, opt);

        return $(this).combobox(opt);
    }

}(window, jQuery));



/*获取参数*/
function SetParamData(Params) {

    var Url = window.location.pathname;

    var returnUc = GetCommonCookies();

    var exist = false;
    if (returnUc) {
        $.each(returnUc, function (ii, dd) {

            if (!exist && dd.Url == Url) {
                dd.Params = Params;
                exist = true;
            }
        });
    }

    if (!exist) {
        returnUc.push({ Url: Url, Params: Params });
    }

    var strNew = JSON.stringify(returnUc);
    $.cookie("ReturnUC" + GetPort(), strNew, { path: '/', expires: 10 });

}

/*获取参数*/
function GetParamData() {
    var returnUc = GetCommonCookies();

    var lastReturnUc = null;
    if (returnUc.length > 0) {

        var Url = window.location.pathname;
        var exist = false;
        $.each(returnUc, function (ii, dd) {
            if (dd.Url == Url) {
                if (!exist && dd.Params) {
                    lastReturnUc = dd.Params;
                    exist = true;
                }
            }
        });
    }

    return lastReturnUc
}

/*设置分页参数*/
function SetPageIndex(pageOpt) {
    if ($.cookie) {
        var Url = window.location.pathname;
        var returnUc = [];
        returnUc.push({ Url: Url, Params: pageOpt });

        var strNew = JSON.stringify(returnUc);
        $.cookie("PageIndex" + GetPort(), strNew, { path: '/', expires: 10 });
    }
}

/*获取分页参数*/
function GetPageIndex() {

    var pIndex = 1;

    if ($.cookie) {
        var Url = window.location.pathname;

        var strReturnUc = $.cookie('PageIndex' + GetPort());
        var returnUc = [];
        if (typeof (strReturnUc) != "undefined" && strReturnUc != null && strReturnUc != "") {
            returnUc = JSON.parse(strReturnUc);
        }

        if (returnUc && returnUc.length > 0) {
            $.each(returnUc, function (ii, dd) {
                if (dd.Url == Url) {
                    if (dd.Params) {
                        pIndex = dd.Params.PageIndex;
                    }
                }
            });
        }
    }

    return pIndex;
}

/*获取端口*/
function GetPort() {
    var port = location.port;
    if (!port) {
        port = 80;
    }
    return port;
}

//全局的辅助变量p，的扩展
(function (window, $, undefined) {

    var p = window.p = window.P = {};

    //禁用ajax缓存
    $.ajaxSetup({ cache: false });

    //Jquery
    p.$ = $;

    /**
    *  指系统开始运行的起始年
    */
    p.SYS_START_YEAR = 2015;

    /**
    *  指系统在登录超时时自动弹出登录框
    */
    p.AUTO_OPEN_LOGIN_DIALOG = true;

    /**
    *  指定文件上传使用的技术方式，支持html5和flash，并按指定的顺序进行尝试可，可单独设置html5或flash。
    */
    p.UPLOAD_RUNTIME_ORDER = 'html5,flash';

    /**
    *  定义一个命名空间
    *  @namespace：命名空间的路径，例如:projectname.modulename.operatename
    *  @obj :命名空间的承载对象，默认为window
    */
    p.namespace = function (namespace, obj) {
        var n = obj || window;
        $.each(namespace.split('.'), function (i, o) {
            if (typeof (n[o]) === typeof (undefined)) {
                n[o] = {};
            }

            n = n[o];
        });

        return p;
    }

    /**
    *  产生一个guid
    */
    p.guid = function () {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    /**
    *  字符串格式化
    */
    p.format = function (src) {
        if (arguments.length == 0) return null;
        var args = Array.prototype.slice.call(arguments, 1);
        return src.replace(/\{(\d+)\}/g, function (m, i) {
            return args[i];
        });
    }

    /**
    *  日期格式化
    *  将被格式化的日期
    *  格式，例如：yyyy-MM-dd HH:mm:ss
    */
    p.formatdate = function (date, fmt) {
        var d = null;

        if (!date) {
            return '';
        }
        if (!fmt) {
            fmt = 'yyyy-MM-dd';
        }
        try {
            if (typeof (date) === 'string') {
                date = date.replace('T', ' ').replace(/\-/g, '/').replace(/\.\d+/g, '');

                if (date === '0001/01/01 00:00:00') {
                    return '';
                }

                d = new Date(date);
            }
            else {
                d = date;
            }

            if (d.getFullYear() == 1) {
                return '';
            }
        }
        catch (e) {
            return '';
        }

        var o = {
            "M+": d.getMonth() + 1, //月份         
            "d+": d.getDate(), //日         
            "h+": d.getHours() % 12 == 0 ? 12 : d.getHours() % 12, //小时         
            "H+": d.getHours(), //小时         
            "m+": d.getMinutes(), //分         
            "s+": d.getSeconds(), //秒         
            "q+": Math.floor((d.getMonth() + 3) / 3), //季度         
            "S": d.getMilliseconds() //毫秒         
        };
        var week = {
            "0": "/u65e5",
            "1": "/u4e00",
            "2": "/u4e8c",
            "3": "/u4e09",
            "4": "/u56db",
            "5": "/u4e94",
            "6": "/u516d"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[d.getDay() + ""]);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

    /**
    *  调用任意iframe内的函数（支持跨域 ）
    *  @name    :函数名称
    *  @params  :参数，多个参数使用数组依次传递
    *  @context :上下文，某个iframe的window对象(默认为window.top)
    */
    p.func = function (name, params, context) {
        context = context || window.top;

        //参数移位
        if ($.isWindow(params)) {
            context = params;
            params = null;
        }

        var data = {
            name: name,
            params: params,
            rand: parseInt(new Date())
        };

        data = JSON.stringify(data);

        if (window.postMessage) {
            context.postMessage(data, '*');
        }
        else {
            context.name = data;
        }
    }

    /**
    *  调用任意iframe内的函数（支持跨域 ）
    *  @name    :函数表达式
    *  @context :上下文，某个iframe的window对象(默认为window.top)
    */
    p.eval = function (expression, context) {
        p.func('eval:' + expression, context);
    }

    /**
    *  此函数不应在外部被调用
    */
    p._set_top_url_ = function (url) {
        window.__crossdomain_child_url__ = url;
    }

    /**
    *  获取文档的url，此函数不应在外部被调用
    */
    p._url_ = function () {
        p.eval('p._set_top_url_("' + location.href + '")', window.top);
    }

    /**
    *  此函数不应在外部被调用
    */
    p._dialog = function (opt) {
        var dlg = null,
            template = '<div class="iframe-dialog">{0}</div>';

        if (opt.src) {
            if (opt.single && $('iframe[src^="' + opt.src + '?rand="]').length > 0) {
                return;
            }

            if (opt.src.indexOf('?') > -1) {
                opt.src += '&';
            } else {
                opt.src += '?';
            }

            opt.src += 'rand=' + Date.parse(new Date());

            template = p.format(template, '<iframe id="' + p.guid() + '" src="' + opt.src + '" frameborder="0" scrolling="no" allowtransparency="true" class="dlg-iframe" style="width: 100%; overflow: hidden; height: 0; border: 0;"></iframe>');

        }
        else {
            template = p.format(template, opt.content || '');
        }

        if (opt.max) {
            var win = $(window);
            opt.width = win.width();
            opt.height = win.height();
        }

        dlg = window.top.$(template).dialog(opt);

        if (opt.border === false) {
            dlg.parents('.panel').addClass('panel-noborder');
        }

        if (opt.cls) {
            dlg.parents('.panel').addClass(opt.cls);
        }

        if (opt.src) {
            dlg.find('.dlg-iframe').bind('load', function () {
                var $t = $(this),
                    $parent = $t.parent();

                $t.css('height', $parent.height() - 3);
                $t.css('width', $parent.width() - 0);

                p.eval('$(document.body).prepend(\'<input id="_source_domain_identity_" type="hidden" value="' + opt.source + '" />\')', dlg.context());

                if (opt.oniframeload) {
                    opt.oniframeload(this, dlg);
                }
            });

            /*
            *   获取iframe的contentWindow
            **/
            dlg.context = function () {
                var ifm = $(this).find('.dlg-iframe');
                if (ifm.length > 0) {
                    return ifm.get(0).contentWindow;
                }

                return null;
            }
        }


        return dlg;
    };

    /**
    *  打开一个模态对话框，支持iframe。
    *  @opt：与easyui的dialog参数一致，但增加了src、content两个参数。
    *       新增src属性，使其支持iframe。
    *       新增content属性，使其支持普通文本和html
    *       新增oniframeload事件，当iframe加载完毕后会触发此事件（如果跨域，该事件无效）。
    *       新增id属性，用来标识具体的某个dialog
    *       新增max属性，如果此属性值为true，则对话框将被最大化，width和height属性将失效
    *  @return: easyui的dialog实例对象（如果跨域，该实例无效）。
    */
    p.dialog = function (opt) {
        var ischild = false;

        opt = $.extend(true, {
            title: '窗口',
            width: 1000,
            height: 600,
            closed: false,
            cache: false,
            modal: true,
            id: p.guid,
            closable: true,
            source: location.href //document.URL //记录消息来源，使用URI作为唯一标识符
        }, opt);

        opt.oniframeload = opt.oniframeload || function () { };

        try {
            window.top.document; //如果无法访问最顶层的document，则启用跨域模式
            ischild = window.top !== window;
            opt.crossdomain = false;
        }
        catch (e) {
            opt.crossdomain = true;
        }
        if (opt.crossdomain) {
            p.func('p._dialog', opt, window.top);
            return;
        }
        else if (ischild) {
            return window.top.p._dialog(opt);
        }
        else {
            return p._dialog(opt);
        }
    }


    /*
    *  您不应该在外部直接调用此函数
    */
    p._closedialog = function (opt) {
        var iframe = $('iframe[src="' + opt.url + '"]');
        if (iframe.length == 0) {
            iframe = $('iframe[src="' + opt.origin + opt.url + '"]');
        }
        if (iframe.length == 0) {
            iframe = $('iframe[src="' + opt.origin + opt.url.replace("#", "") + '"]');
        }
        $("iframe").each(function () {
            if (this.src == opt.origin + opt.url.replace("#", "")) {
                iframe = $(this);
            }
        })
        if (opt.call) {
            if (opt.source === window.location.href) {
                p.func(opt.call, opt.args, window);
            }
            else if (opt.isiframe) {
                var srcIframe = $('iframe[src="' + opt.source + '"]');
                if (srcIframe.length > 0) {
                    p.func(opt.call, opt.args, srcIframe[0].contentWindow);
                }
                else {
                    var ifrs = $('iframe'),
                        i = 0,
                        posted = false,
                        retry_count = 0;

                    window.__crossdomain_child_url__ = null;

                    function reset() {
                        retry_count = 0;
                        window.__crossdomain_child_url__ = null;
                        posted = false;
                        i++;
                    }

                    if (ifrs.length > 0) {
                        var timer = setInterval(function () {
                            var o = ifrs[i];
                            if (!posted) {
                                p.eval('p._url_()', o.contentWindow);
                                posted = true;
                            }

                            if (window.__crossdomain_child_url__) {
                                if (opt.source === window.__crossdomain_child_url__) {
                                    p.func(opt.call, opt.args, o.contentWindow);

                                    clearInterval(timer);
                                }
                                else {
                                    reset();
                                }

                                if (i === ifrs.length - 1) {
                                    clearInterval(timer);
                                }
                            }
                            else if (retry_count >= 3) {
                                reset();
                            }
                            else {
                                retry_count++;
                            }
                        }, 0);
                    }
                }
            }
            else {
                p.func(opt.call, opt.args);
            }
        }

        iframe.parents('.iframe-dialog').dialog('close', opt.forceClose);
        iframe.parents('.iframe-dialog').dialog('destroy');
    }

    /*
    *  关闭对话框
    *   @call :对话框关闭时调用的回调函数名称，该函数必须是一个全局函数
    *   @args :回调函数的参数
    *   @forceClose  :对应easyui 的 dialog 函数的 close方法的forceClose参数
    */
    p.closedialog = function (call, args, forceClose) {
        var csossdomain = false,
            opt = {},
            isiframe = true;
        try {
            window.top.document;    //如果无法访问最顶层的document，则启用跨域模式
            csossdomain = false;
            isiframe = parent != window;
        }
        catch (e) {
            csossdomain = true;
        }

        //参数移位
        if (typeof (call) === 'boolean') {
            forceClose = call;
            call = null;
            args = null;
        }

        if (!csossdomain) {
            url = document.URL.replace(window.location.protocol + '//' + window.location.host, '');
        }
        else {
            url = document.URL;
        }
        opt = {
            url: url,
            forceClose: forceClose,
            call: call,
            args: args,
            origin: window.location.protocol + '//' + window.location.host,
            isiframe: isiframe,
            source: $('#_source_domain_identity_').val() // 将消息来源标识符传递回去
        };

        p.func('p._closedialog', opt);
    }

    /**
    *  显示一个登录对话框，提示用户登录
    *  @call    ：回调函数名称，非函数体
    *  @params  :回调函数的参数，字符串形式，不能传递太多
    */
    p.login = function (call, params) {
        call = call || '';
        params = params || '';
        p.dialog({
            single: true,
            noheader: true,
            border: false,
            cls: 'panel-noborder',
            title: '用户登录',
            shadow: false,
            src: location.protocol + '//' + location.host + '/WebSite/Sample/Pages/TimeOutLogin.html?call=' + encodeURI(call) + '&callparams=' + encodeURI(params),
            width: 550,
            height: 350,
            // style:{
            //     "border-radius":"8px",
            //     "height":"550px",
            //     "width":"350px",
            //     "overflow":"hidden",
            // }
        });
    }

    p._mask = function (opt) {
        var html = '';

        if (opt.msg) {
            html = '<div class="mask-content">' + opt.msg + '</div>';
        }
        else {
            html = '<div class="mask-loading">' + '<img src="' + location.protocol + '//' + location.host + '/content/images/progression.gif' + '"/>' + '</div>';
        }

        $('<div class="loadingmask"></div>').dialog({
            noheader: true,
            border: false,
            width: opt.width || 'auto',
            height: opt.height || 'auto',
            closed: false,
            cache: false,
            modal: true,
            shadow: false,
            content: html
        });

        var box = $('div.loadingmask').parents('.panel');
        box.next('.window-mask').addClass('loadingmask-mask');
        box.addClass('loadingmask-box');
        if (opt.isopacity) {
            box.next('.window-mask').addClass('loadingmask-mask-boopacity');
        }
    }

    //打开一个遮罩层
    p.mask = function (msg, width, height, isopacity, istop) {
        if (typeof (istop) === typeof (undefined)) {
            istop = true;
        }

        if (istop) {
            p.func('p._mask', {
                msg: msg,
                width: width,
                height: height,
                isopacity: isopacity
            });
        }
        else {
            p._mask({ msg: msg, width: width, height: height, isopacity: isopacity });
        }
    }

    p._closemask = function () {
        $('div.loadingmask').dialog('close', true);
        $('div.loadingmask').dialog('destroy', true);
    }

    //关闭遮罩层
    p.closemask = function (istop) {
        if (typeof (istop) === typeof (undefined)) {
            istop = true;
        }
        if (istop) {
            p.func('p._closemask');
        }
        else {
            p._closemask();
        }
    }

    /**
    *  打开或关闭加载提示框，该提示框不会弹出到顶层
    *  @method： 操作类型，show=显示，hide=隐藏
    */
    p.loading = function (method) {
        var box = $('.loading-box'),
            w = $(window).width(),
            h = $(window).height();

        if (method === 'show') {
            if (box.length == 0) {
                box = $('<div class="loading-box"><div class="icon"><img src="/Content/Images/progression.gif" style="width:50px;height:50px;" /></div></div>').appendTo('body');
            }

            var icon = box.find('.icon'),
                w2 = (w - icon.width()) / 2,
                h2 = (h - icon.height()) / 2;

            icon.css('left', w2)
                .css('top', h2)

            box.css('width', w)
                .css('height', h)
                .show();
        }
        else if (method === 'hide') {
            box.hide();
        }
    }

    /**
    *  发送ajax请求，所有参数与jquery ajax方法一致
    */
    p.ajax = function (url, opt) {
        //参数移位
        if ($.isPlainObject(url)) {
            opt = url;
        } else {
            opt.url = url;
        }

        //拼接服务的远程域
        opt.url = $.trim(opt.url);
        if (opt.url.indexOf('http://') != 0 && opt.url.indexOf('https://') != 0) {
            opt.url = env.current + opt.url;
        }

        //设置参数默认值
        opt = $.extend(true, {
            type: "POST",
            dataType: 'json'
        }, opt);
        //给参数中增加token
        var data = opt.data || {};
        if (!data.token) {
            var port = location.port;
            if (!port) {
                port = 80;
            }
            //data.token = p.cookie("ticket" + port); //此处应该设置token的值.
            data.token = p.cookie("token"); //此处应该设置token的值.
            if (data.token == null || data.token == "") {
                data.token = ($.getLoginUser() || { Token: $.cookie("token" + (location.port || 80)) || '' }).Token;
            }
        }
        if (!data.opt) {
            data.opt = 0;
        }
        opt.data = data;

        //设置请求成功时的回调处理
        var success = opt.success || function () { };
        opt.success = function (data, textStatus, jqXHR) {
            if (this.dataType.toLowerCase() === 'json') {
                if (data && typeof (data.ErrorCode) != typeof (undefined)) {
                    if (data.ErrorCode == -1) {
                        if (p.AUTO_OPEN_LOGIN_DIALOG) {
                            p.login();
                            //$.psEnv.doReLogin($.psEnv.doLoginSuccess)
                        }
                        return;
                    }
                    else if (data.ErrorCode > 0) {
                        if (data.Msg && typeof ($.messager) !== typeof (undefined)) {
                            $.messager.alert('提示信息', data.Msg);
                        } else {
                            $.messager.alert('提示信息', '操作失败，未知错误！');
                        }
                        return;
                    }
                }

                //if (data && typeof (data.Data) !== typeof (undefined)) {
                //    data = data.Data;
                //}
                if (data && typeof (data) === 'string') {
                    try {
                        var res = JSON.parse(data);
                        data = res;
                    }
                    catch (e) {
                    }
                }
                if (data) {
                    if (data.Data && typeof (data.Data) === 'object') {
                        try {
                            data.Data = JSON.stringify(data.Data);
                        }
                        catch (e) {
                        }
                    }
                }
                if (data && data.length == 1 && data[0] == null) {
                    data = null;
                }
            }
            $.proxy(success, this)(data, textStatus, jqXHR);
        };

        //设置请求失败的回调处理
        var error = opt.error || function () { };
        opt.error = function (XMLHttpRequest, textStatus, errorThrown) {
            debugger;
            var msg = '操作发生未知异常！';
            var flag = true;
            //鉴于公司框架的特殊情况，返回值有可能不是json
            if (textStatus === 'parsererror' && this.dataType === 'json') {
                if (XMLHttpRequest.responseText.indexOf('error_respone') > -1) {
                    var res = JSON.parse(XMLHttpRequest.responseText.replace('error_respone', '"error_respone"'));
                    msg = res.error_respone.Msg;
                }
                else if (XMLHttpRequest.responseText == 'ok') {
                    $.proxy(success, this)(XMLHttpRequest.responseText, textStatus, null);
                    flag = false;
                }
            }

            if (flag) {
                if (typeof ($.messager) !== typeof (undefined)) {
                    $.messager.alert('提示信息', msg);
                }
                $.proxy(error, this)(XMLHttpRequest, textStatus, errorThrown);
            }
        }

        var complete = opt.complete || function () { };

        opt.complete = function (XHR, TS) {
            if (opt.mask) {
                p.closemask();
            }

            $.proxy(complete, this)(XHR, TS);
        };

        if (opt.mask) {
            p.mask(opt.maskmsg);
        }

        $.ajax(opt);

        return p;
    }

    /**
    *  获取或设置cookie
    *  @name:cookie名称
    *  @val:将被设置的值，如果不传入此参数表示获取cookie值
    *  @expries:过期时间
    */
    p.cookie = function (name, val, expries) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

        if (val) {
            //设置cookie
            document.cookie = name + "=" + escape(val) + ";expires=" + expries.toGMTString() + ";path=/";
        }
        else if (val === null) {
            //删除cookie
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = p.cookie(name);
            if (cval != null) {
                document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
            }
        }
        else {
            //获取cookie
            if (arr = document.cookie.match(reg)) {
                return unescape(arr[2]);
            }
        }

        return null;
    }

    /**
    *  发送post请求，所有参数与jquery post方法一致
    */
    p.post = function (url, data, callback, type, mask) {

        //参数移位
        if ($.isFunction(data)) {
            mask = type;
            type = callback;
            callback = data;
            data = null;
        }

        //参数移位
        if (typeof (type) === 'boolean') {
            mask = type;
            type = null;
        }

        var _m = false;

        if (typeof (mask) === 'boolean') {
            _m = mask;
            mask = null;
        }
        else if (typeof (mask) !== typeof (undefined) && mask !== null) {
            _m = true;
            mask = null;
        }
        else if (mask) {
            _m = true;
        }

        return p.ajax(url, {
            data: data,
            success: callback,
            type: 'post',
            dataType: type || 'json',
            mask: _m,
            maskmsg: mask
        });
    }

    /**
    *  发送get请求，所有参数与jquery get方法一致
    */
    p.get = function (url, data, callback, type, mask) {

        //参数移位
        if ($.isFunction(data)) {
            mask = type;
            type = callback;
            callback = data;
            data = null;
        }
        //参数移位
        if (typeof (type) === 'boolean') {
            mask = type;
            type = null;
        }

        var _m = false;

        if (typeof (mask) === 'boolean') {
            _m = mask;
            mask = null;
        }
        else if (typeof (mask) !== typeof (undefined) && mask !== null) {
            _m = true;
            mask = null;
        }
        else if (mask) {
            _m = true;
        }

        return p.ajax(url, {
            data: data,
            success: callback,
            type: 'get',
            dataType: type || 'json',
            mask: _m,
            maskmsg: mask
        });
    }

    /**
    *  绑定表单
    *  @el:表单元素或对应的jquery 选择器
    *  @data:数据
    *  @overwirte:是否用新值覆盖已绑定值的元素
    */
    p.bind = function (el, data, overwrite) {
        el = $(el);
        function setVal(el, val) {
            if (val === '') {
                val = el.attr('default');
            }

            switch (el[0].tagName.toLowerCase()) {
                case 'input':
                case 'select':
                case 'textarea':
                    $(el).val(val);
                    break;
                default:
                    $(el).text(val);
                    break;
            }
        }

        $.each(el.find('[name]'), function (i, item) {
            var me = $(item),
                name = me.attr('name'),
                dformat = me.attr('dformat'), //日期格式化
                decimal = me.attr('decimal'); //小数点位数

            name = name.split('.');

            //保存默认值
            if (me.attr('default') === undefined) {
                me.attr('default', $.trim(me.html()));
            }

            var val = '';

            if (name.length > 0) {
                val = data;
                $.each(name, function (i, property) {
                    if (typeof (val[property]) !== typeof (undefined)) {
                        val = val[property] || '';
                    }
                    else {
                        val = '';
                    }
                });

                if (dformat) {
                    val = p.formatdate(val, dformat);
                }
                if (decimal) {
                    try {
                        var tmp = parseFloat(val),
                            dec = parseInt(decimal);

                        if (!tmp) {
                            tmp = 0;
                        }

                        if (dec === 0) {
                            val = Math.round(tmp);
                        }
                        else {
                            var stp = Math.pow(10, dec);
                            val = Math.round(tmp * stp) / stp;
                        }
                    }
                    catch (e) { }
                }
            }

            setVal(me, val);
        });

        $.each(el.find('[options],[optionskey]'), function (i, item) {
            var me = $(item),
                options = me.attr('optionskey') || me.attr('options');

            var val = [{ data: '' }];

            try {
                val = $.tmpl(options, data);
            }
            catch (e) {
                console.log(e);
            }

            me.attr('optionskey', options);
            me.attr('options', val[0].data);
        });
    }

    /**
    *  保留小数点位
    *  @num:数值
    *  @decimal:小数位
    */
    p.round = function (num, decimal) {
        num = parseFloat(num);

        decimal = decimal || 2;

        if (!num) {
            return 0;
        }

        var digit = Math.pow(10, decimal);

        num = Math.round(num * digit) / digit;

        return num;
    }

    /**
    *  页面跳转
    *  @url：目标地址
    *  @returnurl:下次返回的地址，如果未设置则默认为当前页面
    */
    p.jmp = function (url, returnurl) {
        var returnurl = returnurl || location.href;

        var maxRtnStepCount = 9,
            rtnStack = sessionStorage.getItem('rtn');
        if (!rtnStack) {
            rtnStack = [];
        }
        else {
            rtnStack = JSON.parse(rtnStack);
        }
        if (rtnStack.length == 0 || (rtnStack.length > 0 && rtnStack[rtnStack.length - 1] != returnurl)) {
            rtnStack.push(returnurl);
        }

        if (rtnStack.length > maxRtnStepCount) {
            rtnStack = rtnStack.slice(0, maxRtnStepCount);
        }

        sessionStorage.setItem('rtn', JSON.stringify(rtnStack));

        location.href = url;
    }

    /**
    *  从返回队列中弹出最上面的url，但并不做实际的返回操作（相当于删除一个返回地址）；可以用在不需要返回到栈中的URL，但需要移除该返回地址时。
    *  @url：目标地址
    */
    p.backPop = function () {
        var returnurl = null;

        var rtnStack = sessionStorage.getItem('rtn');
        if (rtnStack) {
            rtnStack = JSON.parse(rtnStack);
        }

        if (rtnStack && rtnStack.length > 0) {
            returnurl = rtnStack.pop();

            sessionStorage.setItem('rtn', JSON.stringify(rtnStack));
        }

        return returnurl;
    }

    /**
    *  返回上一个页面（如果当前页面中包含returnurl参数，则优先使用该参数，否则使用传入的url）
    *  @url：目标地址
    */
    p.back = function (url) {
        var returnurl = p.backPop();

        if (!returnurl) {
            returnurl = url;
        }

        if (returnurl) {
            location.href = returnurl;
        }
    }


    //内网返回
    p.BackToPrev = function (name) {
        var url = document.referrer;
        p.func("backTabPanel", { name: name, tabName: "tabContent", url: url });
    }
    //外网返回
    p.BackToPrevW = function () {
        var url = document.referrer;
        location.href = url;
    }

    /**
    *  将文本转换为显示模式
    */
    p.toview = function (val) {
        val = val || '';

        return val.replace(/\n/g, '<br/>');
    }

    /**
    *  二维码扫描器
    */
    // p.codescanner = (function () {
    //     var isopend = false,
    //         ws = null;

    //     this.send = function (message) {
    //         waitForConnection(function () {
    //             ws.send(message);
    //         }, 1000);
    //     };

    //     function waitForConnection(callback, interval) {
    //         if (ws.readyState === 1) {
    //             callback();
    //         } else {
    //             setTimeout(function () {
    //                 waitForConnection(callback, interval);
    //             }, interval);
    //         }
    //     };

    //     function appendMsg(msg) {

    //     }

    //     function disconnect() {
    //         if (ws) {
    //             ws.close();
    //         }
    //     }

    //     function connect(_call) {
    //         if (isopend) {
    //             return;
    //         }

    //         _call = _call || function () { };

    //         var support = "MozWebSocket" in window ? 'MozWebSocket' : ("WebSocket" in window ? 'WebSocket' : null);

    //         if (support == null) {
    //             appendMsg("您当前的浏览器版本过低，无法支持WebSocket可能部分功能无法正常使用，请升级您的浏览器！");
    //             return;
    //         }
    //         ws = new window[support]('ws://localhost:2012/');

    //         ws.onmessage = function (evt) {
    //             var content = null;
    //             if (evt.data) {
    //                 var codename = 'Barcode ',
    //                     index = evt.data.indexOf(codename) == 0;

    //                 if (index > 0) {
    //                     content = evt.data.substring(codename.length, evt.data.length);
    //                     _call(content);
    //                 }
    //             }
    //         };

    //         ws.onopen = function () {
    //             isopend = true;
    //         };

    //         ws.onclose = function () {
    //             isopend = false;
    //         }

    //         send('SC_OPEN'); //打开扫描枪
    //     }

    //     return function (_call) {
    //         connect(_call);
    //     };
    // }());

    /**
    *  返回
    */
    p.goback = function (url) {
        p.back(url);
    }

    /**
    *  获取URL参数
    */
    p.query = function (key) {
        return $.getUrlParam(key);
    }

    /**
    *  获取系统从运行开始到现在所经过的年份
    *  @isobject: 指示函数返回数字数组还是对象数组。不指定或设为false返回数字数组，否则返回一个对象数组。
    */
    p.get_years = function (isobject, isAll) {
        var years = [],
            nowY = new Date().getFullYear();
        if (isAll) {
            years.push({ year: '全部' });
        }
        for (var i = p.SYS_START_YEAR; i <= nowY; i++) {
            if (isobject === true) {
                years.push({ year: i });
            }
            else {
                years.push(i);
            }
        }

        return years;
    }

    /**
    *  输出日志
    */
    p.log = function (msg) {
        if (typeof (console) !== typeof (undefined)) {
            console.log(msg);
        }
    }

    p.Windows = function (opt) {
        opt = $.extend(true, {
            showName: '',
            isIframe: false,
            iframeName: '',
            url: '',
            title: '模态窗口',
            width: 800,
            height: 600,
            modal: false,
            cache: false,
            closed: true,
            minimizable: true,
            maximizable: true,
            collapsible: false,
            isDrag: true
        }, opt);

        opt.showName = "#" + opt.showName;
        if (opt.isIframe) {
            opt.iframeName = "#" + opt.iframeName;
            $(opt.iframeName).attr("src", opt.url);
        }
        else {
            $(opt.showName).window({ href: opt.url });
        }

        $(opt.showName).window({
            title: opt.title,
            width: opt.width,
            height: opt.height,
            left: ($(document).width() - opt.width) * 0.5,
            top: ($(document).height() - opt.height) * 0.5,
            modal: opt.isModal,
            cache: opt.cache,
            closed: opt.closed,
            minimizable: opt.minimizable,
            maximizable: opt.maximizable,
            collapsible: opt.collapsible,
            onClose: function () {
                $(opt.iframeName).attr("contentDocument", "");
                $(opt.iframeName).attr("document", "");
                $(opt.iframeName).attr("src", "");
            }
        });

        $(opt.showName).show();
        $(opt.showName).window('open');

        if (opt.isDrag) {
            $(opt.showName).draggable();
        } else {
            $(opt.showName).panel();
        }

        return false;
    }

    ///上传文件
    p.uploader = function (opt) {

        var hasError = false;

        //关于此插件的详细文档请参考：http://fex.baidu.com/webuploader/doc/index.html#WebUploader_Uploader_options

        opt = $.extend(true, {
            auto: true,
            picker: "picker",
            multiple: true,
            prepareNextFile: true,
            chunked: true,
            threads: 3,
            fileNumLimit: 50,//上传数量限制
            fileSizeLimit: 2000 * 1024 * 1024,//限制上传所有文件大小
            fileSingleSizeLimit: 200 * 1024 * 1024,//限制上传单个文件大小
            title: '文档或图片',
            extensions: "doc,docx,dwg,pdf,jpg,jpeg,png,exe,mp4,zip,xls,xlsx",
            compress: false,
            //extensions: "*",
            mimeTypes: "*",
            server: env.current + '/UploadFile.axd',
            filesQueued: function () { },
            uploadBeforeSend: function () { },
            uploadStart: function () { },
            uploadProgress: function () { },
            uploadSuccess: function () { },
            uploadError: function () { },
            uploadComplete: function () { },
            uploadFinished: function () { },
            md5Progress: function () { }, //MD5计算中
            md5Complete: function () { }, //md5计算完毕
            fileQueuedAndMd5Finished: function () { },//文件加入队列,且MD5计算完毕时触发,返回false则取消上传并移除队列
            data: null //将作为所有函数的参数原样传回
        }, opt);

        var uploader = WebUploader.create({
            auto: false,
            swf: env.current + '/Content/JavaScript/uploader/Uploader.swf',
            server: opt.server,
            pick: {
                id: opt.picker,
                multiple: opt.multiple
            },
            accept: {
                title: opt.title,
                extensions: opt.extensions,
                mimeTypes: opt.mimeTypes
            },
            compress: opt.compress,
            prepareNextFile: opt.prepareNextFile,
            chunked: opt.chunked,
            threads: opt.threads,
            duplicate: opt.duplicate,
            runtimeOrder: p.UPLOAD_RUNTIME_ORDER,
            fileNumLimit: opt.fileNumLimit,
            fileSizeLimit: opt.fileSizeLimit,
            fileSingleSizeLimit: opt.fileSingleSizeLimit,
        });

        var files = [],
            addOrModifyFile = function (file) {
                var flag = true;
                $.each(files, function (i, o) {
                    if (o.id == file.id) {
                        files[i] = file;
                        flag = false;
                    }

                    return flag;
                });

                if (flag) {
                    files.push(file);
                }
            },
            removeFile = function (id) {
                $.map(files, function (o) {
                    if (o.id == id) {
                        return null;
                    }

                    return o
                });
            },
            getFile = function (id) {
                var file = null;
                $.each(files, function (i, o) {
                    if (o.id == id) {
                        file = o;
                        return false;
                    }
                });

                return file;
            };

        uploader.on('filesQueued', function (files) {
            if (hasError) {
                hasError = false;
                return;
            }
            opt.filesQueued(uploader, files, opt.data);
            $.each(files, function (i, file) {
                uploader.md5File(file)
                    .progress(function (percentage) {
                        percentage = (percentage * 100).toFixed(2);

                        opt.md5Progress(uploader, file, percentage, opt.data);
                    })
                    .then(function (val) {
                        file.md5 = val;
                        if (opt.fileQueuedAndMd5Finished && opt.fileQueuedAndMd5Finished(uploader, file, opt.data) === false) {
                            uploader.removeFile(file);
                            return;
                        }
                        $.ajax({
                            type: 'POST',
                            url: opt.server,
                            data: { checkSame: "check", md5: val },
                            success: function (data) {
                                if (!data) {
                                    return;
                                }

                                if (data.state == 0 && opt.auto) {
                                    uploader.upload(file);
                                } else if (data.state == 1 && opt.auto) {
                                    uploader.upload(file);
                                } else if (data.state == 2) {
                                    file.guid = data.guid;
                                    file.md5 = file.md5 ? file.md5 : data.md5;
                                    file.fileName = file.fileName ? file.fileName : data.fileName;
                                    addOrModifyFile(file);

                                    opt.uploadSuccess(uploader, file, opt.data);
                                }

                                file.md5 = val;
                                addOrModifyFile(file);
                            },
                            complete: function () {
                                opt.md5Complete(uploader, file, val, opt.data);
                            },
                            dataType: "json"
                        });
                    });
            });
        });

        uploader.on('uploadBeforeSend', function (obj, data, headers) {
            var md5 = null;
            $.each(files, function (i, o) {
                if (o.id == obj.file.id) {
                    md5 = o.md5;
                    return false;
                }
            });

            var file = getFile(obj.file.id);
            if (null == file) {
                return false;
            }

            data.md5 = file.md5;
            data.ChunkSize = 5242880;

            opt.uploadBeforeSend(uploader, obj, data, headers, opt.data);
        });

        uploader.on("uploadStart", function (file) {
            opt.uploadStart(uploader, file, opt.data);
        });

        uploader.on('uploadProgress', function (file, percentage) {
            percentage = (percentage * 100).toFixed(2);
            opt.uploadProgress(uploader, file, percentage, opt.data);
        });

        uploader.on('uploadSuccess', function (file, response) {
            file.guid = response.guid;

            addOrModifyFile(file);

            opt.uploadSuccess(uploader, file, opt.data);
        });

        uploader.on('uploadError', function (file) {
            opt.uploadError(uploader, file, opt.data);
        });

        uploader.on('uploadComplete', function (file) {
            opt.uploadComplete(uploader, file, opt.data);
        });

        uploader.on("uploadFinished", function () {
            opt.uploadFinished(uploader, opt.data);
        });

        uploader.on("error", function (type) {
            switch (type) {
                case 'Q_EXCEED_NUM_LIMIT':
                    $.messager.alert('提示', '文件数量不能超过' + opt.fileNumLimit + '个。');
                    break;
                case 'Q_EXCEED_SIZE_LIMIT':
                    $.messager.alert('提示', '文件总大小不能超过' + (opt.fileSizeLimit / (1024 * 1024)) + 'MB。');
                    break;
                case 'F_EXCEED_SIZE':
                    $.messager.alert('提示', '文件大小不能超过' + (opt.fileSingleSizeLimit / (1024 * 1024)) + 'MB。');
                    break;
                case 'Q_TYPE_DENIED':
                    var msg = '文件格式不正确';
                    if (opt.extensions) {
                        msg += ',仅允许上传文件格式为：' + opt.extensions + '的文件';
                    }
                    msg += '.'

                    $.messager.alert('提示', msg);
                    break;
            }

            hasError = true;
        });

        return uploader;
    }

    p._setPanelTitle = function (title) {
        var tab = $("#tabContent"),
            panel = tab.tabs('getSelected');

        if (panel) {
            panel.panel('setTitle', title);
            panel.panel('options').tab.find("span.tabs-title").html(title);
        }
    };

    //修改tab的标题，只适用于内网
    p.setPanelTitle = function (title) {
        p.eval('p._setPanelTitle("' + title + '")');
    }

    Array.prototype.remove = function (dx) {
        if (isNaN(dx) || dx > this.length) { return false; }
        for (var i = 0, n = 0; i < this.length; i++) {
            if (this[i] != this[dx]) {
                this[n++] = this[i]
            }
        }
        this.length -= 1
    }

    /**
    * 信息显示页面数据绑定
    * parentId：父容器ID
    * attrName：标签属性
    * data：json数据对象
    */
    p.bindViewData = function (parentId, attrName, data) {
        $("#" + parentId + " *[" + attrName + "]").each(function () {
            var content = data[$(this).attr(attrName)];

            if (content != null && typeof (content) != "undefined" && content != "0001-1-1")
                $(this).text(content);
        });
    };

    /**
    * 信息显示页面数据绑定
    * parentId：父容器ID
    * attrName：标签属性
    * data：json数据对象
    */
    p.bindViewDataByName = function (parentId, attrName, data) {
        var objCache = {};
        $(typeof (parentId) == 'string' ? ("#" + parentId) : parentId).find("*[" + attrName + "]").each(function () {
            var thisObj = $(this);
            var attrValue = thisObj.attr(attrName);
            attrValue = attrValue.split(',')[0];//只取逗号之前的值
            var isCache = thisObj.attr("cacheObj");
            var tmpData = data;

            var dotIdx = attrValue.lastIndexOf('.');
            if (dotIdx > 0) { //链式取值
                var preLongStr = attrValue.substr(0, dotIdx);
                if (typeof (objCache[preLongStr]) == 'undefined') { //缓存链式属性指向对象
                    var spArr = attrValue.split('.');
                    spArr.splice(-1);
                    $.each(spArr, function (i, item) {//开始步进取值
                        if (typeof (tmpData) == 'undefined' || tmpData === null)
                            return false;
                        var fieldName = item;
                        var charIdx = item.indexOf('[');
                        if (charIdx > 0 && item[item.length - 1] == ']') {//数组筛选
                            fieldName = item.substr(0, charIdx);
                            tmpData = tmpData[fieldName];
                            if (typeof (tmpData) == 'undefined' || tmpData === null)
                                return false;
                            var expStr = item.substr(charIdx + 1, item.length - charIdx - 2);
                            if ($.isNumeric(expStr)) {
                                tmpData = tmpData[expStr];
                            }
                            else {
                                expStrArr = expStr.split('=');//暂仅支持=表达式筛选
                                var filterVal = null;
                                $.each(tmpData, function (j, jItem) {//筛选满足条件的值
                                    if (jItem[expStrArr[0]] == expStrArr[1]) {
                                        filterVal = jItem;
                                        return false;
                                    }
                                });
                                tmpData = filterVal;
                                if (!tmpData) //未找到对应值跳出取值
                                    return false;
                            }
                        }
                        else {
                            tmpData = tmpData[fieldName];
                        }
                    });
                    objCache[spArr.join('.')] = tmpData;
                }
                tmpData = objCache[preLongStr];
            }
            if (isCache)
                thisObj.data("cacheObj", tmpData || null);

            var targetVal = (tmpData || {})[dotIdx > 0 ? attrValue.substr(dotIdx + 1) : attrValue];
            if (targetVal != null && typeof (targetVal) != "undefined" && targetVal != "0001-01-01T00:00:00") {
                var dtFmt = thisObj.attr('dateformat');
                if (dtFmt)
                    targetVal = new Date(targetVal).Format(dtFmt);
                if (thisObj.is(".combobox-f")) {
                    var cbOpt = thisObj.combobox("options");
                    thisObj.combobox(cbOpt.multiple ? "setValues" : "select", targetVal);
                }
                else if (thisObj.is(".textbox-f"))
                    thisObj.textbox("setValue", targetVal);
                else if (thisObj.is(":input"))
                    thisObj.val(targetVal);
                else
                    thisObj.text(targetVal);
            }
        });
    };

    /*
    * 格式化日期，返回Date类型的数据
    */
    p.formatDate = function (strDate) {
        return strDate == "" ? null : strDate == "1/1/1" ? null : new Date(strDatete);
    }

    /*
    * MD5加密
    */
    p.MD5 = function (sMessage) {
        sMessage = "P%y2K&ja" + sMessage;
        function RotateLeft(lValue, iShiftBits) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); }
        function AddUnsigned(lX, lY) {
            var lX4, lY4, lX8, lY8, lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            if (lX4 | lY4) {
                if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            } else return (lResult ^ lX8 ^ lY8);
        }
        function F(x, y, z) { return (x & y) | ((~x) & z); }
        function G(x, y, z) { return (x & z) | (y & (~z)); }
        function H(x, y, z) { return (x ^ y ^ z); }
        function I(x, y, z) { return (y ^ (x | (~z))); }
        function FF(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        }
        function GG(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        }
        function HH(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        }
        function II(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        }
        function ConvertToWordArray(sMessage) {
            var lWordCount;
            var lMessageLength = sMessage.length;
            var lNumberOfWords_temp1 = lMessageLength + 8;
            var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
            var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
            var lWordArray = Array(lNumberOfWords - 1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (sMessage.charCodeAt(lByteCount) << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        }
        function WordToHex(lValue) {
            var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                WordToHexValue_temp = "0" + lByte.toString(16);
                WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
            }
            return WordToHexValue;
        }
        var x = Array();
        var k, AA, BB, CC, DD, a, b, c, d
        var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
        var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
        var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
        var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
        // Steps 1 and 2. Append padding bits and length and convert to words
        x = ConvertToWordArray(sMessage);
        // Step 3. Initialise
        a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
        // Step 4. Process the message in 16-word blocks
        for (k = 0; k < x.length; k += 16) {
            AA = a; BB = b; CC = c; DD = d;
            a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = AddUnsigned(a, AA); b = AddUnsigned(b, BB); c = AddUnsigned(c, CC); d = AddUnsigned(d, DD);
        }
        // Step 5. Output the 128 bit digest
        var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
        return temp.toLowerCase();
    };

    p.bindLink = function (obj, url, name) {
        var linkBtn = $("#" + obj);
        linkBtn.attr("href", "#");
        linkBtn.attr("onclick", "parent.openTabEx('" + name + "','" + url + "','tabContent',true);");
        linkBtn.text(name);
    };

    //重写tab的页面重置
    p.ResetSelfTab = function (tabsId, title, url) {
        var tab, tabs;
        tabs = $("#" + tabsId);
        if (tabs.length > 0) {
            tab = tabs.tabsexSelf('getSelected');
        }

        if (tab == null || tab == "undefined") {
            tabs = parent.$("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabsexSelf('getSelected');
            }
        }

        var pp = tab.panel("options");
        if (url.indexOf('?') != -1) {
            url = url + "&title=" + escape(pp.title);
        } else {
            url = url + "?title=" + escape(pp.title);
        }
        var href = pp.href;

        url = url + "&href=" + escape(href);
        tab.panel('options').href = url;
        tab.panel('options').title = title;
        tab.panel('refresh');

    };

    //返回时重置
    p.backTabSelfPanel = function (tabsId, title, url) {
        var tab, tabs;
        if (parent.window == window) {
            tabs = $("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabsexSelf('getSelected');
            }
        } else {
            tabs = parent.$("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabsexSelf('getSelected');
            }
        }
        var pp = tab.panel("options");
        var href = pp.href;
        //if (href == null) {
        //    var content = $(pp).attr("content");
        //    tabs.tabsexSelf('update', { tab: tab, options: { title: title, content: $(content).attr("src", url) } });
        //} else {
        //    tabs.tabsexSelf('update', { tab: tab, options: { title: title, href: url } });
        //}

        //url = url + "&href=" + escape(href);
        //tab.panel('options').href = url;
        //tab.panel('options').title = title;
        //tab.panel('refresh');

    };

    /**
    * 重置table面板
    * tabsId：table面板容器ID
    * title：新的标题
    * url：新页面地址链接
    */
    p.resetPanel = function (tabsId, title, url) {
        var tab, tabs;
        if (parent.window == window) {
            tabs = $("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabs('getSelected');
            }
        } else {
            tabs = parent.$("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabs('getSelected');
            }
        }
        var pp = tab.panel("options");
        if (url.indexOf('?') != -1) {
            if (url.indexOf('title') == -1) {
                url = url + "&title=" + escape(pp.title);
            }
        } else {
            if (url.indexOf('title') == -1) {
                url = url + "?title=" + escape(pp.title);
            }
        }

        var href = pp.href;
        if (href == null) {
            var content = $(pp).attr("content");
            href = $(content).attr("src");
            var height = tabs.parent().height() - 35;

            if (href) {
                if (href.indexOf("href") == -1) {
                    url = url + "&href=" + escape(href);
                }
            }

            tabs.tabs('update', { tab: tab, options: { title: title, content: $(content).attr("src", url) } });
        } else {
            if (href.indexOf("href") == -1) {
                url = url + "&href=" + escape(href);
            }
            tabs.tabs('update', { tab: tab, options: { title: title, href: url } });
        }
    };
    //关闭当前选项卡，并切换到上一个选项卡
    //tabsId：table面板容器ID
    //上一个选项卡索引
    p.closePanel = function (tabsId, index) {
        var tab, tabs;
        if (parent.window == window) {
            tabs = $("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabs('getSelected');
            }
        } else {
            tabs = parent.$("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabs('getSelected');
            }
        }
        var _index = tabs.tabs('getTabIndex', tab);
        tabs.tabs("close", _index);
        if (index) {
            tabs.tabs("select", Number(index));
        }
        else {
            tabs.tabs("select", _index);
        }
    }

    //返回面板属性
    p.getTabsOptions = function (tabsId) {
        var tab, tabs;
        if (parent.window == window) {
            tabs = $("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabs('getSelected');
            }
        } else {
            tabs = parent.$("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabs('getSelected');
            }
        }
        var options = tabs.tabs('options');
        return options;
    }

    //返回时重置
    p.backTabPanel = function (tabsId, title, url) {
        var tab, tabs;
        if (parent.window == window) {
            tabs = $("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabs('getSelected');
            }
        } else {
            tabs = parent.$("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabs('getSelected');
            }
        }
        var pp = tab.panel("options");
        var href = pp.href;
        if (href == null) {
            var content = $(pp).attr("content");
            tabs.tabs('update', { tab: tab, options: { title: title, content: $(content).attr("src", url) } });
        } else {
            tabs.tabs('update', { tab: tab, options: { title: title, href: url } });
        }
    };

    /**
   * 重置table面板
   * tabsId：table面板容器ID
   * title：新的标题
   * url：新页面地址链接
   */
    p.resetTabExPanel = function (tabsId, title, url) {
        var tab, tabs;
        if (parent.window == window) {
            tabs = $("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabsex('getSelected');
            }
        } else {
            tabs = parent.$("#" + tabsId);
            if (tabs.length > 0) {
                tab = tabs.tabsex('getSelected');
            }
        }
        var pp = tab.panel("options");
        var content = $(pp).attr("content");
        tabs.tabsex('update', { tab: tab, options: { title: title, content: $(content).attr("src", url) } });
    };

    //扩展多选下拉框，带chekbox
    p.Comboex = function (opt) {
        opt = $.extend(true, {
            container: "",
            separator: '、',
            url: '/Service/ConfigMgeSvr.assx/GetSiteConfig',
            configName: "",
            isAll: "",
            panelHeight: 'auto',
            multiple: false,
            editable: false,
            required: false,
            callback: function () { },
            onUnselect: function () { },
            onLoadSuccess: function () { }
        }, opt);
        var combo = $("#" + opt.container).comboex({
            url: opt.url,
            separator: opt.separator,
            queryParams: {
                configName: opt.configName,
                isAll: opt.isAll
            },
            valueField: 'value',
            textField: 'text',
            panelHeight: opt.panelHeight,
            editable: opt.editable,
            required: opt.required,
            onSelect: opt.callback,
            onUnselect: opt.onUnselect,
            multiple: opt.multiple,
            onLoadSuccess: opt.onLoadSuccess
        });
        return combo;
    };

    p.Combobox = function (opt) {
        opt = $.extend(true, {
            container: "",
            url: '/Service/ConfigMgeSvr.assx/GetSiteConfig',
            configName: "",
            isAll: "",
            panelHeight: 'auto',
            multiple: false,
            editable: false,
            disabled: false,
            valueField: 'value',
            textField: 'text',
            callback: function () { },
            onChange: function () { },
            onLoadSuccess: function () { }
        }, opt);
        var combo = $("#" + opt.container).combobox({
            data: opt.data,
            valueField: opt.valueField,
            textField: opt.textField,
            panelHeight: opt.panelHeight,
            editable: opt.editable,
            disabled: opt.disabled,
            onSelect: opt.callback,
            multiple: opt.multiple,
            onChange: opt.onChange,
            onLoadSuccess: opt.onLoadSuccess
        });
        if (!opt.data)
            p.get(opt.url, { configName: opt.configName, isAll: opt.isAll }, function (data) {
                combo.combobox('loadData', data);
            });
        return combo;
    };

    p.GetConfigData = function (opt) {
        opt = $.extend(true, {
            url: '/Service/ConfigMgeSvr.assx/GetSiteConfig',
            configName: "",
            isAll: "",
            LoadSuccess: function () { }
        }, opt);
        p.get(opt.url, { configName: opt.configName, isAll: opt.isAll }, opt.LoadSuccess);
    }

    p.ComboboxCompanyType = function (opt) {
        opt = $.extend(true, {
            container: "",
            url: '/Service/ConfigMgeSvr.assx/GetCompanyCert',
            Name: '',
            isAll: null,
            child: false,
            panelHeight: 'auto',
            multiple: false,
            editable: false,
            callback: function () { },
            onLoadSuccess: function () { }
        }, opt);
        var combo = $("#" + opt.container).combobox({
            valueField: 'value',
            textField: 'text',
            panelHeight: opt.panelHeight,
            editable: opt.editable,
            onSelect: opt.callback,
            multiple: opt.multiple,
            onLoadSuccess: opt.onLoadSuccess
        });
        p.get(opt.url, { name: opt.Name, child: opt.child }, function (data) {

            if (opt.isAll) {
                var item = { text: opt.isAll, value: '' };
                data.splice(0, 0, item);
            }

            combo.combobox('loadData', data);
        });
        return combo;
    };

    p.ComboboxIntegrityCompanyType = function (opt) {
        opt = $.extend(true, {
            container: "",
            url: '/Service/ConfigMgeSvr.assx/GetIntegrityCompanyCert',
            Name: '',
            isAll: null,
            child: false,
            panelHeight: 'auto',
            multiple: false,
            editable: false,
            callback: function () { },
            onLoadSuccess: function () { }
        }, opt);
        var combo = $("#" + opt.container).combobox({
            valueField: 'value',
            textField: 'text',
            panelHeight: opt.panelHeight,
            editable: opt.editable,
            onSelect: opt.callback,
            multiple: opt.multiple,
            onLoadSuccess: opt.onLoadSuccess
        });
        p.get(opt.url, { name: opt.Name, child: opt.child }, function (data) {

            if (opt.isAll) {
                var item = { text: opt.isAll, value: '' };
                data.splice(0, 0, item);
            }

            combo.combobox('loadData', data);
        });
        return combo;
    };

    p.ComboboxDefault = function (opt) {
        opt = $.extend(true, {
            container: "",
            url: '/Service/ConfigMgeSvr.assx/GetSiteConfig',
            configName: "",
            isAll: "",
            editable: true,
            callback: function () { },
            onLoadSuccess: function () { }
        }, opt);

        p.get(opt.url, { configName: opt.configName, isAll: opt.isAll }, function (data) {
            $("#" + opt.container).combobox({
                data: data,
                valueField: 'value',
                textField: 'text',
                panelHeight: 'auto',
                editable: opt.editable,
                onSelect: opt.callback,
                onLoadSuccess: function () {
                    if (data._Items) {
                        $("#" + opt.container).combobox('setValue', data._Items[0].Value);
                    }
                }
            });
        });
    };

    p.ComboboxObj = function (opt) {
        opt = $.extend(true, {
            container: null,
            url: '/Service/ConfigMgeSvr.assx/GetSiteConfig',
            configName: "",
            isAll: "",
            editable: true,
            callback: function () { },
            onLoadSuccess: function () { }
        }, opt);

        p.get(opt.url, { configName: opt.configName, isAll: opt.isAll }, function (data) {
            $(opt.container).combobox({
                data: data,
                valueField: 'value',
                textField: 'text',
                panelHeight: 'auto',
                editable: opt.editable,
                onSelect: opt.callback,
                onLoadSuccess: function () {
                    if (data._Items) {
                        $("#" + opt.container).combobox('setValue', data._Items[0].Value);
                    }
                }
            });
        });
    };

    p.ComboboxEx = function (opt) {
        opt = $.extend(true, {
            container: "",
            url: "",
            data: {},
            callback: function () { }
        }, opt);

        p.get(opt.url, opt.data, function (data) {
            $("#" + opt.container).combobox({
                data: data._Items,
                valueField: 'Value',
                textField: 'Name',
                panelHeight: 'auto',
                onSelect: opt.callback,
                onLoadSuccess: function () {
                    if (data._Items) {
                        $("#" + opt.container).combobox('setValue', data._Items[0].Value);
                    }
                }
            });
        });
    };

    p.Autocomplete = function (opt) {
        opt = $.extend(true, {
            container: "",
            url: '/Service/CompanyInfoWebSvr.assx/AutoCompanyInfoList',
            width: 200,
            max: 15,
            highlight: false,
            scroll: true,
            scrollHeight: 300,
            extraParams: {},
            formatItem: function () { },
            formatResult: function () { }
        }, opt);

        var Pautocomplete = $("#" + opt.container).autocomplete(opt.url, {
            extraParams: opt.extraParams,
            width: opt.width,
            max: opt.max,
            highlight: opt.highlight,
            scroll: opt.scroll,
            scrollHeight: opt.scrollHeight,
            formatItem: opt.formatItem
        }).result(function (e, item) {
            if (typeof (formatResult) != typeof (undefined)) {
                formatResult(item);
            }
        });

        return Pautocomplete;
    };

    p.AutocompleteObj = function (opt) {
        opt = $.extend(true, {
            container: "",
            url: '/Service/CompanyInfoWebSvr.assx/AutoCompanyInfoList',
            width: 200,
            max: 15,
            highlight: false,
            scroll: true,
            scrollHeight: 300,
            extraParams: {},
            formatItem: function () { },
            formatResult: function () { }
        }, opt);

        var Pautocomplete = $(opt.container).autocomplete(opt.url, {
            extraParams: opt.extraParams,
            width: opt.width,
            max: opt.max,
            highlight: opt.highlight,
            scroll: opt.scroll,
            scrollHeight: opt.scrollHeight,
            formatItem: opt.formatItem
        }).result(function (e, item) {
            if (typeof (formatResult) != typeof (undefined)) {
                formatResult(item);
            }
        });

        return Pautocomplete;
    };

    p.AutocompleteLib = function (opt) {
        opt = $.extend(true, {
            container: "",
            url: '/Service/BaseLibraryWebSvr.assx/AutoBaseLibInfoList',
            width: 200,
            max: 15,
            highlight: false,
            scroll: true,
            scrollHeight: 500,
            extraParams: {},
            formatItem: function () { },
            formatResult: function () { }
        }, opt);

        var options = {
            extraParams: opt.extraParams,
            width: opt.width,
            max: opt.max,
            highlight: opt.highlight,
            scroll: opt.scroll,
            scrollHeight: opt.scrollHeight,
            formatItem: opt.formatItem
        };
        var Pautocomplete = $("#" + opt.container).autocomplete(
            opt.url,
            options).result(function (e, item) {
                if (typeof (formatResult) != typeof (undefined)) {
                    formatResult(item);
                }
            });

        return Pautocomplete;
    };

    p.AutocompleteLibObj = function (opt) {
        opt = $.extend(true, {
            container: "",
            url: '/Service/BaseLibraryWebSvr.assx/AutoBaseLibInfoList',
            width: 200,
            max: 15,
            highlight: false,
            scroll: true,
            scrollHeight: 300,
            extraParams: {},
            formatItem: function () { },
            formatResult: function () { }
        }, opt);

        var Pautocomplete = $(opt.container).autocomplete(opt.url, {
            extraParams: opt.extraParams,
            width: opt.width,
            max: opt.max,
            highlight: opt.highlight,
            scroll: opt.scroll,
            scrollHeight: opt.scrollHeight,
            formatItem: opt.formatItem
        }).result(function (e, item) {
            if (typeof (formatResult) != typeof (undefined)) {
                formatResult(item);
            }
        });

        return Pautocomplete;
    };


    //房产开发管理系统使用
    p.AutocompleteFc = function (opt) {
        opt = $.extend(true, {
            container: "",
            url: '/Service/RealEstateCreditInfoWebSvr.assx/AutoEnterpriseList',
            width: 200,
            max: 15,
            highlight: false,
            scroll: true,
            scrollHeight: 500,
            extraParams: {},
            formatItem: function () { },
            formatResult: function () { }
        }, opt);

        var options = {
            extraParams: opt.extraParams,
            width: opt.width,
            max: opt.max,
            highlight: opt.highlight,
            scroll: opt.scroll,
            scrollHeight: opt.scrollHeight,
            formatItem: opt.formatItem
        };
        var Pautocomplete = $("#" + opt.container).autocomplete(
            opt.url,
            options).result(function (e, item) {
                if (typeof (formatResult) != typeof (undefined)) {
                    formatResult(item);
                }
            });

        return Pautocomplete;
    };

    p.trim = function (str) { //删除左右两端的空格
        if (str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }
        else {
            return str;
        }
    }
    p.ltrim = function (str) { //删除左边的空格
        if (str) {
            return str.replace(/(^\s*)/g, "");
        }
        else {
            return str;
        }
    }
    p.rtrim = function (str) { //删除右边的空格
        if (str) {
            return str.replace(/(\s*$)/g, "");
        }
        else {
            return str;
        }
    }

    ///只能输入数字且可以设置最大长度
    p.InputNum = function (opt) {
        opt = $.extend(true, {
            container: "",
            isObj: false,
            max: 20
        }, opt);

        if (!opt.isObj) {
            opt.container = "#" + opt.container;
        }

        $(opt.container).bind('keyup', function (e) {
            $(opt.container).val($(this).val().replace(/\D/g, ''));

            if ($(this).val().length > opt.max) {
                $(opt.container).val($(this).val().substring(0, opt.max));
            }
        });
    }
    p.InvalidType = {
        mobile: "手机号码",
        email: "电话号码"
    }
    //单独验证用户输入的格式
    p.InvalidHandle = function (value, type) {
        var result = false;
        if (value != null && typeof (value) != typeof (undefined)) {
            switch (type) {
                case p.InvalidType.mobile:
                    result = /^(13|14|15|18|19)\d{9}$/i.test(value);
                    break;
                case p.InvalidType.email:
                    result = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(value);
                    break;
            }
            return result;
        }
    }

    p.InitFloatMenu = function (opt) {
        opt = $.extend(true, {
            classContainer: "FloatMenu_Left",
            container: "float_menu_content",
            selectedClass: "float_menu_content_selected",
            titleClass: "menuContainerTitle",
            top: 140,
            topHeight: 164,
            calcHeight: true,
            calcTop: true,
            click: function () { }
        }, opt);

        if (opt.calcHeight) {
            $("." + opt.classContainer).height($(document).height() - opt.topHeight);
        }
        if (opt.calcTop) {
            if (opt.FloatMenu_Left) {
                $("." + opt.FloatMenu_Left).css("top", top + "px");
            }
        }

        //左右漂浮菜单
        $("." + opt.container + " li").click(function (e) {
            $(this).siblings().removeClass(opt.selectedClass);
            if (!$(this).hasClass(opt.selectedClass)) {
                $(this).addClass(opt.selectedClass);
                opt.click(this);
            }
        });
    }

    //页面滚动时，在顶部定位页面标题
    //pcorId：停靠容器的选择器
    //title_Fixed_Id：显示的元素id
    //title_Id：要替换的元素id
    //调用：p.positionTitle(".container-middle", "div_title_Fixed", "div_title");
    p.positionTitle = function (pcorId, title_Fixed_Id, title_Id) {
        var dtf = $("#" + title_Fixed_Id);
        var dt = $("#" + title_Id);
        $(pcorId).scroll(function () {
            var scrollTop = $(this)[0].scrollTop;
            var dtTop = dt.offset().top;
            if (scrollTop > dtTop) {
                dtf.show();
            } else {
                dtf.hide();
            }
        });
    }

    //经度纬度范围计算
    //raidus 单位米
    p.CalcLatLon = function (lat, lon, raidus) {

        var PI = 3.14159265;

        var latitude = lat;
        var longitude = lon;

        var degree = (24901 * 1609) / 360.0;
        var raidusMile = raidus;

        var dpmLat = 1 / degree;
        var radiusLat = dpmLat * raidusMile;
        var minLat = latitude - radiusLat;
        var maxLat = latitude + radiusLat;

        var mpdLng = degree * Math.cos(latitude * (PI / 180));
        var dpmLng = 1 / mpdLng;
        var radiusLng = dpmLng * raidusMile;
        var minLng = longitude - radiusLng;
        var maxLng = longitude + radiusLng;
        var obj = {
            minLat: minLat,
            minLng: minLng,
            maxLat: maxLat,
            maxLng: maxLng
        }
        return obj;
    }

    //重新计算操作列的位置
    p.CalMenuPosition = function () {
        var footerBottom = ($(".footer").position() || {}).top;
        if (typeof (footerBottom) != typeof (undefined)) {
            if (($(".FloatMenu_Bottom").position().top - 40) > footerBottom) {
                $(".FloatMenu_Bottom").css("bottom", "0px");

                if (($(".FloatMenu_Bottom").position().top - 40) < footerBottom) {
                    $(".FloatMenu_Bottom").css("bottom", "30px");
                }
            }
            else {
                $(".FloatMenu_Bottom").css("bottom", "30px");

                if (($(".FloatMenu_Bottom").position().top - 40) > footerBottom) {
                    $(".FloatMenu_Bottom").css("bottom", "0px");
                }
            }
        }
    }

    //重新计算操作列的位置
    p.CalMenuPositionEx = function () {
        var footerBottom = ($(".footer").position() || {}).top;
        if (typeof (footerBottom) != typeof (undefined)) {
            if ((footerBottom - 40) > $(".FloatMenu_Bottom").position().top) {
                $(".FloatMenu_Bottom").css("bottom", "0px");
            }
            else if (($(".FloatMenu_Bottom").position().top - 40) > footerBottom) {
                $(".FloatMenu_Bottom").css("bottom", "0px");
                if (($(".FloatMenu_Bottom").position().top - 40) < footerBottom) {
                    $(".FloatMenu_Bottom").css("bottom", "30px");
                }
            } else {
                $(".FloatMenu_Bottom").css("bottom", "30px");

                if (($(".FloatMenu_Bottom").position().top - 40) > footerBottom) {
                    $(".FloatMenu_Bottom").css("bottom", "0px");
                }
            }
        }
    }

    //折叠/展开div容器
    //@btn:触发事件的标签
    //@div:需要折叠或展开的div容器
    //调用：p.setSlideToggle('#btn','#div');
    p.setSlideToggle = function (btn, div) {
        $(btn).click(function () {
            if ($(this).attr("class").indexOf("l-btn-slide-up") != -1)
                $(this).removeClass("l-btn-slide-up").addClass("l-btn-slide-down");
            else
                $(this).removeClass("l-btn-slide-down").addClass("l-btn-slide-up");
            $(div).slideToggle("slow");
        });
    }

    //检测是否插了加密锁
    p.checkIsLock = function () {
        var FTCtrl;
        var browserName = navigator.appName;
        var browserNum = parseInt(navigator.appVersion);

        try {
            if ((browserName == "Microsoft Internet Explorer") && (browserNum >= 4) || (navigator.userAgent.indexOf("Trident") >= 0))
                FTCtrl = document.getElementById("USBKeyMGR");
            else
                FTCtrl = document.getElementById("npFTUSBKeyMGR");
        } catch (ex) {
            return false;
        }

        try {
            FTCtrl.SetCSPName("EnterSafe ePass2001 CSP v1.0");
        }
        catch (e) {
            return false;
        }

        var serNum = "";
        try {
            serNum = FTCtrl.EnumUSBKeySerialNumber();
            serNum = eval(serNum);
            if (!serNum || serNum.length == 0) {
                return false;
            }
        }
        catch (e) {
            return false;
        }

        return true;
    }

    //插了锁|并获取锁用户信息是否和当前用户信息一致
    p.GetLockCert = function () {
        var FTCtrl;
        var browserName = navigator.appName;
        var browserNum = parseInt(navigator.appVersion);

        try {
            if ((browserName == "Microsoft Internet Explorer") && (browserNum >= 4) || (navigator.userAgent.indexOf("Trident") >= 0))
                FTCtrl = document.getElementById("USBKeyMGR");
            else
                FTCtrl = document.getElementById("npFTUSBKeyMGR");
        } catch (ex) {
            return;
        }

        try {
            FTCtrl.SetCSPName("EnterSafe ePass2001 CSP v1.0");
        }
        catch (e) {
            return;
        }

        var serNum = "";
        try {
            serNum = FTCtrl.EnumUSBKeySerialNumber();
            serNum = eval(serNum);
            if (!serNum || serNum.length == 0) {
                return;
            }
        }
        catch (e) {
            return;
        }

        //获取证书序列号
        var cerNum = FTCtrl.EnumCertSerialNumber(serNum[0]);
        cerNum = eval(cerNum);
        if (!cerNum || cerNum.length == 0) {
            return false;
        }

        var CertNumber = cerNum[0];

        return CertNumber;
    }

    //生成业务数据文件
    p.GenerateMaterial_C = function (section, typeId, arrs) {
        var maters = { Section: section, TypeId: typeId, Materials: { _Items: [] } };
        if (arrs != null && arrs.length > 0) {
            $.each(arrs, function (index, val) {
                var attach = { MD5: val };
                maters.Materials._Items.push(attach);
            });
        }
        return maters;
    }

    p.ResetValue = function (val) {
        if (val != null && typeof (val) != "undefined" && formatterdate(val) != '1-01-01') {
            return val;
        }
        return "";
    }

    p.ResetValueBR = function (val) {
        if (val != null && typeof (val) != "undefined" && val != "") {

            var _reg = new RegExp("\n", "g");
            var ret = val.replace(_reg, "<br>")

            return ret;
        }
        return "";
    }

    p.CommonTextBox = function (opt) {
        opt = $.extend(true, {
            obj: null,
            editable: true,
            src: "",
            title: "选择",
            width: 880,
            height: 500,
            clickOk: null,
            clickCancel: null
        }, opt);

        if (opt.obj) {
            $("#" + opt.obj).textbox({
                iconWidth: 22,
                editable: opt.editable,
                icons: [{
                    iconCls: 'icon-select',
                    handler: function (e) {
                        var dlg = p.dialog({
                            src: opt.src,
                            title: opt.title,
                            width: opt.width,
                            height: opt.height,
                            buttons: [
                                {
                                    text: '确定',
                                    handler: function () {

                                        var row = dlg.context().getData();
                                        if (row) {
                                            if (opt.clickOk) {
                                                opt.clickOk(row);
                                            }
                                        }

                                        dlg.dialog('close');
                                    }
                                },
                                {
                                    text: '取消',
                                    handler: function () {
                                        dlg.dialog('close');
                                    }
                                }
                            ]
                        });
                    }
                }, {
                    iconCls: 'icon-delete',
                    handler: function (e) {
                        $.messager.confirm('提示信息', '确定要清除吗？', function (r) {
                            if (r) {
                                if (opt.clickCancel) {
                                    opt.clickCancel();
                                }
                            }
                        });
                    }
                }]
            });
        }
    }
    p.CompareDateTime = function (starttime, endtime) {
        try {
            var start = new Date(starttime.replace("-", "/").replace("-", "/"));
            var end = new Date(endtime.replace("-", "/").replace("-", "/"));
            if (end < start) {
                return false;
            }
            else { return true; }
        } catch (e) {
            return false;
        }
    }
    //获取当前登陆用户信息
    $.getLoginUser = function () {
        var arr = document.cookie.match(new RegExp("(^| )_PS_Session_Token_Info_=([^;]*)(;|$)"));
        return arr && arr.length > 2 ? $.parseJSON(decodeURIComponent(arr[2])) : null;
    };

}(window, jQuery));
//获取当前登陆用户信息
$.getLoginUser = function () {
    var arr = document.cookie.match(new RegExp("(^| )_PS_Session_Token_Info_=([^;]*)(;|$)"));
    return arr && arr.length > 2 ? $.parseJSON(decodeURIComponent(arr[2])) : null;
};
(function ($) {
    $.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }

    $.getParentUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = parent.window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    $.getExParam = function () {
        var result = '';
        var r = unescape(window.location.hash);
        if (r != "") {
            result = r.substr(1);
        }
        return result;
    }
})(jQuery);
function Monthformatter(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    return y.toString() + '-' + m.toString();
}
function Monthparser(date) {
    console.log(date);
    if (date) {
        return new Date(String(date).substring(0, 4) + '-'
            + String(date).substring(5, 7));
    } else {
        return new Date();
    }
}


function Go(url) {
    var curHref = window.location.href;
    var restLastReturnCookies = GetLastReturnUc();
    //重复点击多次加载
    if (typeof (restLastReturnCookies) != typeof (undefined) && restLastReturnCookies != null && restLastReturnCookies.Url == curHref) {
        DelLastReturnsCookies();
    }
    SetReturnsCookies(window.location.href, []);
    window.location.href = url;
    return false;
}

function Back() {
    var lastReturnUc = GetLastReturnUc();
    DelLastReturnsCookies();
    window.location.href = lastReturnUc.Url;
    return false;
}
//获取返回页面
function GetReturnsCookies() {
    var strReturnUc = $.cookie('ReturnUC');
    var returnUc = [];
    if (typeof (strReturnUc) != "undefined" && strReturnUc != null && strReturnUc != "") {
        returnUc = JSON.parse(strReturnUc);
    }
    return returnUc;
}


//删除最后一项
function DelLastReturnsCookies() {

    var strReturnUc = $.cookie('ReturnUC');
    if (typeof (strReturnUc) != "undefined" && strReturnUc != null && strReturnUc != "") {
        returnUc = JSON.parse(strReturnUc);
    }
    if (returnUc.length > 1) {
        returnUc.splice(returnUc.length - 1, 1);
    }
    var strNew = JSON.stringify(returnUc);
    $.cookie("ReturnUC", strNew, { path: '/', expires: 10 });

}

//获取上一页
function GetLastReturnUc() {
    var returnUc = GetReturnsCookies();
    var lastReturnUc = null;
    if (returnUc.length > 0) {
        lastReturnUc = returnUc[returnUc.length - 1];
    }
    return lastReturnUc
}
//获取返回页
function GetReturnUc() {
    var returnUc = GetReturnsCookies();
    var lastReturnUc = null;
    if (returnUc.length > 1) {
        lastReturnUc = returnUc[returnUc.length - 2];
    }
    return lastReturnUc
}
//设置返回
function SetReturnsCookies(Url, Params) {
    var strReturnUc = $.cookie('ReturnUC');
    var returnUc = [];
    if (typeof (strReturnUc) != "undefined" && strReturnUc != null && strReturnUc != "") {
        returnUc = JSON.parse(strReturnUc);
    }
    returnUc.push({ Url: Url, Params: Params })
    var strNew = JSON.stringify(returnUc);
    $.cookie("ReturnUC", strNew, { path: '/', expires: 10 });
}
//重置返回
function ReSetReturnsCookies(Url, Params) {

    var returnUc = [];
    returnUc.push({ Url: Url, Params: Params })
    var strNew = JSON.stringify(returnUc);
    $.cookie("ReturnUC", strNew, { path: '/', expires: 10 });
}

//设置登录用户
function SetPerson(ret) {
    $.cookie("_PS_Session_Token_Info_", JSON.stringify(ret), { path: '/', expires: 10 });
}

function GetAddAttrsValue(rowData, attrName) {
    var attrsVal = "";
    try {
        attrsVal = eval("rowData.AddAttrs." + attrName);
    } catch (e) { }

    return IsNullOrEmptyOrUndefine(attrsVal);
}
//格式化时间
function formatterdate(val, row) {
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
}

function restValue(val) {
    if (val != null && typeof (val) != "undefined" && formatterdate(val) != '1-01-01') {
        return val;
    }
    return "";
}

//获取备案部门
function GetRecordReviewUnitName(value) {
    switch (value) {
        case "510101":
            return "市住建局";
            break;
        case "510104":
            return "锦江区建设局";
            break;
        case "510105":
            return "青羊区建设局";
            break;
        case "510108":
            return "成华区建设局";
            break;
        case "510107":
            return "武侯区建设局";
            break;
        case "510106":
            return "金牛区建设局";
            break;
        case "510109":
            return "高新区建设局";
            break;
        case "510110":
            return "天府新区规建局";
            break;
        case "510112":
            return "龙泉驿区建设局";
            break;
        case "510113":
            return "青白江区建设局";
        case "510114":
            return "新都区建设局";
            break;
        case "510115":
            return "温江区建设局";
            break;
        case "510181":
            return "都江堰市建设委员会";
            break;
        case "510182":
            return "彭州市城乡建设局";
            break;
        case "510183":
            return "邛崃市建设局";
            break;
        case "510184":
            return "崇州市建设局";
            break;
        case "510121":
            return "金堂县建设局";
        case "510116":
            return "双流区建设局";
            break;
        case "510117":
            return "郫都区城乡规划建设管理局";
            break;
        case "510131":
            return "蒲江县规划建设管理局";
            break;
        case "510129":
            return "大邑县建设局";
            break;
        case "510132":
            return "新津区建设局";
            break;
        case "510185":
            return "蒲江县规划建设管理局";
            break;
        default:
            return "";
    }
}
//组装全局添加设备信息数据
var equipment = {
    'FloorsGround': '',//地上层数
    'FloorsUnderground': '',//地下层数
    'BranchInfoList': [

    ],
    'CollectorInfoList': [

    ],
    'CollectionPointInfoList': [

    ]
}
//计量设备通用查询事件
function Seach(opt, list, name) {//注opt对象里的key值必须跟查询对象里面的key值名称一样
    var newList = [];
    for (var i = 0; i < list.length; i++) {
        var isExist = true;
        var data = list[i];
        for (var key in opt) {
            if (opt[key] == "" || !emptyCheck(opt[key])) {
                continue;
            }
            if (key.indexOf('_') > -1) {
                var dataKeys = key.split('_');
                var isChildExist = false;
                for (var j = 0; j < dataKeys.length; j++) {
                    var dataKey = dataKeys[j];
                    if (dataKey == "Floor") {
                        var dataValues = "," + data[key] + ",";
                        if (dataValues.indexOf("," + opt[key] + ",") < 0 && opt[key] != "") {
                            isExist = false;
                            break;
                        }
                    }
                    else if (data[dataKey].indexOf(opt[key]) > -1) {
                        isChildExist = true;
                        break;
                    }
                }
                isExist = isChildExist;
            }
            else {
                if (key == "Floor") {
                    var dataValues = "," + data[key] + ",";
                    if (dataValues.indexOf("," + opt[key] + ",") < 0 && opt[key] != "") {
                        isExist = false;
                        break;
                    }
                } else if (key == "CollectorInfoNum") {
                    if (data[key] != null) {
                        if (data[key].indexOf(opt[key]) < 0) {
                            isExist = false;
                            break;
                        }
                    } else {
                        isExist = false;
                        break;
                    }
                }
                else if (data[key].indexOf(opt[key]) < 0) {
                    isExist = false;
                    break;
                }
            }
        }
        if (isExist) {
            newList.push(data);
        }
    }
    if (newList.length > 0)
        $('#' + name + '').datagrid({ data: newList });
    else
        $('#' + name + '').datagrid({ data: [] });
}

//计量设备查重
function SeachRepeat(list, name, val) {
    var newList = [];
    if (emptyCheck(val) && emptyCheck(name)) {
        for (var i = 0; i < list.length; i++) {
            var data = ResetValue(list[i][name]);
            if (data == val) {
                newList.push(list[i]);
            }
        }
    }
    return newList;
}

//判断是否重复数据
function IsRepeat(guid, list, name, val) {
    guid = ResetValue(guid);
    name = ResetValue(name);
    val = ResetValue(val);
    var oldList = SeachRepeat(list, name, val, false);
    var isRepeat = false;
    if (emptyCheck(guid)) {
        //编辑
        for (var i = 0; i < oldList.length; i++) {
            var data = oldList[i];
            if (data.Guid != guid && ResetValue(oldList[i][name]) == val) {
                isRepeat = true;
                break;
            }
        }
    }
    else if (oldList.length > 0) {
        //新增
        isRepeat = true;
    }
    return isRepeat;
}

//判断获取值是否为undefind或者null
function emptyCheck(data) {
    if (data == undefined || data == null || data == 'undefined' || data == 'null' || data == '') {
        return false;
    } else {
        return true
    }
}
//计算楼层数函数
function evalFloor(dataNum, underData, isAll) {
    var FloorArr = [];
    if (isAll) {
        FloorArr = [{ text: '全部', value: '', "selected": true }]
    }

    if (dataNum && dataNum != 0) {
        for (var i = 1; i <= dataNum; i++) {
            FloorArr.push({ text: i + '层', value: i });
        }
    }
    if (underData && underData != 0) {
        for (var i = 1; i <= underData; i++) {
            FloorArr.push({ text: '-' + i + '层', value: '-' + i });
        }
    }
    return FloorArr
}
//附件
function comomUplod(uplodId, tgrdId, dvInfo, valId, datas) {

    var uploader = null;
    var dvObj = $('#' + dvInfo).on('click', '.cancelfilebtn', function () {
        uploader.cancelFile($(this).attr('fileId'));
        dvObj.html('已取消');
    });
    //datas = { _Items: [{ md5: "275d34849e197ce511c7d426493fa0a9", name: "9999999999999.png", size: 31446 }] }
    if (datas._Items.length > 0) {
        var temView = "";
        var btndis = '';
        if (ResetValue(uplodId) == "") {
            btndis = 'display:none';
        }
        $.each(datas._Items, function (i, file) {
            temView += '<div id="' + file.IDs + '"><a href="' + env.current + 'FileAccess.ashx?md5={0}&fileName={1}" target="_blank">{2}</a>&nbsp;&nbsp;<a href="javascript:void(0)" style="color:#FF0000;{3}" onclick="delCertByGuid(\'{4}\',\'{5}\',\'{6}\')">删除</a><br/></div>'.Format(file.IDs, encodeURI(file.FileName), file.FileName, btndis, file.IDs, valId, uplodId)

        });
        dvObj.html(temView);
        $("#" + uplodId).parent().css({ borderColor: "#ccc" });
    }
    var fileItems = { _Items: [] };
    $("#" + valId).val(JSON.stringify(datas));

    uploader = $.uploader({
        //fastMode: true,  //快速模式,此种模式下会先上传文件, 等md5异步计算完毕时再决定是否终止上传,  默认 false
        server: env.current + 'Service/PsFileSvr.svrx', //默认此服务路径
        fileNumLimit: 5,
        //multiple:false,  //单选文件, 默认多选
        //accept: { title: 'xx', mimeTypes: 'image/*', extensions: "exe,xml" }, //选择文件框就能筛选的参数是mimeTypes;extensions参数只是默默地不上传 , 自定义文件类型要做文件类型提示的话需要beforeFileQueued事件
        //chunkSize: 2 * 1024 * 1024,//默认2M文件,大于2M自动分片上传,大于2M需要服务器修改对应web.config文件
        beforeFileQueued: function (file) {
            var fileItems = eval("(" + $("#" + valId).val() + ")");
            if (fileItems._Items.length >= 5) {
                $.messager.alert('提示', "已超出文件上传数量（5个），多个请打包上传！", 'info');
                return false;
            }
            var isExist = false;
            $.each(fileItems._Items, function (i, item) {
                if (item.FileName == file.name) {
                    isExist = true;
                    $.messager.alert('提示', '{0}文件已上传，请勿重复上传！'.Format(item.FileName), 'info');
                    return false;
                }
            });
            return !isExist;
        },
        filesQueued: function (files) {//一般用此事件做页面信息提示
            $.each(files, function (i, item) {
                dvObj.append('<div id="{id}">{name} <span></span><a href="javascript:void(0)" class="cancelfilebtn" fileId="{id}">取消</a></div>'.Format(item));
            });
        },
        uploadProgress: function (file, percent) {//一般用此事件做页面信息提示
            dvObj.find('#' + file.id + ' span').html(percent == 1 ? '正在合并文件' : (percent < 0 ? ' 计算md5进度:' : ' 上传进度:') + Math.floor(percent * 100));
        },
        uploadSuccess: function (file, response) {
            $("#" + uplodId).parent().css({ borderColor: "#ccc" });
            fileItems = eval("(" + $("#" + valId).val() + ")");
            var fileItem = {};
            fileItem.IDs = file.md5;
            fileItem.FileName = file.name;
            fileItem.FileSize = file.size;
            fileItems._Items.push(fileItem);
            $("#" + valId).val(JSON.stringify(fileItems));
            dvObj.children('#' + file.id).html('<div id="' + file.md5 + '"><a href="' + env.current + 'FileAccess.ashx?md5={0}&fileName={1}" target="_blank">{2}</a>&nbsp;&nbsp;<a href="javascript:void(0)" style="color:#FF0000;" onclick="delCertByGuid(\'{3}\',\'{4}\',\'{5}\')">删除</a></div>'.Format(file.md5, encodeURI(file.name), file.name, file.md5, valId, uplodId));

        }
    });
    if (ResetValue(uplodId) != "") {
        $('#' + uplodId).click(function () {
            //dvObj.html('');
            //$("#flieData").val("{ _Items: [] }");
            uploader.uploadFile(); //开启文件选择框, 选择后自动上传
        });
    }

}
//删除上传文件
function delCertByGuid(md5, valId, uplodId) {
    $.messager.confirm('提示信息', '确定要删除该附件吗？', function (r) {
        if (r) {
            var fileItems = eval("(" + $("#" + valId).val() + ")");
            var fileItemsnew = { _Items: [] };
            $.each(fileItems._Items, function (i, file) {
                if (md5 != file.IDs) {
                    var fileItemnew = {};
                    fileItemnew.IDs = file.IDs;
                    fileItemnew.FileName = file.FileName;
                    fileItemnew.FileSize = file.FileSize;
                    fileItemsnew._Items.push(fileItemnew);
                }
            });

            if (fileItemsnew._Items.length == 0) {
                $("#" + uplodId).parent().css({ borderColor: "#f49a5e" });
            }
            $("#" + valId).val(JSON.stringify(fileItemsnew));
            $("#" + md5).remove();
        }
    });
}
//处理空参数
function ResetValue(val) {
    if (val != null && typeof (val) != "undefined" && formatterdate(val) != '1-01-01' && formatterdate(val) != '') {
        return val;
    }
    return "";
}
//根据编码取出区市县的数据
function CityData(code) {
    for (var i = 0; i < Districts.length; i++) {
        if (code == Districts[i].value) {
            return Districts[i].text;
        }
    }
}

//根据编码取出区市县的数据
function CityDataCode(name) {
    for (var i = 0; i < Districts.length; i++) {
        if (name == Districts[i].text) {
            return Districts[i].value;
        }
    }
}

//加载能耗分类分项
function loadEnergyCategory(id, pGuid) { //pGuid没有传空
    $.get('/Service/EnergyMgeSvr.svrx/GetEnergyCategoryList', { pGuid: pGuid }, function (Datum) {
        var data = JSON.parse(Datum);
        $('#' + id).combotree({ textField: 'text', valueField: 'id', data: data });
        if (data.length == 0) {
            $('#' + id).combotree("setValue", "");
        }
    });
}

function loadComboEnergyCategory(id, pGuid) { //pGuid没有传空
    $.get('/Service/EnergyMgeSvr.svrx/GetEnergyCategoryList', { pGuid: pGuid }, function (Datum) {
        var data = JSON.parse(Datum);
        var newData = [];
        for (var i = 0; i < data.length; i++) {
            newData.push({ text: data[i].text, value: data[i].id });
        }
        $('#' + id).combobox({ textField: 'text', valueField: 'value', data: newData });
        if (newData.length == 0) {
            $('#' + id).combobox("setValue", "");
            $('#' + id).combobox("clear");
        }
    });
}
//获取能耗配置结果
function GetEnergyTypeTxt(value) {
    if (typeof (value) == 'object') {
        var EnergyTypeTxt = "";
        for (var i = 0; i < EnergyTypeConfig.length; i++) {
            var EnergyType = EnergyTypeConfig[i];
            for (var j = 0; j < value.length; j++) {
                if (EnergyType.value == value[j]) {
                    if (value.length > 1)
                        EnergyTypeTxt += EnergyType.text + ',';
                    else
                        EnergyTypeTxt += EnergyType.text
                }
            }
        }
        return EnergyTypeTxt.substring(0, EnergyTypeTxt.length - 1);
    } else {
        var EnergyTypeTxt = "";
        for (var i = 0; i < EnergyTypeConfig.length; i++) {
            var EnergyType = EnergyTypeConfig[i];
            if (EnergyType.value == value) {
                EnergyTypeTxt = EnergyType.text;
            }
        }
        return EnergyTypeTxt;
    }
}


//加载建筑类别(数据量较少统一采用配置算了)
function loadBuildingCategory(id, options) { //pGuid没有传空
    //$.get('/Service/EnergyMgeSvr.svrx/GetBuildingCategoryList', {}, function (Datum) {
    //    var data = JSON.parse(Datum);
    //    if (options) {
    //        $.extend({ textField: 'text', valueField: 'id', data: data }, options)
    //    }
    //    $('#' + id).combotree({ textField: 'text', valueField: 'id', data: data });
    //});
    if (!options) {
        options = {};
    }
    options = $.extend({ textField: 'text', valueField: 'id', data: BuildingCategory }, options)
    $('#' + id).combotree(options);
}
//给根元素设置字体大小
function doc_rem(doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            if (clientWidth > 3500 && clientWidth < 6000) {
                docEl.style.fontSize = '240px';
            } else if (clientWidth >= 6000) {
                docEl.style.fontSize = '500px';
            } else if (clientWidth < 3500 && clientWidth > 1024) {
                docEl.style.fontSize = 100 * (clientWidth / 1920) + 'px';
            } else if (clientWidth < 1024 && clientWidth > 760) {
                docEl.style.fontSize = 250 * (clientWidth / 1920) + 'px';
            } else {
                docEl.style.fontSize = 100 * (clientWidth / 1920) + 'px';
            }
        };

    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
};

function isEmptyObject(obj) {
    for (var key in obj) {
        return false;//返回false，不为空对象
    }
    return true;//返回true，为空对象
}

function ScreenInit() {
    var parentId = $.getUrlParam("parentId");
    $('.close_tan1').click(function () {
        parent.$('#' + parentId).window('close');
    })
}
function SetColor(oldData, newData) {
    //基础信息标红
    $("span[fieldname]").each(function () {
        var name = $(this).attr("fieldname");
        var changeValue = IsNullOrEmptyOrUndefine(eval("newData." + name));
        var oldVal = IsNullOrEmptyOrUndefine(eval("oldData." + name));
        if (changeValue != oldVal) {
            $(this).parent().css('background-color', '#e8ffcf');
            $(this).parent().css('color', 'red');
            if (eval("oldData." + name) != "" && eval("oldData." + name) != null && eval("oldData." + name) != "0001/1/1") {
                var oldValue = eval("oldData." + name);
                try {
                    if (oldValue.indexOf("T00:00:00") > -1) {
                        oldValue = oldValue.replace("T00:00:00", "");
                    }
                } catch (e) { }
                $(this).parent().tooltip({ content: "变更前内容为:" + oldValue });
            }
            else {
                $(this).parent().tooltip({ content: "变更前内容为:无" });
            }
        }
    });
}


function removeSelect(guid, columnName, type) {
    $("#before" + guid).remove();
    $("#current" + guid).remove();
    var columns = columnName.split('|');
    for (var i = 0; i < columns.length; i++) {
        if (type == "select") {
            $("#" + columns[i]).combobox("setValue", "");
            $("#" + columns[i]).combobox("setText", "");
        }
        if (type == "textbox") {
            $("#" + columns[i]).textbox("setValue", "");
            $("#" + columns[i]).textbox("setText", "");
        }
        if (type == "datebox") {
            $("#" + columns[i]).datebox("setValue", "");
        }
        if (type == "tree") {
            $("#" + columns[i]).combotree("setValue", "");
            $("#" + columns[i]).combotree("setText", "");
        }
    }
    $(".easyui-linkbutton").each(function () {
        var id = $(this).attr("id");
        if (id == "btnStatic" || id == "btnSearch") {
            $("#" + id).click();
        }
    });
}

//datebox只显示、选择年月
function changeDatebox(id) {
    $('#' + id).datebox({
        currentText: false,
        //显示日趋选择对象后再触发弹出月份层的事件，初始化时没有生成月份层
        onShowPanel: function () {
            //触发click事件弹出月份层
            span.trigger('click');
            if (!tds)
                //延时触发获取月份对象，因为上面的事件触发和对象生成有时间间隔
                setTimeout(function () {
                    tds = p.find('div.calendar-menu-month-inner td');
                    tds.click(function (e) {
                        //禁止冒泡执行easyui给月份绑定的事件
                        e.stopPropagation();
                        //得到年份
                        var year = /\d{4}/.exec(span.html())[0],
                            //月份
                            //之前是这样的month = parseInt($(this).attr('abbr'), 10) + 1; 
                            month = parseInt($(this).attr('abbr'), 10);

                        //隐藏日期对象                     
                        $('#' + id).datebox('hidePanel')
                            //设置日期的值
                            .datebox('setValue', year + '-' + month);
                    });
                }, 0);
        },
        //配置parser，返回选择的日期
        parser: function (s) {
            if (!s) return new Date();
            var arr = s.split('-');
            return new Date(parseInt(arr[0], 10), parseInt(arr[1], 10) - 1, 1);
        },
        //配置formatter，只返回年月 之前是这样的d.getFullYear() + '-' +(d.getMonth()); 
        formatter: function (d) {
            var currentMonth = (d.getMonth() + 1);
            var currentMonthStr = currentMonth < 10 ? ('0' + currentMonth) : (currentMonth + '');
            return d.getFullYear() + '-' + currentMonthStr;
        }
    });
    //日期选择对象
    var p = $('#' + id).datebox('panel'),
        //日期选择对象中月份
        tds = false,
        //显示月份层的触发控件
        span = p.find('span.calendar-text');
}


//加载能耗分类分项
function LoadBuildingCategoryAll(id) {
    var arrBuildingCategory = BuildingCategory;
    arrBuildingCategory.unshift({ text: '全选', value: '' }, { text: '取消全选', value: '' });
    $('#' + id).combotree({
        textField: 'text', valueField: 'value', data: arrBuildingCategory,
        onCheck: function (e) {
            if (e.text == "全选") {
                $('#' + id).combotree('setValues', BuildingCategory);
            } else if (e.text == "取消全选") {
                $('#' + id).combotree('setValues', "");
                $('#' + id).combotree('setText', "");
            }
            //var seleNodes = $('#' + id).combotree('tree').tree('getChecked');
            //var txt = "";
            //var arr = new Array();
            //var count = 0;
            //for (var i = 0; i < seleNodes.length; i++) {
            //    if (!seleNodes[i].children) {
            //        txt += seleNodes[i].name + ',';
            //        arr[count] = seleNodes[i].value;
            //        count++;
            //    }
            //}
            //$('#' + id).combotree('setValues', arr);
            //$('#' + id).combotree('setText', txt.substring(0, txt.length - 1));
        }
    }).combotree('tree').tree('collapseAll');
}
//加载能耗分类分项
function LoadEnergyCategoryAll(id) { //pGuid没有传空
    $.get('/Service/EnergyMgeSvr.svrx/GetEnergyCategoryList', { pGuid: "" }, function (Datum) {
        var data = JSON.parse(Datum);
        var arrData = data;
        arrData.unshift({ text: '全选', value: '' }, { text: '取消全选', value: '' });
        $('#' + id).combotree({
            textField: 'text', valueField: 'id', data: arrData,
            onCheck: function (e) {
                if (e.text == "全选") {
                    $('#' + id).combotree('setValues', data);
                } else if (e.text == "取消全选") {
                    $('#' + id).combotree('setValues', "");
                    $('#' + id).combotree('setText', "");
                }
            }
        }).combotree('tree').tree('collapseAll');
    });
}
//加载区市县复选
function LoadAreaAll(id) {
    var arrCitys = [];
    for (var i = 0; i < Districts.length; i++) {
        arrCitys[i] = Districts[i].value;
    }
    var arrDistricts = Districts;
    arrDistricts.unshift({ text: '全选', value: '' }, { text: '取消全选', value: '' });
    $('#' + id).combobox({
        valueField: 'value',
        textField: 'text',
        data: arrDistricts,
        editable: false,
        onClick: function (record) {
            if (record.text == "全选") {
                $('#' + id).combobox('setValues', arrCitys);
            } else if (record.text == "取消全选") {
                $('#' + id).combobox('setValues', "");
                $('#' + id).combobox('setText', "");
            } else {
                $('#' + id).combobox('unselect', '');
            }
        }
    });
}


/**
 * 配置文件逐月：Categories,   bool isAllMonth
 * true  为12月
 * false 当前年份到当月为止，其他为12月
 * value:传参‘年份’，判断是否为当年
 */
function GetTxtMonth(value) {
    var isAllMonth = false;
    if (isAllMonth) {
        return '1月|2月|3月|4月|5月|6月|7月|8月|9月|10月|11月|12月';
    } else {
        var date = new Date();
        var year = date.getFullYear().toString();
        if (value == year) {
            var month = date.getMonth() + 1;
            var txtMonth = '';
            for (var i = 1; i <= month; i++) {
                txtMonth += i + '月|';
            }
            return txtMonth.substring(0, txtMonth.length - 1);
        } else {
            return '1月|2月|3月|4月|5月|6月|7月|8月|9月|10月|11月|12月';
        }
    }
}
/**
 * 配置文件逐日：Categories,   bool isAllDay
 * true  为当前月份天数
 * false 当前月份到当天为止，其他为当前月份天数
 * yy:传参‘年份’，判断是否为当年
 * mm:传参‘月份’，判断是否为当月
 */
function GetTxtDay(yy, mm) {
    var isAllDay = false;
    var txtDays = '';
    var d = new Date(yy, mm, 0);
    for (var i = 1; i <= d.getDate(); i++) {
        txtDays += i + '|';
    }
    txtDays = txtDays.substring(0, txtDays.length - 1);
    if (isAllDay) {
        return txtDays;
    } else {
        var date = new Date();
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1).toString();
        if (yy == year && mm == month) {
            var txtNowDays = '';
            var day = date.getDate();
            for (var i = 1; i <= day; i++) {
                txtNowDays += i + '|';
            }
            return txtNowDays.substring(0, txtNowDays.length - 1);
        } else {
            return txtDays;
        }
    }
}
/**
 * 配置文件逐时：Categories,   bool isAllHour
 * true  为24小时
 * false 当天到当时为止，其他为24小时
 * yy:传参‘年份’，判断是否为当年
 * mm:传参‘月份’，判断是否为当月
 * dd:传参‘日’，判断是否为月日
 */
function GetTxtHour(yy, mm, dd) {
    var isAllHour = false;
    var txtHours = '0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23';
    if (isAllHour) {
        return txtHours;
    } else {
        var date = new Date();
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1).toString();
        var day = date.getDate();
        var hour = date.getHours();
        if (yy == year && mm == month && dd == day) {
            var txtNowHours = '';
            for (var i = 0; i <= hour; i++) {
                txtNowHours += i + '|';
            }
            return txtNowHours.substring(0, txtNowHours.length - 1);
        } else {
            return txtHours;
        }
    }
}

function RowNumberSuccess(pageSize) {
    if (!pageSize) pageSize = 15;
    $('.datagrid-header-rownumber').html('序号');
    var currentIndex = $("span[class='current']").text();
    $('.datagrid-cell-rownumber').each(function (i) {
        var rowNumber = (parseInt(currentIndex) - 1) * pageSize + i + 1;
        $(this).html(rowNumber);
    })
}
//关于跨域的事件监听，及处理
// (function () {
//     var call = function (data) {
//         if (typeof (data) === 'string') {
//             data = JSON.parse(data);

//             if (!data.name) {
//                 return;
//             }

//             if (data.name.indexOf('eval:') == 0) {
//                 data.name = data.name.substring(5, data.name.length);
//                 eval(data.name);
//             } else {
//                 //data.name = data.name.split('.');

//                 if ($.isArray(data.params)) {
//                     eval(data.name + '(' + data.params.join(',') + ')');
//                 } else {
//                     if (typeof (data.params) !== 'string') {
//                         data.params = JSON.stringify(data.params);
//                     }
//                     else if (typeof (data.params) === 'string') {
//                         data.params = '\'' + data.params + '\'';
//                     }
//                     eval('if(' + data.name + ')' + data.name + '(' + data.params + ')');
//                 }
//             }
//         }
//     };

//     if (window.postMessage) {
//         if (window.addEventListener) {
//             window.addEventListener("message", function (e) {
//                 e = e || event;
//                 call(e.data);
//             }, false);
//         } else if (window.attachEvent) {
//             window.attachEvent("onmessage", function (e) {
//                 e = e || event;
//                 call(e.data);
//             });
//         }
//     } else {
//         var hash = '';

//         setInterval(function () {
//             if (window.name !== hash) {
//                 hash = window.name;
//                 call(hash);
//             }
//         }, 50);
//     }
// }());

$(function () {
    reCalc(document.documentElement);
    $(document).keyup(function (event) {
        if (event.keyCode == 13) {
            $(".easyui-linkbutton").each(function () {
                var id = $(this).attr("id");
                if (id == "btnStatic" || id == "btnSearch" || id == "search") {
                    $("#" + id).click();
                }
            })
            $(".l-btn-search").each(function () {
                $(this).click();
            })
        }
    });
})
window.addEventListener("resize", function () {//监听横竖屏切换
    reCalc(document.documentElement);
}, false);
function reCalc(docEl) {
    var clientWidth = docEl.clientWidth;
    if (!clientWidth) return;
    if (clientWidth > 3500 && clientWidth < 6000) {
        docEl.style.fontSize = '240px';
    } else if (clientWidth >= 6000) {
        docEl.style.fontSize = '500px';
    } else if (clientWidth < 3500 && 1023 < clientWidth) {
        docEl.style.fontSize = 11 * (clientWidth / 1920) + 'px';
    }
    else {
        docEl.style.fontSize = 100 * (clientWidth / 1920) + 'px';
    }
};

//打开弹窗
function showWindow(opt) {
    var win = $(window);
    if (opt.max) {
        opt.width = win.width();
        opt.height = win.height();
        opt.shadow = false;
    }
    opt.modal = true;
    var guid = $.newGuid();
    if (opt.src.indexOf("?") > -1) {
        opt.src += '&parentId=' + guid;
    }
    else {
        opt.src += '?parentId=' + guid;
    }
    opt.content = '<iframe src="' + opt.src + '"  frameborder="0" allowtransparency="true"   style="width: 100%; height: 100%;overflow: auto; border: 0; display:block"></iframe>';
    var boarddiv = '<div id=' + guid + ' ></div>';
    $(document.body).append(boarddiv);
    var win = $('#' + guid).window(opt);
    win.window('open');
}

//为空或未定义
String.IsNullOrEmptyOrWhiteSpace = function (str) {
    return str == null || typeof (str) == typeof (undefined) || $.trim(str) == '';
};