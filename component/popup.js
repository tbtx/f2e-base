(function($, global) {
	var tbtx = global.tbtx,
        throttle = tbtx.throttle,
        Class = tbtx.Class,
        Overlay = tbtx.Overlay,
        adjust = tbtx.adjust,
        detector = tbtx.detector,
        isNotSupportFixed = detector.browser.ie && detector.browser.version < 7;

	var defaults = {
		withOverlay: true,
		overlayOption: {

		},
		destoryOnHide: false,
		top: "center"
    };

    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]";
        };
    }

    var isFunction = isType("Function"),
    	isString = isType("String");

	var Popup = new Class;
    Popup.Implements([tbtx.Events, tbtx.Aspect]);

	Popup.include({
		init: function(selector, options) {
            this.config(options);

            this.mask = '';     // 标示popup，在事件里作为数据传递
			this.$element = $(selector);

			// html append to body
			if (!this.$element.parent().length && typeof selector == "string") {
				this.$element.appendTo('body').hide();
			}

			this.$element.data('tbtx.pop', this);

			if (this.options.withOverlay) {
				this.overlay = new Overlay(this.options.overlayOption);
			}

			// 在事件处理程序中使用this
            this.adjustProxy = this.proxy(throttle(this.adjust));
		},

        config: function(options) {
            this.options = $.extend(true, {}, defaults, options);
        },

		show: function(effect, callback) {
            // 不能像overlay那样通过是否在dom里来判断是否显示
            if (this.visibile) {
                return;
            }
            this.visibile = true;
			// show(function)
			if (effect && isFunction(effect)) {
				callback = effect;
				effect = undefined;
			}

			var position = isNotSupportFixed ? 'absolute' : 'fixed';
			this.$element.css({
				position: position
			});
			// 先显示元素，再显示overlay，否则没有定位获取的高度会偏高
			if (this.overlay) {
				this.overlay.show(this.$element);
			}
			this.adjust();


			if (effect && typeof effect == "string") {
				this.$element[effect]({
					complete: callback
				});
			} else {
				this.$element.show();
				isFunction(callback) && callback();
			}

			var self = this;
			setTimeout(function () {
                self.$element.trigger('tbtx.popup.show', {
                    mask: self.mask
                });

            }, 0);

			this.bind();

		},

		hide: function(effect, callback) {
            if (!this.visibile) {
                return;
            }
            this.visibile = false;

			if (effect && isFunction(effect)) {
				callback = effect;
				effect = undefined;
			}

			if (effect && isString(effect)) {
				this.$element[effect]({
					complete: callback
				});
			} else {
				this.$element.hide();
				isFunction(callback) && callback();
			}
			var self = this;
			setTimeout(function () {
                self.$element.trigger('tbtx.popup.hide', {
                    mask: self.mask
                });
            }, 0);

			if (this.overlay) {
				this.overlay.hide(effect);
			}

			this.unbind();

			if (this.options.destoryOnHide) {
				this.$element.remove();
			}
            // ie 下 a标签
            return false;
		},

		adjust: function() {
            // absolute才需要调整
            adjust(this.$element, isNotSupportFixed, this.options.top);
		},

		bind: function() {
            this.hideProxy  = this.proxy(this.hide);
            this.$element.on('click', '.J-popup-close', this.hideProxy);
            this.$element.on('click', '.close', this.hideProxy);
			$(window).on('scroll resize', this.adjustProxy);
		},

		unbind: function() {
            this.$element.off('click', '.J-popup-close', this.hideProxy);
            this.$element.off('click', '.close', this.hideProxy);
			$(window).off('scroll resize', this.adjustProxy);
		}
	});



    $.fn.Popup = function(options) {
    	return $(this).data('tbtx.pop') || new Popup(this, options);
    };

    tbtx.Popup = Popup;
})(jQuery, this);
