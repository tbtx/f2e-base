describe('date', function() {
    describe("formatDate", function() {
        it("should format the date", function() {
            var date = new Date(1383272557027);
            expect(tbtx
                .formatDate("Y-m-d", date)).toEqual("2013-11-01");
        });
    });
    describe("ago", function() {
        it("should get ago of the date", function() {
            var date = new Date(1383272557027);
            expect(tbtx
                .ago(date, 1385694640871)).toEqual("28天前");
            expect(tbtx
                .ago(1385694640871, date)).toEqual("28天前");

            expect(tbtx
                .ago(1385704245000, 1385704246000)).toEqual("刚刚");
            expect(tbtx
                .ago(1385704306000, 1385704246000)).toEqual("1分钟前");
            expect(tbtx
                .ago(1385704366000, 1385704246000)).toEqual("2分钟前");
            expect(tbtx
                .ago(1385700646000, 1385704246000)).toEqual("1小时前");
            expect(tbtx
                .ago(1385697046000, 1385704246000)).toEqual("2小时前");
            expect(tbtx
                .ago(1385617846000, 1385704246000)).toEqual("昨天");
            expect(tbtx
                .ago(1385531446000, 1385704246000)).toEqual("2天前");
            expect(tbtx
                .ago(1383025846000, 1385704246000)).toEqual("1个月前");
            expect(tbtx
                .ago(1377755446000, 1385704246000)).toEqual("3个月前");
            expect(tbtx
                .ago(1354168246000, 1385704246000)).toEqual("1年前");
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
