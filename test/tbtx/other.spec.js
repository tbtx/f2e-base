describe('date', function() {
    describe("bingo", function() {
        it("should bingo", function() {
            var result = [0, 0];
            for (var i = 0; i < 100; i++) {
                if (tbtx.bingo(70)) {
                    result[0] += 1;
                } else {
                    result[1] += 1;
                }
            }
            tbtx.log(result, "log", "bingo");
        });
    });

    describe("tbtx resize", function() {
        it("should throttle window resize", function() {
            tbtx.on("window.resize", function() {
                tbtx.log("resize").log(arguments);
            });

            tbtx.on("window.scroll", function() {
                tbtx.log(arguments);
            });

            // tbtx.on("window.scroll.down", function() {
            //     tbtx.log("scroll down");
            // }).on("window.scroll.up", function() {
            //     tbtx.log("scroll up");
            // });
        });
    });
});
