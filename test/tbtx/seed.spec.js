describe('seed', function() {
	var S = tbtx;
	describe("log", function() {
		it("should get the log info if the console.log exists", function(){
			S.log('S');
			S.log('S', 'debug');
			S.log('S', 'debug', 'src');
		});
	});

	describe("global", function() {
		it("should equal to the window in the browser", function(){
			expect(S.global).toBe(window);
		});
	});

	describe("staticUrl", function() {
		xit("should be the base static url of the static files", function() {
			expect(S.staticUrl).toEqual("file:///E:/tbcdn");
		});
	});

	describe("uniqueCid", function() {
		it("should get a unique client id", function() {
			expect(S.uniqueCid() - S.uniqueCid()).toEqual(-1);
		});
	});

	describe("$", function() {
		it("should get the $", function() {
			expect(S.$).toEqual(jQuery);
		});
	});
});