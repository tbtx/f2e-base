var lang = require('./lang'),
    extend = lang.extend;

var modules = [
    lang,
    require('./seed')
];

modules.forEach(function(m) {
    extend(exports, m);
});