(function($, S) {
    var Class = S.Class,
        Widget = S.Widget,
        singleton = S.singleton;

    var ua = (window.navigator.userAgent || "").toLowerCase(),
        isIE6 = ua.indexOf("msie 6") !== -1;

    var MsgItemWidget = new Class(Widget, {
        attrs: {
            type: "",
            msg: "",
            duration: 200,
            template: '<p></p>',
            className: "tbtx-msg-item"
        },

        render: function() {
            MsgItemWidget.superclass.render.apply(this, arguments);

            var width = this.element.width();
            this.element.css({
                left: -width,
                opacity: 0
            }).animate({
                left: 0,
                opacity: 1
            }, this.get("duration"));

            return this;
        },

        _onRenderType: function(val) {
            this.element.addClass('tbtx-msg-' + val);
        },
        _onRenderMsg: function(val) {
            this.element.html(val);
        },

        destroy: function() {
            var width = this.element.width(),
                self = this;
            this.element.animate({
                left: -width,
                opacity: 0
            }, this.get("duration"), function() {
                MsgItemWidget.superclass.destroy.call(self);
            });
        }
    });

    var MsgWidget = new Class(Widget, {
        attrs: {
            items: {
                value: "p",
                getter: function(val) {
                    return this.$(val);
                }
            },
            last: 10000
        },
        events: {
            "click p": "_removeHandler"
        },
        add: function(msg, type) {
            var items = this.get("items");
            if (items.length > 10) {
                this.remove(items.first());
            }

            var item = new MsgItemWidget({
                msg: msg,
                type: type,
                parentNode: this.element
            }).render();

            var self = this;
            setTimeout(function() {
                self.remove(item.element);
            }, this.get("last"));
        },

        remove: function($item) {
            var widget = Widget.query($item);
            if (widget) {
                widget.destroy();
            }
        },

        _removeHandler: function(ev) {
            this.remove($(ev.target));
        }
    });

    var pin = function($element) {
        $element.css({
            position: "absolute",
            bottom: 24 - S.scrollY()
        });
    };
    var getWidget = singleton(function() {
        S.loadCss("base/css/msg.css");
        var widget = new MsgWidget({
            id: "tbtx-msg"
        }).render();

        if (isIE6) {
            pin(widget.element);
            S.getWindow().on("scroll resize", function() {
                if (widget.get("items").length) {
                    pin(widget.element);
                }
            });
        }

        return widget;
    });

    var MSG = S.MSG = {};
    var types = "warning error info debug success".split(" ");
    S.each(types, function(type) {
        S[type] = MSG[type] = function(msg) {
            getWidget().add(msg, type);
        };
    });
})(jQuery, tbtx);