var each = require('./lang').each;

var __config = {
    debug: location.search.indexOf("debug") !== -1 ? true : false
};

module.exports = {

    version: '3.0',

    config: function(key, value) {
        var ret = this;

        if (typeof key == 'string') {
            // get config
            if (value === undefined) {
                ret = __config[key];
            } else { // set config
                __config[key] = value;
            }
        } else {
            // Object config
            each(key, function(v, k) {
                __config[k] = v;
            });
        }

        return ret;
    },

    __data: {
        config: __config
    }
};