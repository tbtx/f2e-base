(function($, global) {
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
            var dummy = this.overlay && this.overlay.destroy();
            return Popup.superclass.destroy.call(this);
        }
    });



    $.fn.Popup = function(config) {
        return $(this).data('tbtx.pop') || new Popup(this, config);
    };

    S.Popup = Popup;
})(jQuery, this);
