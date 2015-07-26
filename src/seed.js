var __config = {
    debug: location.search.indexOf('debug') !== -1 ? true : false
};

module.exports = {

    version: '3.0',

    config: function(key, val) {
        var ret = this,
            k,
            object;

        if (typeof key === 'string') {
            // get config
            if (val === undefined) {
                ret = __config[key];
            } else { // set config
                __config[key] = val;
            }
        } else {
            // Object config
            object = key;
            for (k in object) {
                if (object.hasOwnProperty(k)) {
                    __config[k] = object[k];
                }
            }
        }

        return ret;
    },

    __data: {
        config: __config
    }
};