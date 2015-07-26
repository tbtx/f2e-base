describe("uri", function() {
    describe('unparam, param', function() {
        it("should get a object of the params", function() {
            expect(S.unparam("spm=a310i.2181409.5731777.1.eVI5Sh&name=1213")).to.eql({
                spm: "a310i.2181409.5731777.1.eVI5Sh",
                name: "1213"
            });
        });

        it("should param a object to params", function() {
            expect(S.param({
                spm: "a310i.2181409.5731777.1.eVI5Sh",
                name: "1213"
            })).to.eql("spm=a310i.2181409.5731777.1.eVI5Sh&name=1213");
        });

        it("should param an array", function() {
            expect(decodeURIComponent(S.param({
                spm: [1, 2, 3]
            }))).to.eql("spm[]=1&spm[]=2&spm[]=3");
        });
    });

    describe("isUri", function() {
        it("should test a str is a uri", function() {
            expect(S.isUri("http://www.taobao.com")).to.be(true);
            expect(S.isUri("file:///E:/tbcdn/base/js/test/index.html")).to.be(true);
            expect(S.isUri("www.miiee.com")).to.be(false);
            expect(S.isUri("http://miiee.taobao.com/orders/confirm.htm?oid=165021")).to.be(true);
        });
    });

    describe('parseUri', function() {
        it("should get the info of a url", function() {
            var r = S.parseUri("http://miiee.taobao.com/choice.htm?spm=a310i.2181413.5731757.9.Jmv67O&pcid=8101&banner=nvzhuang#page-5");
            expect(r.scheme).to.eql("http");
            expect(r.domain).to.eql("miiee.taobao.com");
        });
    });

    describe('getHash', function() {
        it("should get the hash of a url", function() {
            expect(S.getHash("http://miiee.taobao.com/choice.htm?spm=a310i.2181413.5731757.9.Jmv67O&pcid=8101&banner=nvzhuang#page-5")).to.eql("page-5");
            expect(S.getHash("")).to.eql("");
            expect(S.getHash("")).to.eql("");
        });
    });

    describe("get/add/remove/set, QueryParam", function() {
        it("should get a object of the params with a url ", function() {
            var url = "http://miiee.taobao.com/themes/theme_118.htm?spm=a310i.2181409.5731777.1.eVI5Sh&name=1213#page-5";
            var target = {spm: "a310i.2181409.5731777.1.eVI5Sh", name: "1213"};

            expect( S.getQueryParam(url) ).to.eql(target);
            expect( S.getQueryParam(url) ).to.eql(target);
            expect( S.getQueryParam("name", url) ).to.eql("1213");

            expect( S.getQueryParam()).to.eql({});
            expect( S.getQueryParam("name") ).to.eql('');

            expect( S.getQueryParam("name", "abc") ).to.eql('');
            expect( S.getQueryParam("abc") ).to.eql('');
        });

        it("should add params with a url ", function() {
            var url = "http://miiee.taobao.com/themes/theme_118.htm#page-5";
            var params = {spm: "a310i.2181409.5731777.1.eVI5Sh", name: "1213"};
            var target = "http://miiee.taobao.com/themes/theme_118.htm?spm=a310i.2181409.5731777.1.eVI5Sh&name=1213#page-5";
            expect(S.addQueryParam(params, url)).to.eql(target);
        });

        it("should remove params with a url ", function() {
            var url = "http://miiee.taobao.com/themes/theme_118.htm#page-5";
            var params = ["spm", "name"];
            var target = "http://miiee.taobao.com/themes/theme_118.htm?spm=a310i.2181409.5731777.1.eVI5Sh&name=1213#page-5";
            expect(S.removeQueryParam(params, target)).to.eql(url);
        });
    });
});