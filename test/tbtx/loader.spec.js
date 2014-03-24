describe('loader', function() {
    var S = tbtx;

    describe("realpath", function() {
        it("should real a path", function() {
            expect(S.realpath("http://test.com/a/./b/../c")).toEqual("http://test.com/a/c");
        });
    });

    describe("loadCss, loadScript", function() {
        it("should load the resource", function() {
            S.loadCss("base/css/msg.css");
            S.loadScript("base/js/gallery/store.min.js").done(function() {
                expect(store).not.toBeUndefined();
            });
        });
    });

    describe("require", function() {
        it("should require the module", function() {
            expect(S
                .Switchable).toBeUndefined();
            S.require("switchable").done(function() {
                expect(S
                .Switchable).not.toBeUndefined();
            });
        });
    });
});
