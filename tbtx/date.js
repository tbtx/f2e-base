(function(exports) {

    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]";
        };
    }
    var isDate = isType("Date");

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
        format = format || "Y-m-d h:i:s";

        var o = normalizeDate(date);
        var i;

        var ret = format;
        for (i in o) {
            ret = ret.replace(i, o[i]);
        }
        return ret;
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
            i;
        // for in o的时候如果再对o赋值，在IE7下有bug
        for(i in o) {
            ret[i] = o[i];
        }

        // 补0
        var key;
        for(i in o) {
            key = i.toLowerCase();
            if (key == 'y') {
                ret[key] = o[i].toString().substring(2, 4);
            } else {
                ret[key] = o[i] < 10 ? ("0" + o[i]) : o[i];
            }
        }

        return ret;
    }

    var SECONDS_OF_DAY = 24 * 60 * 60;
    function ago(v1, v2) {
        v1 = toDate(v1);
        v2 = toDate(v2);

        var tmp;
        // 保证v1 > v2
        if (v1 < v2) {
            tmp = v1;
            v1 = v2;
            v2 = tmp;
        }

        // diff 秒
        var floor = Math.floor,
            diff = (v1.getTime() - v2.getTime()) / 1000,
            dayDiff = floor(diff / SECONDS_OF_DAY),
            // 月份跟年粗略计算
            monthDiff = floor(dayDiff / 30),
            yearDiff = floor(dayDiff / 365);

        if (yearDiff) {
            return yearDiff + "年前";
        }
        if (monthDiff) {
            return monthDiff + "个月前";
        }
        if (dayDiff) {
            return dayDiff == 1 ? "昨天": dayDiff + "天前";
        }

        return diff < 60 && "刚刚" ||
            diff < 3600 && floor(diff / 60) + "分钟前" ||
            diff < SECONDS_OF_DAY && floor(diff / 3600) + "小时前";
    }

    // 字符串/数字 -> Date
    function toDate(date) {
        if (isDate(date)) {
            return date;
        }
        var type = typeof date;
        if (type == 'number' || type == 'string') {
            return new Date(date);
        } else{
            return new Date();
        }
    }

    function mixTo(r, s) {
        var p;
        for (p in s) {
            if (s.hasOwnProperty(p)) {
                r[p] = s[p];
            }
        }
    }

    mixTo(exports, {
        normalizeDate: normalizeDate,
        ago: ago,
        formatDate: formatDate
    });
})(tbtx);
