// thanks modernizr
var createElement = function(type) {
        return document.createElement(type);
    },

    splitter = " ",
    supportElem = createElement("tbtx"),
    supportStyl = supportElem.style,
    inputElem = createElement("input"),

    /**
     * css 使用 -webkit-box-sizing
     * dom使用boxSizing
     */
    // prefixes = ' -webkit- -moz- -o- -ms- '.split(splitter),
    omPrefixes = 'Webkit Moz O ms',
    cssomPrefixes = omPrefixes.split(splitter),
    // domPrefixes = omPrefixes.toLowerCase().split(splitter),

    prefixed = function(prop) {
        return testPropsAll(prop, "pfx");
    },
    testProps = function(props, prefixed) {
        var prop,
            i;

        for (i in props) {
            prop = props[i];
            if (supportStyl[prop] !== undefined) {
                return prefixed == "pfx" ? prop : true;
            }
        }
        return false;
    },
    testPropsAll = function(prop, prefixed) {
        var ucProp = ucfirst(prop),
            props = (prop + splitter + cssomPrefixes.join(ucProp + splitter) + ucProp).split(splitter);

        return testProps(props, prefixed);
    },

    transform = prefixed("transform"),
    transition = prefixed("transition"),

    testBodyTimer = setInterval(function() {
        body = document.body;

        if (body) {
            trigger("body.ready", body);
            clearInterval(testBodyTimer);
        }
    }, 50),

    testTranslate3d = function() {
        var el = createElement('p'),
            has3d;

        body.insertBefore(el, null);
        el.style[transform] = 'translate3d(1px,1px,1px)';

        has3d = getComputedStyle(el).getPropertyValue(dasherize(transform));

        body.removeChild(el);

        return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
    },

    support = {
        touch: "ontouchstart" in documentElement,
        pad: !!ua.match(/iPad/i),

        transition: transition,
        transform: transform,

        placeholder: "placeholder" in inputElem,

        add: function(name, factory) {
            var s = this;
            s[name] = isFunction(factory) ? factory.call(s) : factory;
            return s;
        }
    };

support.add("mobile", function() {
    return !!ua.match(/AppleWebKit.*Mobile.*/) || this.touch;
}).add("phone", function() {
    return this.mobile && !this.pad;
}).add("canvas", function() {
    var elem = createElement("canvas");
    return !!(elem.getContext && elem.getContext("2d"));
});

if (support.transform) {
    on("body.ready", function() {
        support.translate3d = testTranslate3d();
    });
} else {
    support.translate3d = false;
}

var transEndEventNames = {
    WebkitTransition : 'webkitTransitionEnd',
    MozTransition    : 'transitionend',
    OTransition      : 'oTransitionEnd otransitionend',
    transition       : 'transitionend'
};
support.transitionEnd = transition ? transEndEventNames[transition]: "";


extend({
    support: support,
    testPropsAll: testPropsAll,
    prefixed: prefixed
});
