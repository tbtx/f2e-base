define("component/countDown/1.0.0/countDown", ["widget"], function() {
    var S = tbtx;

    var attrConfig = {
        value: "00",
        setter: function(val) {
            val = String(val);
            return val.length == 1 ? "0" + val : val;
        }
    };

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

            day: attrConfig,
            hour: attrConfig,
            minute: attrConfig,
            second: attrConfig
        },

        setup: function() {
            var serverNow = this.get("now");
            var clientNow = Date.now();

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

            var clientNow = Date.now(),
                now = clientNow - this.diff;

            if (now >= target) {
                this.timer && this.timer.cancel();
            }

            var diff = S.diffDate(target, now);

            S.each(diff, function(v, k) {
                this.set(k, v);
            }, this);
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

    return CountDown;
});