/**
 * 自定义日期时间范围弹出框。暂不支持使用easyloader+parser方法加载
 * created on 2021-12-08 by 千堆雪
 * 
 */
(function($) {
	//实例化两个日历组件
	function createBox(target) {
		let state = $.data(target, 'daterangebox');
		let opts = state.options;

		//创建两个日历框
		$(target).addClass('daterangebox-f').combo($.extend({}, opts, {
			onShowPanel: function() {
				//绑定事件
				bindEvents(this);
				//初始化按钮栏
				initButtons(this);
				setValue(this, $(this).combo('getText'), true);
				opts.onShowPanel.call(this);
			}
		}));

		if (!state.from) { //若未创建日期时间区间实例
			let panel = $(target).combo('panel').css('overflow', 'hidden').css("font-size", "0");
			let from = state.from = $("<div class='datefrom-inline'>").appendTo(panel);
			let to = state.to = $("<div class='dateto-inline'>").appendTo(panel);

			//创建两个日历控件
			$(from).calendar($.extend({}, opts.from, {
				panelWidth: 270
			}));

			$(to).calendar($.extend({}, opts.to, {
				panelWidth: 270
			}));
		}

		//绑定事件
		function bindEvents(target) {
			var opts = $(target).daterangebox('options');
			var panel = $(target).combo('panel');
			//将daterangebox简写为dtrb，减少长度
			panel.unbind('.drb').bind('click.drb', function(e) {
				if ($(e.target).hasClass('drb-button-a')) {
					let index = parseInt($(e.target).attr('drb-button-index'));
					opts.buttons[index].handler.call(e.target, target);
				}
			});
		}

		//初始化按钮条
		function initButtons(target) {
			var panel = $(target).combo('panel');
			if (panel.children('div.drb-button').length) {
				return;
			}
			var buttonGrp = $('<div class="drb-button"></div>').appendTo(panel);

			for (let i = 0; i < opts.buttons.length; i++) {
				let btn = opts.buttons[i];
				let text = $.isFunction(btn.text) ? btn.text(target) : btn.text;
				let t = $('<a class="drb-button-a" href="javascript:void(0)"></a>').html(text).appendTo(buttonGrp);
				t.attr('drb-button-index', i);
			}
		}
	}

	/**
	 * 获取当前选中的日期范围
	 */
	function getCurrentDateRange(target) {
		let state = $.data(target, 'daterangebox');
		let datefrom = $(state.from).calendar("options").current;
		let dateto = $(state.to).calendar("options").current;

		//创建一个日期对象
		return {
			from: new Date(datefrom.getFullYear(), datefrom.getMonth(), datefrom.getDate()),
			to: new Date(dateto.getFullYear(), dateto.getMonth(), dateto.getDate()),
		};
	}

	/**
	 * 设置表单值，如果remainText为true，则表单的text内容不变
	 * value:值，字符串类型
	 * remainText：布尔类型，表示是否保留当前表单中的text内容
	 */
	function setValue(target, value, remainText) {
		let state = $.data(target, 'daterangebox');
		var opts = state.options;

		//给下拉框设置值（注意：不是显示文本）
		$(target).combo('setValue', value);
		//将字符串格式的时间区间转换为一个日期对象区间对象，如果value不合法，则返回当前系统日期
		var daterange = opts.parser.call(target, value);

		if (!remainText) {
			if (value) {
				//将时间区间转换为字符串格式
				let datestr = opts.formatter.call(target, daterange.from, daterange.to);
				$(target).combo('setText', datestr).combo('setValue', datestr);
			} else {
				$(target).combo('setText', value);
			}
		}

		$(state.from).calendar('moveTo', daterange.from);
		$(state.to).calendar('moveTo', daterange.to);
	}

	/**
	 * 用户回车或点击确定按钮时调用
	 */
	function doEnter(target) {
		var opts = $.data(target, 'daterangebox').options;
		//获取当前选中的时间范围
		var daterange = getCurrentDateRange(target);

		//设置值到表单元素中
		setValue(target, opts.formatter.call(target, daterange.from, daterange.to));

		//隐藏下拉面板
		$(target).combo('hidePanel');
	}

	//创建日期范围弹出框，仅支持日期范围
	$.fn.daterangebox = function(options, param) {
		if (typeof options === 'string') {
			var method = $.fn.daterangebox.methods[options];
			if (method) {
				return method(this, param);
			} else {
				return this.combo(options, param);
			}
		}

		options = options || {};
		return this.each(function() {
			let state = $.data(this, 'daterangebox');
			if (state) {
				$.extend(state.options, options);
			} else {
				$.data(this, 'daterangebox', {
					options: $.extend({}, $.fn.daterangebox.defaults, $.fn.daterangebox
						.parseOptions(this), options)
				});
			}
			createBox(this);
		});
	}

	//所有方法
	$.fn.daterangebox.methods = {
		options: function(jq) {
			var copts = jq.combo('options');
			return $.extend($.data(jq[0], 'daterangebox').options, {
				width: copts.width,
				height: copts.height,
				originalValue: copts.originalValue,
				disabled: copts.disabled,
				readonly: copts.readonly
			});
		},
		setValue: function(jq, value) {
			return jq.each(function() {
				setValue(this, value);
			});
		},
		reset: function(jq) {
			return jq.each(function() {
				var opts = $(this).daterangebox('options');
				$(this).daterangebox('setValue', opts.originalValue);
			});
		}
	};

	//解析属性
	$.fn.daterangebox.parseOptions = function(target) {
		return $.extend({}, $.parser.parseOptions(target, ['value']));
	};

	//配置项默认值
	$.fn.daterangebox.defaults = $.extend({}, $.fn.combo.defaults, {
		panelWidth: 'auto',
		panelHeight: 'auto',
		height: 36,
		currentText: 'Today',
		closeText: 'Close',
		okText: 'Ok',

		buttons: [{
			text: function(target) { //确定按钮
				return $(target).daterangebox('options').okText;
			},
			handler: function(target) {
				doEnter(target);
			},
			cssStyle: {},
			cssClass: []
		}, {
			text: function(target) { //关闭按钮
				return $(target).daterangebox('options').closeText;
			},
			handler: function(target) {
				$(target).daterangebox('hidePanel');
			},
			cssStyle: {},
			cssClass: []
		}],
		parser: function(s) { //将一个字符串解析为日期对象格式，如果格式不合法，则返回当前系统日期
			if (s) {
				let parts = s.split("~");
				let datefrom = null; //开始日期字符串
				let dateto = null; //结束日期字符串

				if (parts.length > 0) {
					datefrom = parts[0].trim();
				}
				if (parts.length > 1) {
					dateto = parts[1].trim();
				}

				if (datefrom) {
					datefrom = $.fn.datebox.defaults.parser(datefrom);
				}
				if (dateto) {
					dateto = $.fn.datebox.defaults.parser(dateto);
				}

				return {
					from: datefrom,
					to: dateto
				};
			}

			return {
				from: new Date(),
				to: new Date()
			};
		},
		formatter: function(dateFrom, dateTo) { //将两个日期对象格式化为字符串
			return $.fn.datebox.defaults.formatter.call(this, dateFrom) + ' ~ ' + $.fn.datebox.defaults
				.formatter.call(this, dateTo);
		}
	});
})(jQuery);
