describe('Base and Widget', function() {
    describe("Base", function() {
        it("should Implements Events Attrs and Aspect", function() {
            var b = new tbtx.Base({
                name: 123
            });
            expect("on" in b).toBeTruthy();
            expect("off" in b).toBeTruthy();
            expect("initAttrs" in b).toBeTruthy();
            expect("set" in b).toBeTruthy();
            expect("get" in b).toBeTruthy();
            expect("before" in b).toBeTruthy();
            expect("after" in b).toBeTruthy();
            expect("destroy" in b).toBeTruthy();
        });

        it("should initAttrs", function() {
            // 不是传入{attrs:{}},直接传入attrs
            // 往prototype上写时是{attrs: {}}，保证attrs in prototype
            // attrs 是onChange, 在proto上的方法名是_onChange
            var b = new tbtx.Base({
                hello: "zenxds",
                onChangeHello: function(v, prev) {
                    expect(prev).toEqual("zenxds");
                }
            });

            expect(b.get("hello")).toEqual("zenxds");
            b.set("hello", "zenxds2");
        });
    });

    describe("Widget", function() {
        xit("should render to body", function() {
            tbtx.Widget.extend({
                outerBoxClass: "outer"
            });

            var w = new tbtx.Widget({
                id: "test-widget",
                template: "#template-demo",
                events: {
                    "click .test": "test"
                }
            });

            tbtx.log(w);
        });
    });
});
