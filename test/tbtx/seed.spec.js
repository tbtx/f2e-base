describe('seed', function() {
	describe("log", function() {
		it("should get the log info if the console.log exists", function(){
			tbtx.log('tbtx');
			tbtx.log('tbtx', 'debug');
			tbtx.log('tbtx', 'debug', 'src');
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
			tbtx.data('msg', v);
			expect(tbtx.data('msg')).toEqual(v);
		});

		it("should get the value with name", function(){
			expect(tbtx.data('msg')).toEqual('hello');
		});
	});
});