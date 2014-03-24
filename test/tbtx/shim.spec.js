describe('shim', function() {
    var S = tbtx;
    describe("promise", function() {
        it("should implement the es6 promise", function(){
            var promise = new Promise(function(resolve, reject) {

            });
            expect(promise.done).not.toBeUndefined();
            expect(promise.fail).not.toBeUndefined();
            expect(promise.then).not.toBeUndefined();
            expect(promise.always).not.toBeUndefined();
        });
    });

    describe("json", function() {
        it("should implement the JSON", function(){
            expect(JSON.stringify).not.toBeUndefined();
            expect(JSON.parse).not.toBeUndefined();
        });
    });
});