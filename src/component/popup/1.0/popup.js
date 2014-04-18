define("component/popup/1.0/popup", ["jquery", "component/overlay/1.1.4/overlay", "position"], function($, O, Position) {

    var Mask = O.Mask,
        Overlay = O.Overlay;

    var Popup = Overlay.extend({
        attrs: {

            withMask: true,

            maskConfig: {
                opacity: 0.5
            },

            destroyOnHide: false,

            className: "tbtx-popup",

            // 定位配置
            align: {
                // element 的定位点，默认为左上角
                selfXY: [ "50%", "50%" ],
                // 基准定位元素，默认为当前可视区域
                baseElement: Position.VIEWPORT,
                // 基准定位元素的定位点，默认为左上角
                baseXY: [ "50%", "50%" ]
            },
        },

        events: {
            "click .J-popup-close": "hide",
            "click [data-popup-role=close]": "hide"
        },

        initProps: function() {
            if (this.get("withMask")) {
                var maskConfig = this.get("maskConfig");

                // element is in dom
                if (!maskConfig.parentNode && this.element.parent()) {
                    maskConfig.parentNode = $("<div>").insertBefore(this.element).addClass('tbtx-overlay-box');
                }
                this.mask = new Mask(maskConfig);
            }
        },

        show: function() {
            this.mask && this.mask.show();

            if (!this.rendered) {
                this.render();
            }

            this.element.show();

            this.trigger('tbtx.popup.show');

            this.set("visible", true);
            return this;
        },

        // in event handler effect is event object
        hide: function() {

            this.mask && this.mask.hide();
            this.element.hide();

            this.trigger('tbtx.popup.hide');

            this.set("visible", false);

            if (this.get("destroyOnHide")) {
                this.destroy();
            }
            return this;
        },

        destroy: function() {
            this.mask && this.mask.destroy();
            return Popup.superclass.destroy.call(this);
        }

    });

    return Popup;
});