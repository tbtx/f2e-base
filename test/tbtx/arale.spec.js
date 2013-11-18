describe('Base and Widget', function() {
    var Base = tbtx.Base,
        Widget = tbtx.Widget;
    describe("Base", function() {
        it("should Implements Events Attrs and Aspect", function() {
            var b = new Base;
            expect("on" in b).toBeTruthy();
            expect("off" in b).toBeTruthy();
            expect("initAttrs" in b).toBeTruthy();
            expect("set" in b).toBeTruthy();
            expect("get" in b).toBeTruthy();
            expect("before" in b).toBeTruthy();
            expect("after" in b).toBeTruthy();
        });

        it("should initAttrs", function() {
            // 不是传入{attrs:{}},直接传入
            // 往prototype上写时是{attrs: {}}，保证attrs in prototype
            var b = new Base({
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
        it("should render to body", function() {
            Widget.extend({
                outerBoxClass: "outer"
            });

            var w = new Widget({
                id: "test-widget",
                template: "<div><div class='test'>test</div></div>",
                events: {
                    "click .test": "test"
                }
            });
            w.test = function() {
                tbtx.log("test");
            };
            w.render();
        });
    });
});
