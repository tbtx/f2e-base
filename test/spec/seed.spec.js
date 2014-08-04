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
            fns.e = function() {
                return "fne";
            };
            expect(S.config("e")).toEqual("fne");
        });

    });
});