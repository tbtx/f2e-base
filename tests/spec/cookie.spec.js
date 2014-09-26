describe('cookie', function() {
    var S = tbtx,
        cookie = S.cookie;

    if (location.protocol == "file:") {
        return;
    }

    describe("get/set", function() {
        it("should get/set the cookie", function() {
            cookie.set("abc", "abc");
            expect(cookie.get("abc")).toEqual("abc");
        });
    });

    describe("get/remove", function() {
        it("should remove the cookie", function() {

            cookie.set("abc", "abc");
            cookie.remove("abc");
            expect(cookie.get("abc")).toBeUndefined();
        });
    });
});
