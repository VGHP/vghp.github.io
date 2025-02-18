let resizeTimeout; // Объявляем переменную resizeTimeout

class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.nextPieceCanvas = document.getElementById('nextPiece');
        this.ctx = this.canvas.getContext('2d');
        this.nextCtx = this.nextPieceCanvas.getContext('2d');
        
        this.themeManager = new ThemeManager();
        this.soundManager = new SoundManager();
        this.achievementsManager = new AchievementsManager();
        this.languageManager = new LanguageManager();
        
        this.gameOver = true;
        this.pieceTrail = [];
        this.maxTrailLength = 3;
        
        // Сохраняем ссылку на игру в canvas
        this.canvas.tetrisGame = this;
        
        this.init();
        this.updateControlButtons();
    }

    init() {
        // Фиксированный размер блока
        GAME_CONFIG.BLOCK_SIZE = 45;
        
        // Устанавливаем размеры канваса
        this.canvas.width = GAME_CONFIG.BLOCK_SIZE * GAME_CONFIG.BOARD_WIDTH;
        this.canvas.height = GAME_CONFIG.BLOCK_SIZE * GAME_CONFIG.BOARD_HEIGHT;
        
        // Размер канваса для следующей фигуры
        this.nextPieceCanvas.width = GAME_CONFIG.BLOCK_SIZE * 4;
        this.nextPieceCanvas.height = GAME_CONFIG.BLOCK_SIZE * 4;

        this.bindEvents();
        
        this.reset();
        this.loadHighScores();
        this.initControlButtons();
        this.updateStats();

        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.classList.remove('hidden');
            startButton.style.pointerEvents = 'auto';
        }
        
        this.gameOver = true;
        
        this.draw();

        const volumeSlider = document.getElementById('volume');
        volumeSlider.addEventListener('input', (event) => {
            const volume = event.target.value / 100;
            this.soundManager.setVolume(volume);
            
            // Обновляем фон полосы громкости
            const percentage = event.target.value;
            event.target.style.background = `linear-gradient(to right, #ff4b4b 0%, #ff4b4b ${percentage}%, rgba(0, 0, 0, 0.3) ${percentage}%, rgba(0, 0, 0, 0.3) 100%)`;
        });

        // Устанавливаем начальное значение фона
        const initialVolume = volumeSlider.value;
        volumeSlider.style.background = `linear-gradient(to right, #ff4b4b 0%, #ff4b4b ${initialVolume}%, rgba(0, 0, 0, 0.3) ${initialVolume}%, rgba(0, 0, 0, 0.3) 100%)`;

        this.initMobileControls(); // Добавляем инициализацию мобильного управления
    }

    reset() {
        this.board = Array(GAME_CONFIG.BOARD_HEIGHT).fill()
            .map(() => Array(GAME_CONFIG.BOARD_WIDTH).fill(0));
        this.currentPiece = this.getRandomPiece();
        this.nextPiece = this.getRandomPiece();
        this.score = 0;
        this.level = GAME_CONFIG.INITIAL_LEVEL;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.dropCounter = 0;
        this.dropInterval = GAME_CONFIG.INITIAL_SPEED;
        this.lastTime = 0;
        this.rotationCount = 0;
        this.speedDropCount = 0;
        this.gameStartTime = Date.now();
        this.pieceTrail = [];
        this.maxTrailLength = 3;
        
        // Обновляем отображение статистики при сбросе игры
        this.updateStats();
    }

    getRandomPiece() {
        const pieces = Object.keys(TETROMINOS);
        const tetromino = TETROMINOS[pieces[Math.floor(Math.random() * pieces.length)]];
        return {
            matrix: tetromino.shape,
            pos: {x: Math.floor(GAME_CONFIG.BOARD_WIDTH / 2) - 1, y: 0},
            color: tetromino.color
        };
    }

    draw() {
        // Применяем фон темы перед отрисовкой игрового состояния
        this.themeManager.applyThemeBackground();
        
        this.ctx.fillStyle = this.themeManager.getThemeColors().board;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();

        this.drawBoard();

        this.drawPiece(this.currentPiece);

        this.drawGhostPiece();

        this.drawNextPiece();
    }

    drawGrid() {
        this.ctx.strokeStyle = this.themeManager.getThemeColors().grid;
        this.ctx.lineWidth = 0.5;

        for (let i = 0; i <= GAME_CONFIG.BOARD_WIDTH; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * GAME_CONFIG.BLOCK_SIZE, 0);
            this.ctx.lineTo(i * GAME_CONFIG.BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }

        for (let i = 0; i <= GAME_CONFIG.BOARD_HEIGHT; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * GAME_CONFIG.BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, i * GAME_CONFIG.BLOCK_SIZE);
            this.ctx.stroke();
        }
    }

    drawBoard() {
        this.board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawBlock(x, y, value);
                }
            });
        });
    }

    drawBlock(x, y, color) {
        if (this.themeManager.currentTheme === 'retro') {
            this.draw3DBlock(x * GAME_CONFIG.BLOCK_SIZE + 1, y * GAME_CONFIG.BLOCK_SIZE + 1, color);
        } else if (this.themeManager.currentTheme === 'neon') {
            this.drawNeonBlock(x * GAME_CONFIG.BLOCK_SIZE + 1, y * GAME_CONFIG.BLOCK_SIZE + 1, color);
        } else {
            // Стандартная отрисовка для других тем
            this.ctx.fillStyle = color;
            this.ctx.fillRect(
                x * GAME_CONFIG.BLOCK_SIZE + 1,
                y * GAME_CONFIG.BLOCK_SIZE + 1,
                GAME_CONFIG.BLOCK_SIZE - 2,
                GAME_CONFIG.BLOCK_SIZE - 2
            );
        }
    }

    draw3DBlock(x, y, color) {
        const blockSize = GAME_CONFIG.BLOCK_SIZE;
        const shadowSize = 4;
        const theme = THEMES.retro;

        // Основной цвет блока (немного темнее для объема)
        this.ctx.fillStyle = this.shadeColor(color, -10);
        this.ctx.fillRect(
            x,
            y,
            blockSize - 1,
            blockSize - 1
        );

        // Блик сверху (светлее основного цвета)
        this.ctx.fillStyle = this.shadeColor(color, 40);
        this.ctx.fillRect(
            x,
            y,
            blockSize - 1,
            shadowSize
        );

        // Правая грань (темнее основного цвета)
        this.ctx.fillStyle = this.shadeColor(color, -20);
        this.ctx.fillRect(
            x + blockSize - shadowSize,
            y,
            shadowSize,
            blockSize - 1
        );

        // Нижняя грань (самая темная)
        this.ctx.fillStyle = this.shadeColor(color, -30);
        this.ctx.fillRect(
            x,
            y + blockSize - shadowSize,
            blockSize - 1,
            shadowSize
        );

        // Левая грань (немного темнее основного цвета)
        this.ctx.fillStyle = this.shadeColor(color, -15);
        this.ctx.fillRect(
            x,
            y,
            shadowSize,
            blockSize - 1
        );
    }

    drawNeonBlock(x, y, color) {
        const blockSize = GAME_CONFIG.BLOCK_SIZE - 2;
        const theme = THEMES.neon;
        
        // Создаем неоновое свечение
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = theme.glow.blur;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Рисуем внутреннее заполнение
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, blockSize, blockSize);

        // Рисуем яркий контур
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, blockSize, blockSize);

        // Сбрасываем эффекты тени
        this.ctx.shadowBlur = 0;
    }

    shadeColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + 
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + 
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + 
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }

    drawPiece(piece, isGhost = false) {
        const theme = this.themeManager.getThemeColors();
        
        if (isGhost) {
            if (this.themeManager.currentTheme === 'neon') {
                // Дискотечный эффект для призрачной фигуры в неоновой теме
                const ghost = {...piece, pos: {...piece.pos}};
                while (!this.collision(ghost)) {
                    ghost.pos.y++;
                }
                ghost.pos.y--;

                const colors = ['#ff00ff', '#00ffff', '#ffff00', '#00ff00'];
                const time = Date.now() / 200; // Скорость мерцания

                ghost.matrix.forEach((row, y) => {
                    row.forEach((value, x) => {
                        if (value) {
                            const colorIndex = Math.floor(time + x + y) % colors.length;
                            this.ctx.fillStyle = colors[colorIndex];
                            this.ctx.globalAlpha = 0.3;
                            this.ctx.fillRect(
                                (ghost.pos.x + x) * GAME_CONFIG.BLOCK_SIZE + 1,
                                (ghost.pos.y + y) * GAME_CONFIG.BLOCK_SIZE + 1,
                                GAME_CONFIG.BLOCK_SIZE - 2,
                                GAME_CONFIG.BLOCK_SIZE - 2
                            );
                            this.ctx.globalAlpha = 1;
                        }
                    });
                });
            } else {
                // Для остальных тем добавляем новую пульсацию
                const ghost = {
                    matrix: piece.matrix,
                    pos: {...piece.pos},
                    color: theme.ghostPiece
                };

                while (!this.collision(ghost)) {
                    ghost.pos.y++;
                }
                ghost.pos.y--;

                // Новая, более плавная пульсация
                const time = Date.now() / 1000; // Замедляем скорость
                const opacity = 0.2 + Math.sin(time * 2) * 0.1; // Пульсация прозрачности вместо размера

                if (this.themeManager.currentTheme === 'retro') {
                    // Пиксельная отрисовка для White с пульсацией прозрачности
                    ghost.matrix.forEach((row, y) => {
                        row.forEach((value, x) => {
                            if (value) {
                                const blockSize = GAME_CONFIG.BLOCK_SIZE;
                                const pixelSize = 3;
                                const startX = (ghost.pos.x + x) * blockSize;
                                const startY = (ghost.pos.y + y) * blockSize;
                                
                                for (let px = 0; px < blockSize; px += pixelSize) {
                                    for (let py = 0; py < blockSize; py += pixelSize) {
                                        if ((px + py) % (pixelSize * 2) === 0) {
                                            this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                                            this.ctx.fillRect(
                                                startX + px,
                                                startY + py,
                                                pixelSize,
                                                pixelSize
                                            );
                                        }
                                    }
                                }
                            }
                        });
                    });
                } else {
                    // Стандартная отрисовка с пульсацией прозрачности для Classic и Nyan Cat
                    ghost.matrix.forEach((row, y) => {
                        row.forEach((value, x) => {
                            if (value) {
                                const color = ghost.color.startsWith('rgba') 
                                    ? ghost.color.replace(/[\d.]+\)$/, `${opacity})`)
                                    : `rgba(255, 255, 255, ${opacity})`;
                                    
                                this.ctx.fillStyle = color;
                                this.ctx.fillRect(
                                    (ghost.pos.x + x) * GAME_CONFIG.BLOCK_SIZE + 1,
                                    (ghost.pos.y + y) * GAME_CONFIG.BLOCK_SIZE + 1,
                                    GAME_CONFIG.BLOCK_SIZE - 2,
                                    GAME_CONFIG.BLOCK_SIZE - 2
                                );
                            }
                        });
                    });
                }
            }
            return;
        }

        // Отрисовка хвоста при падении
        if (this.pieceTrail.length > 0 && this.themeManager.currentTheme === 'neon') {
            // Лазерные лучи для неоновой темы
            const laserColors = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#00ffff', '#ffff00'];
            
            this.pieceTrail.forEach((trailPos, index) => {
                const alpha = (this.maxTrailLength - index) / this.maxTrailLength;
                piece.matrix.forEach((row, y) => {
                    row.forEach((value, x) => {
                        if (value) {
                            const color = laserColors[Math.floor(Date.now() / 100 + index) % laserColors.length];
                            this.ctx.strokeStyle = color;
                            this.ctx.lineWidth = 2;
                            this.ctx.globalAlpha = alpha;
                            this.ctx.shadowColor = color;
                            this.ctx.shadowBlur = 10;
                            
                            // Рисуем лазерный луч
                            this.ctx.beginPath();
                            this.ctx.moveTo(
                                (trailPos.x + x) * GAME_CONFIG.BLOCK_SIZE + GAME_CONFIG.BLOCK_SIZE / 2,
                                (trailPos.y + y) * GAME_CONFIG.BLOCK_SIZE
                            );
                            this.ctx.lineTo(
                                (trailPos.x + x) * GAME_CONFIG.BLOCK_SIZE + GAME_CONFIG.BLOCK_SIZE / 2,
                                (trailPos.y + y) * GAME_CONFIG.BLOCK_SIZE + GAME_CONFIG.BLOCK_SIZE
                            );
                            this.ctx.stroke();
                            
                            this.ctx.shadowBlur = 0;
                            this.ctx.globalAlpha = 1;
                        }
                    });
                });
            });
        }

        // Отрисовка текущей фигуры
        if (this.themeManager.currentTheme === 'neon') {
            piece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.drawNeonBlock(
                            (piece.pos.x + x) * GAME_CONFIG.BLOCK_SIZE + 1,
                            (piece.pos.y + y) * GAME_CONFIG.BLOCK_SIZE + 1,
                            piece.color
                        );
                    }
                });
            });
        } else if (this.themeManager.currentTheme === 'nyancat') {
            // Радужный хвост для Nyan Cat
            this.pieceTrail.forEach((trailPos, index) => {
                const alpha = ((this.maxTrailLength - index) / this.maxTrailLength) * 0.5; // Уменьшили максимальную прозрачность до 0.5
                piece.matrix.forEach((row, y) => {
                    row.forEach((value, x) => {
                        if (value) {
                            const rainbowColors = ['#FF0000', '#FF9900', '#FFFF00', '#33FF00', '#0099FF', '#6633FF'];
                            const color = rainbowColors[index % rainbowColors.length];
                            
                            this.ctx.fillStyle = color;
                            this.ctx.globalAlpha = alpha;
                            this.ctx.fillRect(
                                (trailPos.x + x) * GAME_CONFIG.BLOCK_SIZE + 1,
                                (trailPos.y + y) * GAME_CONFIG.BLOCK_SIZE + 1,
                                GAME_CONFIG.BLOCK_SIZE - 2,
                                GAME_CONFIG.BLOCK_SIZE - 2
                            );
                            this.ctx.globalAlpha = 1;
                        }
                    });
                });
            });

            // Добавляем отрисовку текущей фигуры
            piece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.ctx.fillStyle = piece.color;
                        this.ctx.fillRect(
                            (piece.pos.x + x) * GAME_CONFIG.BLOCK_SIZE + 1,
                            (piece.pos.y + y) * GAME_CONFIG.BLOCK_SIZE + 1,
                            GAME_CONFIG.BLOCK_SIZE - 2,
                            GAME_CONFIG.BLOCK_SIZE - 2
                        );
                    }
                });
            });
        } else {
            // Хвосты для Classic и White тем
            this.pieceTrail.forEach((trailPos, index) => {
                const alpha = ((this.maxTrailLength - index) / this.maxTrailLength) * 0.5; // Уменьшили прозрачность до 50%
                piece.matrix.forEach((row, y) => {
                    row.forEach((value, x) => {
                        if (value) {
                            if (this.themeManager.currentTheme === 'retro') {
                                // Пиксельный хвост для темы White
                                const blockSize = GAME_CONFIG.BLOCK_SIZE;
                                const pixelSize = 3;
                                const startX = (trailPos.x + x) * blockSize;
                                const startY = (trailPos.y + y) * blockSize;
                                
                                for (let px = 0; px < blockSize; px += pixelSize) {
                                    for (let py = 0; py < blockSize; py += pixelSize) {
                                        if ((px + py) % (pixelSize * 2) === 0) {
                                            this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.2})`; // Уменьшаем прозрачность до 20% от текущей
                                            this.ctx.fillRect(
                                                startX + px,
                                                startY + py,
                                                pixelSize,
                                                pixelSize
                                            );
                                        }
                                    }
                                }
                            } else {
                                // Разрушающийся хвост для темы Classic
                                const blockSize = GAME_CONFIG.BLOCK_SIZE;
                                const miniBlockSize = 5;
                                const startX = (trailPos.x + x) * blockSize;
                                const startY = (trailPos.y + y) * blockSize;
                                
                                // Создаем сетку маленьких квадратиков
                                for (let px = 0; px < blockSize; px += miniBlockSize) {
                                    for (let py = 0; py < blockSize; py += miniBlockSize) {
                                        // Добавляем случайное смещение для эффекта разрушения
                                        const offset = (index * 2) * (Math.random() - 0.5);
                                        
                                        this.ctx.fillStyle = piece.color;
                                        this.ctx.globalAlpha = alpha;
                                        this.ctx.fillRect(
                                            startX + px + offset,
                                            startY + py + offset,
                                            miniBlockSize - 1,
                                            miniBlockSize - 1
                                        );
                                        this.ctx.globalAlpha = 1;
                                    }
                                }
                            }
                        }
                    });
                });
            });

            // Отрисовка текущей фигуры
            piece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        if (this.themeManager.currentTheme === 'retro' && !isGhost) {
                            this.draw3DBlock(
                                (piece.pos.x + x) * GAME_CONFIG.BLOCK_SIZE + 1,
                                (piece.pos.y + y) * GAME_CONFIG.BLOCK_SIZE + 1,
                                piece.color
                            );
                        } else {
                            this.ctx.fillStyle = piece.color;
                            this.ctx.fillRect(
                                (piece.pos.x + x) * GAME_CONFIG.BLOCK_SIZE + 1,
                                (piece.pos.y + y) * GAME_CONFIG.BLOCK_SIZE + 1,
                                GAME_CONFIG.BLOCK_SIZE - 2,
                                GAME_CONFIG.BLOCK_SIZE - 2
                            );
                        }
                    }
                });
            });
        }
    }

    drawGhostPiece() {
        this.drawPiece(this.currentPiece, true);
    }

    drawNextPiece() {
        this.nextCtx.fillStyle = this.themeManager.getThemeColors().board;
        this.nextCtx.fillRect(0, 0, this.nextPieceCanvas.width, this.nextPieceCanvas.height);

        const offsetX = (4 - this.nextPiece.matrix[0].length) / 2;
        const offsetY = (4 - this.nextPiece.matrix.length) / 2;

        this.nextPiece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(
                        (x + offsetX) * GAME_CONFIG.BLOCK_SIZE,
                        (y + offsetY) * GAME_CONFIG.BLOCK_SIZE,
                        GAME_CONFIG.BLOCK_SIZE - 1,
                        GAME_CONFIG.BLOCK_SIZE - 1
                    );
                }
            });
        });
    }

    collision(piece) {
        const matrix = piece.matrix;
        const pos = piece.pos;
        
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0 &&
                    (this.board[y + pos.y] &&
                    this.board[y + pos.y][x + pos.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    rotate(piece, dir) {
        const matrix = piece.matrix;
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < y; x++) {
                [
                    matrix[x][y],
                    matrix[y][x]
                ] = [
                    matrix[y][x],
                    matrix[x][y]
                ];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }

        const pos = piece.pos.x;
        let offset = 1;
        while (this.collision(piece)) {
            piece.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > matrix[0].length) {
                this.rotate(piece, -dir);
                piece.pos.x = pos;
                return false;
            }
        }
        return true;
    }

    merge() {
        this.currentPiece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.board[y + this.currentPiece.pos.y][x + this.currentPiece.pos.x] = this.currentPiece.color;
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        let linesToAnimate = [];

        // Проверяем линии снизу вверх
        for (let y = GAME_CONFIG.BOARD_HEIGHT - 1; y >= 0; y--) {
            let isLineFull = true;
            
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                if (this.board[y][x] === 0) {
                    isLineFull = false;
                    break;
                }
            }
            
            if (isLineFull) {
                linesToAnimate.push(y);
                linesCleared++;
            }
        }

        if (linesCleared > 0) {
            // Начисляем очки за линии
            const basePoints = {
                1: GAME_CONFIG.POINTS.SINGLE_LINE,
                2: GAME_CONFIG.POINTS.DOUBLE_LINE,
                3: GAME_CONFIG.POINTS.TRIPLE_LINE,
                4: GAME_CONFIG.POINTS.TETRIS
            }[linesCleared] || 0;

            this.score += basePoints * (this.level + 1);
            this.lines += linesCleared;

            // Проверяем достижение нового уровня
            const newLevel = Math.floor(this.lines / 10);
            if (newLevel > this.level && newLevel <= GAME_CONFIG.MAX_LEVEL) {
                this.level = newLevel;
                this.dropInterval = GAME_CONFIG.INITIAL_SPEED * Math.pow(GAME_CONFIG.SPEED_COEFFICIENT, this.level);
                this.soundManager.play('levelUp');
            }

            // Обновляем статистику на экране
            this.updateStats();

            // Проверяем достижения
            this.achievementsManager.checkAchievements({
                score: this.score,
                level: this.level,
                lines: this.lines,
                linesCleared
            });

            // Запускаем анимацию очистки линий
            this.animateClearLines(linesToAnimate).then(() => {
                linesToAnimate.sort((a, b) => a - b);
                
                linesToAnimate.forEach(y => {
                    this.board.splice(y, 1);
                    this.board.unshift(new Array(GAME_CONFIG.BOARD_WIDTH).fill(0));
                });

                this.draw();
            });
        }

        return linesCleared;
    }

    animateClearLines(lines) {
        return new Promise(resolve => {
            let alpha = 1;
            const animate = () => {
                const colors = lines.map(y => 
                    this.board[y].map(color => color)
                );

                lines.forEach(y => {
                    this.board[y].forEach((_, x) => {
                        if (this.board[y][x] !== 0) {
                            this.board[y][x] = `rgba(255, 255, 255, ${alpha})`;
                        }
                    });
                });

                this.draw();

                lines.forEach((y, i) => {
                    this.board[y] = colors[i];
                });

                alpha -= 0.1;

                if (alpha > 0) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            animate();
        });
    }

    handleKeyPress(event) {
        // Предотвращаем скролл страницы для Space и стрелок
        if (event.code === 'Space' || 
            event.code === 'ArrowUp' || 
            event.code === 'ArrowDown') {
            event.preventDefault();
        }

        if (event.code === 'Space') {
            if (this.gameOver) {
                this.start();
                return;
            }
            if (!this.gameOver) {
                this.togglePause();
                const icon = document.querySelector('#pauseButton i');
                icon.className = this.isPaused ? 'fas fa-play' : 'fas fa-pause';
                return;
            }
            return;
        }

        if (this.gameOver || this.isPaused) return;

        switch(event.code) {
            case 'ArrowLeft':
            case 'KeyA':
            case 'KeyФ':
                this.movePiece(-1);
                break;
            case 'ArrowRight':
            case 'KeyD':
            case 'KeyВ':
                this.movePiece(1);
                break;
            case 'ArrowDown':
            case 'KeyS':
            case 'KeyЫ':
                this.dropPiece();
                this.speedDropCount++;
                break;
            case 'ArrowUp':
            case 'KeyW':
            case 'KeyЦ':
                if (this.rotate(this.currentPiece, 1)) {
                    this.rotationCount++;
                }
                break;
        }
    }

    movePiece(dir) {
        this.currentPiece.pos.x += dir;
        if (this.collision(this.currentPiece)) {
            this.currentPiece.pos.x -= dir;
            return false;
        }
        return true;
    }

    dropPiece() {
        this.currentPiece.pos.y++;
        if (this.collision(this.currentPiece)) {
            this.currentPiece.pos.y--;
            this.merge();
            this.clearLines(); // clearLines теперь сам обновляет статистику
            this.resetPiece();
            this.pieceTrail = [];
            return false;
        }

        // Обновляем хвост только при активном ускорении
        if (this.speedDropCount > 0) {
            this.pieceTrail.unshift({
                x: this.currentPiece.pos.x,
                y: this.currentPiece.pos.y - 1
            });
            if (this.pieceTrail.length > this.maxTrailLength) {
                this.pieceTrail.pop();
            }
        } else {
            this.pieceTrail = [];
        }

        return true;
    }

    resetPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece();
        
        if (this.collision(this.currentPiece)) {
            this.gameOver = true;
            this.showGameOver();
            this.saveHighScore();
            // Добавляем генерацию события gameOver
            const gameOverEvent = new Event('gameOver');
            document.dispatchEvent(gameOverEvent);
        }
    }

    start() {
        if (!this.gameOver && !this.isPaused) return;
        
        this.reset();
        this.gameOver = false;
        this.isPaused = false;
        
        // Скрываем все оверлейные элементы
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('startButton').classList.add('hidden');
        document.getElementById('pauseMessage').classList.add('hidden');
        
        // Обновляем иконку паузы
        const pauseIcon = document.querySelector('#pauseButton i');
        if (pauseIcon) {
            pauseIcon.className = 'fas fa-pause';
        }
        
        this.soundManager.play('gameStart');
        
        // Останавливаем предыдущую фоновую музыку перед началом новой
        this.soundManager.stopBackgroundMusic();
        
        // Небольшая задержка перед началом новой фоновой музыки
        setTimeout(() => {
            // Запускаем фоновую музыку для текущей темы
            this.soundManager.playBackgroundMusic(this.themeManager.currentTheme);
        }, 500);
        
        this.lastTime = performance.now();
        this.updateControlButtons();
        this.update();
    }

    restart() {
        // Сбрасываем все состояния
        this.gameOver = true;
        this.isPaused = false;
        
        // Скрываем все оверлейные элементы
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('startButton').classList.add('hidden');
        document.getElementById('pauseMessage').classList.add('hidden');
        
        // Обновляем иконку паузы
        const pauseIcon = document.querySelector('#pauseButton i');
        if (pauseIcon) {
            pauseIcon.className = 'fas fa-pause';
        }
        
        this.start();
    }

    togglePause() {
        if (this.gameOver) return;
        
        this.isPaused = !this.isPaused;
        
        console.log('Toggling pause, isPaused:', this.isPaused); // Лог состояния паузы
        
        // Генерируем события для паузы
        const pauseEvent = new Event(this.isPaused ? 'gamePaused' : 'gameResumed');
        document.dispatchEvent(pauseEvent);
        console.log('Dispatched event:', this.isPaused ? 'gamePaused' : 'gameResumed'); // Лог отправки события
        
        if (!this.isPaused) {
            this.lastTime = performance.now();
            this.update();
            this.soundManager.playBackgroundMusic(this.themeManager.currentTheme, true);
        } else {
            this.soundManager.stopBackgroundMusic();
        }
        
        const pauseMessage = this.createPauseMessage();
        pauseMessage.classList.toggle('hidden', !this.isPaused);
    }

    createPauseMessage() {
        const pauseMessage = document.getElementById('pauseMessage');
        if (!pauseMessage) {
            console.error('Pause message element not found');
            return null;
        }
        return pauseMessage;
    }

    showGameOver() {
        const gameOverElement = document.getElementById('gameOver');
        const startButton = document.getElementById('startButton');
        
        gameOverElement.classList.remove('hidden');
        startButton.classList.add('hidden');
        
        this.updateControlButtons();
        
        // Воспроизводим звук Game Over вместо обычного звука
        this.soundManager.playGameOverSound();
        
        setTimeout(() => {
            gameOverElement.classList.add('hidden');
            startButton.classList.remove('hidden');
        }, 3000);
    }

    update(time = 0) {
        if (this.gameOver || this.isPaused) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltaTime;

        if (this.dropCounter > this.dropInterval) {
            this.dropPiece();
            this.dropCounter = 0;
        }

        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    loadHighScores() {
        this.highScores = JSON.parse(localStorage.getItem('tetris-highscores')) || [];
        this.renderHighScores();
    }

    saveHighScore() {
        const newScore = {
            score: this.score,
            date: new Date().toLocaleDateString(),
            lines: this.lines,
            level: this.level
        };

        this.highScores.push(newScore);
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 10);

        localStorage.setItem('tetris-highscores', JSON.stringify(this.highScores));
        this.renderHighScores();
    }

    renderHighScores() {
        const container = document.getElementById('highScoresList');
        container.innerHTML = '';

        this.highScores.forEach((score, index) => {
            const scoreElement = document.createElement('div');
            scoreElement.className = 'high-score';
            scoreElement.innerHTML = `
                <div class="rank">${index + 1}</div>
                <div class="score-details">
                    <div class="score-main">${score.score}</div>
                    <div class="score-info">
                        Уровень: ${score.level} | Линии: ${score.lines}
                    </div>
                    <div class="score-date">${score.date}</div>
                </div>
            `;
            container.appendChild(scoreElement);
        });
    }

    initControlButtons() {
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restart();
            document.getElementById('restartButton').blur();
        });

        document.getElementById('pauseButton').addEventListener('click', () => {
            this.togglePause();
            const icon = document.querySelector('#pauseButton i');
            icon.className = this.isPaused ? 'fas fa-play' : 'fas fa-pause';
            document.getElementById('pauseButton').blur();
        });

        document.getElementById('achievementsButton').addEventListener('click', () => {
            document.getElementById('achievementsModal').classList.add('show');
            document.getElementById('achievementsButton').blur();
        });

        document.getElementById('highscoresButton').addEventListener('click', () => {
            document.getElementById('highscoresModal').classList.add('show');
            document.getElementById('highscoresButton').blur();
        });

        document.getElementById('settingsButton').addEventListener('click', () => {
            document.getElementById('settingsModal').classList.add('show');
            document.getElementById('settingsButton').blur();
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    bindEvents() {
        const startButton = document.getElementById('startButton');
        if (startButton) {
            const startHandler = () => {
                if (this.gameOver) {
                    this.start();
                }
            };
            
            this.startHandler = startHandler;
            
            startButton.removeEventListener('click', this.startHandler);
            startButton.addEventListener('click', this.startHandler);
        }

        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'KeyЫ') {
                this.speedDropCount = 0;
                this.pieceTrail = []; // Очищаем хвост при отпускании клавиши
            }
        });
    }

    updateControlButtons() {
        const restartButton = document.getElementById('restartButton');
        const pauseButton = document.getElementById('pauseButton');
        
        if (this.gameOver) {
            restartButton.classList.add('disabled');
            pauseButton.classList.add('disabled');
        } else {
            restartButton.classList.remove('disabled');
            pauseButton.classList.remove('disabled');
        }
    }

    checkLevel() {
        // Новый уровень каждые 10 линий
        const newLevel = Math.floor(this.lines / 10);
        
        if (newLevel > this.level && newLevel <= GAME_CONFIG.MAX_LEVEL) {
            this.level = newLevel;
            // Обновляем скорость падения
            this.dropInterval = GAME_CONFIG.INITIAL_SPEED * Math.pow(GAME_CONFIG.SPEED_COEFFICIENT, this.level);
            
            // Обновляем отображение уровня
            document.getElementById('level').textContent = this.level;
            
            // Воспроизводим звук повышения уровня
            this.soundManager.play('levelUp');
        }
    }

    initMobileControls() {
        // Обработчики для мобильных кнопок
        const mobileButtons = {
            mobileLeft: () => {
                if (this.movePiece(-1)) {
                    this.draw();
                }
            },
            mobileRight: () => {
                if (this.movePiece(1)) {
                    this.draw();
                }
            },
            mobileDown: () => {
                if (this.dropPiece()) {
                    this.speedDropCount++;
                    this.draw();
                }
            },
            mobileRotate: () => {
                if (this.rotate(this.currentPiece, 1)) {
                    this.rotationCount++;
                    this.draw();
                }
            }
        };

        // Добавляем обработчики для касаний
        Object.entries(mobileButtons).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                // Обработка касания
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault(); // Предотвращаем скролл
                    if (!this.gameOver && !this.isPaused) {
                        handler();
                    }
                });

                // Для кнопки "вниз" добавляем повторение действия при удержании
                if (id === 'mobileDown') {
                    let intervalId = null;
                    
                    button.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        if (!this.gameOver && !this.isPaused) {
                            intervalId = setInterval(() => {
                                handler();
                            }, 50);
                        }
                    });

                    button.addEventListener('touchend', () => {
                        if (intervalId) {
                            clearInterval(intervalId);
                            intervalId = null;
                            this.speedDropCount = 0;
                            this.pieceTrail = [];
                        }
                    });
                }
            }
        });
    }

    // Обновляем метод updateStats
    updateStats() {
        if (window.innerWidth <= 768) {
            // Обновляем мобильную статистику
            const scoreElement = document.getElementById('mobileScore');
            const linesElement = document.getElementById('mobileLines');
            const levelElement = document.getElementById('mobileLevel');

            if (scoreElement) scoreElement.textContent = this.score;
            if (linesElement) linesElement.textContent = this.lines;
            if (levelElement) levelElement.textContent = this.level;
        } else {
            // Обновляем десктопную статистику
            const scoreElement = document.getElementById('score');
            const linesElement = document.getElementById('lines');
            const levelElement = document.getElementById('level');

            if (scoreElement) scoreElement.textContent = this.score;
            if (linesElement) linesElement.textContent = this.lines;
            if (levelElement) levelElement.textContent = this.level;
        }
    }
}

class LanguageManager {
    constructor() {
        this.updateTranslations();
    }

    updateTranslations() {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = TRANSLATIONS[key];
        });
    }

    getText(key) {
        return TRANSLATIONS[key];
    }
}

const TRANSLATIONS = {
    gameOver: "Игра окончена",
    pause: "Пауза",
    start: "Старт",
    resume: "Продолжить",
    nextFigure: "Следующая фигура:",
    score: "Очки:",
    level: "Уровень:",
    lines: "Линии:",
    settings: "Настройки",
    volume: "Громкость",
    theme: "Тема",
    achievements: "Достижения",
    highScores: "Рекорды",
    controls: "Управление",
    rotate: "Поворот",
    left: "Влево",
    right: "Вправо",
    speedUp: "Ускорить",
    pauseKey: "Пауза / Продолжить"
};

function resizeCanvas() {
    if (window.innerWidth <= 768) {
        const canvas = document.getElementById('tetris');
        
        // Фиксированные размеры для мобильной версии
        const cellSize = GAME_CONFIG.MOBILE.BLOCK_SIZE;
        const boardWidth = GAME_CONFIG.MOBILE.BOARD_WIDTH * cellSize;
        const boardHeight = GAME_CONFIG.MOBILE.BOARD_HEIGHT * cellSize;

        // Обновляем BLOCK_SIZE для мобильной версии
        GAME_CONFIG.BLOCK_SIZE = cellSize;
        
        // Устанавливаем размеры canvas
        canvas.width = boardWidth;
        canvas.height = boardHeight;

        // Стили для canvas
        canvas.style.width = boardWidth + 'px';
        canvas.style.height = boardHeight + 'px';
        canvas.style.display = 'block';
        canvas.style.padding = '0';
        canvas.style.border = `${GAME_CONFIG.MOBILE.BORDER}px solid #333`;
        
        // Убираем все отступы и устанавливаем только нужные смещения
        canvas.style.margin = '0';
        canvas.style.marginLeft = GAME_CONFIG.MOBILE.OFFSET_X + 'px';
        canvas.style.marginTop = GAME_CONFIG.MOBILE.OFFSET_Y + 'px';

        // Обновляем размер canvas для следующей фигуры
        const nextPieceCanvas = document.getElementById('nextPiece');
        if (nextPieceCanvas) {
            const nextPieceSize = cellSize * 3;
            nextPieceCanvas.width = nextPieceSize;
            nextPieceCanvas.height = nextPieceSize;
        }

        // Стили для панели статистики в мобильной версии
        const statsPanel = document.querySelector('.game-stats');
        if (statsPanel) {
            statsPanel.style.position = 'fixed'; // Меняем на fixed для надежного позиционирования
            statsPanel.style.top = '10px';
            statsPanel.style.left = GAME_CONFIG.MOBILE.OFFSET_X + 'px';
            statsPanel.style.width = boardWidth + 'px';
            statsPanel.style.display = 'flex';
            statsPanel.style.justifyContent = 'space-around';
            statsPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            statsPanel.style.padding = '5px';
            statsPanel.style.borderRadius = '5px';
            statsPanel.style.zIndex = '1000';
            statsPanel.style.visibility = 'visible';
            statsPanel.style.pointerEvents = 'none'; // Чтобы не мешала касаниям
        }

        // Стили для элементов статистики в мобильной версии
        const statElements = document.querySelectorAll('.game-stats .stat');
        statElements.forEach(stat => {
            stat.style.margin = '0 5px';
            stat.style.fontSize = '14px';
            stat.style.color = '#fff';
            stat.style.display = 'flex';
            stat.style.alignItems = 'center';
            stat.style.visibility = 'visible';
            stat.style.opacity = '1';
            
            // Убеждаемся, что значения видны
            const valueElement = stat.querySelector('span:not([data-translate])');
            if (valueElement) {
                valueElement.style.marginLeft = '5px';
                valueElement.style.color = '#fff';
                valueElement.style.opacity = '1';
            }
        });

        // Принудительно обновляем значения статистики
        const game = document.querySelector('canvas').tetrisGame;
        if (game) {
            game.updateStats();
        }
    }
}

// Обработчики событий
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
});

window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 200);
});

// Добавляем обработчик для изменения высоты окна (скрытие адресной строки)
window.addEventListener('visualViewport', resizeCanvas);

// Инициализация
window.addEventListener('load', resizeCanvas);