(function(global, $) {
    var doc = document;

    $.extend($.support, {
        placeholder: 'placeholder' in doc.createElement('input')
    });

    // fix placeholder
    $(function() {
        if (!$.support.placeholder) {
            /*
                input, textarea { color: #000; }
                .placeholder { color: #aaa; }
             */
            tbtx.loadScript("base/js/plugin/jquery.placeholder.js", function() {
                $('input, textarea').placeholder();
            });
        }
    });

    // fix ie6 position [data-fixed-position]
    $(function() {
        if (!tbtx.isIE6) {
            return;
        }
        var $elements = $('[data-fixed-position]');
        if ($elements.length) {
            $(window).on('resize scroll', function() {
                $elements.each(function(index, el) {
                    var $element = $(el);
                    var data = $element.data();
                    var pos = data["fixedPosition"];

                    var i,
                        ret = {};

                    if (pos) {
                        for (i in pos) {
                            // 不跳转left和right, 统一将bottom和top设置为top
                            if (i == 'top') {
                                ret[i] = pos[i] + tbtx.scrollY();
                            }

                            if (i == 'bottom') {
                                ret['top'] = tbtx.scrollY() + tbtx.viewportHeight() - pos[i] - $element.innerWidth();
                            }
                        }
                        $element.css(ret);
                    }
                });
            });
        }
    });
})(this, jQuery);