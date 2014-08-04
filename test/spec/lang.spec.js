describe('lang', function() {
    var S = tbtx;

    var arrayLikeObject = {
            0: "a",
            1: "b",
            2: "c",
            length: 3
        },
        object = {
            a: "av",
            b: "bv",
            c: "cv",
            d: "dv"
        };

    describe("shim", function() {
        describe('keys', function() {
            it("should get the keys of the object", function() {
                expect(Object.keys).toBe(S.keys);

                expect(Object.keys({
                    "name1": "value1",
                    "name2": "value2"
                })).toEqual(["name1", "name2"]);

                expect(Object.keys({
                    toString: 123
                })).toEqual(["toString"]);
            });
        });

        describe('bind', function() {
            it("should bind the function to a context", function() {
                var context = {
                    name: "value"
                };
                var f = function() {
                    return this.name;
                };

                var binded = S.bind(f, context);
                expect(binded()).toEqual("value");

                binded = f.bind(context);
                expect(binded()).toEqual("value");

                // 已经bind过的无法再bind
                binded = binded.bind({
                    name: "value2"
                });
                expect(binded()).toEqual("value");
            });
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
                expect(S.Now).toBe(Date.now);
                expect(S.Now()).toEqual(jasmine.any(Number));
            });

            it("should get a number with length 13", function() {
                expect(String(S.Now()).length).toEqual(13);
            });
        });

        describe("forEach", function() {
            it("should implement ES'5 forEach", function() {
                var array = [1, 2, 3, 4],
                    counter = 0;

                array.forEach(function() {
                    counter++;
                });

                expect(counter).toEqual(4);

                counter = 0;
                S.forEach(array, function() {
                    counter++;

                    // not work
                    return false;
                });
                expect(counter).toEqual(4);

                counter = 0;
                S.forEach(arrayLikeObject, function() {
                    counter++;
                });
                expect(counter).toEqual(3);

                counter = 0;
                var ret = "";
                S.forEach(object, function(v, k) {
                    counter++;
                    ret += k;
                });
                expect(counter).toEqual(4);
                expect(ret).toEqual("abcd");
            });
        });

        describe("every", function() {
            it("should implement ES'5 every", function() {
                var array = [1, 2, 3, 4],
                    counter = 0;

                // every必须return一个值
                array.every(function() {
                    counter++;
                    return true;
                });
                expect(counter).toEqual(4);

                counter = 0;
                array.every(function() {
                    counter++;
                    return false;
                });
                expect(counter).toEqual(1);

                counter = 0;
                S.every(array, function() {
                    counter++;
                    return false;
                });
                expect(counter).toEqual(1);

                expect(S.every(array, function(v) {
                    return v>0;
                })).toBeTruthy();
                expect(S.every(array, function(v) {
                    return v<0;
                })).toBeFalsy();

                counter = 0;
                S.every(arrayLikeObject, function() {
                    counter++;
                    return true;
                });
                expect(counter).toEqual(3);

                counter = 0;
                var ret = "";
                S.every(object, function(v, k) {
                    counter++;
                    ret += k;
                    return true;
                });
                expect(counter).toEqual(4);
                expect(ret).toEqual("abcd");
            });
        });

        describe('some', function() {
            it("should implement ES'5 some", function() {
                var counter = 0,
                    array = [1, 2, 3, 4];


                expect(S.some(array, function(v) {
                    return v>2;
                })).toBeTruthy();
                expect(array.some(function(v) {
                    return v>2;
                })).toBeTruthy();
                expect(array.some(function(v) {
                    return v>4;
                })).toBeFalsy();

                expect(S.some(arrayLikeObject, function(v, k) {
                    return k >= 2;
                })).toBeTruthy();

                expect(S.some(object, function(v, k) {
                    return k == "b";
                })).toBeTruthy();

            });
        });

        describe('map', function() {
            it("should map the array", function() {
                var a = [1, 2, 3];
                expect(S.map(a, function(v) {return v*2})).toEqual([2, 4, 6]);
                expect(a.map(function(v) {return v*2})).toEqual([2, 4, 6]);

                expect(S.map(arrayLikeObject, function(v) {
                    return v + "a";
                })).toEqual(['aa', 'ba', 'ca']);

                expect(S.map(object, function(v) {
                    return v + "a";
                })).toEqual({
                    a: 'ava',
                    b: 'bva',
                    c: 'cva',
                    d: 'dva'
                });
            });
        });
        describe('filter', function() {
            it("should filter the array", function() {
                var array = [1, 2, 3, 4, 5],
                    result;

                result = S.filter(array, function(elem, index, arr) {
                    expect(arr).toBe(array);
                    return elem % 2 === 0;
                });
                expect(result).toEqual([2, 4]);

                result = array.filter(function(elem, index, arr) {
                    expect(arr).toBe(array);
                    return elem % 2 === 1;
                });
                expect(result).toEqual([1, 3, 5]);

                result = S.filter(arrayLikeObject, function(item, index, arr) {
                    return item != "a";
                });
                expect(result).toEqual(["b", "c"]);

                result = S.filter(object, function(v, k) {
                    return v === "av";
                });
                expect(result).toEqual({
                    a: "av"
                });

                result = S.filter(object, function(v, k) {
                    return v === "abcd";
                });
                expect(result).toEqual({});
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

                expect(S.reduce(arrayLikeObject, function(prev, now) {
                    return prev + now;
                })).toEqual("abc");
            });
        });

        describe('indexOf lastIndexOf', function() {
            it("should get the index of the param", function() {
                var array = [1, 2, 3, 4, 5];
                expect(S.indexOf(array, 1)).toBe(0);
                expect(S.lastIndexOf(array, 1)).toBe(0);
                expect(array.lastIndexOf(1)).toBe(0);
            });
        });

        describe('isArray', function() {
            expect(Array.isArray).toBe(S.isArray);

            expect(S.isArray([])).toBeTruthy();
            expect(S.isArray([])).toBeTruthy();
            expect(S.isArray({})).toBeFalsy();
        });
    });

    describe("each", function() {
        var array = [1, 2, 3, 4],
            counter = 0;

        S.each(array, function() {
            counter++;
        });

        expect(counter).toEqual(4);

        counter = 0;
        S.each(array, function() {
            counter++;
            return false;
        });
        expect(counter).toEqual(1);

        var map = [];
        S.each(object, function(v, k) {
            map.push(v);
        });

        expect(map.indexOf("av") > -1).toBeTruthy();
    });

    describe("isWindow", function() {
        it("should tell if the object is window", function() {
            expect(S.isWindow(window)).toBeTruthy();
            expect(S.isWindow({})).toBeFalsy();
            expect(S.isWindow(document.documentElement)).toBeFalsy();
        });
    });

    xdescribe("isEmptyObject", function() {
        it("should tell if the object is empty", function() {
            expect(S.isEmptyObject({})).toBeTruthy();
            expect(S.isEmptyObject({
                a: 123
            })).toBeFalsy();
        });
    });

    xdescribe("isEmptyValue", function() {
        it("should tell if the valye is empty", function() {
            expect(S.isEmptyValue({})).toBeTruthy();
            expect(S.isEmptyValue([])).toBeTruthy();
            expect(S.isEmptyValue("")).toBeTruthy();
            expect(S.isEmptyValue(null)).toBeTruthy();
            expect(S.isEmptyValue()).toBeTruthy();

            expect(S.isEmptyValue("abc")).toBeFalsy();
            expect(S.isEmptyValue({
                a: 1
            })).toBeFalsy();
            expect(S.isEmptyValue([1, 2])).toBeFalsy();

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

    describe("ucfirst", function() {
        it("should ucpercase the first letter", function() {
            expect(S.ucfirst("abc")).toEqual("Abc");
        });
    });

    describe("extend", function() {
        it("should implement the jquery extend", function() {
            expect(S.extend({}, {a: 1}, {b: 2})).toEqual({
                a: 1,
                b: 2
            });

            expect(S.extend({}, {a: {
                b: 1
            }}, {a: {
                c: 2
            }})).toEqual({
                a: {
                    c: 2
                }
            });

            expect(S.extend(true, {}, {a: {
                b: 1
            }}, {a: {
                c: 2
            }})).toEqual({
                a: {
                    b: 1,
                    c: 2
                }
            });
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

    describe('namespace', function() {
        it("should return the namepace object", function() {
            expect(S.namespace("test")).toBe(S.test);
        });
    });

    describe("erase", function() {
        it("should erase an item from an array", function() {
            expect(S.erase("a", ["b", "a", "c"])).toEqual(["b", "c"]);
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

    describe('escape, unEscape', function() {
        it("should escape success", function() {
            expect(S.escapeHtml("<>")).toEqual("&lt;&gt;");
        });
        it("should unEscape success", function() {
            expect(S.unEscapeHtml("&lt;&gt;")).toEqual("<>");
        });
    });

    describe("strip", function() {
        it("should strip the tags from a str", function() {
            expect(S.stripTags('a<p>123</p>b')).toEqual("a123b");
        });

        it("should strip the scripts from a str", function() {
            expect(S.stripTags('a<script src="a.js"></script>b')).toEqual("ab");

            expect(S.stripScripts('a<script>var a = 123;</script>b')).toEqual("ab");

            expect(S.stripScripts('a<script type="text/template">var a = 123;</script>b')).toEqual("ab");

            expect(S.stripScripts('a<script type="text/template">var a = 123;</script>b', "style")).toEqual('a<script type="text/template">var a = 123;</script>b');

            expect(S.stripScripts('a<style type="text/css">var a = 123;</style>b', "style")).toEqual('ab');

            expect(S.stripScripts('a<style type="text/css">var a = 123;</style>b<script>var a = 123;</script>c', ["style", "script"])).toEqual('abc');
        });
    });

    describe("truncate", function() {
        it("should truncate a string", function() {
            expect(S.truncate("abcdefghi", 8)).toEqual("abcde...");
            expect(S.truncate("abcdefghi", 8, "xxx")).toEqual("abcdexxx");
        });
    });
});
