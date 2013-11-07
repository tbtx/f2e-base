(function(exports) {
    var Base = new tbtx.Class();
    Base.Implements([tbtx.Events, tbtx.Aspect, tbtx.Attrs]);
    Base.include({
        init: function(config) {
            this.initAttrs(config);
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
            this.destroy = function() {};
        }
    });
    exports.Base = Base;


    var Widget = new tbtx.Class(Base);

    Widget.include({
        $element: null,
        init: function() {
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