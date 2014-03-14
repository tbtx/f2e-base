(function($, exports) {

    var draggable = function(selector) {
        var $elements = $(selector);

        // 鼠标的初始位置
        var mouseX = 0,
            mouseY = 0;
        // 元素的x,y
        var divLeft,
            divTop;

        $elements.mousedown(function(event) {
            var offset = $(this).offset();
            divLeft = parseInt(offset.left, 10);
            divTop = parseInt(offset.top, 10);

            mouseX = event.pageX;
            mouseY = event.pageY;

            $(this).bind('mousemove', dragElement);
            $(this).trigger("drag.start");
        });

        function dragElement(event) {
            var left = divLeft + (event.pageX - mouseX);
            var top  = divTop + (event.pageY - mouseY);

            $(this).css({
                'top': top + 'px',
                'left': left + 'px',
                'position': 'absolute'
            });
            return false;
        }

        $(document).mouseup(function() {
            $elements.unbind('mousemove');
            $elements.trigger("drag.end");
        });
    };

    exports.draggable = draggable;

    $(function() {
        draggable("[data-draggable]");
    });
})(jQuery, this.tbtx || jQuery);