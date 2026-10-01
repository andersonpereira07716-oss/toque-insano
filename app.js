const screens = {
    menu: document.getElementById('screen-menu'),
    store: document.getElementById('screen-store'),
    how: document.getElementById('screen-how'),
    game: document.getElementById('screen-game'),
    gameover: document.getElementById('screen-gameover')
};

const scoreEl = document.getElementById('current-score');
const livesEl = document.getElementById('current-lives');
const timeBar = document.getElementById('time-bar');
const gameArea = document.getElementById('game-area');
const target = document.getElementById('target');
const finalScoreEl = document.getElementById('final-score');
const finalHighScoreEl = document.getElementById('final-high-score');
const menuHighScoreEl = document.getElementById('menu-high-score');
const newRecordAlert = document.getElementById('new-record-alert');
const vipStatusText = document.getElementById('vip-status-text');

let score = 0;
let lives = 3;
let highScore = localStorage.getItem('toque_insano_highscore') || 0;
let isVip = localStorage.getItem('toque_insano_vip') === 'true';
let gameInterval = null;
let timeLeft = 100;
let decreaseRate = 1.5;
let targetSize = 70;

menuHighScoreEl.textContent = highScore;
updateVipUI();

// Eventos de Navegação
document.getElementById('btn-play').addEventListener('click', () => switchScreen('game'));
document.getElementById('btn-store').addEventListener('click', () => switchScreen('store'));
document.getElementById('btn-howtoplay').addEventListener('click', () => switchScreen('how'));
document.getElementById('btn-back-store').addEventListener('click', () => switchScreen('menu'));
document.getElementById('btn-back-menu').addEventListener('click', () => switchScreen('menu'));
document.getElementById('btn-menu').addEventListener('click', () => switchScreen('menu'));
document.getElementById('btn-restart').addEventListener('click', () => switchScreen('game'));

// Ativação Pix com o seu link real do Mercado Pago
document.getElementById('btn-buy-pix').addEventListener('click', () => {
    // Abre o seu link de pagamento do Mercado Pago
    window.open('https://mpago.la/2J3xUR3', '_blank');
    
    // Ativa o benefício VIP no dispositivo do jogador
    localStorage.setItem('toque_insano_vip', 'true');
    isVip = true;
    updateVipUI();
    alert("Parabéns! Conta VIP ativada com sucesso.");
});

function updateVipUI() {
    if (isVip) {
        vipStatusText.textContent = "✨ Status: CONTA VIP ATIVA (Sem Anúncios)";
    } else {
        vipStatusText.textContent = "✨ Status: Conta Gratuita (Com Anúncios)";
    }
}

function switchScreen(screenName) {
    Object.keys(screens).forEach(key => {
        screens[key].classList.remove('active');
    });
    screens[screenName].classList.add('active');
    
    if (screenName === 'game') {
        startGame();
    } else {
        stopGame();
    }
}

function startGame() {
    score = 0;
    // Se for VIP, ganha 1 vida bônus extra como vantagem freemium!
    lives = isVip ? 4 : 3;
    decreaseRate = 1.5;
    targetSize = 70;
    updateUI();
    target.classList.remove('hidden');
    spawnTarget();
    startTimer();
}

function stopGame() {
    clearInterval(gameInterval);
    target.classList.add('hidden');
}

function updateUI() {
    scoreEl.textContent = score;
    livesEl.textContent = '❤️ '.repeat(lives).trim();
}

function spawnTarget() {
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;
    
    target.style.width = `${targetSize}px`;
    target.style.height = `${targetSize}px`;
    
    const margin = targetSize / 2 + 10;
    const randomX = Math.floor(Math.random() * (areaWidth - margin * 2)) + margin;
    const randomY = Math.floor(Math.random() * (areaHeight - margin * 2)) + margin;
    
    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;
    
    timeLeft = 100;
}

function startTimer() {
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        timeLeft -= decreaseRate;
        timeBar.style.transform = `scaleX(${Math.max(timeLeft, 0) / 100})`;
        
        if (timeLeft <= 0) {
            handleMiss();
        }
    }, 50);
}

target.addEventListener('click', (e) => {
    e.stopPropagation();
    score += 100;
    updateUI();
    
    if (navigator.vibrate) {
        navigator.vibrate(40);
    }
    
    createParticles(e.clientX, e.clientY);
    
    decreaseRate += 0.08;
    if (targetSize > 35) {
        targetSize -= 2;
    }
    
    spawnTarget();
});

gameArea.addEventListener('click', (e) => {
    if (navigator.vibrate) {
        navigator.vibrate([60, 60, 60]);
    }
    handleMiss();
});

function createParticles(x, y) {
    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const rect = gameArea.getBoundingClientRect();
        particle.style.left = `${x - rect.left}px`;
        particle.style.top = `${y - rect.top}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 20;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        
        gameArea.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 400);
    }
}

function handleMiss() {
    lives--;
    updateUI();
    
    if (lives <= 0) {
        endGame();
    } else {
        spawnTarget();
    }
}

function endGame() {
    stopGame();
    
    if (!isVip) {
        console.log("Exibindo anúncio intersticial para utilizador Free...");
    }
    
    finalScoreEl.textContent = score;
    finalHighScoreEl.textContent = highScore;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('toque_insano_highscore', highScore);
        finalHighScoreEl.textContent = highScore;
        menuHighScoreEl.textContent = highScore;
        newRecordAlert.classList.remove('hidden');
    } else {
        newRecordAlert.classList.add('hidden');
    }
    
    switchScreen('gameover');
}
