describe('seed', function() {
	describe("log", function() {
		it("should get the log info if the console.log exists", function(){
			console.log('tbtx');
		});
	});

	describe("global", function() {
		it("should equal to the window in the browser", function(){
			expect(tbtx.global).toEqual(window);
		});
	});

	describe("data", function() {
		it("should data a value with name", function(){
			var v = "hello";
			tbtx.data('msg', v)
			expect(tbtx.data('msg')).toEqual(v);
		});

		it("should get undefined with no name and no value", function(){
			expect(tbtx.data()).toEqual(undefined);
		});

		it("should get the value with name", function(){
			expect(tbtx.data('msg')).toEqual('hello');
		});
	});
});