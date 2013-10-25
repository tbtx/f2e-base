beforeEach(function() {
	// this.addMatchers({
	// 	toBeLarge: function() {
	// 		this.message = function() {
	// 			return "Expected " + this.actual + " to be large";
	// 		};
	// 		return this.actual > 100;
	// 	}
	// });

	this.addMatchers({
		toBeBetween: function(m, n) {
			this.message = function() {
				return "Expected " + this.actual + " to be >=" + m + " & < " + n;
			};
			return this.actual >= m && this.actual < n;
		}
	});
});