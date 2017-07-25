## immediate

Помимо `setTimeout` и `setInterval` в ноде есть `setImmediate`, которая работает как `setTimeout(f, 0)`, но чуть быстрее (`setTimeout` ждёт ближайший тик таймера, это может занять несколько мс).

Если запустить код ниже несколько раз, можно заметить что колбэки выполняются в рандомном порядке.
```javascript
  setImmediate(function () {
    console.log('immediate');
  });

  setTimeout(function () {
    console.log('timeout');
  }, 0);
```
