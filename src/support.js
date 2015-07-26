/**
 * support
 */
var ua = navigator.userAgent;

// thanks modernizr
var getElement = function(type) {
        return document.createElement(type);
    },

    splitter = ' ',
    supportElem = getElement('tbtx'),
    canvasElem = getElement('canvas');
    supportStyl = supportElem.style,

    /**
     * css 使用 -webkit-box-sizing
     * dom使用boxSizing
     */
    // prefixes = ' -webkit- -moz- -o- -ms- '.split(splitter),
    prefixes = 'Webkit Moz O ms',
    cssPrefixes = prefixes.split(splitter),
    // domPrefixes = prefixes.toLowerCase().split(splitter),

    prefixed = function(prop) {
        return testPropsAll(prop, 'pfx');
    },
    testProps = function(props, prefixed) {
        var prop,
            i;

        for (i in props) {
            prop = props[i];
            if (supportStyl[prop] !== undefined) {
                return prefixed === 'pfx' ? prop : true;
            }
        }
        return false;
    },
    testPropsAll = function(prop, prefixed) {
        var ucProp = ucfirst(prop),
            props = (prop + splitter + cssPrefixes.join(ucProp + splitter) + ucProp).split(splitter);

        return testProps(props, prefixed);
    },

    transform = prefixed('transform'),
    transition = prefixed('transition'),

    support = {
        touch: 'ontouchstart' in document.documentElement,
        pad: /iPad/.test(ua),
        android: /Android/.test(ua),
        ios: /iPhone|iPod|iPad/.test(ua),
        // 移动终端，包含pad
        mobile: /AppleWebKit.*Mobile.*/.test(ua),

        canvas: !!(canvasElem.getContext && canvasElem.getContext('2d')),

        transition: transition,
        transform: transform,
        translate3d: testPropsAll('perspective')
    };

support.phone = support.mobile && screen.width < 600;

var transEndEventNames = {
    WebkitTransition : 'webkitTransitionEnd',
    MozTransition    : 'transitionend',
    OTransition      : 'oTransitionEnd otransitionend',
    transition       : 'transitionend'
};
support.transitionEnd = transition ? transEndEventNames[transition]: '';

module.exports = {
    support: support,
    testPropsAll: testPropsAll,
    prefixed: prefixed
};

function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
}