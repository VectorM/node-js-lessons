const EE = function () {
  let listeners = {};

  this.on = function (event, listener) {
    listeners[event] = (listeners[event] || []).concat([listener]);
  };

  this.emit = function (event, data) {
    (listeners[event] || []).forEach(function (v) {
      v(data);
    });
  };
};
