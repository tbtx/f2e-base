
/**
 * formate格式只有2014/07/12 12:34:35的格式可以跨平台
 * new Date()
 * new Date(时间戳)
 * new Date(year, month, day[, hour[, minute[, second[, millisecond]]]])
 */

var rformat = /y|m|d|h|i|s/gi,
    rdate = /^(?:number|date)$/,
    rnewdate = /^(?:number|string)$/;

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
    if (rdate.test(type(format))) {
        date = [format, format = date][0];
    }

    format = format || "Y-m-d h:i:s";
    date = normalizeDate(date);

    return format.replace(rformat, function(k) {
        return date[k];
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
        },
        ret = {};

    each(o, function(v, k) {
        // 统一结果为字符串
        v += "";
        ret[k] = v;

        ret[k.toLowerCase()] = padding2(v).slice(-2);
    });

    return ret;
}

// 字符串/数字 -> Date
function makeDate(date) {
    if (isDate(date)) {
        date = +date;
    }

    return rnewdate.test(type(date)) ? new Date(date) : new Date();
}

function padding2(str) {
    str += "";
    return str.length === 1 ? "0" + str : str;
}

extend({
    normalizeDate: normalizeDate,
    formatDate: formatDate
});
