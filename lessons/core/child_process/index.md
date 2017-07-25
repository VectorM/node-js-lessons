## child_process

Это несложный модуль, вы будете использовать его очень редко, но всё же знать его не помешает.

Основная идея - позволить вам запускать процессы из ноды. Для этого у вас есть 4 функции `spawn`, `exec`, `fork` и `execFile`.

`execFile` запускает команду с параметрами и вызывает переданный ему колбэк, передавая в него ВЕСЬ вывод команды на stdout и stderr
```javascript
execFile('node', ['--version'], function (err, stdout, stderr) {
  //
})
```
Соотвественно у вас нет возможности что-то дописать на stdin процессу

`spawn` запускает процесс и возвращает объект со стримами stdin, stdout, stderr, так что вы можете стримить в него и из него данные
```javascript
const proc = spawn('sometransformation', []);
fs.createReadStream('somefile').pipe(proc.stdin);

proc.stdout.pipe(fs.createWriteStream('files'));
```

`exec` создаёт shell и выполняет команду в оболочке, так что вы можете использовать циклы, пайпы в команде и т.д. Как и `execFile` вызывает колбэк передавая ему ВЕСЬ вывод команды

`fork` это `spawn` создающий шину между вашим процессом и дочерним. Основная идея в том что fork может запускать только js файлы и вы можете с ними общаться
```javascript
//parent.js
const cp = require('child_process');
const n = cp.fork(`${__dirname}/sub.js`);
n.on('message', (m) => {
  console.log('PARENT got message:', m);
});
n.send({ hello: 'world' });

//sub.js
process.on('message', (m) => {
  console.log('CHILD got message:', m);
});
process.send({ foo: 'bar' });
```
