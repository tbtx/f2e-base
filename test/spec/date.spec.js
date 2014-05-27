describe('date', function() {
    var S = tbtx;
    describe("formatDate", function() {
        it("should format the date", function() {
            var date = new Date(1383272557027);
            expect(S
                .formatDate("Y-m-d", date)).toEqual("2013-11-01");
            expect(S
                .formatDate(date, "Y-m-d")).toEqual("2013-11-01");
            expect(S
                .formatDate(1383272557027, "Y-m-d")).toEqual("2013-11-01");

        });
    });

    describe("normalizeDate", function() {
        it("should get the object of a date", function() {
            var date = new Date(1383272557027);
            expect(S
                .normalizeDate(date)).toEqual({
                    D: "1",
                    H: "10",
                    I: "22",
                    M: "11",
                    S: "37",
                    Y: "2013",
                    d: "01",
                    h: "10",
                    i: "22",
                    m: "11",
                    s: "37",
                    y: "13"
                });
        });
    });

    describe("diffDate", function() {
        it("should get the diff of two date", function() {
            var date1 = new Date(1383272557027);
            var date2 = new Date(1400838542662);
            expect(S
                .diffDate(date1, date2)).toEqual({
                    day: 203,
                    hour: 7,
                    minute: 26,
                    second: 25
                });
        });
    });
});
