
// thanks modernizr
var element = document.createElement("tbtx"),
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
    phone = mobile && !pad;

// .add("canvas", function() {
//     var elem = document.createElement("canvas");
//     return !!(elem.getContext && elem.getContext("2d"));
// })

S.mix({
    support: {
        transition: testPropsAll("transition"),
        transform: testPropsAll("transform"),
        touch: touch,
        mobile: mobile,
        pad: pad,
        phone: phone,
        placeholder: "placeholder" in document.createElement("input")
    },
    testPropsAll: testPropsAll,
    prefixed: prefixed
});
