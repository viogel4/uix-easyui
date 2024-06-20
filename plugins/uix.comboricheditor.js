(function($) {
	//创建富文本编辑器
	function create(target) {
		let state = $.data(target, 'comboricheditor');
		let opts = state.options;

		//创建combo，为防止因手动修饰丢失换行符，此处直接将表单设置为不可修改
		$(target).combo($.extend({}, opts, {
			onShowPanel: function() {
				/* let val = $(target).combo("getValue"); //getValue返回的内容可包含换行符，而getText无法包含
				let state = $.data(target, 'comboricheditor');
				state.editor.setValue(val); */
			},
			editable: false
		}));

		let $panel = $(target).combo("panel");
		$panel.css({
			display: "flex",
			flexDirection: "column"
		});

		$panel.append("<div class='combo-vditor' style='border:none;flex-grow:1;'></div>");
		let dom = $panel.children(".combo-vditor")[0];

		//vditor的配置
		let vditorOpts = $.extend({
			with: "100%",
			toolbar: [
				"headings",
				"bold",
				"italic",
				"strike",
				"link",
				"|",
				"list",
				"ordered-list",
				"check",
				"outdent",
				"indent",
				"|",
				"quote",
				"line",
				"code",
				"inline-code",
				"|",
				"upload",
				"table",
				"|",
				"undo",
				"redo"
			],
			preview: {
				hljs: {
					lineNumber: true
				}
			},
			cache: {
				enable: false
			},
			after: function() { //vditor加载完成后触发
				if (opts.onLoadSuccess) {
					opts.onLoadSuccess();
				}
			}
		}, opts.vditorOpts);

		if (opts.data !== undefined) {
			vditorOpts.value = opts.data; //vditor的初始值
			$(target).combo("setText", opts.data); //给combo设置初始显示文本
		}

		let vditor = new Vditor(dom, $.extend(vditorOpts, opts.vditorOpts));
		state.editor = vditor;

		//工具按钮
		let $toolbar = $("<div class='toorbar' style='flex-grow:0;'></div>");
		$toolbar.css({
			display: "flex",
			justifyContent: "flex-end",
			flexGrow: 0,
			borderTop: "1px solid #ccc",
			padding: "5px"
		});

		//三个操作按钮
		$toolbar.append("<a id='confirm' href='javascript:void(0)' style='margin-right:5px;'>确定</a>");
		$toolbar.append("<a id='clear' href='javascript:void(0)' style='margin-right:5px;'>清空</a>");
		$toolbar.append("<a id='cancel' href='javascript:void(0)'>取消</a>");
		//确定
		$toolbar.find("#confirm").linkbutton({
			onClick: function() {
				setValue(target, vditor.getValue()); //设置表单的显示内容及值
				$(target).combo("hidePanel");
			}
		});
		//清空
		$toolbar.find("#clear").linkbutton({
			onClick: function() {
				vditor.setValue(""); //仅更改富文本编辑器内容
			}
		});
		//取消按钮
		$toolbar.find("#cancel").linkbutton({
			onClick: function() {
				$(target).combo("hidePanel");
			}
		});
		$panel.append($toolbar);
	}

	//设置表单值。注意：此方法并不会给富文本编辑器设置内容
	function setValue(target, val) {
		let state = $.data(target, 'comboricheditor');
		let opts = state.options;

		if (state.editor.vditor) {
			state.editor.setValue(val);
		} else { //编辑器尚未加载完毕
			opts.onLoadSuccess = function() {
				state.editor.setValue(val);
			};
		}

		//设置到combo中，用于表单提交时，自动获取其值
		$(target).combo("setValue", val);
		$(target).combo("setText", val);
	}

	//获取表单值
	function getValue(target) {
		return $(target).combo("getValue");
	}

	//下拉富文本编辑器
	$.fn.comboricheditor = function(options, param) {
		if (typeof options === "string") {
			let method = $.fn.comboricheditor.methods[options];
			if (method) {
				return method(this, param);
			} else {
				return this.combo(options, param);
			}
		}

		options = options || {};
		return this.each(function() {
			let me = this;
			let state = $.data(me, 'comboricheditor');
			if (state) {
				$.extend(state.options, options);
			} else {
				state = $.data(me, 'comboricheditor', {
					options: $.extend({}, $.fn.comboricheditor.defaults, $.fn.combo
						.parseOptions(me), options)
				});
			}

			if (state.options.data) {
				state.options.originalValue = state.options.data; //设置初始数据
			} else {
				let data = $.fn.comboricheditor.parseData(me);
				if (data) {
					state.options.data = data;
					state.options.originalValue = data; //初始初始数据
				}
			}

			//创建富文本编辑器
			create(me);
		});
	};

	$.fn.comboricheditor.methods = {
		options: function($jq) {
			var copts = $jq.combo('options');
			return $.extend($.data($jq[0], 'comboricheditor').options, {
				width: copts.width,
				height: copts.height,
				disabled: copts.disabled,
				readonly: copts.readonly
			});
		},
		setValue: function($jq, value) {
			return $jq.each(function() {
				setValue(this, value);
			});
		},
		clear: function($jq) {
			return $jq.each(function() {
				setValue(this, "");
			});
		},
		reset: function($jq) {
			return $jq.each(function() {
				var opts = $(this).combo('options');
				setValue(this, opts.originalValue);
			});
		}
	};

	//todo
	$.fn.comboricheditor.parseOptions = function(target) {
		var t = $(target);
		return $.extend({}, $.fn.combo.parseOptions(target));
	};

	$.fn.comboricheditor.parseData = function(target) {
		return $(target).val();
	};

	$.fn.comboricheditor.defaults = $.extend({}, $.fn.combo.defaults, {
		data: "",
		height: 36,
		panelWidth: 650,
		panelHeight: 350,
		onBeforeLoad: function(param) {},
		onLoadSuccess: function(data) {},
		onLoadError: function() {},
		onSelect: function(record) {},
		onUnselect: function(record) {},
		onClick: function(record) {},
		panelEvents: {
			mousedown: function(e) {
				//override the parent method, so the sub form element in the panel can get focus
			}
		},
		vditorOpts: null
	});
})(jQuery);
