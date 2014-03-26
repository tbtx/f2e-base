describe('lang', function() {
	var S = tbtx;
	var Class = S.Class;

	var arrayLikeObject = {
		1: "a",
		2: "b",
		3: "c",
		length: 3
	};

	describe("shim", function() {
		describe('keys', function() {
			it("should get the keys of the object", function() {
				var o = {
					"name1": "value1",
					"name2": "value2"
				};
				var expectResult = ["name1", "name2"];
				expect( S.keys(o) ).toEqual(expectResult);
				expect( Object.keys(o) ).toEqual(expectResult);
			});
		});

		describe('bind', function() {
			it("should bind the function to a context", function() {
				var o = {
					"name": "value"
				};
				var f = function() {
					return this.name;
				};
				expect(f.bind(o)()).toEqual("value");
				expect(S.bind(f, o)()).toEqual("value");
			});
		});

		describe("JSON", function() {
			var o = {
				a: "a",
				b: "b"
			};
			var expectResult = '{"a":"a","b":"b"}';
			expect(JSON.stringify(o)).toEqual(expectResult);
			expect(JSON.parse(expectResult)).toEqual(o);
		});

		describe("trim", function() {
			it("should trim a str", function() {
				expect("a".trim()).toEqual("a");
				expect(S.trim("a")).toEqual("a");
				expect(" a".trim()).toEqual("a");
				expect(S.trim(" a")).toEqual("a");
				expect("a ".trim()).toEqual("a");
				expect(S.trim("a ")).toEqual("a");
				expect(" a ".trim()).toEqual("a");
				expect(S.trim(" a ")).toEqual("a");
			});
		});

		describe('Now', function() {
			it("should get a number", function() {
				expect(S.Now()).toEqual(jasmine.any(Number));
				expect(Date.now()).toEqual(jasmine.any(Number));
			});

			it("should get a number with length 13", function() {
				expect(String(S.Now()).length).toEqual(13);
			});
		});

		describe('forEach every some', function() {
			it("should implement ES'5 forEach .. etc", function() {
				var counter = 0;
				array = [1, 2, 3, 4];

				array.forEach(function() {
					counter += 1;
					return false;
				});
				expect(counter).toEqual(4);

				counter = 0;
				S.forEach(array, function() {
					counter += 1;
					return false;
				});
				expect(counter).toEqual(4);

				counter = 0;
				array.every(function() {
					counter += 1;
					return false;
				});
				expect(counter).toEqual(1);

				counter = 0;
				S.every(array, function() {
					counter += 1;
					return false;
				});
				expect(counter).toEqual(1);

				counter = 0;
				S.each(array, function() {
					counter += 1;
					return false;
				});
				expect(counter).toEqual(1);


				var a = [1, 2, 3];
				expect(S.every(a, function(v) {return v>0})).toBeTruthy();
				expect(S.every(a, function(v) {return v<0})).toBeFalsy();

				counter = 0;
				S.forEach(arrayLikeObject, function() {
					counter += 1;
					return false;
				});
				expect(counter).toEqual(4);

				counter = 0;
				S.every(arrayLikeObject, function() {
					counter += 1;
					return false;
				});
				expect(counter).toEqual(1);


				expect(S.some(a, function(v) {return v>2})).toBeTruthy();
				expect(a.some(function(v) {return v>2})).toBeTruthy();
				expect(a.some(function(v) {return v>4})).toBeFalsy();

			});
		});

		describe("reduce reduceRight", function() {
			it("should implement ES'5 reduce reduceRight", function() {
				var prevs = [],
					nows = [];

				expect([1, 2, 3, 4].reduce(function(prev, now) {
					return prev + now;
				})).toEqual(10);

				expect(S.reduce([1, 2, 3, 4], function(prev, now) {
					return prev + now;
				})).toEqual(10);

				expect([1, 2, 3, 4].reduce(function(prev, now) {
					return prev + now;
				}, 3)).toEqual(13);

				expect(S.reduce([1, 2, 3, 4], function(prev, now) {
					return prev + now;
				}, 3)).toEqual(13);

				expect([1, 2, 3, 4].reduceRight(function(prev, now) {
					return prev + now;
				})).toEqual(10);

				expect(S.reduceRight([1, 2, 3, 4], function(prev, now) {
					return prev + now;
				})).toEqual(10);

				expect([1, 2, 3, 4].reduceRight(function(prev, now) {
					return prev + now;
				}, 3)).toEqual(13);

				expect(S.reduceRight([1, 2, 3, 4], function(prev, now) {
					return prev + now;
				}, 3)).toEqual(13);
			});
		});

		describe('map', function() {
			it("should map the array", function() {
				var a = [1, 2, 3];
				expect(S.map(a, function(v) {return v*2})).toEqual([2, 4, 6]);
				expect(a.map(function(v) {return v*2})).toEqual([2, 4, 6]);

				expect(S.map(arrayLikeObject, function(v) {
					return v;
				})).toEqual(["a", "b", "c", 3]);
			});
		});
		describe('filter', function() {
			it("should filter the array", function() {
				var array = [1, 2, 3, 4, 5];

				var r = S.filter(array, function(elem, index, arr) {
					expect(arr).toBe(array);
					return elem % 2 == 0;
				});
				expect(r).toEqual([2, 4]);

				var r = array.filter(function(elem, index, arr) {
					expect(arr).toBe(array);
					return elem % 2 == 0;
				});
				expect(r).toEqual([2, 4]);

				r = S.filter(arrayLikeObject, function(elem, index, arr) {
					return elem != "a";
				});
				expect(r).toEqual(["b", "c", 3]);
			});
		});

		describe('indexOf lastIndexOf', function() {
			it("should get the index of the param", function() {
				var array = [1, 2, 3, 4, 5];
				expect(S.indexOf(array, 1)).toBe(0);
				expect(S.lastIndexOf(array, 1)).toBe(0);
				expect(array.lastIndexOf(1)).toBe(0);

				var str = "abc";
				expect(str.indexOf("b")).toEqual(1);
				expect(S.indexOf(str, "b")).toEqual(1);
				expect(str.lastIndexOf("b")).toEqual(1);
				expect(S.lastIndexOf(str, "b")).toEqual(1);
			});
		});
	});

	describe("shim extend", function() {
		var object = {
			c: "789",
			a: "123",
			b: "456"
		};

		S.forEach(object, function(v, k, object) {
			expect(object[k]).toEqual(v);
		});

		var ret = S.map(object, function(v, k, object) {
			return v + "a";
		});
		expect(ret).toEqual({
			c: "789a",
			a: "123a",
			b: "456a"
		});

		ret = S.filter(object, function(v, k, object) {
			return v != "123";
		});
		expect(ret).toEqual({
			b: "456",
			c: "789"
		});

	});

	describe("mix", function() {
		it("should mix to S if no src", function() {
			expect(S.hello).not.toEqual(123);
			S.mix({
				hello: 123
			});
			expect(S.hello).toEqual(123);

			S.mix(S, {
				hello: 456
			}, ["hello"]);
			expect(S.hello).toEqual(123);

			S.mix(S, {
				hello: 456
			}, [], false);
			expect(S.hello).toEqual(123);

			var r = {
				a: {
					b: 123
				}
			};
			var s = {
				a: {
					b: 456
				}
			};
			S.mix(r, s, [], true, true);
			expect(r.a.b).toEqual(456);
		});
	});

	describe("isPending", function() {
		it("should adjust if a deferred is pending", function() {
			var deferred = $.Deferred();
			expect(S.isPending(deferred)).toBeTruthy();

			expect(S.isPending({})).toBeFalsy();
		});
	});

	describe('isNotEmptyString', function() {
		it("should be true if the param is string and is not empty", function() {
			expect(S.isNotEmptyString('abc')).toBeTruthy();
			expect(S.isNotEmptyString('')).toBeFalsy();

			expect(S.isNotEmptyString({})).toBeFalsy();
		});
	});

	describe("singleton", function() {
		it("should get only one instance", function() {
			var getInstance = S.singleton(function() {
				return {};
			});

			var counter = 0;
			var getNull = S.singleton(function() {
				counter += 1;
				return null;
			});
			getNull();
			getNull();
			expect(getInstance()).toBe(getInstance());
			expect(counter).toEqual(2);
		});
	});

	describe("ucfirst and lcfirst", function() {
		it("should uppercase a str's first letter", function() {
			expect(S.ucfirst("abc")).toEqual("Abc");
			expect(S.ucfirst("Abc")).toEqual("Abc");
		});
		it("should uppercase a str's first letter", function() {
			expect(S.lcfirst("abc")).toEqual("abc");
			expect(S.lcfirst("Abc")).toEqual("abc");
		});
	});

	describe("isUri", function() {
		it("should test a str is a uri", function() {
			expect(S.isUri("http://www.taobao.com")).toBeTruthy();
			expect(S.isUri("file:///E:/tbcdn/base/js/test/index.html")).toBeTruthy();
			expect(S.isUri("www.miiee.com")).toBeFalsy();
			expect(S.isUri("http://miiee.taobao.com/orders/confirm.htm?oid=165021")).toBeTruthy();
		});
	});

	describe("later", function() {
		it("should get execute a fn after some mils", function() {
			var globalName;
			var f = function(name) {
				globalName = name;
				expect(globalName).toEqual(name);
			};
			var r = S.later(f, 2000, false, window, ["alex"]);
			expect(globalName).toBeUndefined();
		});
	});

	describe("unique", function() {
		it("should unique an array", function() {
			expect(S.unique(["a", "b", "a", "b", "c", "c"])).toEqual(["a", "b", "c"]);
		});
	});

	describe("type", function() {
		it("should get the type of the argument", function() {
			expect(S.type("")).toEqual("string");
			expect(S.type(123)).toEqual("number");
			expect(S.type(function(){})).toEqual("function");
			expect(S.type([])).toEqual("array");
			expect(S.type({})).toEqual("object");
			expect(S.type(/abc/)).toEqual("regexp");
			expect(S.type(new Date())).toEqual("date");
			expect(S.type(true)).toEqual("boolean");
		});
	});

	describe("Class", function() {
		it("should get a fn to be it's prototype ", function() {
			var ClassA = new S.Class;

			expect(ClassA.fn).toBe(ClassA.prototype);
		});

		it("should get some built in method ", function() {
			var ClassA = new S.Class;

			expect("extend" in ClassA).toBeTruthy();
			expect("include" in ClassA).toBeTruthy();
			expect("proxy" in ClassA).toBeTruthy();
			expect("Implements" in ClassA).toBeTruthy();
		});

		it("should extend as Class prop", function() {
			var ClassA = new S.Class;
			ClassA.extend({
				age: 18
			});

			expect(ClassA.age).toEqual(18);
		});

		it("should include as instance prop", function() {
			var ClassA = new S.Class({
				talk: function(msg) {
					return 'talk:' + msg;
				}
			});

			var instance = new ClassA;
			expect(instance.talk('hello')).toBe('talk:hello');
		});

		it("should extend from a parent", function() {
			var ClassA = new S.Class;

			ClassA.include({
				talk: function(msg) {
					return 'talk:' + msg;
				},
				init: function() {
					S.log("A init");
				}
			});

			var ClassB = new S.Class(ClassA);
			ClassB.include({
				talk: function(msg) {
					return 'Btalk:' + msg;
				},
				init: function() {
					S.log("B init");
				}
			});

			var instanceB = new ClassB;
			var instanceA = new ClassA;
			expect(instanceB.talk('hello')).toBe('Btalk:hello');
			expect(instanceA.talk('hello')).toBe('talk:hello');

			expect(ClassB.superclass.talk('hello')).toBe('talk:hello');
		});

		xit("Inherit class (static) properties from parent.", function() {
			var ClassA = new S.Class;

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
			var ClassA = new S.Class;
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
			S.classify(o);
			expect("Implements" in o).toBeTruthy();

			o.Implements([S.Events, S.Aspect]);
			expect("before" in o).toBeTruthy();
			expect("after" in o).toBeTruthy();
			expect("on" in o).toBeTruthy();
			expect("off" in o).toBeTruthy();
			expect("trigger" in o).toBeTruthy();

			var F = function() {};
			S.classify(F);
			F.Implements(S.Events);
			o = new F();
			expect("on" in o).toBeTruthy();
			expect("off" in o).toBeTruthy();
			expect("trigger" in o).toBeTruthy();
		});
	});

	describe('isPlainObject', function() {
		it("should test if a object is a plain object", function() {
			expect(S.isPlainObject(S.global)).toBeFalsy();
			expect(S.isPlainObject({})).toBeTruthy();

			var f = function(){};
			var a = new f();
			expect(S.isPlainObject(a)).toBeFalsy();

			var head = document.head || document.getElementsByTagName('head')[0];
			expect(S.isPlainObject(head)).toBeFalsy();

			var o = new S.Base();
			expect(S.isPlainObject(o)).toBeFalsy();

			expect(S.isPlainObject("")).toBeFalsy();
		});
	});

	describe('inArray', function() {
		it("should be true if the param is in array", function() {
			var array = [1, 2, 3, 4, 5];
			expect(S.inArray(array, 1)).toBeTruthy();
			expect(S.inArray(array, 6)).toBeFalsy();
		});
	});



	describe('makeArray', function() {
		it("should make arguments to array", function() {
			var f = function() {
				return S.makeArray(arguments);
			}
			expect(f(1, 2, 3)).toEqual([1, 2, 3]);
			expect(S.makeArray(null)).toEqual([]);
		});
	});

	describe('curry', function() {
		it("should curry the arguments", function() {
			var add = function(a, b) {
				return a + b;
			};

			var curriedAdd = S.curry(add, 5);
			expect(curriedAdd(4)).toEqual(9);
		});
	});

	describe('deepCopy', function() {
		it("should make a deep copy", function() {
			var src = {
				names: ["alex", "john"],
				titles: {
					name: "abc",
					info: {
						title: "title"
					}
				}
			};
			expect(S.deepCopy(src)).toEqual(src);
			expect(S.deepCopy("abc")).toEqual("abc");
		});
	});

	describe('namespace', function() {
		it("should return the namepace object", function() {
			expect(S.namespace("test")).toBe(S.test);
		});
	});

	describe('startsWith, endsWith', function() {
		it("should get true if the string startsWith the prefix", function() {
			expect(S.startsWith("hello", 'hello')).toBeTruthy();
			expect(S.startsWith("hello", 'ahello')).toBeFalsy();
		});

		it("should get true if the string endsWith the suffix", function() {
			expect(S.endsWith("hello", 'hello')).toBeTruthy();
			expect(S.endsWith("hello", 'ahello')).toBeFalsy();
		});
	});

	describe('choice', function() {
		it("should get a number between m and n", function() {
			expect(S.choice(1, 5)).toBeBetween(1, 5);
		});

		it("should get a number in the array", function() {
			expect(S.choice([1, 2, 3])).toBeBetween(1, 4);
		});
	});

	describe('Query', function() {
		it("should get the info of a query str", function() {
			var str = "spm=a310i.2181413.5731757.9.Jmv67O&pcid=8101&banner=nvzhuang";
			var q = new S.Query(str);
			q.add("name", "zenxds");
			// S.log(q.toString());
		});
	});

	describe('unparam, param', function() {
		it("should get a object of the params", function() {
			expect(S.unparam("spm=a310i.2181409.5731777.1.eVI5Sh&name=1213")).toEqual({
				spm: "a310i.2181409.5731777.1.eVI5Sh",
				name: "1213"
			});
		});

		it("should param a object to params", function() {
			expect(S.param({
				spm: "a310i.2181409.5731777.1.eVI5Sh",
				name: "1213"
			})).toEqual("spm=a310i.2181409.5731777.1.eVI5Sh&name=1213");
		});
	});

	describe('parseUrl', function() {
		it("should get the info of a url", function() {
			var r = S.parseUrl("http://miiee.taobao.com/choice.htm?spm=a310i.2181413.5731757.9.Jmv67O&pcid=8101&banner=nvzhuang#page-5");
			expect(r.scheme).toEqual("http");
			expect(r.domain).toEqual("miiee.taobao.com");
		});
	});

	describe('getFragment', function() {
		it("should get the fragment of a url", function() {
			expect(S.getFragment("http://miiee.taobao.com/choice.htm?spm=a310i.2181413.5731757.9.Jmv67O&pcid=8101&banner=nvzhuang#page-5")).toEqual("page-5");
			expect(S.getFragment("")).toEqual("");
		});
	});
	describe("get/add/remove/set, QueryParam", function() {
		it("should get a object of the params with a url ", function() {
			var url = "http://miiee.taobao.com/themes/theme_118.htm?spm=a310i.2181409.5731777.1.eVI5Sh&name=1213#page-5";
			var target = {spm: "a310i.2181409.5731777.1.eVI5Sh", name: "1213"};

			expect( S.getQueryParam("", url) ).toEqual(target);
			expect( S.getQueryParam(url) ).toEqual(target);
			expect( S.getQueryParam("name", url) ).toEqual("1213");

			// expect( S.getQueryParam("") ).toEqual({});
			expect( S.getQueryParam("name") ).toEqual('');

			expect( S.getQueryParam("name", "abc") ).toEqual('');
			expect( S.getQueryParam("", "abc") ).toEqual({});

			expect( S.getQueryParam() ).toEqual(S.data("urlInfo").query);
		});

		it("should add params with a url ", function() {
			var url = "http://miiee.taobao.com/themes/theme_118.htm#page-5";
			var params = {spm: "a310i.2181409.5731777.1.eVI5Sh", name: "1213"};
			var target = "http://miiee.taobao.com/themes/theme_118.htm?spm=a310i.2181409.5731777.1.eVI5Sh&name=1213#page-5";
			expect(S.addQueryParam(params, url)).toEqual(target);
		});

		it("should remove params with a url ", function() {
			var url = "http://miiee.taobao.com/themes/theme_118.htm#page-5";
			var params = ["spm", "name"];
			var target = "http://miiee.taobao.com/themes/theme_118.htm?spm=a310i.2181409.5731777.1.eVI5Sh&name=1213#page-5";
			expect(S.removeQueryParam(params, target)).toEqual(url);
		});
	});

	describe('escape, unEscape', function() {
		it("should escape success", function() {
			expect(S.escapeHtml("<>")).toEqual("&lt;&gt;");
		});
		it("should unEscape success", function() {
			expect(S.unEscapeHtml("&lt;&gt;")).toEqual("<>");
		});
	});

	describe('sizeof', function() {
		it("should get the sizeof a str", function() {
			expect(S.sizeof("abc")).toEqual(3);
			expect(S.sizeof("a汉字c")).toEqual(6);
		});
	});
});
