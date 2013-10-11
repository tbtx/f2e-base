(function(global, $) {
    var doc = document;

    $.extend($.support, {
        placeholder: 'placeholder' in doc.createElement('input')
    });

    if (!$.support.placeholder) {
        /*
            input, textarea { color: #000; }
            .placeholder { color: #aaa; }
         */
        tbtx.loadScript("base/js/plugin/jquery.placeholder.js", function() {
            $('input, textarea').placeholder();
        });
    }
})(this, jQuery);