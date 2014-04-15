describe("uri", function() {
    var S = tbtx;

    describe("isUri", function() {
        it("should test a str is a uri", function() {
            expect(S.isUri("http://www.taobao.com")).toBeTruthy();
            expect(S.isUri("file:///E:/tbcdn/base/js/test/index.html")).toBeTruthy();
            expect(S.isUri("www.miiee.com")).toBeFalsy();
            expect(S.isUri("http://miiee.taobao.com/orders/confirm.htm?oid=165021")).toBeTruthy();
        });
    });

    describe('Query', function() {
        it("should get the info of a query str", function() {
            var str = "spm=a310i.2181413.5731757.9.Jmv67O&pcid=8101&banner=nvzhuang";
            var q = new S.Query(str);
            q.add("name", "zenxds");
            // S.log(q.toString());
        });
    });
    describe('parseUrl', function() {
        it("should get the info of a url", function() {
            var r = S.parseUrl("http://miiee.taobao.com/choice.htm?spm=a310i.2181413.5731757.9.Jmv67O&pcid=8101&banner=nvzhuang#page-5");
            expect(r.scheme).toEqual("http");
            expect(r.domain).toEqual("miiee.taobao.com");
        });
    });

    describe('getFragment', function() {
        it("should get the fragment of a url", function() {
            expect(S.getFragment("http://miiee.taobao.com/choice.htm?spm=a310i.2181413.5731757.9.Jmv67O&pcid=8101&banner=nvzhuang#page-5")).toEqual("page-5");
            expect(S.getFragment("")).toEqual("");
        });
    });
    describe("get/add/remove/set, QueryParam", function() {
        it("should get a object of the params with a url ", function() {
            var url = "http://miiee.taobao.com/themes/theme_118.htm?spm=a310i.2181409.5731777.1.eVI5Sh&name=1213#page-5";
            var target = {spm: "a310i.2181409.5731777.1.eVI5Sh", name: "1213"};

            expect( S.getQueryParam("", url) ).toEqual(target);
            expect( S.getQueryParam(url) ).toEqual(target);
            expect( S.getQueryParam("name", url) ).toEqual("1213");

            // expect( S.getQueryParam("") ).toEqual({});
            expect( S.getQueryParam("name") ).toEqual('');

            expect( S.getQueryParam("name", "abc") ).toEqual('');
            expect( S.getQueryParam("", "abc") ).toEqual({});

            // expect( S.getQueryParam() ).toEqual(S.data("urlInfo").query);
        });

        it("should add params with a url ", function() {
            var url = "http://miiee.taobao.com/themes/theme_118.htm#page-5";
            var params = {spm: "a310i.2181409.5731777.1.eVI5Sh", name: "1213"};
            var target = "http://miiee.taobao.com/themes/theme_118.htm?spm=a310i.2181409.5731777.1.eVI5Sh&name=1213#page-5";
            expect(S.addQueryParam(params, url)).toEqual(target);
        });

        it("should remove params with a url ", function() {
            var url = "http://miiee.taobao.com/themes/theme_118.htm#page-5";
            var params = ["spm", "name"];
            var target = "http://miiee.taobao.com/themes/theme_118.htm?spm=a310i.2181409.5731777.1.eVI5Sh&name=1213#page-5";
            expect(S.removeQueryParam(params, target)).toEqual(url);
        });
    });
});