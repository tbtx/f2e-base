define("component/popup/1.0.0/popup", ["jquery", "component/overlay/1.1.4/overlay", "position"], function($, Overlay, Position) {

    var Mask = Overlay.Mask,
        S = tbtx,

        $document = $(document);

    var Popup = Overlay.extend({
        attrs: {

            withMask: true,

            maskConfig: {
                opacity: 0.5
            },

            destroyOnHide: false,

            bindKeyEvent: false,

            className: "tbtx-popup",

            // 定位配置
            align: {
                selfXY: [ "50%", "50%" ],
                baseElement: Position.VIEWPORT,
                baseXY: [ "50%", "50%" ]
            }
        },

        events: {
            "click .J-popup-close": "hide",
            "click [data-role=close]": "hide",      // 兼容之前的写法，现在最好使用data-popup-role
            "click [data-popup-role=close]": "hide",
            "click [data-popup-role=confirm]": "confirm",
            "click [data-popup-role=cancel]": "cancel"
        },

        setup: function() {
            Popup.superclass.setup.call(this);

            if (this.get("withMask")) {
                this._setupMask();
            }

            this._setupKey();
        },

        _setupKey: function() {
            this.after("show", function() {
                if (!allPopups.length) {
                    $document.on("keydown", keyHandler);
                }
                allPopups.push(this);
            });

            this.after("hide", erasePopup.bind(this));
        },

        _setupMask: function() {
            var maskConfig = this.get("maskConfig");

            // popup element is in dom
            // insert mask before popup
            if (isInDocument(this.element[0])) {
                maskConfig.relatedNode = this.element;
                maskConfig.renderMethod = "insertBefore";
            }
            this.mask = new Mask(maskConfig);
        },

        show: function() {
            this.mask && this.mask.show();

            Popup.superclass.show.call(this);

            this.trigger("tbtx.popup.show");

            return this;
        },

        // in event handler effect is event object
        hide: function() {
            this.mask && this.mask.hide();

            Popup.superclass.hide.call(this);

            this.trigger("tbtx.popup.hide");

            if (this.get("destroyOnHide")) {
                this.destroy();
            }
            return this;
        },

        confirm: function() {
            this.trigger("tbtx.popup.confirm");
        },
        cancel: function() {
            this.trigger("tbtx.popup.cancel");
        },

        destroy: function() {
            var mask = this.mask;
            mask && mask.destroy();
            Popup.superclass.destroy.call(this);

            erasePopup.bind(this)();
            return this;
        }

    });

    function isInDocument(element) {
        return $.contains(document.documentElement, element);
    }
    // 从数组中删除对应元素
    function erase(target, array) {
        for (var i = 0; i < array.length; i++) {
            if (target === array[i]) {
                array.splice(i, 1);
                return array;
            }
        }
    }

    // 需要处理键盘事件的popup
    var allPopups = [],
        erasePopup = function() {
            erase(this, allPopups);
            if (!allPopups.length) {
                $document.off("keydown", keyHandler);
            }
        };

    var keyHandler = S.debounce(function(event) {
        if (event.altKey || event.ctrlKey) {
            return;
        }
        switch (event.keyCode) {
             case 27:
                //ESC
                allPopups[allPopups.length - 1].cancel();
                break;
            case 13:
                //enter
                allPopups[allPopups.length - 1].confirm();
                break;
            default:
                void(0);
        }
    });

    return Popup;
});