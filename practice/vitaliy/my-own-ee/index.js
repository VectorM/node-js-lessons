const EE = function () {
  let listeners = {};

  this.on = function (event, listener) {
    listeners[event] = (listeners[event] || []).concat([listener]);
    const index = listeners[event].length - 1;
    return function () { listeners[event].splice(index, 1); };
  };

  this.once= function (event, listener) {
    const removeMe = this.on(event, listener);
    this.on(event, function () { removeMe() })
  }

  this.emit = function (event, data) {
    (listeners[event] || []).forEach(function (v) {
      v(data);
    });
  };
};


