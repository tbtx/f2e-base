/*
 * author: zenxds
 * email: zenxds@gmail.com
 * pagination
 * export:
 * v1.0 2013-7-22
 */
(function($, tbtx) {

    var Class = tbtx.Class,
        Events = tbtx.Events,
        substitute = tbtx.substitute;

    var Pagination = new Class();
    Pagination.Implements([Events]);

    var def = {
        number: {
            total: 100,         // 记录总数
            pagesize: 6,            // 每页记录数
            display: 10,        // 中间显示的页面数
            index: 1            // 当前页数
        },
        template: {
            prev: '上一页',
            next: '下一页',
            first: '首页',
            last: '最后一页',
            item: '第{{ page }}页',
            url: "/home/{{ page }}"             // url的格式
        },
        className: {
            prev: 'prev',
            next: 'next',
            current: 'current',
            item: 'item',
            first: 'first',
            last: 'last',
            disable: 'disable'
        },
        isTarget: false,
        pattern: '<a href="{{ href }}" class="{{ className }}" target="{{ target }}">{{ content }}</a>'
    };

    Pagination.include({
        init: function(container, options) {
            this.container = $(container);
            this.options = $.extend(true, {}, def, options);

            this.render();
        },

        // 计算
        calc: function() {
            this.display = [];          // 要显示的页

            var number = this.options.number;
            number.pages = Math.ceil(number.total / number.pagesize);   // 页数

            // 验证参数
            if (number.index > number.pages) {
                number.index = number.pages;
            }
            if (number.index < 1) {
                number.index = 1;
            }

            // 第一页,最后一页,上一页和下一页
            number.first = 1;
            number.last = number.pages;
            number.prev = number.index == 1 ? null : number.index - 1;
            number.next = number.index == number.pages ? null : number.index + 1;


            // 要显示的页
            var left = number.index - Math.floor(number.display / 2);
            var right = number.index + Math.floor(number.display / 2);
            
            // 判断越界
            if (left < 1) {
                left = 1;
                right = number.display < number.pages ? number.display : number.pages;
            } 
            if (right > number.pages) {
                right = number.pages;
                left =  number.display < number.pages ? (number.pages - number.display + 1) : 1;
            }

            for (var i = left; i <= right; i++) {
                this.display.push(i);
            }

        },

        render: function() {
            this.calc();
            
            var pattern = this.options.pattern;
            var ret = [];

            var template = this.options.template;
            var number = this.options.number;
            var className = this.options.className;
            var target = this.options.isTarget ? '_blank' : '_self';

            // first
            ret.push(substitute(pattern, {
                href: substitute(template.url, {
                    page: number.first
                }),
                className: [className.first, className.item].join(' '),
                target: target,
                content: template.first
            }));

            // prev
            ret.push(substitute(pattern, {
                href: number.prev ? substitute(template.url, {
                    page: number.prev
                }) : 'javascript:;',
                className: number.prev ? [className.prev, className.item].join(' ') : [className.prev, className.disable, className.item].join(' '),
                target: target,
                content: template.prev
            }));

            for (var i = 0; i < this.display.length; i++) {
                var page = this.display[i];

                ret.push(substitute(pattern, {
                    href: substitute(template.url, {
                        page: page
                    }),
                    className: page == number.index ? [className.item, className.current].join(' ') : className.item,
                    target: target,
                    content: substitute(template.item, {
                        page: page
                    })
                }));
            };

            // next
            ret.push(substitute(pattern, {
                href: number.next ? substitute(template.url, {
                    page: number.next
                }) : 'javascript:;',
                className: number.next ? [className.next, className.item].join(' ') : [className.next, className.item, className.disable].join(' '),
                target: target,
                content: template.next
            }));

            // last
            ret.push(substitute(pattern, {
                href: substitute(template.url, {
                    page: number.last
                }),
                className: [className.last, className.item].join(' '),
                target: target,
                content: template.last
            }));

            this.container.html(ret.join(''));
        }
    });

    tbtx.Pagination = Pagination;
})(jQuery, tbtx);
