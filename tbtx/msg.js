(function(global, $) {
    var itemTemplate = '<p class="tbtx-msg-item tbtx-msg-{{ type }}">{{ msg }}</p>',
        containerTemplate = '<div id="tbtx-msg"></div>';

    var ua = (window.navigator.userAgent || "").toLowerCase(),
        isIE6 = ua.indexOf("msie 6") !== -1;

    var MSG = tbtx.MSG = {
        last: 10000,     // item持续时间
        duration: 200,  // 动画时间
        isInited: false,

        init: function() {
            var self = this;
            this.$container = $(containerTemplate).appendTo('body').on('click', 'p', function() {
                self.clearItem($(this));
            });

            tbtx.loadCss("base/css/msg.css");
            self.isInited = true;

        },
        // IE6调整位置
        pin: function() {
            var self = MSG;
            self.$container.css({
                top: tbtx.scrollY() + tbtx.viewportHeight() - 24 - self.$container.height()
            });
        },

        show: function() {
            var self = this;
            self.$container.show();
            if (isIE6) {
                $(window).on('resize scroll', self.pin);
            }
        },

        hide: function() {
            var self = this;
            self.$container.hide();
            if (isIE6) {
                $(window).off('resize scroll', self.pin);
            }
        },

        // 清除某条消息
        clearItem: function($item, last) {
            var width = $item.width();
            var self = this;

            $item.animate({
                left: -width,
                opacity: 0
            }, self.duration, function() {
                $item.remove();
                self.checkItems();
            });
        },

        // 检测是否还有消息, 隐藏消息container
        checkItems: function() {
            var self = MSG;
            if (!self.$container.find('p').length) {
                self.hide();
            }
        },
        item: function(msg, type) {
            var self = this;
            if (!self.isInited) {
                self.init();
            }

            self.show();
            var html = tbtx.substitute(itemTemplate, {
                type: type,
                msg: msg
            });
            var $item = $(html).appendTo(self.$container);

            // 最多存在10条消息
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
                setTimeout(function() {
                    self.clearItem($item);
                }, self.last);
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