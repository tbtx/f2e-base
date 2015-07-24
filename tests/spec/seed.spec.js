describe("seed", function() {

    it("should have a version", function() {
        expect(S.version).to.exist;
    });

    describe("config", function() {

        before(function() {
            // runs before all tests in this block
            // S.__data.config = {};
        });

        after(function() {
            // S.__data.config = {};
            // runs after all tests in this block
        });

        it("should set/get a config", function() {
            S.config("k", "v");
            expect(S.config("k")).to.equal("v");
        });

        it("should set a object config", function() {
            S.config({
                k1: "v1",
                k2: "v2"
            });
            expect(S.config("k1")).to.equal("v1");
            expect(S.config("k2")).to.equal("v2");
        });

    });
});