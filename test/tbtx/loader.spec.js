describe('loader', function() {

    describe("require", function() {
        it("should require the module", function() {
            expect(tbtx
                .Switchable).toBeUndefined();
            tbtx.require("switchable").done(function() {
                expect(tbtx
                .Switchable).not.toBeUndefined();
            });
        });
    });
});
