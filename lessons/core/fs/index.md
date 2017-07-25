## fs

https://nodejs.org/api/fs.html

В принципе, это достаточно простой модуль. Здесь есть набор функций для работы с файлами, всё гуглится по надобности и никакой боли не доставляет.

Функции типа `fs.readFile` или `fs.writeFile` должны быть вам знакомы и понятны.

Есть стрим версии типа `fs.createReadStream` и `fs.createWriteStream`.

Есть возможно работать с правами доступа (`fs.chmod`, `fs.chown`), проверять наличие файла (`fs.exists`), получать информацию о файле (`fs.stat`), считывать содержимое директорий (`fs.readdir`) и удалять файлы (`fs.unlink`).

Также есть интересная возможность смотреть за изменениями в папке `fs.watch`
```javascript
fs.watch(__dirname, {}, function (eventType, filename) {
  console.log(filename, 'changed');
});
```
