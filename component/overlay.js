(function($, global) {
    var tbtx = global.tbtx,
        isInDocument = tbtx.isInDocument,
        Class = tbtx.Class,
        Widget = tbtx.Widget,
        DEFAULT_PARENT_NODE = Widget.DEFAULT_PARENT_NODE,
        each = tbtx.each;

    var ua = (window.navigator.userAgent || "").toLowerCase(), 
        isIE6 = ua.indexOf("msie 6") !== -1,
        doc = tbtx.getDocument();

    var Overlay = new Class(Widget);

    Overlay.include({

        attrs: {
            // 基本属性
            visible: false,
            parentNode: DEFAULT_PARENT_NODE,

            // 定位配置
            align: {
                // element 的定位点，默认为左上角
                selfXY: [ 0, 0 ],
                // 基准定位元素，默认为当前可视区域
                baseElement: tbtx.VIEWPORT,
                // 基准定位元素的定位点，默认为左上角
                baseXY: [ 0, 0 ]
            },

            opacity: 0.5,
            color: "#000",
            hideOnClick: false
        },

        init: function(config) {
            var parentNode = config.parentNode || DEFAULT_PARENT_NODE,
                isMask;

            // 没指定isMask 并且parentNode不是body
            // 认定为普通遮罩而非全屏
            if (typeof config.isMask === "undefined" && parentNode !== DEFAULT_PARENT_NODE) {
                isMask = false;
            } else {
               isMask = true;
            }
            var defaults;

            if (isMask) {
                defaults = {
                    style: {
                        position: isIE6 ? "absolute" : "fixed",
                        top: 0,
                        left: 0
                    },
                    align: {
                        // undefined 表示相对于当前可视范围定位
                        baseElement: isIE6 ? 'body' : undefined
                    },
                    width: isIE6 ? doc.outerWidth(true) : "100%",
                    height: isIE6 ? doc.outerHeight(true) : "100%",
                    className: "mask"
                };
            } else {
                var width = config.width,
                    height = config.height;
                defaults = {
                    width: (parentNode !== DEFAULT_PARENT_NODE && !width) ? $(parentNode).innerWidth() : null,
                    height: (parentNode !== DEFAULT_PARENT_NODE && !height) ? $(parentNode).innerHeight() : null,
                    align: {
                        baseElement: parentNode || tbtx.VIEWPORT
                    },
                    className: "overlay"
                };
            };
            Overlay.superclass.init.call(this, $.extend({}, defaults, config));
        },

        setup: function() {
            var self = this;

            if (this.get("hideOnClick")) {
                this.delegateEvents('click', this.hide);
            }
            this._setupResize();

            this.after("render", function() {
                var _pos = this.element.css("position");
                if (_pos === "static" || _pos === "relative") {
                    this.element.css({
                        position: "absolute",
                        left: "-9999px",
                        top: "-9999px"
                    });
                }
            });
            // 统一在显示之后重新设定位置
            this.after("show", function() {
                self._setPosition();
            });

        },

        _setupResize: function() {
            Overlay.allOverlays.push(this);
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
        show: function(effect) {
            if (!this.rendered) {
                this.render();
            }
            this.element.show();
            this.set("visible", true);
            return this;
        },

        hide: function() {
            this.element.hide();
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
        _onRenderOpacity: function(val) {
             this.element.css("opacity", val);
        },
        _onRenderColor: function(val) {
             this.element.css("backgroundColor", val);
        },

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
        }
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
