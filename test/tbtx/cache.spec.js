describe('cache', function() {
    describe("Cache", function() {
        it("should cache a value with a key", function(){
            var v = "hello";
            var Cache = new tbtx.Cache("test");

            expect(Cache.name).toEqual("test");
            expect(Cache.get('msg')).toBeUndefined();
            Cache.set('msg', v);
            expect(Cache.get('msg')).toEqual(v);
            Cache.remove('msg');
            expect(Cache.get('msg')).toBeUndefined();
        });

        it("should cache a value with a key", function(){
            var v = "hello";
            var Cache = new tbtx.Cache();
            Cache.set('msg', v);
            Cache.set('msg2', v);
            expect(Cache.getAll()).toEqual({
                msg: "hello",
                msg2: "hello"
            });
            Cache.clear();
            expect(Cache.getAll()).toEqual({});
        });
    });

    describe("data and removeData", function() {
        it("should data a value with name", function(){
            var v = "hello";
            expect(tbtx.data('msg')).toBeUndefined();
            tbtx.data('msg', v);
            expect(tbtx.data('msg')).toEqual(v);

        });

        it("should get the value with name", function(){
            expect(tbtx.data('msg')).toEqual('hello');
        });
    });
});