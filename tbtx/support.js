(function($, tbtx) {
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
})(jQuery, tbtx);