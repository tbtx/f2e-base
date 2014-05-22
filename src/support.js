(function(S) {

    var ucfirst = S.ucfirst;

    // thanks modernizr
    var element = document.createElement("tbtx"),

        style = element.style,

        omPrefixes = 'Webkit Moz O ms',

        cssomPrefixes = omPrefixes.split(' ');

    var prefixed = function(prop) {
            return testPropsAll(prop, 'pfx');
        },
        testProps = function(props, prefixed) {
            var prop,
                i;

            for (i in props) {
                prop = props[i];
                if (prop.indexOf("-") === -1 && style[prop] !== undefined) {
                    return prefixed == 'pfx' ? prop : true;
                }
            }
            return false;
        },
        testPropsAll = function (prop, prefixed) {
            var ucProp = ucfirst(prop),
                props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

            return testProps(props, prefixed);
        };


    // export
    var support = S.namespace("support");

    "transition transform".split(" ").forEach(function(name) {
        support[name] = testPropsAll(name);
    });

    S.mix({
        testPropsAll: testPropsAll,
        prefixed: prefixed
    });
})(tbtx);
