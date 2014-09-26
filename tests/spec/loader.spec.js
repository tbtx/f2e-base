describe("loader", function() {
    var S = tbtx,
        Loader = S.Loader;

    describe("realpath", function() {
        it("should realpath", function() {
            expect(S.realpath("http://miiee.taobao.com/./path/../")).toEqual("http://miiee.taobao.com/");
        });
    });

    describe("define", function() {
        it("should define a mod", function() {
            define("mod", function() {
                return {
                    name: "modName"
                };
            });

            var mod = Loader.cache[Loader.resolve("mod")];
            expect(mod.status).toEqual(2);

            require("mod");
            expect(mod.status).toEqual(6);
            expect(mod.exports.name).toEqual("modName");
        });
    });

    xdescribe("register", function() {
        it("should register the mod if the mod is in env", function() {
            S.require("json", function(JSON) {
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
        var ready;
        it("should require the scripts", function() {

            runs(function() {
                ready = false;

                S.require("jquery", function() {
                    ready = true;
                });
            });

            waitsFor(function() {
                return ready;
            }, "the jquery should be load", 10000);

            runs(function() {
                // expect(jQuery).not.toBeNull();

                var mod = Loader.cache[Loader.resolve("jquery")];
                expect(mod.status).toEqual(6);

                // var $ = mod.exports;
                // expect($.fn.init).not.toBeNull();
                // expect($).toEqual(jQuery);
            });

            // S.require("handlebars", function(Handlebars) {
            //     expect(Handlebars).not.toBeUndefined();
            // });
        });
    });
});