/* tbtx-base-js -- 2013-09-03 */
(function(T) {
    var substitute = T.substitute,
        throttle = T.throttle,
        pageWidth = T.pageWidth,
        pageHeight = T.pageHeight,
        Class = T.Class;

    // 最佳实践是添加className而非cssText，但是这里为了减少组件对CSS的依赖
    var template = "<div id='{{ id }}' class='{{ class }}'></div>",
        cssTemplate = "; display: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%; opacity: {{ opacity }}; filter:alpha(opacity={{ alpha }}); background: {{ color }};",
        def = {
            'id': 'overlay',
            'class': 'overlay',
            'opacity': 0.5,
            'color': '#000',
            'hideOnClick': false// 点击遮罩层是否关闭
        };

    var Overlay = new Class;

    Overlay.include({
        init: function(options) {
            this.config(options);

            // 在事件处理程序中使用this
            this.resizeProxy = this.proxy(throttle(function() {
                this.resize();
            }));
            // 只有hideOnClick为true时才使用
            this.hideProxy = this.proxy(this.hide); // 
        },

        // 仅仅加到dom里，不显示
        render: function() {
            var selector = '#' + this.options.id;
            if ($(selector).length) {       // overlay已经存在
                return;
            }
            this.$element = $(substitute(template, this.options));
            this.$element[0].style.cssText += substitute(cssTemplate, this.options);
                
            this.options.zindex && this.$element.css({
                zindex: this.options.zindex
            });
            this.$element.prependTo($('body'));
        },

        config: function(options) {
            this.options = $.extend({}, def, options);
            this.options.alpha = this.options.opacity * 100;
        },

        remove: function() {
            this.$element.remove();
        },

        show: function(effect) {
            this.render();      // 每次渲染，因为关闭的时候remove掉了
            
            effect && this.$element[effect]();
            !effect && this.$element.show();

            this.resize();
            this.on(); // 只有显示的时候进行事件监听

            setTimeout(function () { $('body').trigger('tbtx.overlay.show') }, 0);
            // this.options.onShow.call(this, this.element);
        },
        hide: function(effect) {
            effect && this.$element[effect]();
            !effect && this.$element.hide();
            
            this.off();
            this.remove();

            // this.options.onHide.call(this, this.element);
            setTimeout(function () { $('body').trigger('tbtx.overlay.hide') }, 0);
        },
        resize: function() {
            this.$element.css({
                width: pageWidth(),
                height: pageHeight()
            });
        },

        // event on & off
        on: function() {
            $(window).on('scroll resize', this.resizeProxy);

            if (this.options.hideOnClick) {
                this.$element.on('click', this.hideProxy);
            }
        },
        off: function() {
            $(window).off('scroll resize', this.resizeProxy);

            if (this.options.hideOnClick) {
                this.$element.off('click', this.hideProxy);
            }
        }
    });

    T.mix(T, {
        Overlay: Overlay
    })
})(tbtx);


;(function(T) {
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
