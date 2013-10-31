(function($, global) {
    var tbtx = global.tbtx,
        substitute = tbtx.substitute,
        throttle = tbtx.throttle,
        pageWidth = tbtx.pageWidth,
        pageHeight = tbtx.pageHeight,
        viewportWidth = tbtx.viewportWidth,
        Class = tbtx.Class;

    // 最佳实践是添加className而非cssText，但是这里为了减少组件对CSS的依赖
    var template = "<div id='{{ overlay }}' class='{{ class }}'></div>",
        cssTemplate = "; display: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%; opacity: {{ opacity }}; filter:alpha(opacity={{ alpha }}); background: {{ color }};",
        defaults = {
            'class': 'overlay',
            'opacity': 0.5,
            'color': '#000',
            'hideOnClick': false// 点击遮罩层是否关闭
        };

    var Overlay = new Class;
    Overlay.Implements([tbtx.Events, tbtx.Aspect]);

    Overlay.include({
        init: function(options) {
            this.config(options);

            // 在事件处理程序中使用this
            this.resizeProxy = this.proxy(throttle(this.resize));
        },

        // 仅仅加到dom里，不显示
        render: function(selector) {
            // 不要重复render
            if (this.$element && this.$element.parent().length) {
                return;
            }
            this.$element = $(substitute(template, this.options));
            this.$element[0].style.cssText += substitute(cssTemplate, this.options);


            // 默认不设置z-index，只有传入时才设置
            this.options.zindex && this.$element.css({
                zindex: this.options.zindex
            });

            // 让overlay处在下面
            if (selector) {
                this.$element.insertBefore(selector);
            } else {
                this.$element.prependTo('body');
            }
        },


        config: function(options) {
            this.options = $.extend({}, defaults, options);
            this.options.alpha = this.options.opacity * 100;
        },

        remove: function() {
            this.$element.remove();
        },

        show: function(selector) {
            this.render(selector);      // 每次渲染，因为关闭的时候remove掉了

            this.$element.show();

            this.resize();
            this.bind(); // 只有显示的时候进行事件监听

            var self = this;
            setTimeout(function () {
                $('body').trigger('tbtx.overlay.show');
                self.trigger('tbtx.overlay.show');
            }, 0);
        },
        hide: function(effect) {
            if (effect && typeof effect == 'string') {
                this.$element[effect]();
            } else {
                this.$element.hide();
            }
            this.unbind();
            this.remove();

            var self = this;
            setTimeout(function () {
                // 兼容没有aspect时的trigger
                $('body').trigger('tbtx.overlay.hide');

                self.trigger('tbtx.overlay.hide');
            }, 0);
        },
        resize: function() {
            this.$element.css({
                width: viewportWidth(),
                height: pageHeight()
            });
        },

        // event on & off
        bind: function() {
            $(window).on('resize', this.resizeProxy);

            // hide与before配合时hide会改变，不能一开始就proxy
            if (this.options.hideOnClick) {
                this.hideProxy = this.proxy(this.hide);
                this.$element.on('click', this.hideProxy);
            }
        },
        unbind: function() {
            $(window).off('resize', this.resizeProxy);

            if (this.options.hideOnClick) {
                this.$element.off('click', this.hideProxy);
            }
        }
    });

    tbtx.Overlay = Overlay;
})(jQuery, this);
