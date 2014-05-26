(function(S, document) {

    var ucfirst = S.ucfirst;

    // thanks modernizr
    var element = document.createElement("tbtx"),

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


    // export
    var support = S.namespace("support");

    support.add = function(name, fn) {
        support[name] = fn.call(support);
    };

    "transition transform".split(spliter).forEach(function(name) {
        support[name] = testPropsAll(name);
    });

    support.add("canvas", function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    });

    S.mix({
        testPropsAll: testPropsAll,
        prefixed: prefixed
    });
})(tbtx, document);
