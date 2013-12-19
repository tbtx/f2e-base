(function($, global) {
	var tbtx = global.tbtx,
        Class = tbtx.Class,
        Widget = tbtx.Widget,
        Overlay = tbtx.Overlay,
        isInDocument = tbtx.isInDocument,
        DEFAULT_PARENT_NODE = Widget.DEFAULT_PARENT_NODE;
    
    var ua = (window.navigator.userAgent || "").toLowerCase(), 
        isIE6 = ua.indexOf("msie 6") !== -1;

    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]";
        };
    }
    var isFunction = isType("Function"),
    	isString = isType("String");

	var Popup = new Class(Overlay);

	Popup.include({
        attrs: {
            withOverlay: true,
            overlayOption: {

            },
            destoryOnHide: false,

            className: "popup",
            style: {
                display: "none",
                position: isIE6 ? "absolute" : "fixed",
            },
           
            opacity: null,
            color: null,
            hideOnClick: null,

            parentNode: DEFAULT_PARENT_NODE,
            mask: ''     // 标示popup类型，在事件里作为数据传递，命名害死人
        },

        events: {
            "click .J-popup-close": "hide",
            "click .close": "hide"  
        },

		init: function(selector, config) {
            config = config || {};
            var isHtml = isString(selector) && (selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3);
            if (isHtml) {
                config.template = selector;
            } else {
                config.element = selector;
            }
            
            if (config.align) {
                config.align.baseElement = config.parentNode || tbtx.VIEWPORT;
            }

            Popup.superclass.init.call(this, config);

            // tbtx.log(this);
   //          this.config(options);

   //          this.mask = '';     // 标示popup，在事件里作为数据传递
			// this.$element = $(selector);

			// // html append to body
			// if (!this.$element.parent().length && typeof selector == "string") {
			// 	this.$element.appendTo('body').hide();
			// }

			// this.$element.data('tbtx.pop', this);

			// if (this.options.withOverlay) {
			// 	this.overlay = new Overlay(this.options.overlayOption);
			// }

			// // 在事件处理程序中使用this
   //          this.adjustProxy = this.proxy(throttle(this.adjust));
   //          var self = this;
   //          this.hideProxy  = function() {
   //              self.hide();
   //          };
		},

        initProps: function() {
            if (this.get("parentNode") === DEFAULT_PARENT_NODE) {
                this.set("width", null);
                this.set("height", null);
            }
        },

        setup: function() {
            if (this.get("withOverlay")) {
                var config = this.get("overlayOption") || {},
                    parentNode = this.get("parentNode");
                config.parentNode = this.get("parentNode");

                this.overlay = new Overlay(config).render();
            }

            this.element.data("tbtx.pop", this);

            Popup.superclass.setup.call(this);
        },

        show: function(effect, callback) {
            if (!this.rendered) {
                this.render();
            }
            this.overlay && this.overlay.show();
            this.element.show();
            this.set("visible", true);
            return this;
        },

        hide: function(effect, callback) {
            this.overlay && this.overlay.hide();
            this.element.hide();
            this.set("visible", false);
            return this;
        },

         _setPosition: function() {
            if (!isInDocument(this.element[0])) return;
            var align = this.get("align");
            // 如果align为空，表示不需要使用js对齐
            if (!align) return;
            var isHidden = this.element.css("display") === "none";
            // 在定位时，为避免元素高度不定，先显示出来
            if (isHidden) {
                this.element.css({
                    visibility: "hidden",
                    display: "block"
                });
            }
            
            // 替换了调整方法
            this.adjust();

            // 定位完成后，还原
            if (isHidden) {
                this.element.css({
                    visibility: "",
                    display: "none"
                });
            }
            return this;
        },

        // 重新overlay的prepend为append
        render: function(selector) {
            if (!this.rendered) {
                this._renderAndBindAttrs();
                this.rendered = true;
            }
            // 插入到文档流中
            var parentNode = this.get("parentNode");
            if (parentNode && !isInDocument(this.element[0])) {
                this.element.appendTo(parentNode);
            }
            return this;
        },

        // 不使用父类的设置宽高函数
        _onRenderWidth: function(val) {
            // this.element.css("width", val);
        },
        _onRenderHeight: function(val) {
            // this.element.css("height", val);
        },

		// show: function(effect, callback) {
  //           // 不能像overlay那样通过是否在dom里来判断是否显示
  //           if (this.visibile) {
  //               return;
  //           }
  //           this.visibile = true;
		// 	// show(function)
		// 	if (effect && isFunction(effect)) {
		// 		callback = effect;
		// 		effect = undefined;
		// 	}

		// 	var position = isNotSupportFixed ? 'absolute' : 'fixed';
		// 	this.$element.css({
		// 		position: position
		// 	});
		// 	// 先显示元素，再显示overlay，否则没有定位获取的高度会偏高
		// 	if (this.overlay) {
		// 		this.overlay.show(this.$element);
		// 	}
		// 	this.adjust();


		// 	if (effect && typeof effect == "string") {
		// 		this.$element[effect]({
		// 			complete: callback
		// 		});
		// 	} else {
		// 		this.$element.show();
		// 		isFunction(callback) && callback();
		// 	}

		// 	var self = this;
		// 	setTimeout(function () {
  //               self.$element.trigger('tbtx.popup.show', {
  //                   mask: self.mask
  //               });

  //           }, 0);

		// 	this.bind();

		// },

		// hide: function(effect, callback) {
  //           if (!this.visibile) {
  //               return;
  //           }
  //           this.visibile = false;

		// 	if (effect && isFunction(effect)) {
		// 		callback = effect;
		// 		effect = undefined;
		// 	}

		// 	if (effect && isString(effect)) {
		// 		this.$element[effect]({
		// 			complete: callback
		// 		});
		// 	} else {
		// 		this.$element.hide();
		// 		isFunction(callback) && callback();
		// 	}
		// 	var self = this;
		// 	setTimeout(function () {
  //               self.$element.trigger('tbtx.popup.hide', {
  //                   mask: self.mask
  //               });
  //           }, 0);

		// 	if (this.overlay) {
		// 		this.overlay.hide(effect);
		// 	}

		// 	this.unbind();

		// 	if (this.options.destoryOnHide) {
		// 		this.$element.remove();
		// 	}
  //           // ie 下 a标签
  //           return false;
		// },

		adjust: function() {
            tbtx.center(this.element, this.get("parentNode"));
            // absolute才需要调整
            // adjust(this.$element, isNotSupportFixed, this.options.top);
		}

		// bind: function() {
  //           this.$element.on('click', '.J-popup-close', this.hideProxy);
  //           this.$element.on('click', '.close', this.hideProxy);
		// 	$(window).on('scroll resize', this.adjustProxy);
		// },

		// unbind: function() {
  //           this.$element.off('click', '.J-popup-close', this.hideProxy);
  //           this.$element.off('click', '.close', this.hideProxy);
		// 	$(window).off('scroll resize', this.adjustProxy);
		// }
	});



    $.fn.Popup = function(config) {
    	return $(this).data('tbtx.pop') || new Popup(this, config);
    };

    tbtx.Popup = Popup;
})(jQuery, this);
