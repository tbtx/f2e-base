var lang = require('./lang'),
    extend = lang.extend;

var modules = [
    lang,
    require('./seed'),
    require('./uri'),
    {
        cookie: require('./cookie')
    },
    require('./date'),
    require('./events'),
    require('./loader'),
    require('./support')
];

for (var i = 0; i < modules.length; i++) {
    extend(exports, modules[i]);
};
