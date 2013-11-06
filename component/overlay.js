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
    Overlay.Implements([tbtx.Events, tbtx.Aspect, tbtx.Attrs]);

    Overlay.include({
        init: function(options) {
            this.config(options);

            this.initAttrs({
                attrs: this.options
            });

            this.on("change:opacity", function(val, prev) {
                this.set("alpha", val * 100);

                this.options.opacity = val;
                this.options.alpha = this.options.opacity * 100;

                if (this.get("status") == "show") {
                    this.$element.css("opacity", val);
                }
            });

            this.on("change:color", function(val, prev) {
                this.options.color = val;

                if (this.get("status") == "show") {
                    this.$element.css("backgroundColor", val);
                }
            });

            this.on("change:status", function(val, prev) {
                // triger event
                var eventName = 'tbtx.overlay.' + val;
                $('body').trigger(eventName);
                this.trigger(eventName);

                if (val == "show") {

                } else if(val == "hide") {

                }
            });
            // 在事件处理程序中使用this
            this.resizeProxy = this.proxy(throttle(this.resize));
        },

        // 仅仅加到dom里，不显示
        render: function(selector) {
            // 不要重复render
            if (this.get("status") == "show") {
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
            this.options.status = "hide";
        },

        remove: function() {
            this.$element.remove();
        },

        show: function(selector) {
            this.render(selector);      // 每次渲染，因为关闭的时候remove掉了

            this.$element.show();
            this.set("status", "show");

            this.resize();
            this.bind(); // 只有显示的时候进行事件监听
        },
        hide: function(effect) {
            if (effect && typeof effect == 'string') {
                this.$element[effect]();
            } else {
                this.$element.hide();
            }
            this.set("status", "hide");
            this.unbind();
            this.remove();
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
            var self = this;
            // hide与before配合时hide会改变，不能一开始就proxy
            if (this.options.hideOnClick) {
                this.hideProxy = function() {
                    self.hide();
                };
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
