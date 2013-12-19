(function($, global) {
    var tbtx = global.tbtx,
        substitute = tbtx.substitute,
        throttle = tbtx.throttle,
        pageWidth = tbtx.pageWidth,
        pageHeight = tbtx.pageHeight,
        viewportWidth = tbtx.viewportWidth,
        isInDocument = tbtx.isInDocument,
        Class = tbtx.Class,
        Widget = tbtx.Widget,
        each = tbtx.each;

    // 最佳实践是添加className而非cssText，但是这里为了减少组件对CSS的依赖
    var template = "<div id='{{ overlay }}' class='{{ class }}'></div>",
        cssTemplate = "; display: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%; opacity: {{ opacity }}; filter:alpha(opacity={{ alpha }}); background: {{ color }};",
        defaults = {
            'class': 'overlay',
            'opacity': 0.5,
            'color': '#000',
            'hideOnClick': false// 点击遮罩层是否关闭
        };

    var Overlay = new Class(Widget);

    Overlay.include({

        attrs: {
            // 基本属性
            width: null,
            height: null,
            visible: false,
            // 定位配置
            align: {
                // element 的定位点，默认为左上角
                selfXY: [ 0, 0 ],
                // 基准定位元素，默认为当前可视区域
                baseElement: tbtx.VIEWPORT,
                // 基准定位元素的定位点，默认为左上角
                baseXY: [ 0, 0 ]
            },
            className: "overlay",
            parentNode: 'body',

            style: {
                position: "absolute"
            },
            opacity: 0.5,
            color: "#000",
            hideOnClick: false
        },

        setup: function() {
            var self = this;

            // this.delegateEvents('click', this._hide);
            this._setupResize();

            // 统一在显示之后重新设定位置
            // this.after("show", function() {
            //     self._setPosition();
            // });

            // this.after("render", function() {
            //     var _pos = this.element.css("position");
            //     if (_pos === "static" || _pos === "relative") {
            //         this.element.css({
            //             position: "absolute",
            //             left: "-9999px",
            //             top: "-9999px"
            //         });
            //     }
            // });

            // this.render();
        },

        _setupResize: function() {
            Overlay.allOverlays.push(this);
        },

        _setPosition: function() {
            if (!isInDocument(this.element[0])) return;
            align || (align = this.get("align"));
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
            tbtx.pin({
                element: this.element,
                x: align.selfXY[0],
                y: align.selfXY[1]
            }, {
                element: align.baseElement,
                x: align.baseXY[0],
                y: align.baseXY[1]
            });
            // 定位完成后，还原
            if (isHidden) {
                this.element.css({
                    visibility: "",
                    display: "none"
                });
            }
            return this;
        },
        show: function() {
            this.render();
            this.set("visible", true);
            return this;
        },

        hide: function() {
            this.remove();
            this.set("visible", false);
            return this;
        },

        destroy: function() {
            erase(this, Overlay.allOverlays);
            return Overlay.superclass.destroy.call(this);
        },

        _onRenderWidth: function(val) {
            this.element.css("width", val);
        },
        _onRenderHeight: function(val) {
            this.element.css("height", val);
        },
        _onRenderZIndex: function(val) {
            this.element.css("zIndex", val);
        },
        _onRenderAlign: function(val) {
            this._setPosition(val);
        },
        _onRenderVisible: function(val) {
            tbtx.log(val);
            if (val == "show") {
                this._show();
            }
            if (val == "hide") {
                this._hide();
            }
        },

        _show: function() {
            this.render();
        },

        _hide: function() {

        },

        // 仅仅加到dom里，不显示
        render: function(selector) {
            if (!this.rendered) {
                this._renderAndBindAttrs();
                this.rendered = true;
            }
            // 插入到文档流中
            var parentNode = this.get("parentNode");
            if (parentNode && !isInDocument(this.element[0])) {
                this.element.prependTo(parentNode);
            }
            return this;
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

        // remove: function() {
        //     this.$element.remove();
        // },

        // show: function(selector) {
        //     this.render(selector);      // 每次渲染，因为关闭的时候remove掉了

        //     this.$element.show();
        //     this.set("status", "show");

        //     this.resize();
        //     this.bind(); // 只有显示的时候进行事件监听
        // },
        // hide: function(effect) {
        //     if (effect && typeof effect == 'string') {
        //         this.$element[effect]();
        //     } else {
        //         this.$element.hide();
        //     }
        //     this.set("status", "hide");
        //     this.unbind();
        //     this.remove();
        // },
        // resize: function() {
        //     this.$element.css({
        //         width: viewportWidth(),
        //         height: pageHeight()
        //     });
        // },

        // // event on & off
        // bind: function() {
        //     $(window).on('resize', this.resizeProxy);
        //     var self = this;
        //     // hide与before配合时hide会改变，不能一开始就proxy
        //     if (this.options.hideOnClick) {
        //         this.hideProxy = function() {
        //             self.hide();
        //         };
        //         this.$element.on('click', this.hideProxy);
        //     }
        // },
        // unbind: function() {
        //     $(window).off('resize', this.resizeProxy);

        //     if (this.options.hideOnClick) {
        //         this.$element.off('click', this.hideProxy);
        //     }
        // }
    });

    // resize overlay
    var $window = tbtx.getWindow();
    var winWidth = $window.width();
    var winHeight = $window.height();
    var timeout;
    Overlay.allOverlays = [];
    $window.on("resize", function() {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(function() {
            var winNewWidth = $window.width();
            var winNewHeight = $window.height();
            // IE678 莫名其妙触发 resize
            // http://stackoverflow.com/questions/1852751/window-resize-event-firing-in-internet-explorer
            if (winWidth !== winNewWidth || winHeight !== winNewHeight) {
                each(Overlay.allOverlays, function(item) {
                    // 当实例为空或隐藏时，不处理
                    if (!item || !item.get("visible")) {
                        return;
                    }
                    item._setPosition();
                });
            }
            winWidth = winNewWidth;
            winHeight = winNewHeight;
        }, 80);
    });

    function erase(target, array) {
        for (var i = 0; i < array.length; i++) {
            if (target === array[i]) {
                array.splice(i, 1);
                return array;
            }
        }
    }
    tbtx.Overlay = Overlay;
})(jQuery, this);
