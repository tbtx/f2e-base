describe('cache', function() {
    var S = tbtx;
    describe("Cache", function() {
        it("should cache a value with a key", function(){
            var v = "hello";
            var Cache = new S.Cache("test");

            expect(Cache.name).toEqual("test");
            expect(Cache.get('msg')).toBeUndefined();
            Cache.set('msg', v);
            expect(Cache.get('msg')).toEqual(v);
            Cache.remove('msg');
            expect(Cache.get('msg')).toBeUndefined();
        });

        it("should cache a value with a key", function(){
            var v = "hello";
            var Cache = new S.Cache();
            Cache.set('msg', v);
            Cache.set('msg2', v);
            expect(Cache.getAll()).toEqual({
                msg: "hello",
                msg2: "hello"
            });
            Cache.clear();
            expect(Cache.getAll()).toEqual({});

            Cache.set("msg3", v).set("msg4", v);
        });
    });

    describe("data and removeData", function() {
        it("should data a value with name", function(){
            var v = "hello";
            expect(S.data('msg')).toBeUndefined();
            S.data('msg', v);
            expect(S.data('msg')).toEqual(v);

            S.data('msg1', v).data("msg2", v);
            S.removeData('msg1').removeData("msg2");
        });

        it("should get the value with name", function(){
            expect(S.data('msg')).toEqual('hello');
        });
    });
});