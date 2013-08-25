/* ========================================================================
 * Bootstrap: carousel.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#carousel
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

+function ($) { "use strict";

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd'
    , 'MozTransition'    : 'transitionend'
    , 'OTransition'      : 'oTransitionEnd otransitionend'
    , 'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }
  }

  // http://blog.alexmaccaw.com/css-transitions
  // 模拟transitionend
  // 在duration后触发元素上的transitionend事件
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(window.jQuery);


+function ($) { "use strict";

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    // boolean, 是否暂停
    this.paused      =
    // boolean, 是否正在切换
    this.sliding     =

    // timer
    this.interval    =
    // jQuery element
    this.$active     =
    this.$items      = null

    // bind
    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.DEFAULTS = {
    interval: 5000
  , pause: 'hover'
  , wrap: true    // 是否无限循环，否则只能在一个方向上进行一次
  }

  // 鼠标移出$element时事件传递e参数
  // 进行interval， 每隔一段时间执行next
  // paused false 时进行循环
  Carousel.prototype.cycle =  function (e) {
    // 没有event不改变pause状态
    // 有event
    e || (this.paused = false)
    // console.log(e);
    // console.log(this.paused)
    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  // 一开始一定要有active的item
  Carousel.prototype.getActiveIndex = function () {
    // .item.active 在indicators里也有active
    this.$active = this.$element.find('.item.active')
    // 其实不用每次都去获取
    // this.$items  = this.$items || this.$active.parent().children() 
    this.$items  = this.$active.parent().children() 

    return this.$items.index(this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getActiveIndex()

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid', function () { that.to(pos) })
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition.end) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  // 核心函数
  // $element有slide的类时才进行滑动，否则只是单纯切换active
  // type -- prev, next
  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    // 没有找到next就是处于临界值，需要额外判断
    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    this.sliding = true

    isCycling && this.pause()

    var e = $.Event('slide.bs.carousel', { relatedTarget: $next[0], direction: direction })

    if ($next.hasClass('active')) return

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      this.$element.one('slid', function () {
        var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
        $nextIndicator && $nextIndicator.addClass('active')
      })
    }

    if ($.support.transition && this.$element.hasClass('slide')) {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid') }, 0)
        })
        .emulateTransitionEnd(600)
    } else {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger('slid')
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  var old = $.fn.carousel

  // add to jQuery.fn
  // 提供prev/next/paused/cycle, number等多种调用方式
  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this   = $(this)

      // instance
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      // options.slide = prev or next
      var action  = typeof option == 'string' ? option : options.slide

      // 在元素上附加实例
      // 实例并不执行任何方法
      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      // to(number)
      if (typeof option == 'number') data.to(option)
      // instance.prev/next
      else if (action) data[action]()     
      // 通过cycle()来开始
      else if (options.interval) {
        data.pause().cycle()
      }
    })
  }

  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // 从jQuery 1.4.3起， HTML 5 data- 属性 将自动被引用到jQuery的数据对象中
  // =================

  // prev, next, data-slide-to=0
  // 实质上是绑定click事件，但是添加了命名空间，可以在触发的时候不影响其他的click
  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this   = $(this), href
    // 通过data-target或者href=#id来获取target
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7

    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    $target.carousel(options)


    // 同时有slide和slide-to？
    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  // 一开始默认data-ride="carousel" 的将自动执行
  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      $carousel.carousel($carousel.data())
    })
  })

}(window.jQuery);
