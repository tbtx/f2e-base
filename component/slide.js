(function(T) {
    var Class = T.Class;

    var Slide = new Class();

    Slide.extend({
        defaults: {
            interval: 3000, // 切换间隔
            duration: 600, // 动画时间
            viewSize: 1,        //  在可见区域有几个
            itemSize: 0, // 每个item的size，当x方向滚动时指的是width, y-height

            itemSelector: '.slide-item',
            indicatorSelector: '.indicators li',
            activeClass: 'active',

            // 是否可以沿一个方向无限循环
            isCarousel: true,
            // 移动方向
            // x, y, or none
            direction: 'x'
        }
    });

    Slide.include({
        init: function(element, options) {
            this.$element = $(element);
            this.options = options;

            this.$indicators = this.$element.find(this.options.indicatorSelector);
            this.$items = this.$element.find(this.options.itemSelector);
            // 用来调整margin的元素
            this.$slider = this.$element.find('.slide-inner');
            // 默认获取宽高的元素
            this.$slide = this.$element.find('.slide');

            this.activeClass = this.options.activeClass;
            this.viewSize = this.options.viewSize;

            this.itemSize = this.options.itemSize || (this.options.direction == 'x' ? this.$slide.width() : this.$slide.height());

            // 是否正在切换
            this.sliding = false;
            // timer
            this.interval = 0;
            // 是否处于暂停状态
            this.paused = true;

            this.activeIndex = 0;
            this.nextIndex = 1;

            // 克隆后length增加
            if (this.options.isCarousel) {
                this.clone();
                this.length = this.$items.length + this.viewSize * 2; // 实际的item个数
                this.baseOffset = - (this.itemSize * this.viewSize); // css偏移的基数
            } else {
                this.length = this.$items.length;
                this.baseOffset = 0;
            }

            // 调整$slider 长度，以及位置修复到开始位置（针对克隆过）
            if (this.options.direction == 'x') {
                this.$slider.css({
                    width: this.itemSize * this.length,
                    marginLeft: this.baseOffset
                });
            } else {
                this.$slider.css({
                    height: this.itemSize * this.length,
                    marginTop: this.baseOffset
                });
            }

            this.cycle();

            this.$element.on('mouseenter', this.proxy(this.pause))
                .on('mouseleave', this.proxy(this.cycle));
        },

        // 通过克隆节点来实现跑马灯效果
        // step为多少则前后复制多少个元素
        clone: function() {
            var $items = this.$items,
                number = this.viewSize,
                activeClass = this.activeClass;

            var $parent = $items.parent();
            var prefix = $items.slice(-number).clone().prependTo($parent).removeClass(activeClass).addClass('copy');

            var suffix = $items.slice(0, number).clone().appendTo($parent).removeClass(activeClass).addClass('copy');
        },

        pause: function(e) {
            e || (this.paused = true);

            if (this.sliding) {
                this.cycle(true);
            }

            this.inerval = clearInterval(this.interval);
            return this;
        },

        cycle: function(e) {
            // 1个就不需要轮播
            if (this.$items.length == 1) {
                return;
            }
            e || (this.paused = false);
            this.interval && clearInterval(this.interval);

            var time = this.options.interval;
            time && !this.paused && (this.interval = setInterval(this.proxy(this.next), time));

            return this;
        },

        next: function() {
            if (this.sliding) {
                return;
            }
            return this.slide('next');
        },

        prev: function() {
            if (this.sliding) {
                return;
            }
            return this.slide('prev');
        },

        to: function(pos) {
            var self = this;
            if (pos > (this.$items.length - 1) || pos < 0) {
                return;
            }
            if (this.sliding) {
                return this.$element.one('slid', function () { 
                    self.to(pos);
                });
            }

            if (this.activeIndex == pos) {
                return this.pause().cycle();
            }

            var type = pos > this.activeIndex ? 'next' : 'prev';
            return this.slide(type, pos);
        },

        slide: function(direction, pos) {
            pos = parseInt(pos, 10);
            var isCycling = this.interval;

            this.sliding = true;
            isCycling && this.pause();

            this.$element.trigger('slide');

            var activeIndex = this.activeIndex,
                activeClass = this.activeClass,
                $items = this.$items,
                length = $items.length,
                $indicators = this.$indicators,
                $slider = this.$slider;

            var self = this;
            if (this.options.isCarousel) {
                // next
                if (direction == 'next') {
                    this.nextIndex = pos || activeIndex + 1;
                } else {
                    this.nextIndex = pos || activeIndex - 1;
                }
            } else {
                // next
                if (activeIndex < this.$items.length - 1) {
                    this.nextIndex = pos || activeIndex + 1;
                } else {
                    this.nextIndex = 0;
                }
            }

            var animateObj;
            if (this.options.direction == 'x') {
                animateObj = {
                    marginLeft: this.baseOffset - (this.itemSize * this.nextIndex)
                }
            } else if (this.options.direction == 'y'){
                animateObj = {
                    marginTop: this.baseOffset - (this.itemSize * this.nextIndex)
                }
            }

            animateObj && $slider.animate(animateObj, this.options.duration, function() {
                if (self.options.isCarousel) {
                    if (direction == 'next') {
                        if (self.nextIndex >= length) {
                            if (self.options.direction == 'x') {
                                $slider.css({
                                    marginLeft: self.baseOffset
                                });
                            } else {
                                $slider.css({
                                    marginTop: self.baseOffset
                                });
                            }
                            self.nextIndex = 0;
                            self.activeIndex = 0;
                        } else {
                            self.activeIndex = self.nextIndex;
                        }
                    } else {
                        if (self.nextIndex < 0) {
                            if (self.options.direction == 'x') {
                                $slider.css({
                                    marginLeft: self.baseOffset - self.itemSize * (length - 1)
                                });
                            } else {
                                $slider.css({
                                    marginTop: self.baseOffset - self.itemSize * (length - 1)
                                });
                            }
                            self.activeIndex = length - 1;
                            self.nextIndex = length - 1;
                        } else {
                            self.activeIndex = self.nextIndex;
                        }
                    }
                } else {
                    self.activeIndex = self.nextIndex;
                }

                self.sliding = false;
                setTimeout(function () { self.$element.trigger('slid') }, 0);

            });
            
            !animateObj && +function() {
                $items.hide();
                $items.eq(self.nextIndex).show();
                self.activeIndex = self.nextIndex;
                self.sliding = false;
                setTimeout(function () { self.$element.trigger('slid') }, 0)
            }();

            $items.removeClass(activeClass);
            $items.eq(this.nextIndex).addClass(activeClass);
            $indicators.removeClass(activeClass);
            $indicators.eq(this.nextIndex).addClass(activeClass);
            
            isCycling && self.cycle();
            return this;
        }
    });

    $.fn.Slide = function(option) {
        return this.each(function() {
            var $this = $(this);
            var key = 'tbtx.slide';

            // instance
            var data = $this.data(key);
            var options = $.extend({}, Slide.defaults, $this.data(), typeof option == 'object' && option);

            if (!data) {
                $this.data(key, (data = new Slide(this, options)));
            }
        });
    };

    $(document).on('click.tbtx.slide.data-api', '[data-slide], [data-slide-to]', function(e) {
        var $this = $(this),
            href;
        // 通过data-target或者href=#id来获取target
        var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')); //strip for ie7

        var options = $.extend({}, $target.data(), $this.data());
        var slideIndex = $this.attr('data-slide-to');

        var data = $target.data('tbtx.slide');
        if (slideIndex) {
            data.to(slideIndex);
        }

        if (options.slide) {
            data[options.slide]();
        }

        e.preventDefault();
    })

    // 一开始默认data-ride="carousel" 的将自动执行
    $(window).on('load', function() {
        $('[data-ride="slide"]').each(function() {
            var $element = $(this);
            $element.Slide($element.data());
        });
    });

    T.loadCss("http://a.tbcdn.cn/apps/tbtx/base/css/component/slide.css", function() {

    });
    T.mix(T, {
        Slide: Slide
    });
})(tbtx);
