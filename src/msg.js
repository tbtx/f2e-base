define("msg", ["jquery", "position", "base/2.0/css/msg.css"], function($, Position) {
    var S = tbtx;

    var element = $('<div class="tbtx-broadcast"></div>').appendTo('body');

    var timer;
    // direction - top/bottom
    var broadcast = function(msg, duration, direction) {
        direction = direction || "center";
        duration = duration || 4000;

        if (timer) {
            timer.cancel();
        }

        if (!msg) {
            element.hide();
            return;
        }

        element.html(msg);

        if (direction == "center") {
            Position.center(element);
        } else {
            Position.pin({
                element: element,
                x: "50%",
                y: direction == "top" ? -60 : "100%+60"
            }, {
                element: Position.VIEWPORT,
                x: "50%",
                y: direction == "top" ? 0 : "100%"
            });
        }

        element.fadeIn();

        if (duration > 0) {
            timer = S.later(function() {
                element.fadeOut();
            }, duration, false);
        }
    };

    S.broadcast = broadcast;
});