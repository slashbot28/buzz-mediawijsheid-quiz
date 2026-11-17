/**
 * Hoofdapplicatie voor BUZZ! Mediawijsheid TV-Quiz Show
 */
(() => {
  const CHARACTERS = [
    { id: 'sonic', name: 'Sonic', src: 'img/chars/sonic.png' },
    { id: 'mario', name: 'Mario', src: 'img/chars/mario.png' },
    { id: 'luigi', name: 'Luigi', src: 'img/chars/luigi.png' },
    { id: 'peach', name: 'Peach', src: 'img/chars/peach.png' },
    { id: 'wario', name: 'Wario', src: 'img/chars/wario.png' },
    { id: 'waluigi', name: 'Waluigi', src: 'img/chars/waluigi.png' },
    { id: 'bowser', name: 'Bowser', src: 'img/chars/bowser.png' },
    { id: 'cat-3', name: 'Kapitein Kat', src: 'img/chars/cat-3.png' },
    { id: 'cat-4', name: 'Boekenkat', src: 'img/chars/cat-4.png' },
    { id: 'cat-5', name: 'Knuffelkat', src: 'img/chars/cat-5.png' },
    { id: 'cat-6', name: 'Avonturier', src: 'img/chars/cat-6.png' },
    { id: 'cat-7', name: 'Koning Kat', src: 'img/chars/cat-7.png' },
    { id: 'cat-8', name: 'Slaapmuts', src: 'img/chars/cat-8.png' },
    { id: 'cat-9', name: 'Cool Kat', src: 'img/chars/cat-9.png' },
    { id: 'cat-10', name: 'Skibril Kat', src: 'img/chars/cat-10.png' },
    { id: 'cat-11', name: 'Vuurkat', src: 'img/chars/cat-11.png' },
    { id: 'cat-12', name: 'Choco Kat', src: 'img/chars/cat-12.png' },
    { id: 'cat-13', name: 'Superheld Kat', src: 'img/chars/cat-13.png' },
    { id: 'cat-14', name: 'Poederkat', src: 'img/chars/cat-14.png' },
    { id: 'cat-15', name: 'Prof. Brilkat', src: 'img/chars/cat-15.png' }
  ];

  const TEAM_NAME_PRESETS = [
    'TEAM Mario',
    'Team Sonic',
    'TEAM Luigi',
    'Team Peach',
    'Team Wario',
    'Team Waluigi',
    'Team Bowser',
    'De Superkatten',
    'De Snelle Vossen',
    'De Raketjes',
    'De Slimme Uilen',
    'De Gouden Leeuwen',
    'De Ninja Panda’s',
    'De Bliksem Bende',
    'De Speurneuzen',
    'De Kampioentjes'
  ];

  const DEFAULT_CHAR_INDICES = [1, 0, 2, 3]; // Mario, Sonic, Luigi, Peach
  const PLAYER_COLORS = [
    { ring: 'border-sky-400', bg: 'bg-sky-500/20', text: 'text-sky-300', badge: 'bg-sky-500' },
    { ring: 'border-orange-400', bg: 'bg-orange-500/20', text: 'text-orange-300', badge: 'bg-orange-500' },
    { ring: 'border-emerald-400', bg: 'bg-emerald-500/20', text: 'text-emerald-300', badge: 'bg-emerald-500' },
    { ring: 'border-yellow-400', bg: 'bg-yellow-500/20', text: 'text-yellow-300', badge: 'bg-yellow-500' }
  ];
  const OPTION_KEYS = ['blue', 'orange', 'green', 'yellow'];

  const state = {
    screen: 'lobby', // 'lobby' | 'roundIntro' | 'quiz' | 'finale'
    playerCount: 4,
    players: Array.from({ length: 4 }, (_, i) => ({
      id: i,
      name: TEAM_NAME_PRESETS[i],
      char: CHARACTERS[DEFAULT_CHAR_INDICES[i]],
      score: 0,
      streak: 0,
      lastDelta: 0,
      answer: null,
      answerTime: 0,
      buzzedReady: false
    })),
    pickingCharForPlayer: null,
    selectedCategory: 'mix',
    selectedMode: 'show', // 'quick' (6) | 'show' (9) | 'marathon' (12)
    questionTimePreset: 15, // 15 | 30 (1e graad) | 0 (geen limiet)
    deck: [],
    currentIndex: 0,
    currentRoundType: 'builder', // 'builder' | 'fastest' | 'finale'
    phase: 'idle', // 'waitingBuzz' | 'answering' | 'revealed'
    activeBuzzPlayer: null,
    timeLeft: 15,
    maxTime: 15,
    timerId: null,
    lastRoundIntroShown: null
  };

  function renderAvatarHtml(charObj, sizeClass = 'w-11 h-11') {
    return `<img src="${charObj.src}" alt="${charObj.name}" class="${sizeClass} object-contain drop-shadow-md select-none pointer-events-none" />`;
  }

  /* ==================== DOM ELEMENTEN ==================== */
  const el = {
    screens: {
      lobby: document.getElementById('screenLobby'),
      roundIntro: document.getElementById('screenRoundIntro'),
      quiz: document.getElementById('screenQuiz'),
      finale: document.getElementById('screenFinale')
    },
    buzzerStatusDot: document.getElementById('buzzerStatusDot'),
    buzzerStatusText: document.getElementById('buzzerStatusText'),
    btnConnectBuzzers: document.getElementById('btnConnectBuzzers'),
    btnHeaderHome: document.getElementById('btnHeaderHome'),
    btnOpenTestModal: document.getElementById('btnOpenTestModal'),
    btnToggleVoice: document.getElementById('btnToggleVoice'),
    btnToggleMute: document.getElementById('btnToggleMute'),
    btnFullscreen: document.getElementById('btnFullscreen'),

    lobbyPlayersGrid: document.getElementById('lobbyPlayersGrid'),
    categoryList: document.getElementById('categoryList'),
    btnStartGame: document.getElementById('btnStartGame'),

    roundIntroIcon: document.getElementById('roundIntroIcon'),
    roundIntroLabel: document.getElementById('roundIntroLabel'),
    roundIntroTitle: document.getElementById('roundIntroTitle'),
    roundIntroDesc: document.getElementById('roundIntroDesc'),
    btnContinueRound: document.getElementById('btnContinueRound'),
    btnRoundIntroHome: document.getElementById('btnRoundIntroHome'),

    quizRoundBadge: document.getElementById('quizRoundBadge'),
    quizTopicBadge: document.getElementById('quizTopicBadge'),
    quizCounter: document.getElementById('quizCounter'),
    quizTimerText: document.getElementById('quizTimerText'),
    quizTimerBar: document.getElementById('quizTimerBar'),
    fastestFingerBanner: document.getElementById('fastestFingerBanner'),
    fastestFingerText: document.getElementById('fastestFingerText'),
    quizQuestionText: document.getElementById('quizQuestionText'),
    quizOptionsGrid: document.getElementById('quizOptionsGrid'),
    quizRevealBox: document.getElementById('quizRevealBox'),
    quizExplanationText: document.getElementById('quizExplanationText'),
    btnNextQuestion: document.getElementById('btnNextQuestion'),
    quizPodiumsGrid: document.getElementById('quizPodiumsGrid'),
    btnQuitQuiz: document.getElementById('btnQuitQuiz'),

    finaleWinnerText: document.getElementById('finaleWinnerText'),
    finaleLeaderboard: document.getElementById('finaleLeaderboard'),
    btnPlayAgain: document.getElementById('btnPlayAgain'),
    btnBackToLobby: document.getElementById('btnBackToLobby'),

    modalBuzzerTest: document.getElementById('modalBuzzerTest'),
    btnCloseTestModal: document.getElementById('btnCloseTestModal'),
    btnModalConnectSony: document.getElementById('btnModalConnectSony'),
    btnModalConnectAll: document.getElementById('btnModalConnectAll'),
    btnModalTestLeds: document.getElementById('btnModalTestLeds'),
    virtualHandsetsGrid: document.getElementById('virtualHandsetsGrid'),

    modalCharacterPicker: document.getElementById('modalCharacterPicker'),
    charPickerTitle: document.getElementById('charPickerTitle'),
    charPickerGrid: document.getElementById('charPickerGrid'),
    btnCloseCharModal: document.getElementById('btnCloseCharModal')
  };

  /* ==================== SCREEN NAVIGATION ==================== */
  function showScreen(name) {
    state.screen = name;
    Object.entries(el.screens).forEach(([key, node]) => {
      node.classList.toggle('hidden', key !== name);
    });
    if (el.btnHeaderHome) {
      el.btnHeaderHome.classList.toggle('hidden', name === 'lobby');
    }
  }

  function goToMainMenu() {
    clearInterval(state.timerId);
    window.BuzzSound.stopSpeech();
    window.BuzzDriver.setLeds([false, false, false, false]);
    showScreen('lobby');
  }

  /* ==================== LOBBY RENDERING ==================== */
  function renderLobbyPlayers() {
    document.querySelectorAll('.player-count-btn').forEach((btn) => {
      const count = Number(btn.dataset.playerCount);
      const active = count === state.playerCount;
      btn.className = `player-count-btn px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
        active ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
      }`;
    });

    el.lobbyPlayersGrid.innerHTML = '';
    for (let i = 0; i < state.playerCount; i++) {
      const p = state.players[i];
      const theme = PLAYER_COLORS[i];
      const card = document.createElement('div');
      card.className = `p-4 rounded-2xl border-2 transition flex flex-col justify-between ${
        p.buzzedReady ? 'border-red-400 bg-red-500/15 shadow-lg shadow-red-500/20' : `${theme.ring} ${theme.bg}`
      }`;

      card.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-black uppercase tracking-wider ${theme.text}">Buzzer ${i + 1} • ${p.char.name}</span>
          <span class="text-xs font-bold ${p.buzzedReady ? 'text-red-300 animate-pulse' : 'text-slate-400'}">
            ${p.buzzedReady ? '🔴 INGEZET!' : 'Wacht op buzz...'}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" data-avatar-idx="${i}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950/75 border-2 border-white/20 flex items-center justify-center hover:scale-105 hover:border-amber-400 transition cursor-pointer shrink-0 p-1.5" title="Klik om een ander character te kiezen">
            ${renderAvatarHtml(p.char, 'w-full h-full')}
          </button>
          <input type="text" data-name-idx="${i}" value="${p.name}" maxlength="20"
            class="flex-1 min-w-0 bg-slate-950/70 border border-white/15 rounded-xl px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400" />
          <button type="button" data-rand-name-idx="${i}" class="w-10 h-10 rounded-xl bg-slate-950/70 border border-white/15 hover:border-amber-400 text-lg flex items-center justify-center transition cursor-pointer shrink-0" title="Kies een andere teamnaam">
            🎲
          </button>
        </div>
      `;
      el.lobbyPlayersGrid.appendChild(card);
    }

    el.lobbyPlayersGrid.querySelectorAll('[data-avatar-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        openCharacterPicker(Number(btn.dataset.avatarIdx));
      });
    });

    el.lobbyPlayersGrid.querySelectorAll('[data-rand-name-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.randNameIdx);
        const curName = state.players[idx].name;
        const curPos = TEAM_NAME_PRESETS.indexOf(curName);
        const nextPos = curPos >= 0 ? (curPos + 1) % TEAM_NAME_PRESETS.length : Math.floor(Math.random() * TEAM_NAME_PRESETS.length);
        state.players[idx].name = TEAM_NAME_PRESETS[nextPos];
        renderLobbyPlayers();
      });
    });

    el.lobbyPlayersGrid.querySelectorAll('[data-name-idx]').forEach((inp) => {
      inp.addEventListener('input', () => {
        const idx = Number(inp.dataset.nameIdx);
        state.players[idx].name = inp.value || TEAM_NAME_PRESETS[idx];
      });
    });
  }

  function openCharacterPicker(playerIdx) {
    state.pickingCharForPlayer = playerIdx;
    const p = state.players[playerIdx];
    el.charPickerTitle.textContent = `Kies character voor ${p.name}`;
    el.charPickerGrid.innerHTML = '';

    CHARACTERS.forEach((ch) => {
      const selected = p.char.id === ch.id;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition cursor-pointer ${
        selected
          ? 'border-amber-400 bg-amber-400/20 shadow-lg shadow-amber-500/20 scale-[1.03]'
          : 'border-white/10 bg-slate-950/70 hover:border-white/35 hover:bg-slate-800/70'
      }`;
      btn.innerHTML = `
        ${renderAvatarHtml(ch, 'w-20 h-20')}
        <span class="text-xs font-bold text-slate-200 truncate w-full text-center">${ch.name}</span>
      `;
      btn.addEventListener('click', () => {
        state.players[playerIdx].char = ch;
        el.modalCharacterPicker.classList.add('hidden');
        renderLobbyPlayers();
      });
      el.charPickerGrid.appendChild(btn);
    });

    el.modalCharacterPicker.classList.remove('hidden');
  }

  function renderCategories() {
    el.categoryList.innerHTML = '';
    window.BUZZ_CATEGORIES.forEach((cat) => {
      const selected = cat.id === state.selectedCategory;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `w-full text-left p-3 rounded-2xl border-2 transition flex items-center gap-3 cursor-pointer ${
        selected
          ? 'border-amber-400 bg-amber-400/15 shadow-lg shadow-amber-500/10'
          : 'border-white/10 bg-slate-950/50 hover:border-white/25'
      }`;
      btn.innerHTML = `
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl shrink-0 shadow">
          ${cat.icon}
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-heading font-bold text-sm sm:text-base text-white truncate">${cat.title}</div>
          <div class="text-xs text-slate-400 truncate">${cat.subtitle}</div>
        </div>
        ${selected ? '<span class="text-amber-400 font-black text-lg">✓</span>' : ''}
      `;
      btn.addEventListener('click', () => {
        state.selectedCategory = cat.id;
        // Voor 1e graad automatisch extra denktijd (30s) inschakelen
        if (cat.id === 'media-1') {
          state.questionTimePreset = 30;
        } else if (state.questionTimePreset === 30) {
          state.questionTimePreset = 15;
        }
        renderCategories();
        renderTimeButtons();
      });
      el.categoryList.appendChild(btn);
    });
  }

  function renderTimeButtons() {
    document.querySelectorAll('.time-btn').forEach((btn) => {
      const val = Number(btn.dataset.timePreset);
      const active = val === state.questionTimePreset;
      btn.className = `time-btn px-2 py-2 rounded-xl border-2 text-center transition cursor-pointer ${
        active
          ? 'border-amber-400 bg-amber-400/20 text-amber-200'
          : 'border-white/10 bg-slate-950/50 text-slate-300 hover:border-white/25'
      }`;
    });
  }

  function renderModeButtons() {
    document.querySelectorAll('.mode-btn').forEach((btn) => {
      const active = btn.dataset.mode === state.selectedMode;
      btn.className = `mode-btn px-2 py-2.5 rounded-xl border-2 text-center transition cursor-pointer ${
        active
          ? 'border-amber-400 bg-amber-400/20 text-amber-200'
          : 'border-white/10 bg-slate-950/50 text-slate-300 hover:border-white/25'
      }`;
    });
  }

  /* ==================== QUIZ DECK & ROUNDS ==================== */
  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildDeck() {
    let pool =
      state.selectedCategory === 'mix'
        ? [...window.BUZZ_QUESTIONS]
        : window.BUZZ_QUESTIONS.filter((q) => q.category === state.selectedCategory);

    pool = shuffle(pool);
    const total = state.selectedMode === 'quick' ? 6 : state.selectedMode === 'marathon' ? 12 : 9;
    return pool.slice(0, Math.min(total, pool.length));
  }

  function getRoundForIndex(idx, total) {
    if (state.selectedMode === 'quick') {
      return { type: 'builder', num: 1, title: 'Punten Bouwer', icon: '⚡', desc: 'Iedereen antwoordt tegelijk! Kies Blauw, Oranje, Groen of Geel.' };
    }
    const perRound = Math.ceil(total / 3);
    if (idx < perRound) {
      return {
        type: 'builder',
        num: 1,
        title: 'Punten Bouwer',
        icon: '⚡',
        desc: 'Iedereen antwoordt tegelijk met de 4 gekleurde knoppen! Hoe sneller je bent, hoe meer bonuspunten je verdient.'
      };
    }
    if (idx < perRound * 2) {
      return {
        type: 'fastest',
        num: 2,
        title: 'Snelste Vinger!',
        icon: '🔴',
        desc: 'Druk zo snel mogelijk op de GROTE RODE BUZZER om de beurt te claimen! Goed antwoord = +300 punten, fout = -150 punten!'
      };
    }
    return {
      type: 'finale',
      num: 3,
      title: 'De Grote Finale!',
      icon: '🔥',
      desc: 'Alle remmen los! Iedereen antwoordt tegelijk voor DUBBELE PUNTEN (tot wel +500 per vraag)!'
    };
  }

  function startGame() {
    state.deck = buildDeck();
    state.currentIndex = 0;
    state.lastRoundIntroShown = null;
    state.players.forEach((p) => {
      p.score = 0;
      p.streak = 0;
      p.lastDelta = 0;
      p.answer = null;
      p.buzzedReady = false;
    });

    prepareNextStep();
  }

  function prepareNextStep() {
    if (state.currentIndex >= state.deck.length) {
      showFinale();
      return;
    }

    const roundInfo = getRoundForIndex(state.currentIndex, state.deck.length);
    state.currentRoundType = roundInfo.type;

    if (state.lastRoundIntroShown !== roundInfo.num) {
      state.lastRoundIntroShown = roundInfo.num;
      showRoundIntro(roundInfo);
    } else {
      loadQuestion();
    }
  }

  function showRoundIntro(info) {
    showScreen('roundIntro');
    el.roundIntroIcon.textContent = info.icon;
    el.roundIntroLabel.textContent = `RONDE ${info.num}`;
    el.roundIntroTitle.textContent = info.title;
    el.roundIntroDesc.textContent = info.desc;
    window.BuzzSound.playRoundIntro();
    window.BuzzSound.speak(`Ronde ${info.num}: ${info.title}. ${info.desc}`);
    window.BuzzDriver.setLeds([true, true, true, true]);
  }

  function loadQuestion() {
    showScreen('quiz');
    clearInterval(state.timerId);

    const q = state.deck[state.currentIndex];
    const roundInfo = getRoundForIndex(state.currentIndex, state.deck.length);

    state.players.forEach((p) => {
      p.answer = null;
      p.answerTime = 0;
      p.lastDelta = 0;
    });

    state.activeBuzzPlayer = null;
    const baseTime =
      state.questionTimePreset === 0
        ? 0
        : q.category === 'media-1' && state.questionTimePreset < 25
        ? 25
        : state.questionTimePreset;
    state.maxTime = baseTime;
    state.timeLeft = baseTime;
    state.phase = state.currentRoundType === 'fastest' ? 'waitingBuzz' : 'answering';

    el.quizRoundBadge.textContent = `Ronde ${roundInfo.num} • ${roundInfo.title}`;
    el.quizTopicBadge.textContent = q.badge;
    el.quizCounter.textContent = `Vraag ${state.currentIndex + 1} / ${state.deck.length}`;
    el.quizQuestionText.textContent = q.question;
    el.quizRevealBox.classList.add('hidden');

    if (state.currentRoundType === 'fastest') {
      el.fastestFingerBanner.classList.remove('hidden');
      el.fastestFingerText.textContent = '🔴 DRUK ZO SNEL MOGELIJK OP DE RODE BUZZER!';
    } else {
      el.fastestFingerBanner.classList.add('hidden');
    }

    const optionButtons = el.quizOptionsGrid.querySelectorAll('.buzz-btn');
    optionButtons.forEach((btn, idx) => {
      btn.classList.remove('is-correct', 'is-dimmed', 'is-pressed');
      btn.disabled = false;
      btn.querySelector('.opt-label').textContent = q.options[idx];
    });

    renderQuizPodiums();
    updateTimerUI();
    window.BuzzDriver.setLeds(
      Array.from({ length: 4 }, (_, i) => i < state.playerCount)
    );

    window.BuzzSound.speak(q.question);

    if (state.maxTime > 0) {
      state.timerId = setInterval(() => {
        state.timeLeft = Math.max(0, state.timeLeft - 1);
        updateTimerUI();

        if (state.timeLeft <= 4 && state.timeLeft > 0) {
          window.BuzzSound.playTick(true);
        } else if (state.timeLeft > 4) {
          window.BuzzSound.playTick(false);
        }

        if (state.timeLeft <= 0) {
          clearInterval(state.timerId);
          revealAnswer();
        }
      }, 1000);
    }
  }

  function updateTimerUI() {
    if (state.maxTime === 0) {
      el.quizTimerText.textContent = '∞';
      el.quizTimerBar.style.width = '100%';
      return;
    }
    el.quizTimerText.textContent = state.timeLeft;
    const pct = (state.timeLeft / state.maxTime) * 100;
    el.quizTimerBar.style.width = `${pct}%`;
  }

  function renderQuizPodiums(revealed = false, correctIdx = null) {
    el.quizPodiumsGrid.innerHTML = '';
    for (let i = 0; i < state.playerCount; i++) {
      const p = state.players[i];
      const theme = PLAYER_COLORS[i];
      const isBuzzed = state.activeBuzzPlayer === i;

      let stateClass = '';
      if (isBuzzed && !revealed) stateClass = 'active-buzz';
      else if (!revealed && p.answer !== null) stateClass = 'answered';
      else if (revealed && p.answer !== null) {
        stateClass = p.answer === correctIdx ? 'correct-podium' : 'wrong-podium';
      }

      let statusText = 'Wacht...';
      if (state.currentRoundType === 'fastest' && !revealed) {
        statusText = isBuzzed ? '🎤 MAG ANTWOORDEN!' : state.activeBuzzPlayer !== null ? 'Geblokkeerd' : 'Druk Rood!';
      } else if (!revealed) {
        statusText = p.answer !== null ? '✓ Geantwoord' : 'Kies kleur...';
      } else {
        if (p.lastDelta > 0) statusText = `+${p.lastDelta} ptn! 🎉`;
        else if (p.lastDelta < 0) statusText = `${p.lastDelta} ptn 😬`;
        else statusText = 'Geen punten';
      }

      const card = document.createElement('div');
      card.className = `podium-card rounded-2xl p-3 flex flex-col gap-1.5 ${stateClass}`;
      card.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            ${renderAvatarHtml(p.char, 'w-16 h-16 sm:w-20 sm:h-20 shrink-0')}
            <span class="font-heading font-bold text-sm sm:text-base text-white truncate">${p.name}</span>
          </div>
          <span class="w-3 h-3 rounded-full ${theme.badge} shrink-0"></span>
        </div>
        <div class="flex items-baseline justify-between gap-2 mt-1">
          <span class="font-display font-black text-2xl text-amber-300">${p.score}</span>
          <span class="text-xs font-bold ${p.lastDelta > 0 ? 'text-emerald-400' : p.lastDelta < 0 ? 'text-rose-400' : 'text-slate-300'}">${statusText}</span>
        </div>
      `;
      el.quizPodiumsGrid.appendChild(card);
    }
  }

  /* ==================== BUZZER & ANTWOORD LOGICA ==================== */
  function handlePlayerButton(playerIndex, button) {
    const intro = document.getElementById('screenIntro');
    if (intro && !intro.classList.contains('hidden')) return;
    if (playerIndex >= state.playerCount) return;

    // Lobby: druk Rood om "klaar" te melden
    if (state.screen === 'lobby') {
      if (button === 'red') {
        state.players[playerIndex].buzzedReady = true;
        window.BuzzSound.playBuzzer(playerIndex);
        renderLobbyPlayers();
        window.BuzzDriver.setLeds(state.players.map((p) => p.buzzedReady));
      }
      return;
    }

    // Round intro: druk Rood om door te gaan
    if (state.screen === 'roundIntro') {
      if (button === 'red') {
        loadQuestion();
      }
      return;
    }

    // Quiz stage
    if (state.screen !== 'quiz') return;

    if (state.phase === 'revealed') {
      if (button === 'red') {
        goToNextQuestion();
      }
      return;
    }

    // Ronde 2: Snelste Vinger - eerst Rood drukken!
    if (state.phase === 'waitingBuzz') {
      if (button === 'red') {
        state.activeBuzzPlayer = playerIndex;
        state.phase = 'answering';
        const q = state.deck[state.currentIndex];
        const answerSecs =
          state.questionTimePreset === 0
            ? 0
            : state.questionTimePreset >= 30 || (q && q.category === 'media-1')
            ? 15
            : 8;
        state.maxTime = answerSecs;
        state.timeLeft = answerSecs;
        updateTimerUI();
        window.BuzzSound.playBuzzer(playerIndex);

        const p = state.players[playerIndex];
        el.fastestFingerText.textContent = `⚡ ${p.name} (${p.char.name}) HEEFT GEBUZZT! Kies snel een kleur!`;

        // Alleen de rode LED van de snelste speler blijft branden
        window.BuzzDriver.setLeds([0, 1, 2, 3].map((i) => i === playerIndex));
        renderQuizPodiums();
      }
      return;
    }

    // Antwoordkeuze (Blauw, Oranje, Groen, Geel)
    if (state.phase === 'answering') {
      const optIdx = OPTION_KEYS.indexOf(button);
      if (optIdx === -1) return;

      if (state.currentRoundType === 'fastest') {
        if (playerIndex !== state.activeBuzzPlayer) return;
        state.players[playerIndex].answer = optIdx;
        state.players[playerIndex].answerTime = state.timeLeft;
        window.BuzzSound.playOptionClick();
        clearInterval(state.timerId);
        revealAnswer();
        return;
      }

      // Punten Bouwer / Finale: iedere speler kan 1x antwoorden
      const p = state.players[playerIndex];
      if (p.answer !== null) return;
      p.answer = optIdx;
      p.answerTime = state.timeLeft;
      window.BuzzSound.playOptionClick();

      // Zet LED uit zodra speler geantwoord heeft
      const leds = Array.from({ length: 4 }, (_, i) => i < state.playerCount && state.players[i].answer === null);
      window.BuzzDriver.setLeds(leds);
      renderQuizPodiums();

      // Als alle spelers geantwoord hebben, direct onthullen!
      const allAnswered = state.players.slice(0, state.playerCount).every((pl) => pl.answer !== null);
      if (allAnswered) {
        clearInterval(state.timerId);
        setTimeout(revealAnswer, 350);
      }
    }
  }

  function revealAnswer() {
    if (state.phase === 'revealed') return;
    state.phase = 'revealed';
    window.BuzzSound.stopSpeech();

    const q = state.deck[state.currentIndex];
    const correctIdx = q.correct;
    let anyoneCorrect = false;

    for (let i = 0; i < state.playerCount; i++) {
      const p = state.players[i];
      if (p.answer === null) {
        p.streak = 0;
        p.lastDelta = 0;
        continue;
      }

      if (p.answer === correctIdx) {
        anyoneCorrect = true;
        p.streak += 1;
        let pts = 150 + p.answerTime * 8;
        if (state.currentRoundType === 'fastest') pts = 300;
        if (state.currentRoundType === 'finale') pts = (150 + p.answerTime * 10) * 2;
        p.score += pts;
        p.lastDelta = pts;
      } else {
        p.streak = 0;
        if (state.currentRoundType === 'fastest') {
          const penalty = -150;
          p.score = Math.max(0, p.score + penalty);
          p.lastDelta = penalty;
        } else {
          p.lastDelta = 0;
        }
      }
    }

    if (anyoneCorrect) {
      window.BuzzSound.playCorrect();
    } else {
      window.BuzzSound.playWrong();
    }

    // Highlight juiste knop
    const optionButtons = el.quizOptionsGrid.querySelectorAll('.buzz-btn');
    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correctIdx) btn.classList.add('is-correct');
      else btn.classList.add('is-dimmed');
    });

    el.quizExplanationText.textContent = q.explanation;
    el.quizRevealBox.classList.remove('hidden');
    el.btnNextQuestion.textContent =
      state.currentIndex + 1 >= state.deck.length ? 'Bekijk Uitslag 🏆' : 'Volgende Vraag →';

    renderQuizPodiums(true, correctIdx);
    window.BuzzDriver.setLeds([false, false, false, false]);
  }

  function goToNextQuestion() {
    state.currentIndex += 1;
    prepareNextStep();
  }

  /* ==================== FINALE PODIUM ==================== */
  function showFinale() {
    showScreen('finale');
    window.BuzzSound.playVictory();
    window.BuzzDriver.flashAllLeds(4, 180);

    if (typeof window.confetti === 'function') {
      window.confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
    }

    const sorted = [...state.players.slice(0, state.playerCount)].sort((a, b) => b.score - a.score);
    const winner = sorted[0];
    el.finaleWinnerText.textContent = `${winner.name} (${winner.char.name}) wint met ${winner.score} punten!`;

    const medals = ['🥇', '🥈', '🥉', '🎖️'];
    el.finaleLeaderboard.innerHTML = '';
    sorted.forEach((p, idx) => {
      const row = document.createElement('div');
      row.className = `flex items-center justify-between gap-4 p-4 rounded-2xl border ${
        idx === 0
          ? 'bg-amber-400/20 border-amber-400 shadow-lg'
          : 'bg-slate-950/70 border-white/10'
      }`;
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-2xl">${medals[idx] || '🏅'}</span>
          ${renderAvatarHtml(p.char, 'w-16 h-16 shrink-0')}
          <span class="font-heading font-bold text-lg text-white">${p.name}</span>
        </div>
        <span class="font-display font-black text-2xl text-amber-300">${p.score} ptn</span>
      `;
      el.finaleLeaderboard.appendChild(row);
    });
  }

  /* ==================== BUZZER TEST MODAL ==================== */
  function renderVirtualHandsets(rawState = window.BuzzDriver.state) {
    el.virtualHandsetsGrid.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const s = rawState[i];
      const handset = document.createElement('div');
      handset.className = 'bg-slate-950 border border-slate-700 rounded-2xl p-3 flex flex-col items-center gap-2.5';
      handset.innerHTML = `
        <div class="text-xs font-black uppercase tracking-wider text-slate-300">Buzzer ${i + 1}</div>
        <div class="w-16 h-16 rounded-full red-buzzer-dome ${s.red ? 'lit pressed' : ''}"></div>
        <div class="w-full flex flex-col gap-1.5 mt-1">
          <div class="h-5 rounded-lg bg-sky-500 transition ${s.blue ? 'ring-2 ring-white scale-105 brightness-125' : 'opacity-45'}"></div>
          <div class="h-5 rounded-lg bg-orange-500 transition ${s.orange ? 'ring-2 ring-white scale-105 brightness-125' : 'opacity-45'}"></div>
          <div class="h-5 rounded-lg bg-emerald-500 transition ${s.green ? 'ring-2 ring-white scale-105 brightness-125' : 'opacity-45'}"></div>
          <div class="h-5 rounded-lg bg-yellow-400 transition ${s.yellow ? 'ring-2 ring-white scale-105 brightness-125' : 'opacity-45'}"></div>
        </div>
      `;
      el.virtualHandsetsGrid.appendChild(handset);
    }
  }

  /* ==================== EVENT BINDINGS ==================== */
  function bindEvents() {
    // Player count
    document.querySelectorAll('.player-count-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.playerCount = Number(btn.dataset.playerCount);
        renderLobbyPlayers();
      });
    });

    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedMode = btn.dataset.mode;
        renderModeButtons();
      });
    });

    // Denktijd buttons
    document.querySelectorAll('.time-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.questionTimePreset = Number(btn.dataset.timePreset);
        renderTimeButtons();
      });
    });

    el.btnStartGame.addEventListener('click', startGame);
    el.btnContinueRound.addEventListener('click', loadQuestion);
    el.btnNextQuestion.addEventListener('click', goToNextQuestion);
    el.btnQuitQuiz.addEventListener('click', goToMainMenu);
    if (el.btnHeaderHome) el.btnHeaderHome.addEventListener('click', goToMainMenu);
    if (el.btnRoundIntroHome) el.btnRoundIntroHome.addEventListener('click', goToMainMenu);
    if (el.btnCloseCharModal) {
      el.btnCloseCharModal.addEventListener('click', () => el.modalCharacterPicker.classList.add('hidden'));
    }

    el.btnPlayAgain.addEventListener('click', startGame);
    el.btnBackToLobby.addEventListener('click', goToMainMenu);

    // Clickable on-screen answer buttons (voor muis/digibord)
    el.quizOptionsGrid.querySelectorAll('.buzz-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const optIdx = Number(btn.dataset.opt);
        const key = OPTION_KEYS[optIdx];
        if (state.currentRoundType === 'fastest') {
          if (state.phase === 'waitingBuzz') {
            // Op digibord: als niemand gebuzzt heeft, laat Speler 1 antwoorden
            handlePlayerButton(0, 'red');
          }
          if (state.activeBuzzPlayer !== null) {
            handlePlayerButton(state.activeBuzzPlayer, key);
          }
        } else {
          // Zoek eerste speler die nog niet geantwoord heeft
          const nextP = state.players.slice(0, state.playerCount).findIndex((p) => p.answer === null);
          if (nextP !== -1) {
            handlePlayerButton(nextP, key);
          }
        }
      });
    });

    // Hardware Buzz! Driver events
    window.BuzzDriver.onPress((playerIdx, button) => {
      handlePlayerButton(playerIdx, button);
    });

    window.BuzzDriver.onRawState((rawState) => {
      if (!el.modalBuzzerTest.classList.contains('hidden')) {
        renderVirtualHandsets(rawState);
      }
    });

    window.BuzzDriver.onStatusChange((status) => {
      el.buzzerStatusText.textContent = status.deviceName;
      el.buzzerStatusDot.className = `w-2.5 h-2.5 rounded-full ${
        status.mode === 'webhid'
          ? 'bg-emerald-400 animate-pulse'
          : status.mode === 'gamepad'
          ? 'bg-sky-400 animate-pulse'
          : 'bg-amber-400'
      }`;
    });

    // Header Controls
    async function connectUsb(showAll = false) {
      try {
        const ok = await window.BuzzDriver.connectWebHID(showAll);
        if (ok) {
          window.BuzzDriver.flashAllLeds(2, 150);
        }
      } catch (err) {
        alert(err.message || 'Kon geen verbinding maken met de PS3 Buzz! USB controller.');
      }
    }

    el.btnConnectBuzzers.addEventListener('click', () => connectUsb(false));
    el.btnModalConnectSony.addEventListener('click', () => connectUsb(false));
    el.btnModalConnectAll.addEventListener('click', () => connectUsb(true));
    el.btnModalTestLeds.addEventListener('click', () => window.BuzzDriver.flashAllLeds(3, 180));

    el.btnOpenTestModal.addEventListener('click', () => {
      renderVirtualHandsets();
      el.modalBuzzerTest.classList.remove('hidden');
    });
    el.btnCloseTestModal.addEventListener('click', () => {
      el.modalBuzzerTest.classList.add('hidden');
    });

    el.btnToggleVoice.addEventListener('click', () => {
      const next = !window.BuzzSound.voiceEnabled;
      window.BuzzSound.setVoiceEnabled(next);
      el.btnToggleVoice.textContent = next ? '🗣️ Voorlezen: Aan' : '🗣️ Voorlezen: Uit';
      el.btnToggleVoice.classList.toggle('border-amber-400', next);
      el.btnToggleVoice.classList.toggle('text-amber-300', next);
    });

    el.btnToggleMute.addEventListener('click', () => {
      const next = !window.BuzzSound.muted;
      window.BuzzSound.setMuted(next);
      el.btnToggleMute.textContent = next ? '🔇' : '🔊';
    });

    el.btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  /* ==================== MORPHING BLOB VOOR RONDE-INTRO ==================== */
  const roundMorphBlob = document.getElementById('roundMorphBlob');
  if (roundMorphBlob) {
    let morphT = 0;
    function morphRoundBg() {
      if (state.screen === 'roundIntro') {
        morphT += 0.038;
        const pts = [];
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const r = 230 + Math.sin(morphT + i * 1.2) * 85 + Math.cos(morphT * 0.8 + i * 2) * 50;
          pts.push({ x: 400 + Math.cos(a) * r, y: 400 + Math.sin(a) * r });
        }
        const startMidX = (pts[7].x + pts[0].x) / 2;
        const startMidY = (pts[7].y + pts[0].y) / 2;
        let d = `M ${startMidX} ${startMidY}`;
        for (let i = 0; i < 8; i++) {
          const p0 = pts[i];
          const p1 = pts[(i + 1) % 8];
          d += ` Q ${p0.x} ${p0.y}, ${(p0.x + p1.x) / 2} ${(p0.y + p1.y) / 2}`;
        }
        roundMorphBlob.setAttribute('d', d + ' Z');
      }
      requestAnimationFrame(morphRoundBg);
    }
    morphRoundBg();
  }

  /* ==================== INIT ==================== */
  renderLobbyPlayers();
  renderCategories();
  renderModeButtons();
  renderTimeButtons();
  bindEvents();
})();
