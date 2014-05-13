(function(S) {

    var isDate = S.isDate,
        each = S.each;

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
        if (typeof format === "number") {
            date = [format, format = date][0];
        }
        format = format || "Y-m-d h:i:s";

        each(normalizeDate(date), function(v, k) {
            format = format.replace(k, v);
        });
        return format;
    }

    // date转对象
    function normalizeDate(date) {
        date = toDate(date);

        var o = {
            Y: date.getFullYear(),
            M: date.getMonth() + 1,
            D: date.getDate(),
            H: date.getHours(),
            I: date.getMinutes(),
            S: date.getSeconds()
        };

        var ret = {},
            key,
            i;

        for(i in o) {
            o[i] = String(o[i]);
            ret[i] = o[i];

            key = i.toLowerCase();
            if (key == "y") {
                ret[key] = o[i].substring(2, 4);
            } else {
                ret[key] = padding2(o[i]);
            }
        }

        return ret;
    }

    function diffDate(v1, v2) {
        v1 = toDate(v1);
        v2 = toDate(v2);

        var SECONDS = 60,
            SECONDS_OF_HOUR = SECONDS * 60,
            SECONDS_OF_DAY = SECONDS_OF_HOUR * 24,

            // diff seconds
            diff = Math.abs(v1.getTime() - v2.getTime()) / 1000,
            remain = diff;

        var day, hour, minute, second;

        day = Math.floor(remain / SECONDS_OF_DAY);
        remain -= day * SECONDS_OF_DAY;
        hour = Math.floor(remain / SECONDS_OF_HOUR);
        remain -= hour * SECONDS_OF_HOUR;
        minute = Math.floor(remain / SECONDS);
        remain -= minute * SECONDS;
        second = Math.floor(remain);

        return {
            day: day,
            hour: hour,
            minute: minute,
            second: second
        };
    }

    // 字符串/数字 -> Date
    function toDate(date) {
        if (isDate(date)) {
            return date;
        }

        var type = typeof date;
        return (type == "number" || type == "string") ? new Date(date) : new Date();
    }

    function padding2(str) {
        str = String(str);
        return str.length === 1 ? "0" + str : str;
    }

    S.mix({
        normalizeDate: normalizeDate,
        diffDate: diffDate,
        toDate: toDate,
        formatDate: formatDate
    });
})(tbtx);
