class AchievementsManager {
    constructor() {
        this.achievements = {
            firstGame: {
                id: 'firstGame',
                title: 'Первые шаги',
                description: 'Сыграйте свою первую игру',
                unlocked: false
            },
            score1000: {
                id: 'score1000',
                title: 'Начинающий',
                description: 'Наберите 1000 очков',
                unlocked: false
            },
            tetris: {
                id: 'tetris',
                title: 'Тетрис!',
                description: 'Очистите 4 линии одновременно',
                unlocked: false
            },
            score5000: {
                id: 'score5000',
                title: 'Опытный игрок',
                description: 'Наберите 5000 очков',
                unlocked: false
            },
            score10000: {
                id: 'score10000',
                title: 'Мастер',
                description: 'Наберите 10000 очков',
                unlocked: false
            },
            level5: {
                id: 'level5',
                title: 'Быстрые руки',
                description: 'Достигните 5 уровня',
                unlocked: false
            },
            level10: {
                id: 'level10',
                title: 'Скоростной',
                description: 'Достигните 10 уровня',
                unlocked: false
            },
            combo3: {
                id: 'combo3',
                title: 'Комбинатор',
                description: 'Очистите 3 линии подряд',
                unlocked: false
            },
            lines50: {
                id: 'lines50',
                title: 'Чистильщик',
                description: 'Очистите 50 линий',
                unlocked: false
            },
            lines100: {
                id: 'lines100',
                title: 'Уборщик',
                description: 'Очистите 100 линий',
                unlocked: false
            },
            perfectClear: {
                id: 'perfectClear',
                title: 'Идеальная чистота',
                description: 'Полностью очистите игровое поле',
                unlocked: false
            },
            speedDrop100: {
                id: 'speedDrop100',
                title: 'Падающая звезда',
                description: 'Используйте быстрое падение 100 раз',
                unlocked: false
            },
            rotation100: {
                id: 'rotation100',
                title: 'Гимнаст',
                description: 'Поверните фигуры 100 раз',
                unlocked: false
            },
            marathon30min: {
                id: 'marathon30min',
                title: 'Марафонец',
                description: 'Играйте 30 минут без перерыва',
                unlocked: false
            },
            noRotation: {
                id: 'noRotation',
                title: 'Прямолинейный',
                description: 'Наберите 1000 очков без вращения фигур',
                unlocked: false
            },
            allThemes: {
                id: 'allThemes',
                title: 'Дизайнер',
                description: 'Попробуйте все темы оформления',
                unlocked: false
            },
            nightPlayer: {
                id: 'nightPlayer',
                title: 'Ночной игрок',
                description: 'Играйте после полуночи',
                unlocked: false
            },
            morningPlayer: {
                id: 'morningPlayer',
                title: 'Ранняя пташка',
                description: 'Играйте до 6 утра',
                unlocked: false
            },
            weekendWarrior: {
                id: 'weekendWarrior',
                title: 'Воин выходного дня',
                description: 'Играйте 3 часа в выходной',
                unlocked: false
            },
            dedication: {
                id: 'dedication',
                title: 'Преданность',
                description: 'Играйте 7 дней подряд',
                unlocked: false
            }
        };
        
        this.loadAchievements();
    }

    checkAchievements(stats) {
        const { score, level, lines, linesCleared } = stats;
        let achievementsUnlocked = false;

        // Проверяем достижение "Тетрис!"
        if (linesCleared === 4 && !this.achievements.tetris.unlocked) {
            this.unlockAchievement('tetris');
            achievementsUnlocked = true;
        }

        // Проверяем достижение за очки
        if (score >= 1000 && !this.achievements.score1000.unlocked) {
            this.unlockAchievement('score1000');
            achievementsUnlocked = true;
        }

        // Проверяем достижение первой игры
        if (!this.achievements.firstGame.unlocked) {
            this.unlockAchievement('firstGame');
            achievementsUnlocked = true;
        }

        if (achievementsUnlocked) {
            this.saveAchievements();
        }
    }

    unlockAchievement(id) {
        if (this.achievements[id] && !this.achievements[id].unlocked) {
            this.achievements[id].unlocked = true;
            this.showNotification(this.achievements[id]);
            this.updateAchievementsList();
        }
    }

    showNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <h4>Достижение разблокировано!</h4>
            <p>${achievement.title}</p>
            <p>${achievement.description}</p>
        `;
        document.body.appendChild(notification);

        // Показываем уведомление
        setTimeout(() => notification.classList.add('show'), 100);

        // Скрываем и удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateAchievementsList() {
        const container = document.getElementById('achievementsList');
        if (!container) return;

        container.innerHTML = '';
        Object.values(this.achievements).forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement ${achievement.unlocked ? 'unlocked' : ''}`;
            achievementElement.innerHTML = `
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
            `;
            container.appendChild(achievementElement);
        });
    }

    loadAchievements() {
        const saved = localStorage.getItem('tetris-achievements');
        if (saved) {
            const savedAchievements = JSON.parse(saved);
            Object.keys(savedAchievements).forEach(id => {
                if (this.achievements[id]) {
                    this.achievements[id].unlocked = savedAchievements[id].unlocked;
                }
            });
        }
        this.updateAchievementsList();
    }

    saveAchievements() {
        localStorage.setItem('tetris-achievements', JSON.stringify(this.achievements));
    }
} 