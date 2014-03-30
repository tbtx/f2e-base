define("overlay", function() {

    var S = tbtx,
        $ = S.$,
        Widget = S.Widget,
        VIEWPORT = S.VIEWPORT,
        DEFAULT_PARENT_NODE = Widget.DEFAULT_PARENT_NODE,
        each = S.each,
        isInDocument = S.isInDocument,
        isIE6 = S.isIE6,
        doc = S.getDocument();

    // Mask为遮罩，Overlay是全屏遮罩
    var Mask = S.createWidget({

        attrs: {
            width: null,
            height: null,
            className: "tbtx-mask",
            // 基本属性
            visible: false,
            parentNode: DEFAULT_PARENT_NODE,

            // 定位配置
            align: {
                // element 的定位点，默认为左上角
                selfXY: [ 0, 0 ],
                // 基准定位元素，默认为当前可视区域
                baseElement: VIEWPORT,
                // 基准定位元素的定位点，默认为左上角
                baseXY: [ 0, 0 ]
            },

            hideOnClick: false
        },

        init: function(config) {
            var parentNode = config.parentNode,
                defaults = {};

            if (parentNode && parentNode !== DEFAULT_PARENT_NODE) {
                defaults.width = $(parentNode).innerWidth();
                defaults.height = $(parentNode).innerHeight();
                defaults.align = {
                    baseElement: parentNode || VIEWPORT
                };
            }

            Mask.superclass.init.call(this, $.extend(true, defaults, config));
        },

        setup: function() {
            var self = this;

            if (this.get("hideOnClick")) {
                this.delegateEvents('click', function() {
                    self.hide();
                });
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
            Mask.allMasks.push(this);
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

        // 兼容之前的Popup
        adjust: function() {
            var align = this.get("align");
            S.pin({
                element: this.element,
                x: align.selfXY[0],
                y: align.selfXY[1]
            }, {
                element: align.baseElement,
                x: align.baseXY[0],
                y: align.baseXY[1]
            });
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
            erase(this, Mask.allMasks);
            erase(this, Mask.blurMasks);
            return Mask.superclass.destroy.call(this);
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
        _onRenderBackgroundColor: function(val) {
            this.element.css("backgroundColor", val);
        },
        // 除了 element 和 relativeElements，点击 body 后都会隐藏 element
        _blurHide: function(arr) {
            arr = $.makeArray(arr);
            arr.push(this.element);
            this._relativeElements = arr;
            Mask.blurMasks.push(this);
        }
    });

    Mask.allMasks = [];
    Mask.blurMasks = [];
    doc.on("click", function(e) {
        hideBlurMasks(e);
    });
    // resize overlay
    S.on("window.resize", function() {
        each(Mask.allMasks, function(item) {
            // 当实例为空或隐藏时，不处理
            if (!item || !item.get("visible")) {
                return;
            }
            item._setPosition();
        });
    });

    function erase(target, array) {
        for (var i = 0; i < array.length; i++) {
            if (target === array[i]) {
                array.splice(i, 1);
                return array;
            }
        }
    }
    function hideBlurMasks(e) {
        $(Mask.blurMasks).each(function(index, item) {
            // 当实例为空或隐藏时，不处理
            if (!item || !item.get("visible")) {
                return;
            }
            // 遍历 _relativeElements ，当点击的元素落在这些元素上时，不处理
            for (var i = 0; i < item._relativeElements.length; i++) {
                var el = $(item._relativeElements[i])[0];
                if (el === e.target || $.contains(el, e.target)) {
                    return;
                }
            }
            // 到这里，判断触发了元素的 blur 事件，隐藏元素
            item.hide();
        });
    }

    S.Mask = Mask;

    var Overlay = S.createWidget({
        attrs: {
            width: isIE6 ? doc.outerWidth(true) : "100%",
            height: isIE6 ? doc.outerHeight(true) : "100%",
            className: "overlay",
            opacity: 0.5,
            backgroundColor: "#000",
            style: {
                position: isIE6 ? "absolute" : "fixed",
                top: 0,
                left: 0
            },
            align: {
                // undefined 表示相对于当前可视范围定位
                baseElement: isIE6 ? DEFAULT_PARENT_NODE : undefined
            }
        },
        show: function() {
            if (isIE6) {
                this.set("width", doc.outerWidth(true));
                this.set("height", doc.outerHeight(true));
            }
            return Overlay.superclass.show.call(this);
        }
    }, Mask);
    S.Overlay = Overlay;

    return {
        Overlay: Overlay,
        Mask: Mask,
    };
});

// 兼容之前页面直接引入js的情况
tbtx.require("overlay");