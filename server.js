const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Раздаем статические файлы из текущей директории
app.use(express.static(__dirname));

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Запускаем сервер
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
    console.log(`Откройте http://localhost:${port} в браузере`);
}); 