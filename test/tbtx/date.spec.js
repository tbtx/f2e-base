describe('date', function() {
    describe("formatDate", function() {
        it("should format the date", function() {
            var date = new Date(1383272557027);
            // expect(tbtx
            //     .formatDate("Y-m-d")).toEqual("2013-11-01");
        });
    });

    describe("normalizeDate", function() {
        it("should get the object of a date", function() {
            var date = new Date(1383272557027);
            expect(tbtx
                .normalizeDate(date)).toEqual({
                    D: 1,
                    H: 10,
                    I: 22,
                    M: 11,
                    S: 37,
                    Y: 2013,
                    d: "01",
                    h: 10,
                    i: 22,
                    m: 11,
                    s: 37,
                    y: "13"
                });
        });
    });
});
