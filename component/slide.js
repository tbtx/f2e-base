(function(T) {
    var Class = T.Class;

    var Slide = new Class();

    Slide.extend({
        defaults: {
            interval: 3000,		// 切换间隔
            duration: 600,		// 动画时间
            steps: 1, // 一次切换几个, 比较鸡肋
            itemSize: 0, // 每个item的size，当x方向滚动时指的是width, y-height

            itemSelector: '.slide-item',
            indicatorSelector: '.indicators li',
            activeClass: 'active',

            // 是否可以沿一个方向无限循环
            isCarousel: true,
            // 是否延迟加载图片
            isLazyload: false,
            // 移动方向
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

            this.activeClass = this.options.activeClass;
            this.steps = this.options.steps;

            this.itemSize = this.options.itemSize || (this.options.direction == 'x' ? this.$slider.width() : this.$slider.height());
            // 是否正在切换
            this.sliding = false;
            // timer
            this.interval = null;
            this.paused = true;

            this.activeIndex = 0;
            this.nextIndex = 1;

            // 克隆后length增加
            if (this.options.isCarousel) {
            	this.clone();
            	this.length = this.$items.length + this.steps*2;	// 实际的item个数
            	this.baseOffset = - this.itemSize * this.steps;
            } else {
            	this.length = this.$items.length;
            	this.baseOffset = 0;
            }

            // adjust width or height
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

        // 通过克隆节点来实现走马灯效果
        clone: function() {
        	var $items = this.$items,
        		steps = this.steps,
        		activeClass = this.activeClass;

            var $parent = $items.parent();
            var prefix = $items.slice(-steps).clone().prependTo($parent).removeClass(activeClass).addClass('copy');

            var suffix = $items.slice(0, steps).clone().appendTo($parent).removeClass(activeClass).addClass('copy');
        },

        pause: function() {
            this.inerval = clearInterval(this.interval);
        },

        cycle: function() {
        	// 1个就不需要轮播
        	if (this.$items.length == 1) {
        		return;
        	}

            var time = this.options.interval;
            this.interval = setInterval(this.proxy(this.next), time);

        },

        next: function() {
            if (this.sliding) {
                return;
            }
            this.slide('next');
            // !this.paused && this.cycle();
        },

        prev: function() {
            if (this.sliding) {
                return;
            }
            this.slide('prev');
        },

        to: function(pos) {
        	var type = pos > this.activeIndex ? 'next' : 'prev';
        	this.slide(type, pos);
        },

        slide: function(direction, pos) {
        	this.sliding = true;

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
        	// console.log(this.nextIndex);

        	var animateObj = {};
        	if (this.options.direction == 'x') {
        		animateObj = {
        			marginLeft: this.baseOffset - (this.itemSize * this.nextIndex)
        		}
        	} else {
        		animateObj = {
        			marginTop: this.baseOffset - (this.itemSize * this.nextIndex)
        		}
        	}

			$slider.animate(animateObj, 600, function() {
            	if (self.options.isCarousel) {
            		if(direction == 'next') {
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
            });


			$items.removeClass(activeClass);
			$items.eq(this.nextIndex).addClass(activeClass);
			$indicators.removeClass(activeClass);
			$indicators.eq(this.nextIndex).addClass(activeClass);
			// toggleCallback.call(slidePlayer, $slideItems.eq(n), $thumbItems.eq(n));
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
})(tbtx);
