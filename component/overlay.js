(function(T) {
    var substitute = T.substitute,
        throttle = T.throttle,
        pageWidth = T.pageWidth,
        pageHeight = T.pageHeight,
        Class = T.Class;

    // 最佳实践是添加className而非cssText，但是这里为了减少组件对CSS的依赖
    var template = "<div id='{{ id }}' class='{{ class }}'></div>",
        cssTemplate = "; display: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%; opacity: {{ opacity }}; filter:alpha(opacity={{ alpha }}); background: {{ color }}; z-index: {{ zindex }};",
        def = {
            'id': 'overlay',
            'class': 'overlay',
            'opacity': 0.5,
            'color': '#000',
            'zindex': 200, // 遮罩层z-index
            'hideOnClick': false, // 点击遮罩层是否关闭
            onHide: function($overlay) {

            },
            onShow: function($overlay) {
                // console.log($overlay);
            }
        };

    var Overlay = new Class;

    Overlay.include({
        init: function(options) {
            this.config(options);

            // 在事件处理程序中使用this
            this.resizeProxy = this.proxy(throttle(function() {
                this.resize();
            }, 150));
            // 只有hideOnClick为true时才使用
            this.hideProxy = this.proxy(this.hide); // 
        },

        // 仅仅加到dom里，不显示
        render: function() {
            var selector = '#' + this.options.id;
            var $elem = $(selector);

            if (!$elem.length) {    // 没有添加到页面中
                $('body').append(substitute(template, this.options));
                this.element = $(selector);
                this.element[0].style.cssText += substitute(cssTemplate, this.options);
            }
        },

        config: function(options) {
            this.options = $.extend({}, def, options);
            this.options.alpha = this.options.opacity * 100;
        },

        remove: function() {
            this.element.remove();
        },

        show: function() {
            this.render();      // 每次渲染，因为关闭的时候remove掉了
            this.element.show();
            this.resize();
            this.on(); // 只有显示的时候进行事件监听

            this.options.onShow.call(this, this.element);
        },
        hide: function() {
            this.element.hide();
            this.off();
            this.remove();

            this.options.onHide.call(this, this.element);
        },
        resize: function() {
            this.element.css({
                width: pageWidth(),
                height: pageHeight()
            });
        },

        // event on & off
        on: function() {
            $(window).on('scroll resize', this.resizeProxy);

            if (this.options.hideOnClick) {
                this.element.on('click', this.hideProxy);
            }
        },
        off: function() {
            $(window).off('scroll resize', this.resizeProxy);

            if (this.options.hideOnClick) {
                this.element.off('click', this.hideProxy);
            }
        }
    });

    T.mix(T, {
        Overlay: Overlay
    })
})(tbtx);
