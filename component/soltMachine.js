(function($) {
    var Class = tbtx.Class,
        choice = tbtx.choice;

    var SoltMachine = new Class(),
        def = {
            speed: {
                // 最小，最大和初始速度
                // 与Tween配合时，以1000为基数
                low: 1500,
                fast: 5000,
                start: 3000,

                update: 200, // 更新速度的频率，ms

                step: 200 // 每次速度变化的步长
            }
        };

    SoltMachine.extend({
        guid: 0, // 为每个老虎机附加id

        instances: [], // 存储每个老虎机实例

        // 状态
        status: "ready",

        number: 0, // 奖品的个数

        callbacks: [], // 完成的回调

        // 获取并更新guid
        getGuid: function(instance) {
            var ret = this.guid;
            this.guid = ret + 1;
            return ret;
        },

        // 添加一个状态机
        add: function(options) {
            var number = this.number;
            var instance = new SoltMachine(number, options);

            instance.guid = SoltMachine.getGuid(); // 老虎机标示
            this.instances.push(instance);
        },

        // 如果给出了结果数组，则使用新的结果
        // results - [0, 1, 2]
        start: function(results) {
            results = results || [];
            var length = results.length;

            // 传入length不正常
            if (length && length != this.instances.length) {
                return false;
            }

            if (this.status == "running") {
                return false;
            }

            this.status = "running";

            // 每次更新defer，完成执行回调
            var defers = [],
                self = this;
            $.each(this.instances, function(i, instance) {
                defers.push(instance.getDefer());
            });
            $.when.apply(this, defers).done(function() {
                for (var i = 0; i < self.callbacks.length; i++) {
                    self.callbacks[i]();
                }
                self.status = "ready";
            });

            if (length) {
                $.each(this.instances, function(i, instance) {
                    instance.result = results[i];

                    instance.start();
                });
            } else {
                $.each(this.instances, function(i, instance) {
                    instance.start();
                });
            }

            return true;
        },

        // 随机生成结果
        // isLotteried 是否中奖
        randomStart: function(isLotteried) {
            var length = this.instances.length;
            var choice = this.choice;

            var randoms = new Array(length);
            var result = choice(0, length); // 随机出的结果

            // 中奖
            if (isLotteried) {
                $.each(randoms, function(i, v) {
                    randoms[i] = result;
                });
            } else { // 让第一个等于seed，其余不等于即可
                $.each(randoms, function(i, v) {
                    randoms[i] = 0;

                    if (i == 0) {
                        randoms[i] = result;
                    } else {
                        do {
                            randoms[i] = choice(0, length);
                        } while (randoms[i] == result)
                    }
                });
            }

            return this.start(randoms);
        },


        // 添加回调函数
        done: function(cb) {
            this.callbacks.push(cb);
            return this.callbacks;
        },

        choice: choice
    });

    SoltMachine.include({
        // 从length中挑选结果为result
        init: function(number, options) {
            this.options = $.extend(true, {}, def, options);

            this.result = this.options.result || SoltMachine.choice(0, number);

            this.intervalToggle = null; // 切换定时器, 更改index
            this.intervalUpdateSpeed = null; // 改变速度的定时器

            this.speed = this.options.speed.start; // 一开始的速度
            this.status = "ready";
            this.index = this.options.index || 0; // 当前所在位置

        },

        // 返回某项配置
        getOption: function(name) {
            return this.options[name];
        },

        // 返回dtd给老虎机使用
        getDefer: function() {
            // resolve也需要重新new Defer
            if (this.dtd && this.dtd.status == "pending") {

            } else {
                this.dtd = $.Deferred();
            }
            return this.dtd.promise();
        },

        // 对外主要使用start, pause, reset
        start: function() {
            this.onStart(this);

            this.status = "up"; // 一开始处于加速阶段
            this.doInterval();
            this.changeSpeed();
        },

        reset: function() {
            this.onReset(this);

            this.index = 0;
            this.speed = this.options.speed.start;
            this.status = "ready";

            this.clear();
        },

        clear: function() {
            clearInterval(this.intervalUpdateSpeed);
            clearTimeout(this.intervalToggle);
            this.intervalToggle = null;
            this.intervalUpdateSpeed = null;
        },

        // 仅仅改变状态
        done: function() {
            this.dtd.resolve(); // 改变执行状态，reject是失败
        },



        // 仅仅是改变index,在回调里面可以切换active
        doInterval: function() {
            this.toggle();
            // 用timeout是因为切换的速度会变化
            this.intervalToggle = setTimeout(this.proxy(function() {
                this.doInterval();
            }), this.speed / 4); // 切换的速度除4，否则太慢
        },

        toggle: function() {
            this.index = (this.index + 1) % SoltMachine.number;
            this.onToggle(this);
        },

        // 先加速再减速
        changeSpeed: function() {
            var speed = this.options.speed;
            this.intervalUpdateSpeed = setInterval(this.proxy(function() {
                if (this.status == 'up') {
                    // 更新速度
                    this.speed = this.speed + speed.step;
                }
                if (this.status == 'down') {
                    this.speed = this.speed - speed.step;
                    // 最小速度不能太小，甚至小于0
                    if (this.speed < 200) {
                        this.speed = 200;
                    }
                }

                // 速度最大后开始减速
                if (this.speed > speed.fast) {
                    this.status = "down";
                    return;
                }
                // 速度减速到小于初始速度之后停止
                if (this.speed < speed.low && this.index == this.result) {
                    this.doneSpeed = this.speed;
                    this.reset();
                }

            }), speed.update);
        },

        /* ------ 需要重写的函数,提供UI变化 ------ */

        // 如何进行切换
        onToggle: function(self) {

        },

        // 额外的初始化函数
        onStart: function(self) {

        },

        onReset: function(self) {

        }
    });

    tbtx.SoltMachine = SoltMachine;
})(jQuery);
