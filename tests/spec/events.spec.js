describe('events', function() {
    afterEach(function() {
        S.off();
    });

    describe("on/trigger", function() {
        it("should trigger the event", function() {

            var counter = 0;
            S.on("hello", function() {
                counter++;
            });

            expect(counter).to.eql(0);
            S.trigger("hello");
            expect(counter).to.eql(1);

            var sum = 0;
            S.on("argsMoreThanOne", function(a, b) {
                sum = a + b;
            });
            S.trigger("argsMoreThanOne", 2, 3);
            expect(sum).to.eql(5);

            counter = 0;
            S.on("hello1 hello2", function() {
                counter++;
            });

            expect(counter).to.eql(0);
            S.trigger("hello1");
            S.trigger("hello2");
            expect(counter).to.eql(2);
        });
    });

    describe("on/off", function() {
        it("should off the event", function() {

            var counter = 0;

            S.on("hello", function() {
                counter++;
            });

            expect(counter).to.eql(0);
            S.off("hello");
            S.trigger("hello");
            expect(counter).to.eql(0);
        });
    });

    describe("one", function() {
        it("should trigger the event only once", function() {

            var counter = 0;

            S.one("hello", function(data) {
                counter++;
            });

            expect(counter).to.eql(0);
            S.trigger("hello", "data1");
            expect(counter).to.eql(1);

            S.trigger("hello", "data2");
            expect(counter).to.eql(1);
        });
    });
});
