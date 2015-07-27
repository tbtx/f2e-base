describe("loader", function() {

    describe("request", function() {
        it("should request a script", function() {
            expect(typeof _).to.be("undefined");
            S.request("http://cdn.staticfile.org/underscore.js/1.7.0/underscore-min.js", function() {
                expect(typeof _).not.to.be("undefined");
            });
        });

        it("should request a css", function() {
            S.request("http://cdn.staticfile.org/animate.css/3.2.0/animate.css", function() {
            });
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