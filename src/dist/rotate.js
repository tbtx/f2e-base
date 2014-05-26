define("dist/rotate", ["jquery", "./rotateEffect"], function($, rotate) {
    $.fn.extend({
        rotate: function(config) {
            if (this.length === 0 || !config) {
                return;
            }
            // 旋转角度
            if (typeof config === "number") {
                config = {
                    angle: config
                };
            }

            this.each(function(index, element) {
                rotate(element, config);
            });

            return this;
        }
    });
});

define("dist/rotateEffect", function() {
    var S = tbtx,
        prefixed = S.prefixed;

    var transform = prefixed("transform"),
        transformOrigin = prefixed("transformOrigin");

    // 支持transform
    if (transform) {
        return function(element, config) {
            element.style[transform] = "rotate("+(config.angle%360)+"deg)";
        };
    } else {
        return function(element, config) {

        };
    }
});