
/**
 * formate格式只有2014/07/12 12:34:35的格式可以跨平台
 * new Date()
 * new Date(时间戳)
 * new Date(year, month, day[, hour[, minute[, second[, millisecond]]]])
 */

var rformatDate = /y|m|d|h|i|s/gi,
    rnumberDate = /^\d{13}$/,
    // from moment
    riso = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

// 判断参数是否是日期格式
// 包括数字，日期
// iso日期字符串
function isDateFormat(val) {
    return rnumberDate.test(val) || riso.test(val)  || isDate(val);
}

// 解析一个日期, 返回日期对象
function parseDate(val) {
    var match;

    if (isDate(val)) {
        return val;
    }

    if (rnumberDate.test(val)) {
        return new Date(+val);
    }

    match = riso.exec(val);
    if (match) {
        return new Date(match[0].replace(/-/g, "/").replace("T", " "));
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
 * date只支持毫秒和Date
 *  @return：指定格式的字符串
 */
function formatDate(format, date) {
    // 交换参数
    if (isDateFormat(format)) {
        date = [format, format = date][0];
    }

    format = format || "Y-m-d h:i:s";
    date = normalizeDate(date);

    return format.replace(rformatDate, function(k) {
        return date[k];
    });
}

// date转对象
function normalizeDate(date) {
    date = parseDate(date);

    var o = {
            Y: date.getFullYear(),
            M: date.getMonth() + 1,
            D: date.getDate(),
            H: date.getHours(),
            I: date.getMinutes(),
            S: date.getSeconds()
        },
        ret = {};

    each(o, function(v, k) {
        // 统一结果为字符串
        ret[k] = v + "";

        ret[k.toLowerCase()] = padding2(v).slice(-2);
    });

    return ret;
}

function padding2(str) {
    str += "";
    return str.length === 1 ? "0" + str : str;
}

extend({
    normalizeDate: normalizeDate,
    formatDate: formatDate
});
