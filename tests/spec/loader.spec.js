describe("loader", function() {
    var S = tbtx,
        window = S.global,
        Loader = S.Loader,
        Module = S.Module;

    Loader.config({
        alias: {
            jquery: "http://static.tianxia.taobao.com/tbtx/base/2.0/js/gallery/jquery/1.11.0/jquery.min.js",
            handlebars: "http://static.tianxia.taobao.com/tbtx/base/2.0/js/gallery/handlebars/1.3.0/handlebars.js"
        }
    });

    describe("realpath", function() {
        it("should realpath", function() {
            expect(S.realpath("http://miiee.taobao.com/./path/../")).toEqual("http://miiee.taobao.com/");
        });
    });

    describe("Module.resolve", function() {
        it("should resolve an id to url", function() {
            Loader.config({
                alias: {
                    resolve: "http://a.b.com/path/resolve.js"
                }
            });

            expect(Module.resolve("resolve")).toContain("http://a.b.com/path/resolve.js");
        });
    });

    describe("define", function() {
        it("should define a mod", function() {
            var name, factory;

            name = "mod.define";
            factory = function() {
                return {
                    name: "define"
                };
            };

            define(name, factory);

            var mod = Loader.cache[Loader.resolve(name)];
            expect(mod.status).toEqual(2);
            expect(mod.factory).toEqual(factory);
            expect(mod.id).toEqual(name);
        });
    });

    describe("register", function() {
        var ready;
        it("should register the mod if the mod is in env", function() {
            runs(function() {
                ready = false;

                S.require(["json"], function() {
                    ready = true;
                });
            });

            waitsFor(function() {
                return ready;
            }, "the json2 should be load if there is no JSON", 20000);

            runs(function() {
                var o = {
                    a: "a",
                    b: "b"
                };
                var expectResult = '{"a":"a","b":"b"}';
                expect(JSON.stringify(o)).toEqual(expectResult);
                expect(JSON.parse(expectResult)).toEqual(o);
            });

        });
    });

    describe('require', function() {
        var ready;
        it("should require the scripts", function() {

            runs(function() {
                ready = false;

                S.require(["jquery", "handlebars"], function() {
                    ready = true;
                });
            });

            waitsFor(function() {
                return ready;
            }, "the jquery should be load", 20000);

            runs(function() {
                expect(window.jQuery).not.toBeUndefined();
                expect(window.Handlebars).not.toBeUndefined();

                var mod = Loader.cache[Loader.resolve("jquery")];
                expect(mod.status).toEqual(6);

                var $ = mod.exports;
                expect($.fn.init).not.toBeNull();
                expect($).toEqual(window.jQuery);
            });

        });
    });

    describe("order", function() {
        it("should have a right order", function() {
            var msgs = [];

            define("mod1", function() {
                msgs.push('require module: mod1');

                return {
                    hello: function() {
                        msgs.push("hello mod1");
                    }
                };
            });

            define("mod2", ["mod1"], function() {
                msgs.push('require module: mod2');

                return {
                    hello: function() {
                        msgs.push("hello mod2");
                    }
                };
            });

            define("main", ["mod1", "mod2"], function(mod1, mod2) {
                msgs.push('require module: mian');

                mod1.hello();
                mod2.hello();

                return {
                    hello: function() {
                        msgs.push("hello main");
                    }
                };
            });

            require("main", function(main) {
                main.hello();

                expect(msgs).toEqual(["require module: mod1", "require module: mod2", "require module: mian", "hello mod1", "hello mod2", "hello main"]);
            });
        });
    });

    xdescribe("loadScript", function() {
        var ready;
        it("should load a script", function() {
            // var length = document.scripts.length;

            expect(window.jQuery).toBeUndefined();

            runs(function() {
                loadScript("http://cdn.staticfile.org/jquery/1.11.1/jquery.min.js", function() {
                    ready = true;
                });
            });

            waitsFor(function() {
                return ready;
            }, "jQuery should be loaded", 20000);

            runs(function() {
                // expect(document.scripts.length - length).toEqual(1);

                expect(window.jQuery).not.toBeUndefined();
                expect(window.jQuery.fn.init).not.toBeUndefined();
            });
        });

    });

    function loadScript(url, callback) {
        var script = document.createElement("script");
        var head = document.head || document.getElementsByTagName("head")[0];
        if (script.readyState) { //IE
            script.onreadystatechange = function() {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                    head.removeChild(script);
                }
            };
        } else { //Others
            script.onload = function() {
                callback();
                // head.removeChild(script);
            };
        }
        script.src = url;
        head.appendChild(script);
    }
});