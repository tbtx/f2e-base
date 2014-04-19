describe('lang', function() {
    var S = tbtx;

    var arrayLikeObject = {
        1: "a",
        2: "b",
        3: "c"
    };

    describe("shim", function() {
        describe('keys', function() {
            it("should get the keys of the object", function() {
                var o = {
                    "name1": "value1",
                    "name2": "value2"
                };
                var expectResult = ["name1", "name2"];
                expect( Object.keys(o) ).toEqual(expectResult);

                o = {
                    toString: 123
                };
                expect(S.keys(o) ).toEqual(["toString"]);
            });
        });

        describe('bind', function() {
            it("should bind the function to a context", function() {
                var o = {
                    name: "value"
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
                expect(counter).toEqual(3);

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
                })).toEqual({ 1 : 'a', 2 : 'b', 3 : 'c' });
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
                expect(r).toEqual({ 2 : 'b', 3 : 'c' });
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

        describe('isArray', function() {
            expect(Array.isArray([])).toBeTruthy();
            expect(S.isArray([])).toBeTruthy();
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

    describe("object array", function() {
        var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];

        describe("pluck", function() {
            it("should map the property of an object array", function() {
                var ret = S.pluck(stooges, 'name');
                expect(ret).toEqual(["moe", "larry", "curly"]);

                // ret = S.pluck(stooges, 'name.0');
                // expect(ret).toEqual(["m", "l", "c"]);
            });
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

    describe("substitute", function() {
        it("should replace the str with the data", function() {
            var o = {
                name: "alex",
                age: 18
            };
            var t = "<a {{name}} {{age}}>";
            expect(S.substitute(t, o)).toEqual("<a alex 18>");
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

    describe('isPlainObject', function() {
        it("should test if a object is a plain object", function() {
            expect(S.isPlainObject(S.global)).toBeFalsy();
            expect(S.isPlainObject({})).toBeTruthy();

            var f = function(){};
            var a = new f();
            expect(S.isPlainObject(a)).toBeFalsy();

            var head = document.head || document.getElementsByTagName('head')[0];
            expect(S.isPlainObject(head)).toBeFalsy();

            // var o = new S.Base();
            // expect(S.isPlainObject(o)).toBeFalsy();

            // expect(S.isPlainObject("")).toBeFalsy();
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

    describe('escape, unEscape', function() {
        it("should escape success", function() {
            expect(S.escapeHtml("<>")).toEqual("&lt;&gt;");
        });
        it("should unEscape success", function() {
            expect(S.unEscapeHtml("&lt;&gt;")).toEqual("<>");
        });
    });
});
