describe('lang', function() {
	var Class = tbtx.Class;

	describe("mix", function() {
		it("should mix to tbtx if no src", function() {
			expect(tbtx.hello).not.toEqual(123);
			tbtx.mix({
				hello: 123
			});
			expect(tbtx.hello).toEqual(123);
		});
	});

	describe("Class", function() {
		it("should get a fn to be it's prototype ", function() {
			var ClassA = new tbtx.Class;

			expect(ClassA.fn).toBe(ClassA.prototype);
		});

		it("should get some built in method ", function() {
			var ClassA = new tbtx.Class;

			expect("extend" in ClassA).toBeTruthy();
			expect("include" in ClassA).toBeTruthy();
			expect("proxy" in ClassA).toBeTruthy();
			expect("Implements" in ClassA).toBeTruthy();
		});

		it("should extend as Class prop", function() {
			var ClassA = new tbtx.Class;
			ClassA.extend({
				age: 18
			});

			expect(ClassA.age).toEqual(18);
		});

		it("should include as instance prop", function() {
			var ClassA = new tbtx.Class;

			ClassA.include({
				talk: function(msg) {
					return 'talk:' + msg;
				}
			});

			var instance = new ClassA;
			expect(instance.talk('hello')).toBe('talk:hello');
		});

		it("should extend from a parent", function() {
			var ClassA = new tbtx.Class;

			ClassA.include({
				talk: function(msg) {
					return 'talk:' + msg;
				},
				init: function() {
					console.log("A init");
				}
			});

			var ClassB = new tbtx.Class(ClassA);
			ClassB.include({
				talk: function(msg) {
					return 'Btalk:' + msg;
				},
				init: function() {
					console.log("B init");
				}
			});

			var instanceB = new ClassB;
			var instanceA = new ClassA;
			expect(instanceB.talk('hello')).toBe('Btalk:hello');
			expect(instanceA.talk('hello')).toBe('talk:hello');

			expect(ClassB.superclass.talk('hello')).toBe('talk:hello');
		});

		xit("Inherit class (static) properties from parent.", function() {
			var ClassA = new tbtx.Class;

			ClassA.extend({
				hello: "zenxds"
			});
			expect(ClassA.hello).toEqual("zenxds");
			var ClassB = new Class(ClassA);
			expect(ClassB.hello).toBe("zenxds");
		});

		it("should call the parent's constructor", function() {
			var ClassA = function(name) {
					this.name = name;
				};

			var ClassB = new Class(ClassA);
			ClassB.include({
				init: function(name) {
					this.name2 = name;
				}
			});

			var b = new ClassB("alex");

			expect(b.name).toBe("alex");
			expect(b.name2).toBe("alex");
		});

		it("should fix it's constructor", function() {
			var ClassA = new tbtx.Class;
			var a = new ClassA;

			expect(ClassA.fn.constructor).toBe(ClassA);
			expect(a.constructor).toBe(ClassA);

			var ClassB = new Class(ClassA);
			var b = new ClassB;
			expect(b.constructor).toBe(ClassB);
		});
	});

	describe('classify', function() {
		it("should get a Implements method", function() {
			var o = {};
			tbtx.classify(o);
			expect("Implements" in o).toBeTruthy();

			o.Implements([tbtx.Events, tbtx.Aspect]);
			expect("before" in o).toBeTruthy();
			expect("after" in o).toBeTruthy();
			expect("on" in o).toBeTruthy();
			expect("off" in o).toBeTruthy();
			expect("trigger" in o).toBeTruthy();
		});
	});

	describe('isNotEmptyString', function() {
		it("should be true if the param is string and is not empty", function() {
			expect(tbtx.isNotEmptyString('abc')).toBeTruthy();
			expect(tbtx.isNotEmptyString('')).toBeFalsy();

			expect(tbtx.isNotEmptyString({})).toBeFalsy();
		});
	});

	describe('inArray', function() {
		it("should be true if the param is in array", function() {
			var array = [1, 2, 3, 4, 5];
			expect(tbtx.inArray(array, 1)).toBeTruthy();
			expect(tbtx.inArray(array, 6)).toBeFalsy();
		});
	});

	describe('indexOf', function() {
		it("should get the index of the param in the array", function() {
			var array = [1, 2, 3, 4, 5];
			expect(tbtx.indexOf(array, 1)).toBe(0);
		});
	});

	describe('filter', function() {
		it("should filter the array", function() {
			var array = [1, 2, 3, 4, 5];
			var r = tbtx.filter(array, function(elem, index, arr) {
				expect(arr).toBe(array);
				return elem % 2 == 0;
			});

			expect(r).toEqual([2, 4]);

			r = tbtx.filter(array, function(elem, index, arr) {
				return index % 2 == 0;
			});
			expect(r).toEqual([1, 3, 5]);
		});
	});

	describe('keys', function() {
		it("should get the keys of the object", function() {
			var o = {
				"name1": "value1",
				"name2": "value2"
			};
			expect(tbtx.keys(o)).toEqual(["name1", "name2"]);
		});
	});

	describe('Now', function() {
		it("should get a number", function() {
			expect(tbtx.Now()).toEqual(jasmine.any(Number));
		});

		it("should get a number with length 13", function() {
			expect(String(tbtx.Now()).length).toEqual(13);
		});
	});

	describe('startsWith, endsWith', function() {
		it("should get true if the string startsWith the prefix", function() {
			expect(tbtx.startsWith("hello", 'hello')).toBeTruthy();
			expect(tbtx.startsWith("hello", 'ahello')).toBeFalsy();
		});

		it("should get true if the string endsWith the suffix", function() {
			expect(tbtx.endsWith("hello", 'hello')).toBeTruthy();
			expect(tbtx.endsWith("hello", 'ahello')).toBeFalsy();
		});
	});

	describe('choice', function() {
		it("should get a number between m and n", function() {
			expect(tbtx.choice(1, 5)).toBeBetween(1, 5);
		});

		it("should get a number in the array", function() {
			expect(tbtx.choice([1, 2, 3])).toBeBetween(1, 4);
		});
	});

	describe('getFragment', function() {
		it("should get the fragment of a url", function() {
			expect(tbtx.getFragment("http://miiee.taobao.com/choice.htm?spm=a310i.2181413.5731757.9.Jmv67O&pcid=8101&banner=nvzhuang#page-5")).toEqual("page-5");
			expect(tbtx.getFragment("")).toEqual("");
		});
	});
	describe('unparam, getQueryParam', function() {
		it("should get a object of the params", function() {
			expect(tbtx.unparam("spm=a310i.2181409.5731777.1.eVI5Sh&name=1213")).toEqual({
				spm: "a310i.2181409.5731777.1.eVI5Sh",
				name: "1213"
			});
		});

		it("should get a object of the params with a url ", function() {
			var url = "http://miiee.taobao.com/themes/theme_118.htm?spm=a310i.2181409.5731777.1.eVI5Sh&name=1213#page-5";
			var target = {spm: "a310i.2181409.5731777.1.eVI5Sh", name: "1213"};

			expect( tbtx.getQueryParam("", url) ).toEqual(target);
			expect( tbtx.getQueryParam("name", url) ).toEqual("1213");

			expect( tbtx.getQueryParam("") ).toEqual({});
			expect( tbtx.getQueryParam("name") ).toEqual('');

			expect( tbtx.getQueryParam("name", "abc") ).toEqual('');
			expect( tbtx.getQueryParam("", "abc") ).toEqual({});
		});
	});

	describe('escape, unEscape', function() {
		it("should escape success", function() {
			expect(tbtx.escapeHtml("<>")).toEqual("&lt;&gt;");
		});
		it("should unEscape success", function() {
			expect(tbtx.unEscapeHtml("&lt;&gt;")).toEqual("<>");
		});
	});
});
