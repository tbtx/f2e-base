(function(S, document) {
    // thanks modernizr

    var ucfirst = S.ucfirst,
        ua = navigator.userAgent,

        support = S.support = {},

        documentElement = document.documentElement,
        element = document.createElement("tbtx"),

        style = element.style,

        spliter = " ",

        omPrefixes = "Webkit Moz O ms",

        cssomPrefixes = omPrefixes.split(spliter);

    var prefixed = function(prop) {
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
        testPropsAll = function (prop, prefixed) {
            var ucProp = ucfirst(prop),
                props = (prop + spliter + cssomPrefixes.join(ucProp + spliter) + ucProp).split(spliter);

            return testProps(props, prefixed);
        };

    support.add = function(name, fn) {
        support[name] = fn.call(support);
        return this;
    };

    "transition transform".replace(S.rword, function(name) {
        support[name] = testPropsAll(name);
    });

    support.add("canvas", function() {
        var elem = document.createElement("canvas");
        return !!(elem.getContext && elem.getContext("2d"));
    }).add("mobile", function() {
        // 是否是移动设备，包含pad
        return !!ua.match(/AppleWebKit.*Mobile.*/) || "ontouchstart" in documentElement;
    }).add("pad", function() {
        return !!ua.match(/iPad/i);
    }).add("phone", function() {
        return this.mobile && !this.pad;
    }).add("placeholder", function() {
        return "placeholder" in document.createElement("input");
    });

    S.mix({
        testPropsAll: testPropsAll,
        prefixed: prefixed
    });
})(tbtx, document);
