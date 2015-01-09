
// thanks modernizr
var createElement = function(type) {
        return document.createElement(type);
    },
    element = createElement("tbtx"),
    style = element.style,
    spliter = " ",
    omPrefixes = "Webkit Moz O ms",
    cssomPrefixes = omPrefixes.split(spliter),

    prefixed = function(prop) {
        return testPropsAll(prop, "pfx");
    },
    testProps = function(props, prefixed) {
        var prop,
            i;

        for (i in props) {
            prop = props[i];
            if (style[prop] !== undefined) {
                return prefixed == "pfx" ? prop : true;
            }
        }
        return false;
    },
    testPropsAll = function(prop, prefixed) {
        var ucProp = ucfirst(prop),
            props = (prop + spliter + cssomPrefixes.join(ucProp + spliter) + ucProp).split(spliter);

        return testProps(props, prefixed);
    },

    touch = "ontouchstart" in documentElement,
    mobile = !!ua.match(/AppleWebKit.*Mobile.*/) || touch,
    pad = !!ua.match(/iPad/i),
    phone = mobile && !pad,
    transform = testPropsAll("transform"),

    support = {
        transition: testPropsAll("transition"),
        transform: transform,
        touch: touch,
        mobile: mobile,
        pad: pad,
        phone: phone,
        placeholder: "placeholder" in createElement("input"),
        canvas: (function() {
            var elem = createElement("canvas");
            return !!(elem.getContext && elem.getContext("2d"));
        })(),

        testTranslate3d: function() {
            if (!transform) {
                return false;
            }

            var el = createElement('p'),
                has3d,
                prefixedTransform = prefixed("transform");

            document.body.insertBefore(el, null);
            el.style[prefixedTransform] = 'translate3d(1px,1px,1px)';

            has3d = getComputedStyle(el).getPropertyValue(dasherize(prefixedTransform));

            document.body.removeChild(el);

            return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
        }
    };


extend({
    support: support,
    testPropsAll: testPropsAll,
    prefixed: prefixed
});
