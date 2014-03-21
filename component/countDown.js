/**
 * 倒计时组件
 * 十一_tbtx
 */
(function(S) {
    var countDownAttrConfig = {
        value: "00",
        setter: function(val) {
            val = String(val);
            return val.length == 1 ? "0" + val : val;
        }
    };

    var SECONDS = 60,
        SECONDS_OF_HOUR = SECONDS * 60,
        SECONDS_OF_DAY = SECONDS_OF_HOUR * 24;

    // 倒计时组件
    var CountDown = S.createWidget({
        attrs: {
            // 当前时间
            now: {
                value: null,
                getter: function(val) {
                    return parseInt(val, 10);
                }
            },
            // 目标时间
            target: {
                value: null,
                getter: function(val) {
                    return parseInt(val, 10);
                }
            },

            day: countDownAttrConfig,
            hour: countDownAttrConfig,
            minute: countDownAttrConfig,
            second: countDownAttrConfig
        },

        setup: function() {
            var serverNow = this.get("now");
            var clientNow = S.Now();

            // 计算客户端当前时间和服务器当前时间的差
            this.diff = clientNow - serverNow;

            // 更新
            this.update();
            this.timer = S.later(this.update, 1000, true, this);
        },

        // 更新时间
        update: function() {
            // 目标时间
            var target = this.get("target");

            var clientNow = S.Now(),
                now = clientNow - this.diff;

            if (now >= target) {
                var dummy = this.timer && this.timer.cancel();

                // this.trigger('timeEnd');
            }

            var diff = (target - now)/1000;

            var day = Math.floor(diff / SECONDS_OF_DAY),
                hour = Math.floor((diff - day * SECONDS_OF_DAY)/SECONDS_OF_HOUR),
                minute = Math.floor((diff - hour * SECONDS_OF_HOUR - day * SECONDS_OF_DAY)/SECONDS),
                second = Math.floor(diff - minute * SECONDS - hour * SECONDS_OF_HOUR - day * SECONDS_OF_DAY);

            this.set("day", day);
            this.set("hour", hour);
            this.set("minute", minute);
            this.set("second", second);
        },

        _onRenderDay: function(val) {
            this.$("[data-role=day]").html(val);
        },
        _onRenderHour: function(val) {
            this.$("[data-role=hour]").html(val);
        },
        _onRenderMinute: function(val) {
            this.$("[data-role=minute]").html(val);
        },
        _onRenderSecond: function(val) {
            this.$("[data-role=second]").html(val);
        }
    });

    S.CountDown = CountDown;
})(tbtx);