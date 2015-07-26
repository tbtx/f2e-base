describe('cookie', function() {
    var cookie = S.cookie;

    if (location.protocol.indexOf("file") > -1) {
        return;
    }

    describe("get/set", function() {
        it("should get/set the cookie", function() {
            cookie.set("cookie1", "abc");
            expect(cookie.get("cookie1")).to.eql("abc");
        });
    });

    describe("get/remove", function() {
        it("should remove the cookie", function() {
            cookie.set("cookie2", "abc");
            expect(cookie.get("cookie2")).to.eql("abc");
            cookie.remove("cookie2");
            expect(cookie.get("cookie2")).to.be(undefined);
        });
    });
});
