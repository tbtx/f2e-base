(function(S) {

    // S.preload = S.singleton(function() {
    //     return new Promise(function(resolve, reject) {
    //         if (!S.$) {
    //             S.require("jquery").then(function() {
    //                 S.$ = jQuery;
    //                 resolve(S);
    //             });
    //         } else {
    //             resolve(S);
    //         }
    //     });
    // });

})(tbtx);