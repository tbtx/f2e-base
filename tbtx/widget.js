(function(exports) {
    var Base = new tbtx.Class();
    Base.Implements([tbtx.Events, tbtx.Aspect, tbtx.Attrs]);
    Base.include({
        init: function(config) {
            this.initAttrs(config);
            parseEventsFromInstance(this, this.attrs);
        },
        destory: function() {
            // 解除事件绑定
            this.off();

            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
            // Destroy should be called only once, generate a fake destroy after called
            // https://github.com/aralejs/widget/issues/50
            this.destory = function() {};
        }
    });
    function parseEventsFromInstance(host, attrs) {
        for (var attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                var m = "_onChange" + ucfirst(attr);
                if (host[m]) {
                    host.on("change:" + attr, host[m]);
                }
            }
        }
    }
    function ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }
    exports.Base = Base;


    var Widget = new tbtx.Class(Base);

    Widget.include({
        propsInAttrs: ["$element", "events"],

        $element: null,
        init: function(config) {
            Widget.superclass.init.call(this, config);
            this.setup();
        },
        $: function(selector) {
            return this.$element.find(selector);
        },
        setup: function() {},
        render: function() {}
    });
    exports.Widget = Widget;
})(tbtx);