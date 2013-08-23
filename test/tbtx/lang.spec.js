describe('lang', function() {
	describe("Class", function() {
		it("should extend as Class prop", function(){
			var ClassA = new tbtx.Class;
			ClassA.extend({
				age: 18
			});
			
			expect(ClassA.age).toEqual(18);
		});

		it("should include as instance prop", function(){
			var ClassA = new tbtx.Class;

			ClassA.include({
				talk: function(msg) {
					return 'talk:' + msg;
				}
			});

			var instance = new ClassA;
			expect(instance.talk('hello')).toBe('talk:hello');
		});
	});
});