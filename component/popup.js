(function(T) {
	var throttle = T.throttle,
        Class = T.Class,
        Overlay = T.Overlay,
        adjust = T.adjust,
        detector = T.detector,
        isNotSupportFixed = detector.browser.ie && detector.browser.version < 7;

	var defaults = {
		withOverlay: true,
		overlayOption: {

		},
		destoryOnHide: false,
		top: "center"
    };

	var Popup = new Class;
    var cache = {};

	Popup.include({
		init: function(selector, options) {
            if (typeof selector == "string") {
                if (cache[selector]) {
                    return cache[selector];
                }
                cache[selector] = this;
            }

			this.options = $.extend(true, {}, defaults, options);
			this.element = $(selector);

			var position = isNotSupportFixed ? 'absolute' : 'fixed';
			this.element.css({
				position: position
				// zIndex: this.options.zindex
			});

			if (this.options.withOverlay) {
				this.overlay = new Overlay(this.options.overlayOption);
			}

			// 在事件处理程序中使用this
            this.adjustProxy = this.proxy(throttle(this.adjust));
            this.hideProxy  = this.proxy(this.hide);
		},

		show: function() {
			if (this.overlay) {
				this.overlay.show();
			}
			this.element.show();
			this.adjust();
			this.on();
		},

		hide: function() {
			if (this.overlay) {
				this.overlay.hide();
			}
			this.element.hide();
			this.off();

			if (this.options.destoryOnHide) {
				this.element.remove();
			}
		},

		adjust: function() {
            // absolute才需要调整
            adjust(this.element, isNotSupportFixed, this.options.top);
		},

		on: function() {
            this.element.on('click', '.close', this.hideProxy);
			$(window).on('scroll resize', this.adjustProxy);
		},

		off: function() {
            this.element.off('click', '.close', this.hideProxy);
			$(window).off('scroll resize', this.adjustProxy);
		}
	});



    $.fn.Popup = function(options) {
    	var selector = this.selector;
    	
    	var p = new Popup(selector, options);
    	return p;
    };

    T.mix(T, {
    	Popup: Popup
    });
})(tbtx);
