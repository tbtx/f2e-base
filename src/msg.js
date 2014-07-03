define("msg", ["widget", "position", "base/2.0/css/msg.css"], function(Widget, Position) {
    var S = tbtx;

    var BroadcastWidget = Widget.extend({
        attrs: {
            visible: false,
            msg: "",
            // 消息持续时间
            duration: 4000,
            // 消息位置
            direction: "center"
        },

        events: {
            "click": "clear"
        },

        _onRenderVisible: function(val) {
            this.element[val ? "fadeIn" : "fadeOut"]();
        },

        clear: function() {
            var self = this;
            self.set("msg", "");
        },

        _onRenderMsg: function(val) {
            var self = this,
                duration = this.get("duration");

            if (self.timer) {
                self.timer.cancel();
            }
            if (!val) {
                self.set("visible", false);
                return;
            }

            self.element.html(val);
            self.set("visible", true);
            self.pin();

            if (duration > 0) {
                self.timer = S.later(self.clear, duration, false, self);
            }
        },

        pin: function() {
            var instance = this,
                element = instance.element,
                direction = instance.get("direction");

            if (direction === "center") {
                Position.center(element);
            } else {
                Position.pin({
                    element: element,
                    x: "50%",
                    y: direction === "top" ? -60 : "100%+60"
                }, {
                    element: Position.VIEWPORT,
                    x: "50%",
                    y: direction === "top" ? 0 : "100%"
                });
            }
        }
    });

    var getInstance = S.singleton(function() {
        return new BroadcastWidget({
            className: "tbtx-broadcast"
        }).render();
    });

    var broadcast = function(msg, direction, duration) {
        var instance = getInstance();

        if (duration) {
            instance.set("duration", duration);
        }
        instance.set("msg", msg);
        instance.set("direction", direction || "center");
        return S;
    };

    S.broadcast = broadcast;
    return broadcast;
});