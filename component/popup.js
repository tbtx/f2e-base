define("popup", ["overlay"], function() {
    var S = tbtx,
        $ = S.$,
        Widget = S.Widget,
        Overlay = S.Overlay,
        Mask = S.Mask,
        VIEWPORT = S.VIEWPORT,
        DEFAULT_PARENT_NODE = Widget.DEFAULT_PARENT_NODE,
        isInDocument = S.isInDocument,
        isIE6 = S.isIE6,
        isFunction = S.isFunction,
        isString = S.isString;

    var Popup = S.createWidget({
        attrs: {
            withOverlay: true,
            // 需要指定这两个参数，mask默认没有
            overlayOption: {
                opacity: 0.5,
                backgroundColor: "#000"
            },

            // 擦，拼写错误
            destoryOnHide: false,
            className: "tbtx-popup",

            parentNode: DEFAULT_PARENT_NODE
        },

        events: {
            "click .J-popup-close": "hide",
            "click .close": "hide",
            "click [data-role=close]": "hide"
        },

        init: function(selector, config) {
            if (S.isPlainObject(selector)) {
                config = selector;
            } else {
                config = config || {};
                var isHtml = isString(selector) && (selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3);
                if (isHtml) {
                    config.template = selector;
                } else {
                    config.element = selector;
                }
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

                this.overlay = parentNode == DEFAULT_PARENT_NODE ? new Overlay(config) : new Mask(config);
            }

            this.mask = '';     // 标示popup类型，在事件里作为数据传递，命名害死人
            this.$element = this.element;
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

            var dummy = this.overlay && this.overlay.show();

            if (effect && typeof effect == "string") {
                this.element[effect]({
                    complete: callback
                });
            } else {
                this.element.show();
                dummy = isFunction(callback) && callback();
            }


            this.element.trigger('tbtx.popup.show', {
                mask: this.mask
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

            var dummy = this.overlay && this.overlay.hide();

            if (effect && typeof effect == "string") {
                this.element[effect]({
                    complete: callback
                });
            } else {
                this.element.hide();
                dummy = isFunction(callback) && callback();
            }

            this.element.trigger('tbtx.popup.hide', {
                mask: this.mask
            });

            this.set("visible", false);

            if (this.get("destoryOnHide")) {
                this.destroy();
            }
            return this;
        },

        // 不使用父类的设置宽高函数
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
            var dummy = this.overlay && this.overlay.destroy();
            return Popup.superclass.destroy.call(this);
        }
    });



    $.fn.Popup = function(config) {
        return $(this).data('tbtx.pop') || new Popup(this, config);
    };

    S.Popup = Popup;

    return Popup;
});
// 兼容之前页面直接引入js的情况
tbtx.require("popup");