class SoundManager {
    constructor() {
        this.sounds = {};
        this.volume = 0.5;
        this.isMuted = false;
        this.backgroundMusic = {};
        this.currentMusicTime = 0;
        this.gameOverSound = null;
        this.currentTheme = null;
        this.userInteracted = false;
        
        // Добавляем слушатель для первого взаимодействия
        const handleFirstInteraction = () => {
            this.userInteracted = true;
            // Предзагружаем все звуки после первого взаимодействия
            this.init();
            // Удаляем слушатели после первого взаимодействия
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };

        // Добавляем слушатели для клика и нажатия клавиш
        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);
    }

    init() {
        // Загружаем все звуки
        this.soundFiles = {
            gameOver: '8bit-negative-beeps.mp3',
        };
        
        // Создаем и загружаем звуки
        Object.entries(this.soundFiles).forEach(([key, file]) => {
            const audio = new Audio(`sounds/${file}`);
            audio.load(); // Явно загружаем звук
            this.sounds[key] = audio;
            this.sounds[key].volume = this.volume;
        });

        // Загружаем фоновую музыку
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
            music.load(); // Явно загружаем музыку
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
        if (!this.userInteracted) return;

        // Останавливаем текущую музыку
        this.stopBackgroundMusic();
        
        // Запускаем трек для текущей темы
        const music = this.backgroundMusic[theme];
        if (music) {
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

    preloadAfterInteraction() {
        const loadSounds = () => {
            // Загружаем все звуки после первого взаимодействия
            Object.entries(this.soundFiles).forEach(([key, file]) => {
                const audio = new Audio(`sounds/${file}`);
                audio.load(); // Явно загружаем звук
                this.sounds[key] = audio;
                this.sounds[key].volume = this.volume;
            });
            
            // Удаляем слушатель после загрузки
            document.removeEventListener('click', loadSounds);
            document.removeEventListener('touchstart', loadSounds);
        };

        // Добавляем слушатели для загрузки звуков
        document.addEventListener('click', loadSounds);
        document.addEventListener('touchstart', loadSounds);
    }

    play(soundName) {
        if (!this.sounds[soundName] || !this.userInteracted) return;
        
        const sound = this.sounds[soundName].cloneNode();
        sound.volume = this.volume;
        
        if (soundName === 'gameStart' && this.userInteracted) {
            this.playBackgroundMusic(this.currentTheme || 'neon');
        }
        
        sound.play().catch(() => {});
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