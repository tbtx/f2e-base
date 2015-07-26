describe("support", function() {
    var support = S.support;

    describe("props", function() {
        it("should have some props", function() {
            expect(support).have.property('canvas');
            expect(support).have.property('ios');
            expect(support).have.property('android');
            expect(support).have.property('transition');
            expect(support).have.property('transform');
        });

    });

    // function loadScript(url, callback) {
    //     var script = document.createElement("script");
    //     var head = document.head || document.getElementsByTagName("head")[0];
    //     if (script.readyState) { //IE
    //         script.onreadystatechange = function() {
    //             if (script.readyState == "loaded" || script.readyState == "complete") {
    //                 script.onreadystatechange = null;
    //                 callback();
    //                 head.removeChild(script);
    //             }
    //         };
    //     } else { //Others
    //         script.onload = function() {
    //             callback();
    //             // head.removeChild(script);
    //         };
    //     }
    //     script.src = url;
    //     head.appendChild(script);
    // }
});