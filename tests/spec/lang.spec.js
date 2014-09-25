describe('lang', function() {
    var S = tbtx;

    describe("each", function() {
        var array = [1, 2, 3, 4];

        it("should each an array", function() {
            var counter = 0;
            S.each(array, function() {
                counter++;
            });
            expect(counter).toEqual(4);
        });

        it("should break the each if the function return false", function() {
            var counter = 0;
            S.each(array, function() {
                counter++;
                return false;
            });
            expect(counter).toEqual(1);
        });

        it("should each an object", function() {
            var map = [];
            var object = {
                a: "a",
                b: "b",
                c: "c",
                d: "d"
            };
            S.each(object, function(v, k) {
                map.push(v);
            });

            expect(map.indexOf("a") > -1).toBeTruthy();
            expect(map.indexOf("b") > -1).toBeTruthy();
            expect(map.indexOf("c") > -1).toBeTruthy();
            expect(map.indexOf("d") > -1).toBeTruthy();
        });

        it("should each with a context", function() {
            var context = {
                name: "context"
            };
            var name;
            S.each(array, function(v, k) {
                name = this.name;
                return false;
            }, context);

            expect(name).toEqual("context");
        });
    });

    describe("isWindow", function() {
        it("should tell if the object is window", function() {
            expect(S.isWindow(window)).toBeTruthy();
            expect(S.isWindow({})).toBeFalsy();
            expect(S.isWindow(document.documentElement)).toBeFalsy();
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


    describe('makeArray', function() {
        it("should make arguments to array", function() {
            var f = function() {
                return S.makeArray(arguments);
            };
            expect(f(1, 2, 3)).toEqual([1, 2, 3]);
            expect(S.makeArray(null)).toEqual([]);
        });
    });

    describe('startsWith, endsWith', function() {
        it("should get true if the string startsWith the prefix", function() {
            expect("hello".startsWith('hello')).toBeTruthy();
            expect("hello".startsWith('ahello')).toBeFalsy();
        });

        it("should get true if the string endsWith the suffix", function() {
            expect("hello".endsWith('hello')).toBeTruthy();
            expect("hello".endsWith('ahello')).toBeFalsy();
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

    describe("truncate", function() {
        it("should truncate a string", function() {
            expect(S.truncate("abcdefghi", 8)).toEqual("abcde...");
            expect(S.truncate("abcdefghi", 8, "xxx")).toEqual("abcdexxx");
        });
    });
});
