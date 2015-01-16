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

    support = {
        touch: "ontouchstart" in documentElement,
        pad: !!ua.match(/iPad/i),

        transition: transition,
        transform: transform,

        placeholder: "placeholder" in inputElem,

        translate3d: testPropsAll('perspective')
    };

each({
    mobile: function() {
        return !!ua.match(/AppleWebKit.*Mobile.*/) || this.touch;
    },

    phone: function() {
        return this.mobile && !this.pad;
    },

    canvas: function() {
        var elem = createElement("canvas");
        return !!(elem.getContext && elem.getContext("2d"));
    }
}, function(factory, name) {
    support[name] = factory.call(support);
});

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
