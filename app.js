const state = {
    player: { hp: 150, maxHp: 150, atk: 700 },
    boss: { hp: 10000, maxHp: 10000, atk: 35, stunned: false },
    cooldowns: { rm: 0, ctrlc: 0 },
    isAnimating: false,
    gameOver: false
};

const ui = {
    prologue: document.getElementById('prologue'),
    prologueImg: document.getElementById('prologue-img'),
    prologueText: document.getElementById('prologue-text'),
    gameUI: document.getElementById('game-ui'),
    playerImg: document.getElementById('player-img'),
    bossImg: document.getElementById('boss-img'),
    playerHpBar: document.getElementById('player-hp-bar'),
    bossHpBar: document.getElementById('boss-hp-bar'),
    playerHpText: document.getElementById('player-hp-text'),
    bossHpText: document.getElementById('boss-hp-text'),
    bossStatus: document.getElementById('boss-status'),
    logArea: document.getElementById('log-area'),
    btns: {
        attack: document.getElementById('btn-attack'),
        rm: document.getElementById('btn-rm'),
        ctrlc: document.getElementById('btn-ctrlc'),
        heal: document.getElementById('btn-heal')
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function playAnimation(element, animClass) {
    element.style.animation = 'none';
    void element.offsetWidth;
    element.classList.add(animClass);
}

function addLog(text, type = 'sys') {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `> ${text}`;
    ui.logArea.appendChild(entry);
    ui.logArea.scrollTop = ui.logArea.scrollHeight;
}

function updateHP() {
    const pPercent = Math.max(0, (state.player.hp / state.player.maxHp) * 100);
    ui.playerHpBar.style.width = `${pPercent}%`;
    ui.playerHpText.textContent = `${state.player.hp}/${state.player.maxHp}`;
    ui.playerHpBar.style.backgroundColor = pPercent < 30 ? 'red' : pPercent < 60 ? 'orange' : '#0f0';

    const bPercent = Math.max(0, (state.boss.hp / state.boss.maxHp) * 100);
    ui.bossHpBar.style.width = `${bPercent}%`;
    ui.bossHpText.textContent = `${state.boss.hp}/${state.boss.maxHp}`;
    ui.bossHpBar.style.backgroundColor = bPercent < 30 ? 'red' : '#0f0';
}

function updateButtons() {
    ui.btns.rm.innerHTML = `sudo rm -rf /<br>(CD: ${state.cooldowns.rm})`;
    ui.btns.ctrlc.innerHTML = `Ctrl+C (中斷)<br>(CD: ${state.cooldowns.ctrlc})`;

    ui.btns.rm.disabled = state.cooldowns.rm > 0 || state.isAnimating || state.gameOver;
    ui.btns.ctrlc.disabled = state.cooldowns.ctrlc > 0 || state.isAnimating || state.gameOver;
    ui.btns.attack.disabled = state.isAnimating || state.gameOver;
    ui.btns.heal.disabled = state.isAnimating || state.gameOver;
}

async function typeWriter(text, element, speed = 40) {
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
        element.textContent += text.charAt(i);
        await sleep(speed);
    }
}

async function startPrologue() {
    // 換上新的五條悟 raw 圖片
    ui.prologueImg.src = "https://raw.githubusercontent.com/hzy0213/2d/main/%E4%B8%8B%E8%BC%89.png";
    ui.prologueImg.style.transform = "scaleX(-1)";
    ui.prologueImg.style.filter = "drop-shadow(0 0 10px #0f0)";
    ui.prologueImg.style.opacity = "1";

    await typeWriter("init system...\n23:42 PM - 依舊是平常寫程式的夜晚。\n你正在編寫全新的無下限運算邏輯...", ui.prologueText, 50);
    await sleep(1500);

    ui.prologueImg.style.opacity = "0";
    await sleep(1000);

    // 換上新的利姆路 raw 圖片
    ui.prologueImg.src = "https://raw.githubusercontent.com/hzy0213/2d/main/%E4%B8%8B%E8%BC%89%20(1).png";
    ui.prologueImg.style.transform = "none";
    ui.prologueImg.style.filter = "drop-shadow(0 0 20px #ff003c)";
    ui.prologueImg.style.opacity = "1";

    ui.prologue.style.backgroundColor = "#110000";
    await typeWriter("Warning: Unknown process detected.\n惡意代碼「暴食者」入侵系統。防禦協議崩潰。\n準備迎戰...", ui.prologueText, 40);
    await sleep(2000);

    ui.prologue.style.display = 'none';
    ui.gameUI.style.display = 'flex';
    updateButtons();
}

async function playerAction(actionType) {
    if (state.isAnimating || state.gameOver) return;
    state.isAnimating = true;
    updateButtons(); 

    let damage = 0;
    let actionName = "";

    switch(actionType) {
        case 'attack':
            actionName = "std::attack()";
            damage = Math.floor(state.player.atk * (0.9 + Math.random() * 0.2)); 
            break;
        case 'rm':
            actionName = "sudo rm -rf /";
            damage = Math.floor(state.player.atk * 3); 
            state.cooldowns.rm = 2 + 1; 
            break;
        case 'ctrlc':
            actionName = "Ctrl+C (中斷)";
            damage = Math.floor(state.player.atk * 0.2); 
            state.boss.stunned = true;
            state.cooldowns.ctrlc = 3 + 1;
            ui.bossStatus.textContent = "[ STATUS: STUNNED ]";
            break;
        case 'heal':
            actionName = "debug_heal()";
            const healAmount = 60;
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + healAmount);
            addLog(`執行 ${actionName}，恢復了 ${healAmount} 點 HP。`, 'heal');
            updateHP();
            await sleep(500);
            break;
    }

    if (actionType !== 'heal') {
        addLog(`執行 ${actionName}...`, 'sys');
        playAnimation(ui.playerImg, 'anim-dash-player');
        await sleep(150); 
        
        state.boss.hp = Math.max(0, state.boss.hp - damage);
        playAnimation(ui.bossImg, 'anim-glitch');
        addLog(`進程遭受重擊，造成 ${damage} 點傷害！`, 'dmg');
        updateHP();
        await sleep(600); 
    }

    if (state.cooldowns.rm > 0) state.cooldowns.rm--;
    if (state.cooldowns.ctrlc > 0) state.cooldowns.ctrlc--;

    if (state.boss.hp <= 0) {
        addLog(`PROCESS_TERMINATED. 惡意代碼已被清除。`, 'sys');
        playAnimation(ui.bossImg, 'anim-death');
        state.gameOver = true;
        updateButtons();
        return;
    }

    await sleep(800);
    await bossTurn();
}

async function bossTurn() {
    if (state.gameOver) return;

    if (state.boss.stunned) {
        addLog(`對手處於 [中斷] 狀態，無法執行指令...`, 'sys');
        state.boss.stunned = false;
        ui.bossStatus.textContent = "";
        await sleep(1000);
    } else {
        addLog(`惡意進程發起攻擊...`, 'sys');
        
        playAnimation(ui.bossImg, 'anim-dash-boss');
        await sleep(150);

        const damage = Math.floor(state.boss.atk * (0.8 + Math.random() * 0.4));
        state.player.hp = Math.max(0, state.player.hp - damage);
        
        playAnimation(ui.playerImg, 'anim-glitch');
        document.body.style.filter = "invert(0.2)"; 
        setTimeout(() => document.body.style.filter = "none", 100);

        addLog(`警告：核心防禦受損，受到 ${damage} 點傷害！`, 'dmg');
        updateHP();
        await sleep(600);

        if (state.player.hp <= 0) {
            addLog(`SYSTEM FAILURE. 核心權限已被剝奪。`, 'dmg');
            playAnimation(ui.playerImg, 'anim-death');
            state.gameOver = true;
        }
    }

    state.isAnimating = false;
    updateButtons();
}

window.onload = () => {
    startPrologue();
};