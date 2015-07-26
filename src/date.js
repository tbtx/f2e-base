/**
 * date module
 */

/**
 * formate格式只有2014/07/12 12:34:35的格式可以跨平台
 * new Date()
 * new Date(时间戳)
 * new Date(year, month, day[, hour[, minute[, second[, millisecond]]]])
 */

var rformat = /y|m|d|h|i|s/gi,
    rnumberDate = /^\d{13}$/,
    // from moment
    // risoDate = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
    rstringDate = /^(\d{4}-\d{2}-\d{2})(T| )(\d\d:\d\d:\d\d)$/;


// 判断参数是否是日期格式
// 支持数字，date
// 字符串支持2015-10-11 05:03:02 2015-10-11T05:03:02
function isDateFormat(val) {
    return rnumberDate.test(val) || rstringDate.test(val)  || isDate(val);
}

function isDate(val) {
    return val instanceof Date;
}

// 解析一个日期, 返回日期对象
function makeDate(val) {
    if (isDate(val)) {
        return val;
    }

    if (rnumberDate.test(val)) {
        return new Date(+val);
    }

    var match = rstringDate.exec(val);
    if (match) {
        return new Date(match[1].replace(/-/g, '/') + ' ' + match[3]);
    }

    return new Date();
}

/*
 * 将日期格式化成字符串
 *  Y - 4位年
 *  y - 2位年
 *  M - 不补0的月,
 *  m - 补0的月
 *  D - 不补0的日期
 *  d - 补0的日期
 *  H - 不补0的小时
 *  h - 补0的小时
 *  I - 不补0的分
 *  i - 补0的分
 *  S - 不补0的秒
 *  s - 补0的秒
 *  毫秒暂不支持
 *
 *  @return：指定格式的字符串
 */
function formatDate(format, date) {
    // 交换参数
    if (isDateFormat(format)) {
        date = [format, format = date][0];
    }

    format = format || 'Y-m-d h:i:s';
    var normalized = normalizeDate(date);

    return format.replace(rformat, function(k) {
        return normalized[k];
    });
}

// date转对象
function normalizeDate(date) {
    date = makeDate(date);

    var o = {
        Y: date.getFullYear(),
        M: date.getMonth() + 1,
        D: date.getDate(),
        H: date.getHours(),
        I: date.getMinutes(),
        S: date.getSeconds()
    };

    var normalized = {},
        k,
        v;

    for (k in o) {
        // 统一结果为字符串
        v = o[k] + '';

        normalized[k] = v;
        normalized[k.toLowerCase()] = padding2(v).slice(-2);
    }
    return normalized;
}

function padding2(str) {
    return str.length === 1 ? '0' + str : str;
}

module.exports = {
    makeDate: makeDate,
    normalizeDate: normalizeDate,
    formatDate: formatDate
};
