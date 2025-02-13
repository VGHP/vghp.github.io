const THEMES = {
    classic: {
        name: 'Классическая',
        colors: {
            background: '#2c3e50',
            board: 'rgba(0, 0, 0, 0.8)',
            grid: '#34495e',
            ghostPiece: 'rgba(255, 255, 255, 0.2)',
            pieces: {
                I: '#00f0f0',
                O: '#f0f000',
                T: '#a000f0',
                S: '#00f000',
                Z: '#f00000',
                J: '#0000f0',
                L: '#f0a000'
            }
        },
        sounds: {
            rotate: 'classic-rotate.mp3',
            drop: 'classic-drop.mp3',
            clear: 'classic-clear.mp3',
            gameOver: 'classic-gameover.mp3',
            gameStart: 'classic-start.mp3'
        }
    },
    neon: {
        name: 'Неон',
        colors: {
            background: '#000000',
            board: 'rgba(0, 0, 0, 0.9)',
            grid: '#111111',
            ghostPiece: 'rgba(255, 255, 255, 0.2)',
            pieces: {
                I: '#00ffff',
                O: '#ffff00',
                T: '#ff00ff',
                S: '#00ff00',
                Z: '#ff0000',
                J: '#0066ff',
                L: '#ff6600'
            }
        },
        glow: {
            blur: 15,
            spread: 5,
            opacity: 0.7
        },
        sounds: {
            rotate: 'neon-rotate.mp3',
            drop: 'neon-drop.mp3',
            clear: 'neon-clear.mp3',
            gameOver: 'neon-gameover.mp3',
            gameStart: 'neon-start.mp3'
        }
    },
    retro: {
        name: 'White',
        colors: {
            background: '#FFFFFF',
            board: '#FFFFFF',
            grid: '#EEEEEE',
            ghostPiece: 'rgba(0, 0, 0, 0.1)',
            pieces: {
                I: '#00FFFF',
                O: '#FFFF00',
                T: '#FF00FF',
                S: '#00FF00',
                Z: '#FF0000',
                J: '#0000FF',
                L: '#FF8800'
            }
        },
        blockStyle: {
            shadowTop: 'rgba(255, 255, 255, 0.8)',
            shadowRight: 'rgba(255, 255, 255, 0.4)',
            shadowBottom: 'rgba(0, 0, 0, 0.2)',
            shadowLeft: 'rgba(0, 0, 0, 0.4)'
        },
        sounds: {
            rotate: 'retro-rotate.mp3',
            drop: 'retro-drop.mp3',
            clear: 'retro-clear.mp3',
            gameOver: 'retro-gameover.mp3',
            gameStart: 'retro-start.mp3'
        }
    },
    minimal: {
        name: 'Минимализм',
        colors: {
            background: '#ffffff',
            board: '#f0f0f0',
            grid: '#e0e0e0',
            ghostPiece: 'rgba(0, 0, 0, 0.1)',
            pieces: {
                I: '#95a5a6',
                O: '#7f8c8d',
                T: '#34495e',
                S: '#2c3e50',
                Z: '#2980b9',
                J: '#3498db',
                L: '#1abc9c'
            }
        },
        sounds: {
            rotate: 'minimal-rotate.mp3',
            drop: 'minimal-drop.mp3',
            clear: 'minimal-clear.mp3',
            gameOver: 'minimal-gameover.mp3',
            gameStart: 'minimal-start.mp3'
        }
    },
    nyancat: {
        name: 'Nyan Cat',
        colors: {
            background: 'custom',
            board: 'rgba(0, 0, 0, 0.5)',
            grid: 'rgba(255, 255, 255, 0.1)',
            ghostPiece: 'rgba(255, 105, 180, 0.2)',
            pieces: {
                I: '#FF69B4',
                O: '#FF69B4',
                T: '#FF69B4',
                S: '#FF69B4',
                Z: '#FF69B4',
                J: '#FF69B4',
                L: '#FF69B4'
            }
        },
        drawBackground: (ctx, width, height) => {
            const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
            skyGradient.addColorStop(0, '#8B5E9C');
            skyGradient.addColorStop(0.5, '#E37B96');
            skyGradient.addColorStop(0.8, '#FFB6C1');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, width, height);

            const seaGradient = ctx.createLinearGradient(0, height * 0.8, 0, height);
            seaGradient.addColorStop(0, '#4FA4E4');
            seaGradient.addColorStop(1, '#1E90FF');
            ctx.fillStyle = seaGradient;
            ctx.fillRect(0, height * 0.8, width, height * 0.2);

            ctx.fillStyle = '#FFE135';
            ctx.beginPath();
            ctx.arc(width * 0.2, height * 0.3, width * 0.15, 0, Math.PI * 2);
            ctx.fill();

            const rainbowColors = ['#FF0000', '#FF9900', '#FFFF00', '#33FF00', '#0099FF', '#6633FF'];
            const stripeHeight = height * 0.05;
            rainbowColors.forEach((color, i) => {
                ctx.fillStyle = color;
                ctx.fillRect(0, height * 0.4 + i * stripeHeight, width * 0.3, stripeHeight);
            });

            ctx.fillStyle = '#FFFFFF';
            const stars = [
                {x: width * 0.8, y: height * 0.1},
                {x: width * 0.9, y: height * 0.2},
                {x: width * 0.7, y: height * 0.15}
            ];
            
            stars.forEach(star => {
                ctx.fillRect(star.x - 1, star.y - 4, 2, 8);
                ctx.fillRect(star.x - 4, star.y - 1, 8, 2);
            });
        },
        sounds: {
            rotate: 'nyancat-rotate.mp3',
            drop: 'nyancat-drop.mp3',
            clear: 'nyancat-clear.mp3',
            gameOver: 'nyancat-gameover.mp3',
            gameStart: 'nyancat-start.mp3'
        }
    }
};

class ThemeManager {
    constructor() {
        this.currentTheme = 'classic';
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('tetris-theme') || 'classic';
        this.setTheme(savedTheme);
        
        document.getElementById('theme').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        const themeSelect = document.getElementById('theme');
        if (themeSelect) {
            themeSelect.value = savedTheme;
        }
    }

    setTheme(themeName) {
        if (!THEMES[themeName]) return;
        
        this.currentTheme = themeName;
        localStorage.setItem('tetris-theme', themeName);
        
        const theme = THEMES[themeName];
        this.applyThemeBackground();

        if (game && game.soundManager && !game.gameOver && !game.isPaused) {
            game.soundManager.playBackgroundMusic(themeName);
        }
    }

    applyThemeBackground() {
        const theme = THEMES[this.currentTheme];
        const canvas = document.getElementById('tetris');
        
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (theme.colors.background === 'custom' && theme.drawBackground) {
                theme.drawBackground(ctx, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = theme.colors.background;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.fillStyle = theme.colors.board;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        const nextPieceCanvas = document.getElementById('nextPiece');
        if (nextPieceCanvas) {
            const nextCtx = nextPieceCanvas.getContext('2d');
            nextCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
            
            if (theme.colors.background === 'custom' && theme.drawBackground) {
                theme.drawBackground(nextCtx, nextPieceCanvas.width, nextPieceCanvas.height);
            } else {
                nextCtx.fillStyle = theme.colors.background;
                nextCtx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
            }
            
            nextCtx.fillStyle = theme.colors.board;
            nextCtx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        }
    }

    getThemeColors() {
        return THEMES[this.currentTheme].colors;
    }

    getThemeSounds() {
        return THEMES[this.currentTheme].sounds;
    }
} 