(function(S) {

    var promise = new Promise(function(resolve, reject) {
        if (!S.$) {
            S.require("jquery").then(function() {
                S.$ = jQuery;
                resolve(S, S.$);
            });
        } else {
            resolve(S, S.$);
        }
    });

    S.ready = function(callback) {
        return promise.then(callback);
    };

})(tbtx);