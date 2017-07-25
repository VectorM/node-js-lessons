## stream

#### Основная идея

Стрим или Поток это концепт ноды, позволяющий работать с большими объёмами данных порционно (чанками).
Основная идея потока - обрабатывающая/считывающая/записывающая функция, работающая с чанками данных.
Например, особенно большой файл размером более объёма оперативной памяти у вас не получится считать разом с readFile, для его считывания и обработки вы можете использовать поток, т.к. он работает с чанками, которые, в большинстве случаев, меньше объёма оперативной памяти.

Стримы также используются под капотом огромного количества библиотек в ноде. Например, `req` и `res` в `express` реализуют интерфейс stream и с ними можно работать как с потоками:
```javascript
app.get('/somefile', function (req, res) {
  fs.createReadStream('somebigfile').pipe(res);
});
```

#### Типы

Обычно потоки делят на три типа: Readable, Writable и Duplex.
У Duplex потоков условно есть "вход", "выход" и некоторая функция посередине, обрабатывающая чанки со входа и передающая на выход.

У Readable потоков как бы нет "входа", но есть функция-источник, которая генерирует чанки и "выход".

У Writable потоков как бы нет "выхода", но есть функция-приёмник, которая принимает чанки и что-то с ними делает.

Создать Readable поток можно, например из файла
```javascript
const readableStream = fs.createReadStream('filename');
```
теперь всё что в этом файле попадёт на выход readableStream

или из req в express (req уже является readable стримом)
```javascript
app.get('/somefile', function (req, res) {
  // req - readable stream
});
```

Создать Writeable поток можно, обозначить как бы "цель" его создания, например:
```javascript
const writeableStream = fs.createWriteStream('filename');
```
теперь всё что будет записано на вход этого стрима будет попадать в файл filename

или res в express это тоже Writable поток. Всё что попадает на его вход идёт к клиенту.

Также примерами потоков являются process.stdin и process.stdout (и stderr)

#### Pipe

Readable потоки можно перенаправлять (пайпить в Writeable или в Duplex потоки), например
```javascript
fs.createReadStream('somefile').pipe(fs.createWriteStream('somefile2'));
```
скопирует файл по чанкам somefile -> somefile2

или
```javascript
app.get('/somefile', function (req, res) {
  fs.createReadStream('somebigfile').pipe(res);
});
```
отдаст клиенту файл somebigfile не нагружая при этом оперативную память

#### Создание потоков на коленке
*запомните эту секцию, эта инфа в инете труднодостижима*

Вы всегда можете создать поток из ничего путём нехитрых манипуляций:
```javascript
const Readable = require('stream').Readable;

const someReadableStream = new Readable({
  /* Функция-генератор */
  read: function () {
    this.push('some chunk'); // процесс создания чанка
  }
});

/* Теперь делаем что-то с потоком */
someReadableStream.pipe(process.stdout); // засрёт some chunksome chunksome chunk весь терминал

```

или Writable стрим, например:
```javascript
const Writable = require('stream').Writable;

const someWritableStream = new Writable({
  /* Функция-приёмник */
  write: function (chunk, encoding, cb) {
    // что-то делаем с чанком (записываем его куда-либо)
    cb();
  }
});

/* Теперь делаем что-то с потоком */
process.stdin.pipe(someWritableStream); // загрузим наш Writable стрим чанками с stdin процесса
```

или Duplex поток:
```javascript
const Transform = require('stream').Transform;

const someTransformStream = new Transform({
  /* Функция-трансформатор */
  transform: function (chunk, encoding, cb) {
    /* что-то делаем с чанком (преобразуем его как-либо) */
    this.push(chunk); // да, здесь this.push не форсит вызов следующих обработчиков
    cb();
  },
  /* Также есть функция, которая вызовется, когда закроется поток с которого мы считываем чанки или будет вызван flush() вручную
  flush: function (cb) {
    /* Здесь можно сделать что-либо */
  }
});

/* Теперь делаем что-то с потоком */
process.stdin.pipe(someTransformStream).pipe(process.stdout); // загрузим наш Transform чанками с stdin процесса и выведем то, что он вернул, обратно
```
это самое интересное, т.к. Duplex потоки можно соединять в цепочки и обрабатывать стримы.
Например, можно считывать CSV и построчно выводить на терминал(или даже парсить):
```javascript
let buffer = '';

fs.createReadStream('somebigcsv.csv')
  /* Т.к. чанки могут содержать куски строк или захватывать следующие строки,
     переразобьём их на строки (разделитель - ;) */
  .pipe(new Transform({
    transform: function (chunk, encoding, cb) {
      buffer += chunk.toString();
      let lines = buffer.split(';');
      buffer = lines.pop();
      lines.forEach((line) => {
        this.push(line + "\n");
      });
      cb();
    },
    /* Если интересно почему так - спроси меня в скайпе */
    flush: function (cb) {
      this.push(buffer);
      cb();
    }
  }))
  /* Выведем построчно */
  .pipe(process.stdout);
```

#### Примечания

Все потоки наследуются от EE и работают асинхронно, передача чанка дальше по цепочке будет осуществлена только тогда, когда вызовется cb в функции потока (или this.push в Readable стриме)

Все потоки наследуются от EE и эмитят ивенты внутри себя, на которые можно подписываться типа
```javascript
someReadableStream.on('data', function () {
  // произошёл this.push
})
```
ивентами на которые можно подписаться являются `data`, `end`, `close`, `flush`(не уверен).

У readable потоков также есть метод `read()` который позволяет считать один чанк, у Writable потоков есть метод `write()`, позволяющий записать один чанк.

Чанком в классическом понимании может выступать строка или Buffer объект, но если создавать стримы с опциями `readableObjectMode: true` или `writableObjectMode: true` то на выход или на вход соответственно в роли чанков могу поступать js объекты.
```javascript
const someReadableStream = new Readable({
  /* Функция-генератор */
  readableObjectMode: treu,
  read: function () {
    this.push({ p: 2 }); // процесс создания чанка
  }
});
```

Также стоит заметить отдельно, что потоки достаточно ленивы и, например, чтение из Readable потока не начнётся до тех пор пока вы не запайпите его или не вызовете read() вручную.
