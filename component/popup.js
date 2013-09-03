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

	Popup.include({
		init: function(selector, options) {

			this.options = $.extend(true, {}, defaults, options);
			this.$element = $(selector);

			this.$element.data('tbtx.pop', this);

			
			if (this.options.withOverlay) {
				this.overlay = new Overlay(this.options.overlayOption);
			}

			// 在事件处理程序中使用this
            this.adjustProxy = this.proxy(throttle(this.adjust));
            this.hideProxy  = this.proxy(this.hide);
		},

		show: function(effect) {
			if (this.overlay) {
				this.overlay.show(effect);
			}

			var position = isNotSupportFixed ? 'absolute' : 'fixed';
			this.$element.css({
				position: position
			});
			if (effect) {
				this.$element[effect]();
			} else {
				this.$element.show();
			}

			var self = this;
			setTimeout(function () { self.$element.trigger('tbtx.popup.show') }, 0);

			this.adjust();
			this.on();
		},

		hide: function(effect) {
			if (effect) {
				this.$element[effect]();
			} else {
				this.$element.hide();
			}
			var self = this;
			setTimeout(function () { self.$element.trigger('tbtx.popup.hide') }, 0);

			if (this.overlay) {
				this.overlay.hide(effect);
			}

			this.off();

			if (this.options.destoryOnHide) {
				this.$element.remove();
			}
		},

		adjust: function() {
            // absolute才需要调整
            adjust(this.$element, isNotSupportFixed, this.options.top);
		},

		on: function() {
            this.$element.on('click', '.close', this.hideProxy);
			$(window).on('scroll resize', this.adjustProxy);
		},

		off: function() {
            this.$element.off('click', '.close', this.hideProxy);
			$(window).off('scroll resize', this.adjustProxy);
		}
	});



    $.fn.Popup = function(options) {
    	return $(this).data('tbtx.pop') || new Popup(this, options);
    };

    T.mix(T, {
    	Popup: Popup
    });
})(tbtx);
