/*
 * overlay.popup
 * 2013-12-25 3:05:08
 */
(function($, global) {
    var S = global.tbtx,
        isInDocument = S.isInDocument,
        Class = S.Class,
        Widget = S.Widget,
        VIEWPORT = S.VIEWPORT,
        DEFAULT_PARENT_NODE = Widget.DEFAULT_PARENT_NODE,
        each = S.each;

    var ua = (window.navigator.userAgent || "").toLowerCase(), 
        isIE6 = ua.indexOf("msie 6") !== -1,
        doc = S.getDocument();

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
                baseElement: VIEWPORT,
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
            if (typeof config.isMask === "undefined") {
                isMask = parentNode === DEFAULT_PARENT_NODE ? true : false;
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
                    className: "tbtx-mask overlay"
                };
            } else {
                var width = config.width,
                    height = config.height;
                defaults = {
                    width: (parentNode !== DEFAULT_PARENT_NODE && !width) ? $(parentNode).innerWidth() : width,
                    height: (parentNode !== DEFAULT_PARENT_NODE && !height) ? $(parentNode).innerHeight() : height,
                    align: {
                        baseElement: parentNode || VIEWPORT
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
            this.adjust(align);
            // 定位完成后，还原
            if (isHidden) {
                this.element.css({
                    visibility: "",
                    display: "none"
                });
            }
            return this;
        },

        adjust: function(align) {
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
        // 除了 element 和 relativeElements，点击 body 后都会隐藏 element
        _blurHide: function(arr) {
            arr = $.makeArray(arr);
            arr.push(this.element);
            this._relativeElements = arr;
            Overlay.blurOverlays.push(this);
        }
    });

    Overlay.allOverlays = [];
    Overlay.blurOverlays = [];
    S.getDocument().on("click", function(e) {
        hideBlurOverlays(e);
    });
    // resize overlay
    S.on("window.resize", function() {
        each(Overlay.allOverlays, function(item) {
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
    function hideBlurOverlays(e) {
        $(Overlay.blurOverlays).each(function(index, item) {
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

    S.Overlay = Overlay;
})(jQuery, this);


;(function($, global) {
    var S = global.tbtx,
        Class = S.Class,
        Widget = S.Widget,
        Overlay = S.Overlay,
        isInDocument = S.isInDocument,
        VIEWPORT = S.VIEWPORT,
        DEFAULT_PARENT_NODE = Widget.DEFAULT_PARENT_NODE;

    var ua = (window.navigator.userAgent || "").toLowerCase(),
        isIE6 = ua.indexOf("msie 6") !== -1;

    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]";
        };
    }
    var isFunction = isType("Function"),
        isString = isType("String");

    var Popup = new Class(Overlay);

    Popup.include({
        attrs: {
            withOverlay: true,
            overlayOption: {

            },

            // 擦，拼写错误
            destoryOnHide: false,

            style: {
                display: "none",
                position: isIE6 ? "absolute" : "fixed"
            },

            parentNode: DEFAULT_PARENT_NODE,

            // 不需要这几个属性
            opacity: null,
            color: null,
            hideOnClick: null
        },

        events: {
            "click .J-popup-close": "hide",
            "click .close": "hide"
        },

        init: function(selector, config) {
            config = config || {};
            var isHtml = isString(selector) && (selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3);
            if (isHtml) {
                config.template = selector;
            } else {
                config.element = selector;
            }

            if (config.align) {
                config.align.baseElement = config.parentNode || VIEWPORT;
            }

            Popup.superclass.init.call(this, config);

        },

        initProps: function() {
            if (this.get("withOverlay")) {
                var config = this.get("overlayOption") || {},
                    parentNode = this.get("parentNode");
                config.parentNode = this.get("parentNode");
                config.relatedNode = this.element;
                config.renderMethod = "insertBefore";

                this.overlay = new Overlay(config);
            }
            this.mask = '';     // 标示popup类型，在事件里作为数据传递，命名害死人
            this.$element = this.element;
            this.set("className", "tbtx-popup");
        },

        setup: function() {

            this.element.data("tbtx.pop", this);

            Popup.superclass.setup.call(this);
        },

        show: function(effect, callback) {
            if (!this.rendered) {
                this.render();
            }

            if (effect && isFunction(effect)) {
                callback = effect;
                effect = undefined;
            }

            this.overlay && this.overlay.show();

            if (effect && typeof effect == "string") {
                this.element[effect]({
                    complete: callback
                });
            } else {
                this.element.show();
                isFunction(callback) && callback();
            }


            this.element.trigger('tbtx.popup.show', {
                mask: self.mask
            });

            this.set("visible", true);
            return this;
        },

        // in event handler effect is event object
        hide: function(effect, callback) {
            if (effect && isFunction(effect)) {
                callback = effect;
                effect = undefined;
            }

            this.overlay && this.overlay.hide();

            if (effect && typeof effect == "string") {
                this.element[effect]({
                    complete: callback
                });
            } else {
                this.element.hide();
                isFunction(callback) && callback();
            }

            this.element.trigger('tbtx.popup.hide', {
                mask: self.mask
            });

            this.set("visible", false);

            if (this.get("destoryOnHide")) {
                this.destroy();
            }
            return this;
        },

        // 不使用父类的设置宽高函数
        // attr中的width和height不生效
        _onRenderWidth: function(val) {
            // this.element.css("width", this.element.width());
        },
        _onRenderHeight: function(val) {
            // this.element.css("height", this.element.height());
        },

        adjust: function() {
            // 定位的base是VIEWPORT
            var parentNode = this.get("parentNode");
            if (parentNode === DEFAULT_PARENT_NODE) {
                parentNode = VIEWPORT;
            }
            S.center(this.element, parentNode);
        },

        destroy: function() {
            this.overlay && this.overlay.destroy();
            return Popup.superclass.destroy.call(this);
        }
    });



    $.fn.Popup = function(config) {
        return $(this).data('tbtx.pop') || new Popup(this, config);
    };

    S.Popup = Popup;
})(jQuery, this);
