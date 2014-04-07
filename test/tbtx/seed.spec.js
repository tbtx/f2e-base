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
			expect(S.uniqueCid()).not.toEqual(S.uniqueCid());
		});
	});

	describe("$", function() {
		it("should get the $", function() {
			expect(S.$).toEqual(jQuery);
		});
	});

	describe("generateCid", function() {
		it("should generate a cid generator", function() {
			var cid1 = S.generateCid();

			expect(cid1()).toEqual(0);

			var cid2 = S.generateCid("widget-");
			expect(cid2()).toEqual("widget-0");
		});
	});
});