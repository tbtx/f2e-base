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

        _onRenderVisible: function(val) {
            this.element[val ? "fadeIn" : "fadeOut"]();
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
            if (duration > 0) {
                self.timer = S.later(function() {
                    self.set("visible", false);
                    self.set("msg", "");    // 清空消息
                }, duration, false);
            }
        },

        _onRenderDirection: function(val) {
            var element = this.element;

            if (val === "center") {
                Position.center(element);
            } else {
                Position.pin({
                    element: element,
                    x: "50%",
                    y: val === "top" ? -60 : "100%+60"
                }, {
                    element: Position.VIEWPORT,
                    x: "50%",
                    y: val === "top" ? 0 : "100%"
                });
            }
        }
    });
    var init = S.singleton(function() {
        return new BroadcastWidget({
            className: "tbtx-broadcast"
        }).render();
    });

    S.broadcast = function(msg, direction, duration) {
        var instance = init();
        if (duration) {
            instance.set("duration", duration);
        }
        instance.set("direction", direction || "center");
        instance.set("msg", msg);
        return S;
    };
});