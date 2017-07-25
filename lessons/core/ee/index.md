## ee

EventEmitter это один из основных концептов в ноде. Большинство остальных концептов, поставляющихся вместе с нодой, базируются на EventEmitter'е.

Сам по себе EventEmitter представляет собой объект, реализующий паттерн медиатор. Суть ee заключается в том, что он позволяет получать упралвение участкам кода при наступлении определенного события несколько раз.

Сам по себе ee достаточно простой, но в то же время очень мощный концепт. Базова реализация ee на коленке может занять 20 строк.

```javascript
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
```

Само использование ee выглядит примерно так:
```javascript
const e = new EventEmitter();

e.on('someevent', function () {
  // now we know that some event happened
});

/* Some other place in the code */

e.emit('someevent', { someValue: 3 });
```
