(function($) {
	/**
	 * 注意：本插件补丁不再支持easyloader的使用方式，必须运行在easyui的js加载之后
	 */

	/**
	 * 给easyui的组件所创建出的每个实例打补丁，callback为回调函数
	 * 函数全名为：patchEasyuiPluginInstances，考虑到名称太长，简化为pepi
	 * 
	 * 同理，第一个参数名targetEasyuiPluginFunc，也简化为：tepf
	 */
	function pepi(tepf, cb) {
		return new Proxy(tepf, {
			apply: function(target, thisArg, args) {
				if (typeof args[0] == 'string') {
					return Reflect.apply(...arguments);
				} else {
					Reflect.apply(...arguments); //当第一个参数是options对象，表示创建easyui组件对象
					return thisArg.each(function() {
						cb.call(this);
					});
				}
			}
		});
	}

	/**
	 * linkbutton按钮组件
	 */
	function uix_linkbutton() {
		$.fn.linkbutton = pepi($.fn.linkbutton, function() {
			let state = $.data(this, "linkbutton");
			let options = state.options;
			let $target = $(this);

			let clsArr = options.theme; //按钮主题皮肤
			if (clsArr) {
				if (typeof clsArr === "string") {
					$target.addClass(clsArr);
				} else {
					$target.addClass(clsArr.join(" "));
				}
			}
		});

		// 新增方法，用于设置按钮文本
		$.fn.linkbutton.methods.setText = function($jq, value) {
			return $jq.each(function() {
				$(this).find(".l-btn-text").text(value);
			});
		};
	}

	// progressbar进度条组件
	function uix_progressbar() {
		//扩展progressbar组件默认值
		$.extend($.fn.progressbar.defaults, {
			height: 20,
			animation: true
		});

		$.fn.progressbar = pepi($.fn.progressbar, function() {
			let state = $.data(this, "progressbar");
			let options = state.options;
			let $target = $(this).find(".progressbar-value>.progressbar-text");

			let clsArr = options.theme;
			if (clsArr) {
				if (typeof clsArr === "string") {
					$target.addClass(clsArr);
				} else {
					$target.addClass(clsArr.join(" "));
				}
			}

			if (options.animation) {
				$target.addClass("progressbar-animation");
			}
		});

		// 给进度条组件设置data-percent属性，此属性可用于进度条自动颜色 
		$.fn.progressbar.methods.setValue = new Proxy($.fn.progressbar.methods.setValue, {
			apply: function(target, thisArg, args) {
				let jq = Reflect.apply(...arguments);
				return jq.each(function() {
					$(this).find(".progressbar-value>.progressbar-text").attr("data-percent",
						args[1]);
				});
			}
		});
	}

	/* 验证表单样式 */
	function uix_validatebox() {
		$.extend($.fn.validatebox.defaults.tipOptions, {
			onShow: function() {
				$(this).tooltip("tip").css({
					color: "#fff",
					border: "none",
					backgroundColor: "rgb(255,87,75)"
				});
			}
		});
	}

	//继承自文本框的高度默认都设置为36
	function uix_textbox() {
		$.extend($.fn.textbox.defaults, {
			height: 36
		});

		//给textbox添加keyup事件，默认是keydown事件，此事件会导致combobox在输入中文时无效
		$.fn.textbox = new Proxy($.fn.textbox, {
			apply: function(target, thisArg, args) {
				if (typeof args[0] === 'string') {
					return Reflect.apply(...arguments);
				} else {
					Reflect.apply(...arguments); //当第一个参数是options对象，表示创建easyui组件对象
					return thisArg.each(function() {
						let state = $.data(this, "textbox");
						let opts = state.options;
						let tb = state.textbox;
						let input = tb.find('.textbox-text');

						//添加一个keyup事件，其handler等同于keydown事件，修复combobox在输入中文时无效的bug
						input.on('keyup.textbox', {
							target: this
						}, opts.inputEvents["keydown"]);
					});
				}
			}
		});
	}

	/**
	 * 密码框
	 */
	function uix_passwordbox() {
		$.extend($.fn.passwordbox.defaults, {
			height: 36
		});
	}

	/**
	 * 搜索框
	 */
	function uix_searchbox() {
		$.extend($.fn.searchbox.defaults, {
			height: 36
		});
	}

	/**
	 * 数字框
	 */
	function uix_numberbox() {
		$.extend($.fn.numberbox.defaults, {
			height: 36
		});
	}

	//日历组件
	function uix_calendar() {
		$.extend($.fn.calendar.defaults, {
			width: 272,
			height: 272
		});
	}

	//日期选择框，重置面板大小
	function uix_datebox() {
		$.extend($.fn.datebox.defaults, {
			panelWidth: 272,
			panelHeight: 320,
			height: 36
		});
	}

	//日期时间选择框
	function uix_datetimebox() {
		$.extend($.fn.datetimebox.defaults, {
			panelWidth: 272,
			panelHeight: 360,
			height: 36
		});
	}

	/**
	 * 文件输入框
	 */
	function uix_filebox() {
		$.extend($.fn.filebox.defaults, {
			height: 36
		});
	}

	//数值微调框。垂直摆放时，设置默认高度为auto
	function uix_numberspinner() {
		$.extend($.fn.numberspinner.defaults, {
			height: 36
		});

		$.fn.numberspinner = new Proxy($.fn.numberspinner, {
			apply: function(target, thisArg, args) {
				if (typeof args[0] == "string") {
					return Reflect.apply(...arguments);
				} else {
					thisArg.each(function() {
						let opts = $.extend({}, $.fn.numberspinner.defaults, $.fn.numberspinner
							.parseOptions(this), args[0]);
						if (opts.spinAlign == 'vertical') { //垂直方向的数字框
							if (typeof opts.height == 'number' && opts.height < 100) {
								args[0].height = 'auto';
							}
						}
					});
					return Reflect.apply(...arguments);
				}
			}
		});
	}

	/**
	 * 日期时间微调框
	 */
	function uix_datetimespinner() {
		$.extend($.fn.datetimespinner.defaults, {
			height: 36
		});
	}

	// 下拉面板，实现效果点击箭头时，有动画
	function uix_combo() {
		//showPanelWhenInput是自定义属性，表示当输入时，是否显示面板
		$.extend($.fn.combo.defaults, {
			showPanelWhenInput: true
		});

		//以下部分是添加一个showPanelWhenInput自定义属性，来控制下拉面板是在输入时是否显示
		let oldKeyDown = $.fn.combo.defaults.inputEvents.keydown;
		$.fn.combo.defaults.inputEvents.keydown = function(e) {
			var target = e.data.target;
			var state = $.data(target, "combo");
			var opts = state.options;

			if (!opts.showPanelWhenInput) { //自定义属性，在输入时，是否显示面板
				if (opts.editable) { //只有在可编辑时，才显示面板
					if (state.restoreQueryTimer) {
						clearTimeout(state.restoreQueryTimer);
					}
					//使用一个定时器，避免keydown连续快速触发，同时保证触发后即刻被keydown触发
					state.restoreQueryTimer = setTimeout(function() {
						let oldShow = $.fn.combo.methods.showPanel; //缓存旧的显示面板函数
						$.fn.combo.methods.showPanel = $.noop; //替换为空操作

						let oldQuery = opts.keyHandler.query;
						//注意：此函数在keydown中，会被延时调用
						opts.keyHandler.query = function(q, e) {
							if (oldQuery) {
								oldQuery.call(this, q, e);
							}
							$.fn.combo.methods.showPanel = oldShow; //恢复为旧的显示面板函数
							opts.keyHandler.query = oldQuery;
						};
					}, opts.delay - 1);

					//此函数中会有一个延时调用
					oldKeyDown.call(this, e);
					return;
				}
			}
			oldKeyDown.call(this, e);
		};

		let oldParseFn = $.fn.combo.parseOptions; //原解析处理函数
		//对原函数进行重写，以支持解析showPanelWhenInput属性
		$.fn.combo.parseOptions = function(target) {
			let result = oldParseFn.call(this, target);
			return $.extend(result, $.parser.parseOptions(target, [{
				showPanelWhenInput: 'boolean',
			}]));
		};

		$.fn.combo = new Proxy($.fn.combo, {
			apply: function(target, thisArg, args) {
				if (typeof args[0] === "string") {
					return Reflect.apply(...arguments);
				} else {
					Reflect.apply(...arguments);
					return thisArg.each(function() {
						let state = $.data(this, "combo");
						let opts = state.options;
						let icons = $(this).textbox("options").icons;

						if (opts.onShowPanel) {
							let oldShow = opts.onShowPanel;
							opts.onShowPanel = function() {
								if (opts.hasDownArrow) { //如果有下拉箭头icon
									if (icons && icons.length > 0) {
										let arrow = $(this).textbox("getIcon", icons
											.length - 1);
										if (arrow.parents(".datebox").length == 0) {
											arrow.addClass("combo-arrow-up");
										}
									}
								}
								oldShow.call(this);
							};
						}

						if (opts.onHidePanel) {
							let oldHide = opts.onHidePanel;
							opts.onHidePanel = function() {
								if (opts.hasDownArrow) { //如果有下拉箭头icon
									if (icons && icons.length > 0) {
										let arrow = $(this).textbox("getIcon", icons
											.length - 1);
										if (arrow.parents(".datebox").length == 0) {
											arrow.removeClass("combo-arrow-up");
										}
									}
								}
								oldHide.call(this);
							};
						}
						/////
					});
				}
			}
		});
	}

	/**
	 * 下拉列表框
	 */
	function uix_combobox() {
		$.extend($.fn.combobox.defaults, {
			height: 36
		});
		//对于非easyloader的加载方式，在加载easyui.all.js时，已经对combobox的inputEvents完成了复制
		//所以需要重新覆盖一下引用
		$.fn.combobox.defaults.inputEvents.keydown = $.fn.combo.defaults.inputEvents.keydown;
	}

	/**
	 * 下拉树
	 */
	function uix_combotree() {
		$.extend($.fn.combotree.defaults, {
			height: 36
		});
	}

	// 下拉表格
	function uix_combogrid() {
		//combogrid间接从panel继承了属性height:auto，此处进行重写
		//至于panel的高度，在combogrid插件中，则为panelHeight。
		$.extend($.fn.combogrid.defaults, {
			height: 36
		});
	}

	//combotreegrid处理
	function uix_combotreegrid() {
		$.extend($.fn.combotreegrid.defaults, {
			height: 36
		});
	}

	//panel处理
	function uix_panel() {
		//扩展panel的默认属性
		$.extend($.fn.panel.defaults, {
			minimize: function(jq) {
				//注意：此处没有使用panel的close方法(close方法是关闭，而不是隐藏，关闭有其它附带行为，如onBeforeClose等)
				return jq.each(function() {
					$(this).panel("panel").hide();
				});
			}
		});

		$.fn.panel = new Proxy($.fn.panel, {
			apply: function(target, thisArg, args) {
				if (typeof args[0] === 'string') {
					return Reflect.apply(...arguments);
				} else {
					Reflect.apply(...arguments);
					return thisArg.each(function() {
						var me = this;
						let state = $.data(me, "panel");
						let opts = state.options;
						let $header = $(me).prev(".panel-header");

						//如果有皮肤属性
						let arr = opts.theme; //是一个数组或字符串
						if (arr) {
							if (typeof arr == "string") {
								arr = [arr];
							}
							arr.push("uix-elem"); //此句目的不明，待查
							arr.forEach(function(item) {
								$header.addClass(item);
							});
						}

						//如果有副标题属性
						let subTitle = opts.subTitle;
						if (subTitle) {
							let $title = $("<p>").text(subTitle);
							if (opts.subTitlePos == "right") {
								$title.addClass("right-sub-title");
							}
							$header.children(".panel-title").append($title);
						}

						let $collapseBtn = $header.find(".panel-tool-collapse");
						if ($collapseBtn.length > 0) { //表示有收缩按钮
							//重新绑定事件
							$collapseBtn.off("click").click(function() {
								if (opts.collapsed == true) {
									$(me).panel("expand", true);
								} else {
									$(me).panel("collapse", true);
								}
							});
						}

						///最小化按钮添加事件捕获
						var $minBtn = $header.find(".panel-tool-min");
						if ($minBtn.length > 0) {
							//使用事件捕获触发的事件，在默认的使用事件冒泡触发的事件之前
							//先使$.fn.hide失效，然后再触发原生的最小化事件
							var oldFn = $.fn.hide; //缓存旧的hide函数
							$minBtn[0].addEventListener("click", function() {
								$.fn.hide = $.noop;
								if (opts.minimized) {
									//表示已是最小化，本插件的标志，非opts.minimized这个标志
									opts._minimized = true;
								}
							}, true);

							//再在原生事件触发之后，再添加一个新的事件
							$minBtn[0].addEventListener("click", function() {
								//恢复旧的hide函数
								$.fn.hide = oldFn;

								if (opts._minimized) {
									opts._minimized = false;
									return;
								}

								$(me).metadata(state.panel);

								//自定义的动画实现，仅实现动画效果，不实现功能（功能由原函数实现）
								if (opts.minimize) {
									opts.minimize.call(me, $(me));
								}
							});
						}
					});
					///////////////////////////////////
				}
			}
		});

		//缓存方法
		let cached = {
			collapse: $.fn.panel.methods.collapse,
			expand: $.fn.panel.methods.expand,
			minimize: $.fn.panel.methods.minimize,
			slideUp: $.fn.slideUp,
			slideDown: $.fn.slideDown
		};

		//重写panel的收缩面板方法
		$.fn.panel.methods.collapse = function(jq, animate, options) {
			if (animate == true) {
				//重写jquery的slideUp方法，因默认动画太慢，在不修改easyui源码的原则下，只能如此间接操作
				function slideUp(uselessArg, cb) {
					let duration = options ? options.duration || "fast" : "fast";
					cached.slideUp.call($(this), duration, function() {
						if (cb && typeof cb == "function") {
							cb();
						}
					});
				}

				//迭代，修正每个panel对象的options中的onExpand和onCollapse属性
				jq.each(function() {
					let opts = $(this).panel("options");
					let preFn = opts.onBeforeCollapse;
					let postFn = opts.onCollapse;

					opts.onBeforeCollapse = function() {
						$.fn.slideUp = slideUp;
						preFn.call(this);
					};

					opts.onCollapse = function() {
						$.fn.slideUp = cached.slideUp;
						postFn.call(this);

						//重置
						opts.onBeforeCollapse = preFn;
						opts.onCollapse = postFn;
					};
				});

				//调用缓存的方法，此方法内部调用了slideUp方法
				return cached.collapse(jq, animate);
			} else {
				//原封不动调用原方法
				return cached.collapse(jq, animate);
			}
		};

		//重写panel的展开面板方法
		$.fn.panel.methods.expand = function(jq, animate, options) {
			if (animate == true) {
				//重写jquery的slideUp方法，因默认动画太慢，在不修改easyui源码的原则下，只能如此间接操作
				function slideDown(uselessArg, cb) {
					let duration = options ? options.duration || "fast" : "fast";
					cached.slideDown.call($(this), duration, function() {
						if (cb && typeof cb == "function") {
							cb();
						}
					});
				}

				//迭代，修正每个panel对象的options中的onExpand和onCollapse属性
				jq.each(function() {
					let opts = $(this).panel("options");
					let preFn = opts.onBeforeExpand;
					let postFn = opts.onExpand;

					opts.onBeforeExpand = function() {
						$.fn.slideDown = slideDown;
						preFn.call(this);
					};

					opts.onExpand = function() {
						$.fn.slideDown = cached.slideDown;
						postFn.call(this);
						opts.onBeforeExpand = preFn;
						opts.onExpand = postFn;
					};
				});

				//调用缓存的方法，此方法内部调用了slideUp方法
				return cached.expand(jq, animate);
			} else {
				//原封不动调用原方法
				return cached.expand(jq, animate);
			}
		};

		/**
		 * 当window在改变大小时，触发resize事件，进而触发panel的_resize事件。
		 * 重写默认事件，默认处理使用了一个节流函数，在windows停止改变尺寸的100ms之后，才会触发_resize事件
		 * 此处改为，随着windows的改变而改变，即取消节流处理，以提升响应式的用户体验
		 */
		$(window).off('.panel').on('resize.panel', function() {
			var layout = $('body.layout');
			if (layout.length) {
				layout.layout('resize');
				$('body').children('.easyui-fluid:visible').each(function() {
					$(this).triggerHandler('_resize');
				});
			} else {
				$('body').panel('doLayout');
			}
		});

		//最小化
		$.fn.panel.methods.minimize = function(jq) {
			return jq.each(function() {
				var me = this;
				var state = $.data(me, "panel");
				var opts = state.options;

				if (opts.minimized) { //如果已最小化，则取消操作。注：原生最小化操作可重复进行
					return true; //继续下一次循环
				}

				//缓存旧的hide函数
				var oldFn = $.fn.hide;
				//重写jquery的hide函数
				$.fn.hide = $.noop;
				//原最小化函数，参数是一个jquery对象
				cached.minimize.call($(me), $(me));
				//恢复旧的hide函数
				$.fn.hide = oldFn;

				$(me).metadata(state.panel);

				if (opts.minimize) {
					opts.minimize.call(me, $(me));
				}
			});
		}

		/**
		 * 移动到某个位置。如果在param的参数中指定minimize为true，则移动操作同时为最小化操作
		 * 此moveTo函数与原生函数move不同，move函数没有动画，但支持回调函数onMove。
		 * 同时moveTo函数记录了移动之前的位置和尺寸，方便后续还原
		 * 
		 * @param {Object} jq
		 * @param {Object} target 表示最小化到的位置所在dom
		 */
		$.fn.panel.methods.moveTo = function(jq, param) {
			if (param) {
				return jq.each(function() {
					var me = this;
					var state = $.data(me, "panel");
					var opts = state.options;

					if (param.minimize && !opts.minimized) {
						//缓存旧的hide函数
						let oldFn = $.fn.hide;
						//重写jquery的hide函数
						$.fn.hide = $.noop;
						//原最小化函数，参数是一个jquery对象
						cached.minimize.call($(me), $(me));
						//恢复旧的hide函数
						$.fn.hide = oldFn;
					}

					var panel = state.panel;
					$(me).metadata(panel);

					if (typeof param == "function") { //如果是函数
						param.call(me, $(me));
						return true;
					} else if (param instanceof $) { //如果参数是jquery对象，此种方式无法指定回调函数
						let offset = param.offset();
						param = {
							left: offset.left,
							top: offset.top,
							width: param.width(),
							height: param.height()
						};
					} else {
						parma = $.extend({}, param);
					}

					param.current = $(me).metadata();
					if (param.complete) {
						let oldFn = param.complete;
						param.complete = function() {
							oldFn.call(me, $(me));
						};
					}
					panel.moveTo(param);
				});
			} else {
				throw new Error("未指定移动目标位置参数");
			}
		};

		/**
		 * 恢复到最小化之前的位置，此方法和restore不同，后者是恢复到最大化之前的位置
		 */
		$.fn.panel.methods.restoreTo = function(jq, param) {
			return jq.each(function() {
				var me = this;
				var state = $.data(me, "panel");
				var opts = state.options;

				var metadata = $(me).metadata(); //获取位置和尺寸元数据
				param = $.extend({}, param, metadata || {});
				//恢复到最小化之前的状态
				state.panel.show().moveTo(param).css("height", "");
				//移除缓存
				$(me).removeData("metadata");
				opts.minimized = false;
			});
		};
		///////////////////
	}

	// 选项卡
	function uix_tabs() {
		$.extend($.fn.tabs.defaults, {
			tabHeight: 36
		});

		// 点击选项卡左右两端按钮
		$.fn.tabs.methods.scrollBy = function(jq, deltaX) {
			return jq.each(function() {
				var $wrap = $(this).find('>div.tabs-header>div.tabs-wrap');
				var pos = Math.min($wrap._scrollLeft() + deltaX, getMaxScrollWidth());

				if (window.Velocity) { //如果引入了velocity库，则使用velocity，性能强
					// 为保证动画的流畅性，此处使用固定的duration:100ms，原配置项scrollDuration失效
					$wrap.velocity("stop").velocity({
						scrollLeft: pos + "px"
					}, {
						duration: 100,
						easing: "ease"
					});
				} else {
					$wrap.stop(true, true).animate({
						scrollLeft: pos + "px"
					}, 100, "swing");
				}

				function getMaxScrollWidth() {
					var w = 0;
					var ul = $wrap.children('ul');
					ul.children('li').each(function() {
						w += $(this).outerWidth(true);
					});
					return w - $wrap.width() + (ul.outerWidth() - ul.width());
				}
			});
		};

		/**
		 * 根据id查找tab，仅返回唯一Tab
		 */
		$.fn.tabs.methods.getTabById = function(jq, tabId) {
			let $tab;
			jq.each(function() {
				var tabs = $(this).tabs("tabs"); //tabs是一个数组
				$.each(tabs, function(idx, item) {
					var id = $(item).panel("options").id;
					if (id == tabId) {
						$tab = $(this);
						return false;
					}
				});

				if ($tab) {
					return false;
				}
			});
			return $tab;
		};


		//删除一个iframeTab
		$.fn.tabs.methods.destroyIframeTab = function($jq, tab) {
			return $jq.each(function() {
				let $tab;
				if (typeof tab == "string") { // 按tabId进行查询
					$tab = $(this).tabs("getTabById", tab);
				} else {
					$tab = $(tab);
				}

				let $tabBody = $tab.panel("body");
				let $frame = $("iframe", $tabBody);

				if ($frame.length > 0) {
					try { // 跨域会拒绝访问，这里处理掉该异常
						$frame[0].contentWindow.document.write('');
						$frame[0].contentWindow.close();
					} catch (e) {
						// Do nothing
					}
					$frame.remove();
				}
				$tabBody.html('');
			});
		};

		//重载iframeTab
		$.fn.tabs.methods.reloadIframeTab = function($jq, params) {
			return $jq.each(function() {
				let $tab;
				if (params.id) {
					$tab = $(this).tabs("getTabById", params.id);
				} else {
					$tab = $(this).tabs("getTab", params.which);
				}

				if ($tab == null) {
					return;
				}

				// 释放iframe内存
				$(this).tabs("destroyIframeTab", $tab);

				var $tabBody = $tab.panel("body");
				$tabBody.css({
					"overflow": "hidden",
					"position": "relative"
				});

				var $mask = $("<div class='tab-iframe-mask'></div>").appendTo($tabBody);
				var $maskMessage = $("<div class='tab-iframe-mask-msg'>" + (params.iframe.message ||
					"载入中，请稍候...") + "</div>").appendTo($tabBody);
				var $containter = $("<div class='tab-iframe-container'></div>").appendTo($tabBody);

				// 创建iframe的dom元素
				var iframe = $("<iframe></iframe>")[0];
				iframe.src = params.iframe.src;
				iframe.frameBorder = params.iframe.frameBorder || 0;
				iframe.height = params.iframe.height || "100%";
				iframe.width = params.iframe.width || "100%";
				iframe.scrolling = params.iframe.scrolling || "auto";
				iframe.marginwidth = params.iframe.marginwidth || 0;
				iframe.marginheight = params.iframe.marginheight || 0;

				if (iframe.attachEvent) {
					iframe.attachEvent("onload", function() {
						$([$mask[0], $maskMessage[0]]).fadeOut(params.iframe.delay || "fast",
							function() {
								$(this).remove();
							});
					});
				} else {
					iframe.onload = function() {
						$([$mask[0], $maskMessage[0]]).fadeOut(params.iframe.delay || "fast",
							function() {
								$(this).remove();
							});
					};
				}
				$containter[0].appendChild(iframe);
			});
		};

		//添加iframeTab
		$.fn.tabs.methods.addIframeTab = function($jq, params) {
			return $jq.each(function() {
				if (params.tab.href) {
					delete params.tab.href;
				}
				$(this).tabs("add", params.tab);
				$(this).tabs("reloadIframeTab", {
					"id": params.tab.id,
					"which": params.tab.title,
					"iframe": params.iframe
				});
			});
		};

		//更新iframeTab
		$.fn.tabs.methods.updateIframeTab = function($jq, params) {
			return $jq.each(function() {
				params.iframe = params.iframe || {};
				if (!params.iframe.src) { // 如果没有提供iframe的src参数，则从已有的iframe中提取
					var $tab;
					if (params.id) {
						$tab = $(this).tabs("getTabById", params.id);
					} else {
						$tab = $(this).tabs("getTab", params.which);
					}
					if ($tab == null) {
						return;
					}
					var $tabBody = $tab.panel("body");
					var $iframe = $tabBody.find("iframe");
					if ($iframe.length === 0) {
						return;
					}
					$.extend(params.iframe, {
						"src": $iframe.attr('src')
					});
				}
				$(this).tabs("loadIframeTab", params);
			});
		};
	}

	/**
	 * 窗口组件
	 * 功能增强： 
	 * 1.实现拖动时，本地位置直接跟随鼠标移动，而不是移动一个虚线框
	 */
	function uix_window() {
		//扩展window的默认属性
		$.extend($.fn.window.defaults, {
			minimize: function(jq) {
				jq.each(function() {
					var me = this;
					var state = $.data(me, "window");
					if (state.window) {
						state.window.hide();
					}
					if (state.shadow) {
						state.shadow.hide();
					}
				});
			}
		});

		$.fn.window = new Proxy($.fn.window, {
			apply: function(target, thisArg, args) {
				if (typeof args[0] == 'string') {
					return Reflect.apply(...arguments);
				} else {
					//当第一个参数是options对象，表示创建easyui组件对象
					Reflect.apply(...arguments);

					return thisArg.each(function() {
						var me = $(this);
						//获取window的state
						let winState = $.data(this, "window");
						//获取draggable组件的state，第一个参数需要是dom对象
						let dragState = $.data(winState.window.get(0), "draggable");
						//获取draggable组件的options
						let opts = dragState.options;
						var f1 = opts.onStartDrag;
						var f2 = opts.onStopDrag;
						var modelMask = $("<div class='window-drag-mask'></div>")

						opts.onStartDrag = function() {
							f1.call(this, ...arguments);
							winState.proxy.remove();
							winState.pmask.remove();

							//添加一个全屏遮罩，防止窗口移动时，焦点进入到其它组件
							var zIndex = winState.shadow.css("z-index");
							zIndex = parseInt(zIndex) - 1;
							modelMask.css("z-index", zIndex);
							modelMask.appendTo($(document.body));

							//此为移动窗体本身，连带阴影
							winState.proxy = winState.window.add(winState.shadow);
						};

						opts.onStopDrag = function() {
							//缓存jquery的remove方法
							var fnRemove = $.fn.remove;
							//重写jquery的remove()方法，防止window本体被删除
							$.fn.remove = function() {
								//do nothing...
							}
							//f2的操作调用了proxy的remove，之后为赋值null
							f2.call(this, ...arguments);

							//恢复jquery的remove方法
							$.fn.remove = fnRemove;
							winState.window.css("height", "unset");
							modelMask.remove();
						}
					});
				}
			}
		});

		//移动到某个位置
		$.fn.window.methods.moveTo = function(jq, param) {
			if (param) {
				return jq.each(function() {
					var me = this;
					var state = $.data(me, "window");
					$(me).panel("moveTo", param);

					if (state.shadow) { //如果有阴影，则阴影也移动，但不触发回调函数
						if (param.complete) {
							param = $.extend({}, param);
							param.complete = null;
						}
						state.shadow.moveTo(param);
					}
				});
			} else {
				throw new Error("未指定移动目标位置参数");
			}
		};

		/**
		 * 恢复到最小化之前的位置，不同于restore方法是恢复到最大化之前的位置
		 * 
		 * @param {Object} jq
		 */
		$.fn.window.methods.restoreTo = function(jq, param) {
			return jq.each(function() {
				let me = this;

				let metadata = $(me).metadata(); //必须先获取
				param = $.extend({}, param, metadata || {});
				$(me).panel("restoreTo", param); //此调用会移除metadata

				let state = $.data(me, "window");
				if (state.shadow) {
					if (param.complete) {
						param = $.extend({}, param);
						param.complete = null;
					}
					state.shadow.show().moveTo(param).css("height", "");
				}
			});
		};

		/**
		 * 窗口获取焦点
		 * @param {Object} jq
		 */
		$.fn.window.methods.requestFocus = function(jq) {
			return jq.each(function() {
				let me = this;
				let state = $.data(me, 'window');
				if (state.mask) {
					state.mask.css('z-index', $.fn.window.defaults.zIndex++);
				}
				if (state.shadow) {
					state.shadow.css('z-index', $.fn.window.defaults.zIndex++);
				}
				state.window.css('z-index', $.fn.window.defaults.zIndex++);
			});
		}
		//////////////
	}

	/**
	 * 简易提示对话框，未使用遮罩或flex布局居中，是因为modal背景层阻碍用户操作的时间太长
	 */
	function uix_messager() {
		$.messager.msg = function(msg, timeout) {
			let $msg = $("<div class='uix-messager-msg'>").text(msg).appendTo(document.body);
			let w = $(window).width();
			let h = $(window).height();

			let left = (w - $msg.width()) / 2;
			let top = (h - $msg.height()) / 2;

			$msg.offset({
				left: left,
				top: top
			}).css("opacity", "1");

			if (timeout == undefined) {
				timeout = 1500;
			}

			setTimeout(function() {
				$msg.stop().animate({
					opacity: 0
				}, 200, function() {
					$msg.remove();
				});
			}, timeout)
		}
	}

	/**
	 * 切换按钮
	 * 
	 */
	function uix_switchbutton() {
		$.extend($.fn.switchbutton.defaults, {
			width: 56,
			height: 24,
			handleWidth: 24,
			onText: "是",
			offText: "否"
		});

		$.fn.switchbutton = new Proxy($.fn.switchbutton, {
			apply: function(target, thisArg, args) {
				if (typeof args[0] === 'string') {
					return Reflect.apply(...arguments);
				} else {
					Reflect.apply(...arguments);
					return thisArg.each(function() {
						var me = this;
						var state = $.data(me, 'switchbutton');
						var opts = state.options;
						var oldFn = opts.onChange;

						state.switchbutton.find(".switchbutton-handle").css({
							width: opts.height - 2,
							height: opts.height - 2,
							marginLeft: -(opts.height - 2) / 2,
							marginTop: 1
						});

						if (opts.checked) {
							state.switchbutton.removeClass("off");
						} else {
							state.switchbutton.addClass("off");
						}

						opts.onChange = function(checked) {
							var me = this;
							if (checked) {
								state.switchbutton.removeClass("off");
							} else {
								state.switchbutton.addClass("off");
							}
							oldFn.call(me, checked);
						};
					});
				}
			}
		});
	}

	/**
	 * datagrid组件，editor添加了switchbutton组件
	 */
	function uix_datagrid() {
		$.extend($.fn.datagrid.defaults.editors, {
			switchbutton: {
				init: function(container, options) {
					var input = $('<input type="text" class="datagrid-editable-input">').appendTo(
						container);
					options = $.extend({}, options, {
						width: 56,
						height: 24,
						handleWidth: 24,
					});
					input.switchbutton(options);
					return input;
				},
				destroy: function(target) {
					let button = $.data(target[0], "switchbutton").switchbutton;
					button.off().remove();
					$(target).remove();
				},
				getValue: function(target) {
					let opts = $(target).switchbutton("options");
					return opts.checked;
				},
				setValue: function(target, value) {
					let checked = value ? true : false;
					if (checked) {
						$(target).switchbutton("check");
					} else {
						$(target).switchbutton("uncheck");
					}
				}
			},
			comboricheditor: { //富文本编辑器，markdown编辑器
				init: function(container, options) { //此方法会被多次调用，不会缓存任何数据
					let $input = $('<input type="text" class="datagrid-editable-input" />').appendTo(
						container);
					//注意：vditor的初始化过程是比较慢的
					$input.comboricheditor({
						width: "100%",
						vditorOpts: options
					});
					return $input;
				},
				destroy: function(target) {
					$(target).combo("destroy");
					$(target).remove();
				},
				getValue: function(target) { //取值就是为了设置到td中，target即在init中创建的表单输入框
					return $(target).comboricheditor("getValue");;
				},
				setValue: function(target, value) { //value为从列中获取到的值，有可能已丢失换行符
					$(target).comboricheditor("setValue", value);
				}
			}
		});

		$.fn.datagrid = new Proxy($.fn.datagrid, {
			apply: function(target, thisArg, args) {
				if (typeof args[0] === 'string') {
					return Reflect.apply(...arguments);
				} else {
					Reflect.apply(...arguments);
					return thisArg.each(function() {
						var me = this;
						var state = $.data(me, 'datagrid');
						var opts = state.options;

						//paginate-info的是否居左对齐
						if (opts.paginationInfoLeft) {
							state.panel.addClass("pagination-info-left");
						}
					});
				}
			}
		});
	}

	/**
	 * 分页组件
	 */
	function uix_pagination() {
		//nothing to do now...
	}

	/**
	 * 连字符命名法（注意，不是下划线命名）转换成驼峰式命名法
	 */
	function hyphenateToCamelCase(str) {
		var o = /-(\w)/g;
		return str.replace(o, function(a, b) {
			return b.toUpperCase()
		});
	}

	//创建表单数据对象，第一个参数支持选择器，支持dom元素，支持jquery对象
	function buildFormData(jqForm, options) {
		let opts = $.extend({
			ignoreEmptyValue: false,
			joinValueArray: false
		}, options || {});

		//结果表单数据
		var formData = {};

		var array = $(jqForm).serializeArray();
		array.forEach(function(item) {
			if ((item.value == undefined || item.value == null || item.value == "") && opts
				.ignoreEmptyValue) {
				return true;
			}

			let key, val;
			if (opts.handler) {
				item = opts.handler.call(array, item);
				key = item.name;
			} else {
				key = hyphenateToCamelCase(item.name);
			}
			val = item.value;

			let old = formData[key];
			if (old != undefined) {
				if (opts.joinValueArray) {
					formData[key] = old + "," + val;
				} else {
					if (Array.isArray(old)) {
						old.push(val);
					} else {
						formData[key] = [old, val];
					}
				}
			} else {
				formData[key] = val;
			}
		});
		return formData;
	}

	//以上为easyui的补丁
	let patch = function(plugin) {
		if (patch[plugin]) {
			return; //表示已经处理过
		}

		if ($.fn[plugin]) {
			switch (plugin) {
				case "linkbutton":
					uix_linkbutton();
					break;
				case "progressbar":
					uix_progressbar();
					break;
				case "validatebox":
					uix_validatebox();
					break;
				case "textbox":
					uix_textbox();
					break;
				case "passwordbox":
					uix_passwordbox();
					break;
				case "searchbox":
					uix_searchbox();
					break;
				case "numberbox":
					uix_numberbox();
					break;
				case "filebox":
					uix_filebox();
					break;
				case "calendar":
					uix_calendar();
					break;
				case "datebox":
					uix_datebox();
					break;
				case "datetimebox":
					uix_datetimebox();
					break;
				case "numberspinner":
					uix_numberspinner();
					break;
				case "datetimespinner":
					uix_datetimespinner();
					break;
				case "combo":
					uix_combo();
					break;
				case "combobox":
					uix_combobox();
					break;
				case "combotree":
					uix_combotree();
					break;
				case "combogrid":
					uix_combogrid();
					break;
				case "combotreegrid":
					uix_combotreegrid();
					break;
				case "panel":
					uix_panel();
					break;
				case "tabs":
					uix_tabs();
					break;
				case "window":
					uix_window();
					break;
				case "switchbutton":
					uix_switchbutton();
					break;
				case "datagrid":
					uix_datagrid();
					break;
				case "pagination":
					uix_pagination();
					break;
			}

			//置标志
			patch[plugin] = true;
		}

		//对话框patch
		if (plugin === "messager") {
			uix_messager();
			patch[plugin] = true;

			//此句仅仅是为了可以使用uix.alert()这种语法
			$.extend(patch, $.messager, {
				buildFormData
			});
		}
	};

	//此句仅仅是为了可以使用uix.alert()这种语法
	window.uix = patch;

	//添加日期范围框的自动解析
	if ($.parser) {
		$.parser.plugins.push("daterangebox"); //日期范围选择框
		$.parser.plugins.push("comboricheditor"); //下拉markdown富文本编辑器
	}

	//给jquery扩展一个moveTo函数，调用velocity函数进行动画
	//params参数是一个json对象，包括：left、top、width、height、duration以及complate回调函数
	$.fn.moveTo = function(params) {
		return this.each(function() {
			var me = this;
			if (window.Velocity) { //如果引入了velocity库，则使用velocity，性能强
				params = $.extend({}, params);

				if (params.current) {
					params.left = [params.left, params.current.left];
					params.top = [params.top, params.current.top];
					params.width = [params.width, params.current.width];
					params.height = [params.height, params.current.height];
				}

				$(me).velocity(params, {
					duration: params.duration || 250,
					complete: function() {
						if (params.complete) {
							params.complete.call(me, $(me));
						}
					}
				});
			} else { //使用jquery动画，性能弱
				$(me).animate(params, params.duration || 250, function() {
					if (params.complete) {
						params.complete.call(me, $(me));
					}
				});
			}
		});
	};

	/**
	 * 保存或获取jq对象的元数据，包括：位置和尺寸
	 * 参数和调用都均应为一个实例
	 */
	$.fn.metadata = function(jq) {
		var me = this;
		if (jq) {
			var offset = jq.offset();
			//缓存窗口当前状态位置和尺寸数据
			var metadata = {
				left: offset.left,
				top: offset.top,
				width: jq.outerWidth(),
				height: jq.outerHeight()
			};
			return $(me).data("metadata", metadata);
		} else {
			return $(me).data("metadata");
		}
	};

	//完全放弃支持easyloader的使用方式
	$.parser.plugins.forEach(function(item) {
		patch(item);
	});
	//对于完整加载，要单独给messager修正
	patch("messager");

	////////////
})(jQuery);
