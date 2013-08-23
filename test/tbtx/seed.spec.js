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
});