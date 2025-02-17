const GAME_CONFIG = {
    // Размеры игрового поля для десктопа
    BOARD_WIDTH: 14,
    BOARD_HEIGHT: 20,
    BLOCK_SIZE: 32,

    // Размеры для мобильной версии
    MOBILE: {
        BOARD_WIDTH: 11.5,  // Ширина поля (фактически клеток 14)
        BOARD_HEIGHT: 17,  // Высота поля (фактически клеток 20)
        BLOCK_SIZE: 32,    // Размер клетки
        OFFSET_X: -65,     // Смещение влево, костыль для центрирования
        OFFSET_Y: -7,      // Смещение вверх, костыль для центрирования
        BORDER: 2,         // Толщина бордера
    },

    // Настройки уровней сложности
    INITIAL_LEVEL: 0,
    MAX_LEVEL: 20,
    POINTS_PER_LEVEL: 1000,    // Очки для перехода на следующий уровень
    SPEED_COEFFICIENT: 0.8,     // Коэффициент ускорения при переходе на новый уровень
    INITIAL_SPEED: 1000,        // Начальная скорость падения (в миллисекундах)

    // Очки за действия
    POINTS: {
        SINGLE_LINE: 100,       // За одну линию
        DOUBLE_LINE: 300,       // За две линии
        TRIPLE_LINE: 500,       // За три линии
        TETRIS: 800,           // За четыре линии (тетрис)
        SOFT_DROP: 1,          // За ускорение падения (за каждую клетку)
        HARD_DROP: 2           // За мгновенное падение (за каждую клетку)
    }
}; 

// Добавляем мобильные элементы только если это мобильная версия
if (window.innerWidth <= 768) {
    document.addEventListener('DOMContentLoaded', function() {
        // Создаем контейнер для кнопок
        const mobileControls = document.createElement('div');
        mobileControls.className = 'mobile-game-controls';

        // Создаем кнопку Старт
        const startButton = document.createElement('button');
        startButton.className = 'mobile-start-button';
        startButton.textContent = 'Старт';
        startButton.type = 'button';

        // Создаем кнопку Пауза
        const pauseButton = document.createElement('button');
        pauseButton.className = 'mobile-pause-button hidden';
        pauseButton.textContent = 'Пауза';
        pauseButton.type = 'button';

        // Добавляем кнопки в контейнер
        mobileControls.appendChild(startButton);
        mobileControls.appendChild(pauseButton);
        
        // Добавляем контейнер в body
        document.body.appendChild(mobileControls);

        // Получаем ссылки на десктопные кнопки
        const desktopStartButton = document.querySelector('.start-button');
        const desktopPauseButton = document.querySelector('.pause-button');

        // Сначала добавляем слушатели событий паузы
        document.addEventListener('gamePaused', function() {
            console.log('Game paused event received');
            pauseButton.classList.remove('hidden');
            console.log('Pause button should be visible now');
        });

        document.addEventListener('gameResumed', function() {
            console.log('Game resumed event received');
            pauseButton.classList.add('hidden');
            console.log('Pause button should be hidden now');
        });

        // Затем добавляем обработчики для кнопки Пауза
        pauseButton.addEventListener('click', function() {
            console.log('Pause button clicked');
            if (desktopPauseButton) {
                desktopPauseButton.click();
            }
        });

        pauseButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            console.log('Pause button touched');
            if (desktopPauseButton) {
                desktopPauseButton.click();
            }
        });

        // Функция для запуска игры
        function startGame(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            if (desktopStartButton) {
                desktopStartButton.click();
                startButton.classList.add('hidden');
            }
        }

        // Функция для показа кнопки Старт
        function showStartButton() {
            startButton.classList.remove('hidden');
            pauseButton.classList.add('hidden');
        }

        // Обработчики для кнопки Старт
        startButton.addEventListener('click', startGame);
        startButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            startGame(e);
        });

        // Обработчик окончания игры
        document.addEventListener('gameOver', function() {
            setTimeout(showStartButton, 3000);
        });
    });
}