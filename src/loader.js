/**
 * loader module
 */

var isFunction = isType("Function"),
    noop = function() {},
    head = document.head || document.getElementsByTagName('head')[0],
    baseElement = head.getElementsByTagName("base")[0],
    IS_CSS_RE = /\.css(?:\?|$)/i,
    isOldWebKit = +navigator.userAgent
      .replace(/.*(?:AppleWebKit|AndroidWebKit)\/?(\d+).*/i, "$1") < 536;

function request(url, callback, charset) {
    callback = callback || noop;

    var isCSS = IS_CSS_RE.test(url),
        node = document.createElement(isCSS ? "link" : "script");

    if (charset) {
        var cs = isFunction(charset) ? charset(url) : charset;
        if (cs) {
            node.charset = cs;
        }
    }

    addOnload(node, callback, isCSS);

    if (isCSS) {
        node.rel = "stylesheet";
        node.href = url;
    }
    else {
        node.async = true;
        node.src = url;
    }

    // ref: #185 & http://dev.jquery.com/ticket/2709
    if (baseElement) {
        head.insertBefore(node, baseElement);
    } else {
        head.appendChild(node);
    }
}

function addOnload(node, callback, isCSS) {
    // 不支持 onload事件
    var supportOnload = "onload" in node;
    // for Old WebKit and Old Firefox
    if (isCSS && (isOldWebKit || !supportOnload)) {
        setTimeout(function() {
          pollCss(node, callback);
        }, 1); // Begin after node insertion
        return;
    }

    var onload = function() {
        // Ensure only run once and handle memory leak in IE
        node.onload = node.onerror = node.onreadystatechange = null;

        if(!isCSS) {
            head.removeChild(node);
        }

        // Dereference the node
        node = null;
        callback();
    };

    if (supportOnload) {
        node.onload = node.onerror = onload;
    } else {
        node.onreadystatechange = function() {
            if (/loaded|complete/.test(node.readyState)) {
                onload();
            }
        };
    }
}

function pollCss(node, callback) {
    var sheet = node.sheet,
        isLoaded;

    // for WebKit < 536
    if (isOldWebKit) {
        if (sheet) {
            isLoaded = true;
        }
    }
    // for Firefox < 9.0
    else if (sheet) {
        try {
            if (sheet.cssRules) {
                isLoaded = true;
            }
        } catch (ex) {
        // The value of `ex.name` is changed from "NS_ERROR_DOM_SECURITY_ERR"
        // to "SecurityError" since Firefox 13.0. But Firefox is less than 9.0
        // in here, So it is ok to just rely on "NS_ERROR_DOM_SECURITY_ERR"
            if (ex.name === "NS_ERROR_DOM_SECURITY_ERR") {
                isLoaded = true;
            }
        }
    }

    setTimeout(function() {
        if (isLoaded) {
            // Place callback here to give time for style rendering
            callback();
        } else {
            pollCss(node, callback);
        }
    }, 20);
}

function getCurrentScript() {
    if (document.currentScript) {
        return document.currentScript;
    }

    // For IE6-9 browsers, the script onload event may not fire right
    // after the script is evaluated. Kris Zyp found that it
    // could query the script nodes and the one that is in "interactive"
    // mode indicates the current script
    // ref: http://goo.gl/JHfFW

    var scripts = document.scripts,
        script,
        length = scripts.length,
        i = length - 1;

    for (; i >= 0; i--) {
        script = scripts[i];
        if (script.readyState === "interactive") {
            return script;
        }
    }

    return scripts[length - 1];
}

function getScriptAbsoluteSrc(node) {
    return node.hasAttribute ? // non-IE6/7
        node.src :
        // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute("src", 4);
}

var currentScript = getCurrentScript(),
    rstaticUrl = /^.+?\/tbtx\//,
    match = rstaticUrl.exec(getScriptAbsoluteSrc(currentScript));

module.exports = {
    staticUrl: match && match[0],

    getCurrentScript: getCurrentScript,
    request: request,
    loadCss: request,
    loadScript: request
};

function isType(type) {
    return function(obj) {
        return {}.toString.call(obj) == "[object " + type + "]";
    }
}