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

    describe("isoDate", function() {
        it("should format the date", function() {
            expect(S
                .formatDate("Y-m-d", "2014-11-26T11:22:23")).toEqual("2014-11-26");
            expect(S
                .formatDate("2014-11-26T11:22:23", "Y-m-d")).toEqual("2014-11-26");
            expect(S
                .formatDate("2014-11-26T11:22:23", "Y-m-d h:i:s")).toEqual("2014-11-26 11:22:23");

        });
    });

    describe("normalizeDate", function() {
        it("should get the object of a date", function() {
            var date = new Date(1383272557027);
            var normalizedDate = S
                .normalizeDate(date);

            delete normalizedDate.origin;

            expect(normalizedDate).toEqual({
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
});
