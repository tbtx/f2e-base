(function(S) {
    var $ = S.$;
    var doc = document;
    var support = S.namespace("support");

    function transitionEnd() {
        var el = document.createElement('support');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }
    }

    $.extend(support, {
        transition: transitionEnd(),
        placeholder: 'placeholder' in doc.createElement('input')
    });

    // fix placeholder
    $(function() {
        if (!support.placeholder && $("input[placeholder], textarea[placeholder]").length) {
            /*
                input, textarea { color: #000; }
                .placeholder { color: #aaa; }
             */
            S.loadScript("base/js/plugin/jquery.placeholder.js", function() {
                $('input, textarea').placeholder();
            });
        }
    });
})(tbtx);
