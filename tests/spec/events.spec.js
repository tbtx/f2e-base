describe('events', function() {
    var S = tbtx;

    describe("on/trigger", function() {
        it("should trigger the event", function() {

            var counter = 0;

            S.on("hello", function() {
                counter++;
            });

            expect(counter).toEqual(0);
            S.trigger("hello");
            expect(counter).toEqual(1);
        });
    });

    describe("on/off", function() {
        it("should off the event", function() {

            var counter = 0;

            S.on("hello", function() {
                counter++;
            });

            expect(counter).toEqual(0);
            S.off("hello");
            S.trigger("hello");
            expect(counter).toEqual(0);
        });
    });
});
