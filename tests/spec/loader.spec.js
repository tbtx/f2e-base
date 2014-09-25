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

    describe("register", function() {
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
        it("should require the scripts", function() {
            S.require("jquery", function($) {
                expect($).toBe(jQuery);
            });

            S.require("handlebars", function() {
                expect(Handlebars).not.toBeUndefined();
            });
        });
    });
});