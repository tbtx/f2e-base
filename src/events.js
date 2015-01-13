/**
 * events
 */
var events = S.events = {};

// Bind event
S.on = function(name, callback) {
    var list = events[name] || (events[name] = []);
    list.push(callback);
    return S;
};

S.one = function(name, callback) {
    var _callback = function() {
        S.off(name, _callback);
        callback.apply(S, arguments);
    };
    return S.on(name, _callback);
};

// Remove event. If `callback` is undefined, remove all callbacks for the
// event. If `event` and `callback` are both undefined, remove all callbacks
// for all events
S.off = function(name, callback) {
    // Remove *all* events
    if (!(name || callback)) {
        events = S.events = {};
        return S;
    }

    var list = events[name];
    if (list) {
        if (callback) {
            for (var i = list.length - 1; i >= 0; i--) {
                if (list[i] === callback) {
                    list.splice(i, 1);
                }
            }
        } else {
            delete events[name];
        }
    }

    return S;
};

// Emit event, firing all bound callbacks. Callbacks receive the same
// arguments as `emit` does, apart from the event name
var trigger = S.trigger = function(name) {
    var list = events[name],
        args = slice.call(arguments, 1);

    if (list) {
        // Copy callback lists to prevent modification
        list = list.slice();

        // Execute event callbacks, use index because it's the faster.
        for (var i = 0, len = list.length; i < len; i++) {
            list[i].apply(S, args);
        }
    }

    return S;
};
