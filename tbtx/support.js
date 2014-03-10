(function(S) {
    var doc = document;
    var support = S.namespace("support");

    S.mix(support, {
        placeholder: 'placeholder' in doc.createElement('input')
    }, [], false, true);

    // fix placeholder
    // $(function() {
    //     if (!support.placeholder && $("input[placeholder], textarea[placeholder]").length) {

    //             input, textarea { color: #000; }
    //             .placeholder { color: #aaa; }

    //         S.require("plugin/jquery.placeholder.js", function() {
    //             $('input, textarea').placeholder();
    //         });
    //     }
    // });
})(tbtx);
