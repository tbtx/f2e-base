describe("seed", function() {
    var S = tbtx;

    describe("config", function() {
        var Config = S.Config,
            fns = Config.fns;

        it("should set a config", function() {
            S.config("a", "a");
            expect(Config.a).toEqual("a");
        });

        it("should get a config", function() {
            S.config("b", "b");
            expect(S.config("b")).toEqual("b");
        });

        it("should set a object config", function() {
            S.config({
                c: "c",
                d: "d"
            });
            expect(Config.c).toEqual("c");
            expect(Config.d).toEqual("d");
        });

        it("should get a config with fn", function() {
            fns.path = function() {
                return "my path";
            };
            expect(S.config("path")).toEqual("my path");
        });

        it("should set a config with fn", function() {
            fns.var = function(val) {
                if (val) {
                    Config.var = "my " + val;
                } else {
                    return "getter";
                }
            };
            S.config("var", "var");
            expect(Config.var).toEqual("my var");
            expect(S.config("var")).toEqual("getter");
        });
    });
});