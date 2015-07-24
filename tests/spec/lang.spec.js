describe('lang', function() {
    describe("noop", function() {
        it("should have a noop method", function() {
            expect(S.noop).to.exist;
        });
    });

    describe("each", function() {
        var array = [1, 2, 3, 4];

        it("should each an array", function() {
            var counter = 0;
            S.each(array, function() {
                counter++;
            });
            expect(counter).to.equal(4);
        });

        it("should break the each if the function return false", function() {
            var counter = 0;
            S.each(array, function() {
                counter++;
                return false;
            });
            expect(counter).to.equal(1);
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

            expect(map.indexOf("a") > -1).to.be.true;
            expect(map.indexOf("b") > -1).to.be.true;
            expect(map.indexOf("c") > -1).to.be.true;
            expect(map.indexOf("d") > -1).to.be.true;
        });

        it("should each with a context", function() {
            var context = {
                name: "context"
            };
            S.each(array, function(v, k) {
                expect(this.name).to.equal("context");
            }, context);
        });
    });

    describe("isWindow", function() {
        it("should tell if the object is window", function() {
            expect(S.isWindow(window)).to.be.true;
            expect(S.isWindow({})).to.be.false;
            expect(S.isWindow(document.documentElement)).to.be.false;
        });
    });

    describe("memoize", function() {
        it("should memoize the result of the function", function() {
            var f = S.memoize(function(val) {
                return {
                    val: val
                };
            });
            expect(f(1)).to.equal(f(1));
            expect(f(2)).to.equal(f(2));
            expect(f({})).to.equal(f({}));
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
            expect(getInstance()).to.equal(getInstance());
            expect(counter).to.equal(2);
        });
    });

    describe("substitute", function() {
        it("should replace the str with the data", function() {
            var o = {
                name: "alex",
                age: 18
            };
            var t = "<a {{name}} {{age}}>";
            expect(S.substitute(t, o)).to.equal("<a alex 18>");
        });

        it("should reverse the {{}} if the reverse param is true", function() {
            expect(S.substitute("{{ name }}", {}, true)).to.equal("{{ name }}");
        });
    });

    describe("later", function() {
        it("should get execute a fn after some mils", function() {
            var globalName;
            var f = function(name) {
                globalName = name;
                expect(globalName).to.equal(name);
            };
            var r = S.later(f, 2000, false, window, ["alex"]);
            expect(globalName).to.be.an("undefined");
        });
    });

    describe("ucfirst", function() {
        it("should ucpercase the first letter", function() {
            expect(S.ucfirst("abc")).to.equal("Abc");
        });
    });

    describe("extend", function() {
        it("should implement the jquery extend", function() {
            expect(S.extend({}, {a: 1}, {b: 2})).to.eql({
                a: 1,
                b: 2
            });

            expect(S.extend({}, {a: {
                b: 1
            }}, {a: {
                c: 2
            }})).to.eql({
                a: {
                    c: 2
                }
            });

            expect(S.extend(true, {}, {a: {
                b: 1
            }}, {a: {
                c: 2
            }})).to.eql({
                a: {
                    b: 1,
                    c: 2
                }
            });
        });
    });

    describe("type", function() {
        it("should get the type of the argument", function() {
            expect(S.type("")).to.equal("string");
            expect(S.type(123)).to.equal("number");
            expect(S.type(function(){})).to.equal("function");
            expect(S.type([])).to.equal("array");
            expect(S.type({})).to.equal("object");
            expect(S.type(/abc/)).to.equal("regexp");
            expect(S.type(new Date())).to.equal("date");
            expect(S.type(true)).to.equal("boolean");
        });
    });

    describe('isPlainObject', function() {
        it("should test if a object is a plain object", function() {
            expect(S.isPlainObject({})).to.be.true;

            var f = function(){};
            var a = new f();
            expect(S.isPlainObject(a)).to.be.false;

            var head = document.head || document.getElementsByTagName('head')[0];
            expect(S.isPlainObject(head)).to.be.false;
        });
    });

    describe("isEqual", function() {
        it("should test if two variable isEqual", function() {
            expect(S.isEqual(1, 1)).to.be.true;
            expect(S.isEqual(1, 2)).to.be.false;
            expect(S.isEqual(null, undefined)).to.be.false;
            expect(S.isEqual(null, null)).to.be.true;
            expect(S.isEqual(undefined, undefined)).to.be.true;

            expect(S.isEqual("a", "b")).to.be.false;
            expect(S.isEqual("b", "b")).to.be.true;
            expect(S.isEqual("a", new String("a"))).to.be.true;

            expect(S.isEqual(true, true)).to.be.true;
            expect(S.isEqual(true, false)).to.be.false;

            var t = new Date();
            expect(S.isEqual(t, t)).to.be.true;

            expect(S.isEqual([1, 2, 3], [3, 2, 1])).to.be.false;
            expect(S.isEqual([1, 2, 3], [1, 2, 3])).to.be.true;
            expect(S.isEqual([1, 2, 3, 4], [1, 2, 3])).to.be.false;

            expect(S.isEqual({a: 1, b: 2}, {a: 1, b: 2})).to.be.true;
            expect(S.isEqual({a: 1, b: 2}, {a: 2, b: 1})).to.be.false;
            expect(S.isEqual({b: 2, a: 1}, {a: 1, b: 2})).to.be.true;
        });
    });

    describe('makeArray', function() {
        it("should make arguments to array", function() {
            var f = function() {
                return S.makeArray(arguments);
            };
            expect(f(1, 2, 3)).to.eql([1, 2, 3]);
            expect(S.makeArray(null)).to.eql([]);
            expect(S.makeArray([1, 2, 3])).to.eql([1, 2, 3]);
        });
    });

    describe("uniqueCid", function() {
        it("should get an unique cid", function() {
            expect(S.uniqueCid()).to.be.a("number");
            expect(S.uniqueCid()).to.not.equal(S.uniqueCid());
        });
    });

    describe('escape, unEscape', function() {
        it("should escape a string", function() {
            expect(S.escapeHtml("<>")).to.equal("&lt;&gt;");
        });
        it("should unEscape s string", function() {
            expect(S.unEscapeHtml("&lt;&gt;")).to.equal("<>");
        });
    });

    describe("truncate", function() {
        it("should truncate a string", function() {
            expect(S.truncate("abcdefghi", 8)).to.equal("abcde...");
            expect(S.truncate("abcdefghi", 8, "xxx")).to.equal("abcdexxx");
        });
    });

    describe("dasherize/camelize", function() {

        it("should dasherize the string", function() {
            expect(tbtx.dasherize("GoodLike")).to.equal("good-like");

            expect(tbtx.dasherize("good_like")).to.equal("good-like");
            expect(tbtx.dasherize("good-like")).to.equal("good-like");
        });

        it("should camelize the string", function() {
            expect(tbtx.camelize("GoodLike")).to.equal("GoodLike");
            expect(tbtx.camelize("good_like")).to.equal("goodLike");
            expect(tbtx.camelize("good-like")).to.equal("goodLike");
        });
    });

    describe("random", function() {
        it("should get a random result from an array", function() {
            var array = [1, 2, 3, 4];
            expect(array.indexOf(tbtx.random(array)) > -1).to.be.true;
        });
    });
});
