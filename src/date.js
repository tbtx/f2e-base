(function(S) {

    var isDate = S.isDate,
        each = S.each,
        floor = Math.floor,
        EMPTY = "",
        rword = S.rword,
        rformat = /y|m|d|h|i|s/gi,
        rdate = /number|object/,
        rnewdate = /number|string/;

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
     *  @return：指定格式的字符串
     */
    function formatDate(format, date) {
        // 交换参数
        if (rdate.test(typeof format)) {
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
            v = EMPTY + v;

            ret[k] = v;

            k = k.toLowerCase();
            ret[k] = k === "y" ? v.substring(2, 4) : padding2(v);
        });

        return ret;
    }

    var seconds = {
        second: 1,
        minute: 60,
        hour: 60 * 60,
        day: 60 * 60 * 24
    };
    function diffDate(d1, d2) {
        d1 = makeDate(d1);
        d2 = makeDate(d2);

        // 相差的秒
        var diff = Math.abs(d1 - d2) / 1000,
            remain = diff,
            ret = {};

        "day hour minute second".replace(rword, function(name) {
            var s = seconds[name],
                current = floor(remain / s);

            ret[name] = current;
            remain -= s * current;
        });
        return ret;
    }

    // 字符串/数字 -> Date
    function makeDate(date) {
        if (isDate(date)) {
            return new Date(+date);
        }

        return rnewdate.test(typeof date) ? new Date(date) : new Date();
    }

    function padding2(str) {
        str = EMPTY + str;
        return str.length === 1 ? "0" + str : str;
    }

    S.mix({
        normalizeDate: normalizeDate,
        diffDate: diffDate,
        makeDate: makeDate,
        formatDate: formatDate
    });
})(tbtx);
