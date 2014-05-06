(function(S) {
    var ucfirst = S.ucfirst;

    function transition() {
        var el = document.createElement('tbtx'),
            transNames = ["moz", "webkit", "o"].map(function(prefix) {
                return ucfirst(prefix) + ucfirst("transition");
            });

        transNames.push("transition");

        return transNames.some(function(name) {
            return el.style[name] !== undefined;
        });
    }

    S.support = {
        transition: transition()
    };
})(tbtx);
