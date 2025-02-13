class SoundManager {
    constructor() {
        this.sounds = {};
        this.volume = 0.5;
        this.isMuted = false;
        this.backgroundMusic = {};
        this.currentMusicTime = 0;
        this.gameOverSound = null;
        this.currentTheme = null;
        
        // Определяем звуковые файлы напрямую
        this.soundFiles = {
            rotate: 'neon-rotate.mp3',
            drop: 'neon-drop.mp3',
            clear: 'neon-clear.mp3',
            gameOver: '8bit-negative-beeps.mp3',  // Новый звук для Game Over
            gameStart: 'neon-start.mp3'
        };
        
        this.init();
    }

    init() {
        // Загружаем все звуки
        Object.entries(this.soundFiles).forEach(([key, file]) => {
            this.sounds[key] = new Audio(`sounds/${file}`);
            this.sounds[key].volume = this.volume;
        });

        // Загружаем фоновую музыку для каждой темы
        this.backgroundMusic = {
            classic: new Audio('sounds/8bit-simple-beginnings.mp3'),
            neon: new Audio('sounds/8bit-ten-feet-under.mp3'),
            retro: new Audio('sounds/8bit-winners-dance.mp3'),
            nyancat: new Audio('sounds/8bit-nyan-cat.opus')
        };

        // Настраиваем все фоновые треки
        Object.values(this.backgroundMusic).forEach(music => {
            music.loop = true;
            music.volume = this.volume;
        });

        // Настраиваем звук Game Over
        this.sounds.gameOver.loop = false;
        this.sounds.gameOver.addEventListener('ended', () => {
            this.sounds.gameOver.currentTime = 0;
        });

        // Инициализация контроля громкости
        const volumeControl = document.getElementById('volume');
        if (volumeControl) {
            volumeControl.value = this.volume * 100;
            
            volumeControl.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }
    }

    setVolume(value) {
        this.volume = value;
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.isMuted ? 0 : value;
        });
        Object.values(this.backgroundMusic).forEach(music => {
            music.volume = this.isMuted ? 0 : value;
        });
        
        localStorage.setItem('tetris-volume', value);
    }

    playBackgroundMusic(theme, resumeFromPause = false) {
        // Если тема изменилась, начинаем с начала
        if (this.currentTheme !== theme) {
            this.currentMusicTime = 0;
            this.currentTheme = theme;
        }
        
        // Сначала останавливаем все фоновые треки
        this.stopBackgroundMusic();
        
        // Запускаем трек для текущей темы
        const music = this.backgroundMusic[theme];
        if (music) {
            // Если возобновляем после паузы, используем сохраненную позицию
            music.currentTime = resumeFromPause ? this.currentMusicTime : 0;
            music.play().catch(error => {
                console.warn(`Не удалось воспроизвести фоновую музыку для темы ${theme}:`, error);
            });
        }
    }

    stopBackgroundMusic() {
        // Сохраняем текущую позицию активного трека перед остановкой
        Object.values(this.backgroundMusic).forEach(music => {
            if (!music.paused) {
                this.currentMusicTime = music.currentTime;
            }
            music.pause();
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.setVolume(this.volume);
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            try {
                const sound = this.sounds[soundName].cloneNode();
                sound.volume = this.isMuted ? 0 : this.volume;
                
                sound.play().catch(error => {
                    console.warn(`Не удалось воспроизвести звук ${soundName}:`, error);
                });
            } catch (error) {
                console.warn(`Ошибка при воспроизведении звука ${soundName}:`, error);
            }
        } else {
            console.warn(`Звук ${soundName} не найден`);
        }
    }

    playGameOverSound() {
        // Сначала останавливаем фоновую музыку
        this.stopBackgroundMusic();
        
        // Воспроизводим звук Game Over
        const gameOverSound = this.sounds.gameOver;
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(error => {
            console.warn('Не удалось воспроизвести звук Game Over:', error);
        });
    }
} 