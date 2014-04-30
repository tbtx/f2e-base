describe("loader", function() {
    var S = tbtx;

    xdescribe('preload', function() {
        it("should preload the scripts", function() {
            expect(jQuery).not.toBeUndefined();
            // expect(JSON).not.toBeUndefined();
        });
    });

    describe("register", function() {
        it("should register the mod if the mod is in env", function() {
            S.require("json", function() {
                var o = {
                    a: "a",
                    b: "b"
                };
                var expectResult = '{"a":"a","b":"b"}';
                expect(JSON.stringify(o)).toEqual(expectResult);
                expect(JSON.parse(expectResult)).toEqual(o);
            });
        });
    });

    describe('require', function() {
        it("should require the scripts", function() {
            S.require("jquery", function($) {
                expect($).toBe(jQuery);
            });

            // S.require("miiee/js/moment.min.js", function() {
            //     expect(moment).not.toBeUndefined();
            // });

            S.require("gallery/store/store.min.js", function(store) {
                expect(store).not.toBeUndefined();
            });

            S.require("handlebars", function() {
                expect(Handlebars).not.toBeUndefined();
            });

            S.require("widget", function(Widget) {
                var w = new Widget().render();

                S.log(w);
            });
        });
    });
});