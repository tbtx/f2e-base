describe('other', function() {
    var S = tbtx;
    describe("bingo", function() {
        it("should bingo", function() {
            var result = [0, 0];
            for (var i = 0; i < 100; i++) {
                if (S.bingo(70)) {
                    result[0] += 1;
                } else {
                    result[1] += 1;
                }
            }
            S.log(result, "log", "bingo");
        });
    });

    describe("S resize", function() {
        it("should throttle window resize", function() {
            S.on("window.resize", function() {
                // S.log("resize").log(arguments);
            });

            S.on("window.scroll", function() {
                // S.log(arguments);
            });
        });
    });
});
