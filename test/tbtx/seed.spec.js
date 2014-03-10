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
			expect(tbtx.global).toBe(window);
		});
	});

	describe("staticUrl", function() {
		xit("should be the base static url of the static files", function() {
			expect(tbtx.staticUrl).toEqual("file:///E:/tbcdn");
		});
	});

	describe("uniqueCid", function() {
		it("should get a unique client id", function() {
			expect(tbtx.uniqueCid() - tbtx.uniqueCid()).toEqual(-1);
		});
	});
});