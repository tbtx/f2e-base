(function(global, $) {
    var itemTemplate = '<p class="tbtx-msg-item tbtx-msg-{{ type }}">{{ msg }}</p>',
        containerTemplate = '<div id="tbtx-msg"></div>';

    var ua = (window.navigator.userAgent || "").toLowerCase(), 
        isIE6 = ua.indexOf("msie 6") !== -1;

    var MSG = tbtx.MSG = {
        last: 6000,     // item持续时间
        duration: 200,
        timer: null,

        init: function() {
            var self = this;
            if (!this.$container) {
                this.$container = $(containerTemplate).appendTo('body').on('mouseover', 'p', function() {
                    self.clearItem($(this));
                });

                tbtx.loadCss("base/css/msg.css");
                if (isIE6) {
                    this.on();
                }
            }

            this.$container.show();
        },
        // IE6调整位置
        pin: function() {
            var self = MSG;
            self.$container.css({
                top: tbtx.scrollY() + tbtx.viewportHeight() - 24 - self.$container.height()
            });
        },
        on: function() {
            var self = this;
            $(window).on('resize scroll', self.pin);
        },

        off: function() {
            var self = this;
            $(window).off('resize scroll', self.pin);
        },

        // 清除某条消息
        clearItem: function($item, last) {
            var width = $item.width();
            var self = this;

            if (last) {
                $item.delay(last).animate({
                    left: -width,
                    opacity: 0
                }, self.duration, function() {
                    $item.remove();
                });
            } else {
                $item.remove();
            }

            clearTimeout(self.timer);
            self.timer = setTimeout(self.checkItems, (last || self.duration) + 200);
        },

        // 检测是否还有消息, 隐藏消息container
        checkItems: function() {
            var self = MSG;
            if (!self.$container.find('p').length) {
                self.$container.hide();
                if (isIE6) {
                    this.off();
                }
            }
        },
        item: function(msg, type) {
            var self = this;
            self.init();

            var html = tbtx.substitute(itemTemplate, {
                type: type,
                msg: msg
            });
            var $item = $(html).appendTo(self.$container);
            var $items = self.$container.children('p');
            if ($items.length > 10) {
                self.clearItem($items.first());
            }

            var width = $item.width();
            $item.css({
                left: -width,
                opacity: 0
            }).animate({
                left: 0,
                opacity: 1
            }, self.duration, function() {
                self.clearItem($item, self.last);
            });
        }
    };


    var types = "warning error info debug success".split(" ");
    $.each(types, function(index, type) {
         MSG[type] = function(msg) {
            MSG.item(msg, type);
         };
    });
})(this, jQuery);