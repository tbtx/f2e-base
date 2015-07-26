describe('date', function() {
    describe("makeDate", function() {
        it("should make date from a timestamp or a number format string", function() {
            expect(S.makeDate(1383272557027)).to.be.a(Date);
            expect(S.makeDate("1383272557027")).to.be.a(Date);
            expect(new Date()).to.be.a(Date);
        });
    });

    describe("formatDate", function() {
        it("should format the date", function() {
            var date = new Date(1383272557027);
            expect(S
                .formatDate("Y-m-d", date)).to.eql("2013-11-01");
            expect(S
                .formatDate(date, "Y-m-d")).to.eql("2013-11-01");
            expect(S
                .formatDate(1383272557027, "Y-m-d")).to.eql("2013-11-01");

        });

        it("should format the date from string", function() {
            expect(S
                .formatDate("Y-m-d", "2014-11-26T11:22:23")).to.eql("2014-11-26");
            expect(S
                .formatDate("2014-11-26T11:22:23", "Y-m-d")).to.eql("2014-11-26");
            expect(S
                .formatDate("2014-11-26T11:22:23", "Y-m-d h:i:s")).to.eql("2014-11-26 11:22:23");
            expect(S
                .formatDate("2014-11-26 11:22:23", "Y-m-d h:i:s")).to.eql("2014-11-26 11:22:23");
        });
    });

    describe("normalizeDate", function() {
        it("should get the normalized object of a date", function() {
            var date = new Date(1383272557027);

            expect(S
                .normalizeDate(date)).to.eql({
                    Y: "2013",
                    M: "11",
                    D: "1",
                    H: "10",
                    I: "22",
                    S: "37",
                    y: "13",
                    m: "11",
                    d: "01",
                    h: "10",
                    i: "22",
                    s: "37"
                });
        });
    });
});
