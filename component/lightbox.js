(function(S) {
    var $ = S.$;

    var Lightbox = S.createWidget({
        attrs: {
            // 触发元素
            trigger: {
                value: "img",
                // required
                getter: function(val) {
                    var delegateNode = this.get("delegateNode");
                    this.set("triggerSelector", val);
                    return delegateNode.length ? delegateNode.find(val) : $(val);
                }
            },

            delegateNode: {
                value: null,
                // required
                getter: function(val) {
                    return $(val);
                }
            },

            // 当前激活的元素
            activeTrigger: {
                value: null,
                // required
                getter: function(val) {
                    return $(val);
                }
            },

            // 激活元素的index值
            activeIndex: null,

            dataAttr: "bigsrc",

            triggerType: "click",

            opacity: 1,
            backgroundColor: null,

            // 是否正在加载
            isLoading: false,

            // 是否能够触发
            // 可以通过set('disabled', true)关闭
            disabled: false,

            // hideOnClick: true,

            className: "tbtx-lightbox",

            // 前后不可用时的class名
            disabledClass: "tbtx-lightbox-nav-disabled"
        },

        events: {
            'click [data-role=prev]': 'prev',
            'click [data-role=next]': 'next',
            "click [data-role=close]": "hide"
        },

        setup: function() {
            Lightbox.superclass.setup.call(this);
            this._bindTrigger();

            this.after('render', function() {
                this.element.hide();
            });

            this.before('show', function() {
                S.stopBodyScroll();
            });
            this.after('hide', function() {
                S.resetBodyScroll();
            });
        },

        pin: function() {
            var content = this.$("[data-role=content]");
            if (content.height() + 100 > S.viewportHeight()) {
                S.pin({
                    element: content,
                    x: "50%",
                    y: 0
                }, {
                    element: this.element,
                    x: "50%",
                    y: 0
                });
            } else {
                S.center(this.$("[data-role=content]"), this.element);
            }
        },

        show: function() {
            if (this.get("disabled")) {
                return;
            }
            return Lightbox.superclass.show.apply(this, arguments);
        },

        _bindTrigger: function() {
            var trigger = this.get("trigger");

            var handler = function(e) {
                var node = e.target;
                this.set("activeTrigger", node);
                this.switchTo(trigger.index(node));

                e.preventDefault();
            };

            this.get("delegateNode").on(this.get("triggerType"), this.get("triggerSelector"), S.bind(handler, this));
        },

        prev: function() {
            var activeIndex = this.get("activeIndex");
            this.switchTo(activeIndex - 1);
        },

        next: function() {
            var activeIndex = this.get("activeIndex");
            this.switchTo(activeIndex + 1);
        },

        _onRenderIsLoading: function(val) {
            this.$("[data-role=loading]")[val ? "show": "hide"]();
        },

        switchTo: function(index) {
            var trigger = this.get("trigger");

            if (index < 0 || index >= trigger.length) {
                return;
            }
            if (this.get("isLoading")) {
                return;
            }

            this.set("activeIndex", index);
            this.set("activeTrigger", trigger.get(index));
            this.show();


            var activeTrigger = this.get("activeTrigger"),
                data = activeTrigger.data();
            var src = data[this.get("dataAttr")] || activeTrigger.attr("src");

            this.set("isLoading", true);
            this.trigger('switch');
            var img = new Image();
            var self = this;
            img.onload = img.onerror = function () {
                self.set("isLoading", false);
                self.$('[data-role=img]').empty().append(img).css({
                    width: img.width,
                    height: img.height
                });


                self.$("[data-role=next]")[index === trigger.length - 1 ? "addClass" : "removeClass"](self.get("disabledClass"));
                self.$("[data-role=prev]")[index === 0 ? "addClass": "removeClass"](self.get("disabledClass"));
                if (data.title) {
                    self.$("[data-role=title]").html(data.title);
                }
                if (data.desc) {
                    self.$("[data-role=desc]").html(data.desc);
                }
                self.trigger('switched');

                self.pin();

                img.onload = onerror = null;
            };

            img.src = src;

        }

    }, S.Overlay);

    S.Lightbox = Lightbox;

})(tbtx);