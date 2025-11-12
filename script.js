
// Game State
const gameState = {
  currentSong: null,
  currentDifficulty: 'normal',
  paused: false,
  score: 0,
  combo: 0,
  maxCombo: 0,
  hits: { sick: 0, good: 0, bad: 0, miss: 0 },
  customChart: null,
  scrollSpeed: 1,
  health: 100,
  noteAnimations: {},
  countdownFinished: false,
  backgroundVideo: null,
  backgroundImage: null,
  skipIntroAvailable: false,
  firstNoteTime: 0
};

// Settings
const settings = {
  keybinds: {
    left: 'D',
    down: 'F',
    up: 'J',
    right: 'K'
  },
  colors: {
    left: '#c24b99',
    down: '#00ffff',
    up: '#12fa05',
    right: '#f9393f'
  },
  volumes: {
    inst: 0.7,
    opponent: 0.5,
    player: 0.5
  },
  background: 'gradient1',
  swapSides: false,
  botPlay: false,
  ghostTapping: true,
  noteSpeed: 1.0,
  customCountdown: {
    three: null,
    two: null,
    one: null,
    go: null
  },
  customMissSounds: []
};

// Audio Context
let audioCtx;
let instAudio, opponentAudio, playerAudio;

// Canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Built-in songs
const songs = [
  { name: 'Tutorial', folder: 'tutorial', bpm: 100, artist: 'Kawai Sprite' },
  { name: 'Bopeebo', folder: 'bopeebo', bpm: 100, artist: 'Kawai Sprite' },
  { name: 'Fresh', folder: 'fresh', bpm: 120, artist: 'Kawai Sprite' },
  { name: 'Dad Battle', folder: 'dad-battle', bpm: 110, artist: 'Kawai Sprite' },
  { name: 'Spookeez', folder: 'spookeez', bpm: 120, artist: 'Kawai Sprite' },
  { name: 'South', folder: 'south', bpm: 125, artist: 'Kawai Sprite' },
  { name: 'Monster', folder: 'monster', bpm: 95, artist: 'Kawai Sprite' },
  { name: 'Pico', folder: 'pico', bpm: 150, artist: 'Kawai Sprite' },
  { name: 'Philly Nice', folder: 'philly-nice', bpm: 120, artist: 'Kawai Sprite' },
  { name: 'Blammed', folder: 'blammed', bpm: 150, artist: 'Kawai Sprite' },
  { name: 'Satin Panties', folder: 'satin-panties', bpm: 130, artist: 'Kawai Sprite' },
  { name: 'High', folder: 'high', bpm: 140, artist: 'Kawai Sprite' },
  { name: 'MILF', folder: 'milf', bpm: 140, artist: 'Kawai Sprite' },
  { name: 'Cocoa', folder: 'cocoa', bpm: 100, artist: 'Kawai Sprite' },
  { name: 'Eggnog', folder: 'eggnog', bpm: 120, artist: 'Kawai Sprite' },
  { name: 'Winter Horrorland', folder: 'winter-horrorland', bpm: 140, artist: 'Kawai Sprite' },
  { name: 'Senpai', folder: 'senpai', bpm: 120, artist: 'Kawai Sprite' },
  { name: 'Roses', folder: 'roses', bpm: 125, artist: 'Kawai Sprite' },
  { name: 'Thorns', folder: 'thorns', bpm: 190, artist: 'Kawai Sprite' },
  { name: 'Ugh', folder: 'ugh', bpm: 120, artist: 'Kawai Sprite' },
  { name: 'Guns', folder: 'guns', bpm: 135, artist: 'Kawai Sprite' },
  { name: 'Stress', folder: 'stress', bpm: 155, artist: 'Kawai Sprite' },
  { name: 'Darnell', folder: 'darnell', bpm: 155, artist: 'Kawai Sprite' },
  { name: 'Lit Up', folder: 'lit-up', bpm: 132, artist: 'Kawai Sprite' },
  { name: '2Hot', folder: '2hot', bpm: 182, artist: 'Kawai Sprite' },
  { name: 'Blazin', folder: 'blazin', bpm: 175, artist: 'Kawai Sprite' }
];

// EXTRA charts
const extraSongs = [
  { name: 'All That I Was', folder: 'all-that-i-was', bpm: 150, artist: 'Custom', hasBackground: true },
  { name: 'Final Zone', folder: 'final-zone', bpm: 140, artist: 'Custom', hasVideo: true },
  { name: 'Returnal', folder: 'returnal', bpm: 165, artist: 'Custom', hasBackground: true },
  { name: 'Tick Tock', folder: 'tick-tock', bpm: 130, artist: 'Custom', hasVideo: true }
];

let currentTab = 'base';

// Initialize
function init() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  setupEventListeners();
  loadSettings();
  renderSongList();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function setupEventListeners() {
  // Settings
  document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.add('active');
  });
  document.getElementById('close-settings').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.remove('active');
    saveSettings();
  });

  // Import
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-panel').classList.add('active');
  });
  document.getElementById('close-import').addEventListener('click', () => {
    document.getElementById('import-panel').classList.remove('active');
  });

  // Keybinds
  ['left', 'down', 'up', 'right'].forEach(dir => {
    const input = document.getElementById(`key-${dir}`);
    input.addEventListener('input', (e) => {
      settings.keybinds[dir] = e.target.value.toUpperCase();
    });
  });

  // Colors
  ['left', 'down', 'up', 'right'].forEach(dir => {
    const input = document.getElementById(`color-${dir}`);
    input.addEventListener('input', (e) => {
      settings.colors[dir] = e.target.value;
    });
  });

  // Volumes
  ['inst', 'opponent', 'player'].forEach(type => {
    const slider = document.getElementById(`volume-${type}`);
    const display = document.getElementById(`volume-${type}-val`);
    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      settings.volumes[type] = val / 100;
      display.textContent = val + '%';
      updateVolumes();
    });
  });

  // Background
  document.getElementById('background-select').addEventListener('change', (e) => {
    settings.background = e.target.value;
    if (e.target.value === 'custom') {
      document.getElementById('bg-upload').click();
    } else {
      document.getElementById('game-container').className = '';
      document.getElementById('game-container').classList.add(e.target.value);
    }
  });

  document.getElementById('bg-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        document.getElementById('game-container').className = 'custom';
        document.getElementById('game-container').style.backgroundImage = `url(${event.target.result})`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Scroll Speed
  document.getElementById('scroll-speed').addEventListener('input', (e) => {
    gameState.scrollSpeed = parseFloat(e.target.value);
    document.getElementById('scroll-speed-val').textContent = gameState.scrollSpeed.toFixed(1) + 'x';
  });

  // Swap Sides
  document.getElementById('swap-sides').addEventListener('change', (e) => {
    settings.swapSides = e.target.checked;
  });

  // Bot Play
  document.getElementById('bot-play').addEventListener('change', (e) => {
    settings.botPlay = e.target.checked;
  });

  // Ghost Tapping
  document.getElementById('ghost-tapping').addEventListener('change', (e) => {
    settings.ghostTapping = e.target.checked;
  });

  // Note Speed
  document.getElementById('note-speed').addEventListener('input', (e) => {
    settings.noteSpeed = parseFloat(e.target.value);
    document.getElementById('note-speed-val').textContent = settings.noteSpeed.toFixed(1) + 'x';
  });

  // Custom Countdown Sounds
  document.getElementById('countdown-three').addEventListener('change', (e) => {
    if (e.target.files[0]) {
      settings.customCountdown.three = URL.createObjectURL(e.target.files[0]);
    }
  });
  document.getElementById('countdown-two').addEventListener('change', (e) => {
    if (e.target.files[0]) {
      settings.customCountdown.two = URL.createObjectURL(e.target.files[0]);
    }
  });
  document.getElementById('countdown-one').addEventListener('change', (e) => {
    if (e.target.files[0]) {
      settings.customCountdown.one = URL.createObjectURL(e.target.files[0]);
    }
  });
  document.getElementById('countdown-go').addEventListener('change', (e) => {
    if (e.target.files[0]) {
      settings.customCountdown.go = URL.createObjectURL(e.target.files[0]);
    }
  });

  // Custom Miss Sounds
  document.getElementById('miss-sounds').addEventListener('change', (e) => {
    settings.customMissSounds = [];
    Array.from(e.target.files).forEach(file => {
      settings.customMissSounds.push(URL.createObjectURL(file));
    });
  });

  // Custom Chart Import
  document.getElementById('load-custom-chart').addEventListener('click', loadCustomChart);

  // Tab switching
  document.getElementById('base-songs-tab').addEventListener('click', () => switchTab('base'));
  document.getElementById('extra-songs-tab').addEventListener('click', () => switchTab('extra'));

  // Game Controls
  document.getElementById('pause-btn').addEventListener('click', togglePause);
  document.getElementById('quit-btn').addEventListener('click', quitToMenu);
  document.getElementById('resume-btn').addEventListener('click', togglePause);
  document.getElementById('restart-btn').addEventListener('click', restartSong);
  document.getElementById('menu-btn').addEventListener('click', quitToMenu);

  // Keyboard
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
}

function renderSongList() {
  const songList = document.getElementById('song-list');
  songList.innerHTML = '';
  
  const songsToRender = currentTab === 'base' ? songs : extraSongs;
  const basePath = currentTab === 'base' ? 'assets/charts' : 'assets/EXTRAcharts';
  
  songsToRender.forEach(song => {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    
    let extras = '';
    if (song.hasVideo) extras += ' 📹';
    if (song.hasBackground) extras += ' 🖼️';
    
    songItem.innerHTML = `
      <h3>${song.name}${extras}</h3>
      <p>${song.artist} - ${song.bpm} BPM</p>
      <div class="difficulty-buttons">
        <button onclick="startSong('${song.folder}', 'easy', '${basePath}')">Easy</button>
        <button onclick="startSong('${song.folder}', 'normal', '${basePath}')">Normal</button>
        <button onclick="startSong('${song.folder}', 'hard', '${basePath}')">Hard</button>
      </div>
    `;
    songList.appendChild(songItem);
  });
}

function switchTab(tab) {
  currentTab = tab;
  
  document.getElementById('base-songs-tab').classList.toggle('active', tab === 'base');
  document.getElementById('extra-songs-tab').classList.toggle('active', tab === 'extra');
  
  renderSongList();
}

async function startSong(folder, difficulty, basePath = 'assets/charts') {
  gameState.currentSong = folder;
  gameState.currentDifficulty = difficulty;
  gameState.currentBasePath = basePath;
  gameState.customChart = null;
  
  await loadSong(folder, difficulty, basePath);
  startGame();
}

async function loadSong(folder, difficulty, basePath = 'assets/charts') {
  const diffSuffix = difficulty === 'normal' ? '' : `-${difficulty}`;
  const chartPath = `${basePath}/${folder}/${folder}${diffSuffix}.json`;
  
  try {
    const response = await fetch(chartPath);
    const data = await response.json();
    gameState.chart = parsePsychEngineChart(data);
    
    // Load audio and media files
    await loadAudioFiles(folder, basePath);
    await loadExtraMedia(folder, basePath);
  } catch (error) {
    console.error('Error loading song:', error);
    alert('Failed to load song. Check console for details.');
  }
}

async function loadAudioFiles(folder, basePath = 'assets/charts') {
  const instPath = `${basePath}/${folder}/Inst.ogg`;
  const opponentPath = `${basePath}/${folder}/Voices-Opponent.ogg`;
  const playerPath = `${basePath}/${folder}/Voices-Player.ogg`;
  
  instAudio = new Audio(instPath);
  opponentAudio = new Audio(opponentPath);
  playerAudio = new Audio(playerPath);
  
  updateVolumes();
}

async function loadExtraMedia(folder, basePath) {
  // Check for background image
  const imagePath = `${basePath}/${folder}/artwork.jpg`;
  try {
    const response = await fetch(imagePath, { method: 'HEAD' });
    if (response.ok) {
      gameState.backgroundImage = imagePath;
    } else {
      gameState.backgroundImage = null;
    }
  } catch {
    gameState.backgroundImage = null;
  }
  
  // Check for background video
  const videoPath = `${basePath}/${folder}/video.mp4`;
  try {
    const response = await fetch(videoPath, { method: 'HEAD' });
    if (response.ok) {
      gameState.backgroundVideo = videoPath;
    } else {
      gameState.backgroundVideo = null;
    }
  } catch {
    gameState.backgroundVideo = null;
  }
}

function updateVolumes() {
  if (instAudio) instAudio.volume = settings.volumes.inst;
  if (opponentAudio) opponentAudio.volume = settings.volumes.opponent;
  if (playerAudio) playerAudio.volume = settings.volumes.player;
}

function parsePsychEngineChart(data) {
  const song = data.song || data;
  const opponentNotes = [];
  const playerNotes = [];
  
  if (song.notes) {
    song.notes.forEach(section => {
      if (section.sectionNotes) {
        section.sectionNotes.forEach(note => {
          const [time, lane, duration] = note;
          
          // Swap logic based on settings
          const shouldSwap = settings.swapSides;
          
          // In Psych Engine charts:
          // - Lanes 0-3 are always the LEFT side of the screen
          // - Lanes 4-7 are always the RIGHT side of the screen
          // - mustHitSection determines which side the PLAYER plays
          // - If mustHitSection is true, player plays lanes 4-7 (right side)
          // - If mustHitSection is false, player plays lanes 0-3 (left side)
          
          const isRightSide = lane >= 4;
          const normalizedLane = lane % 4;
          
          // Determine if this note belongs to the player
          let isPlayerNote = false;
          if (section.mustHitSection) {
            // Player is on right side, so lanes 4-7 are player notes
            isPlayerNote = isRightSide;
          } else {
            // Player is on left side, so lanes 0-3 are player notes
            isPlayerNote = !isRightSide;
          }
          
          // Apply swap if enabled
          if (shouldSwap) {
            isPlayerNote = !isPlayerNote;
          }
          
          const noteData = {
            time: time,
            lane: normalizedLane,
            duration: duration || 0
          };
          
          if (isPlayerNote) {
            playerNotes.push(noteData);
          } else {
            opponentNotes.push(noteData);
          }
        });
      }
    });
  }
  
  const sortedPlayerNotes = playerNotes.sort((a, b) => a.time - b.time);
  const sortedOpponentNotes = opponentNotes.sort((a, b) => a.time - b.time);
  
  // Find the time of the first note (player or opponent)
  let firstNoteTime = Infinity;
  if (sortedPlayerNotes.length > 0) {
    firstNoteTime = Math.min(firstNoteTime, sortedPlayerNotes[0].time);
  }
  if (sortedOpponentNotes.length > 0) {
    firstNoteTime = Math.min(firstNoteTime, sortedOpponentNotes[0].time);
  }
  
  return {
    bpm: song.bpm || 120,
    speed: song.speed || 2,
    opponentNotes: sortedOpponentNotes,
    playerNotes: sortedPlayerNotes,
    firstNoteTime: firstNoteTime !== Infinity ? firstNoteTime : 0
  };
}

async function loadCustomChart() {
  const chartFile = document.getElementById('chart-file').files[0];
  const instFile = document.getElementById('inst-file').files[0];
  const opponentFile = document.getElementById('opponent-vocals-file').files[0];
  const playerFile = document.getElementById('player-vocals-file').files[0];
  const bgImageFile = document.getElementById('bg-image-file').files[0];
  const bgVideoFile = document.getElementById('bg-video-file').files[0];
  
  if (!chartFile || !instFile) {
    alert('Please select at least a chart and instrumental file.');
    return;
  }
  
  try {
    const chartText = await chartFile.text();
    const chartData = JSON.parse(chartText);
    gameState.chart = parsePsychEngineChart(chartData);
    
    instAudio = new Audio(URL.createObjectURL(instFile));
    opponentAudio = opponentFile ? new Audio(URL.createObjectURL(opponentFile)) : null;
    playerAudio = playerFile ? new Audio(URL.createObjectURL(playerFile)) : null;
    
    // Load background media
    gameState.backgroundImage = bgImageFile ? URL.createObjectURL(bgImageFile) : null;
    gameState.backgroundVideo = bgVideoFile ? URL.createObjectURL(bgVideoFile) : null;
    
    updateVolumes();
    
    gameState.customChart = true;
    document.getElementById('import-panel').classList.remove('active');
    startGame();
  } catch (error) {
    console.error('Error loading custom chart:', error);
    alert('Failed to load custom chart. Check console for details.');
  }
}

async function startGame() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  
  resetGameState();
  setupBackgroundMedia();
  
  // Play countdown before starting
  await playCountdown();
  
  instAudio.currentTime = 0;
  if (opponentAudio) opponentAudio.currentTime = 0;
  if (playerAudio) playerAudio.currentTime = 0;
  
  instAudio.play();
  if (opponentAudio) opponentAudio.play();
  if (playerAudio) playerAudio.play();
  
  // Start background video if present
  const bgVideo = document.getElementById('background-video');
  if (bgVideo && bgVideo.src) {
    bgVideo.currentTime = 0;
    bgVideo.play();
  }
  
  gameState.startTime = Date.now();
  gameState.paused = false;
  gameState.countdownFinished = true;
  
  // Check if there's a significant intro (first note starts after 3 seconds)
  gameState.firstNoteTime = gameState.chart.firstNoteTime;
  gameState.skipIntroAvailable = gameState.firstNoteTime > 3000;
  
  gameLoop();
}

function setupBackgroundMedia() {
  const bgVideo = document.getElementById('background-video');
  const bgImage = document.getElementById('background-image');
  
  // Clear previous media
  bgVideo.style.display = 'none';
  bgImage.style.display = 'none';
  bgVideo.src = '';
  bgImage.src = '';
  
  if (gameState.backgroundVideo) {
    bgVideo.src = gameState.backgroundVideo;
    bgVideo.style.display = 'block';
    bgVideo.muted = true; // Mute video audio
    bgVideo.loop = false;
  } else if (gameState.backgroundImage) {
    bgImage.src = gameState.backgroundImage;
    bgImage.style.display = 'block';
  }
}

async function playCountdown() {
  const bpm = gameState.chart.bpm;
  const beatDuration = (60 / bpm) * 1000; // milliseconds per beat
  
  const countdownTexts = ['3', '2', '1', 'GO!'];
  const countdownSounds = [
    settings.customCountdown.three || 'assets/sounds/count3.ogg',
    settings.customCountdown.two || 'assets/sounds/count2.ogg',
    settings.customCountdown.one || 'assets/sounds/count1.ogg',
    settings.customCountdown.go || 'assets/sounds/count4.ogg'
  ];
  
  for (let i = 0; i < countdownTexts.length; i++) {
    // Show countdown text
    const countdownEl = document.getElementById('countdown-display');
    countdownEl.textContent = countdownTexts[i];
    countdownEl.style.display = 'block';
    
    // Play sound
    const sound = new Audio(countdownSounds[i]);
    sound.volume = 0.7;
    sound.play().catch(e => console.log('Countdown sound failed:', e));
    
    // Wait for one beat
    await new Promise(resolve => setTimeout(resolve, beatDuration));
    
    countdownEl.style.display = 'none';
  }
}

function resetGameState() {
  gameState.score = 0;
  gameState.combo = 0;
  gameState.maxCombo = 0;
  gameState.hits = { sick: 0, good: 0, bad: 0, miss: 0 };
  gameState.noteIndex = 0;
  gameState.activeNotes = [];
  gameState.pressedKeys = { left: false, down: false, up: false, right: false };
  gameState.health = 100;
  gameState.noteAnimations = {};
  gameState.countdownFinished = false;
  gameState.heldNotes = { left: null, down: null, up: null, right: null };
  gameState.skipIntroAvailable = false;
  gameState.firstNoteTime = 0;
  document.getElementById('skip-intro-prompt').style.display = 'none';
  updateUI();
}

function skipToNotes() {
  // Skip to 500ms before first note
  const skipToTime = Math.max(0, (gameState.firstNoteTime - 500) / 1000);
  
  instAudio.currentTime = skipToTime;
  if (opponentAudio) opponentAudio.currentTime = skipToTime;
  if (playerAudio) playerAudio.currentTime = skipToTime;
  
  // Skip video if present
  const bgVideo = document.getElementById('background-video');
  if (bgVideo && bgVideo.src) {
    bgVideo.currentTime = skipToTime;
  }
  
  gameState.skipIntroAvailable = false;
  document.getElementById('skip-intro-prompt').style.display = 'none';
}

function gameLoop() {
  if (gameState.paused) return;
  
  const currentTime = instAudio.currentTime * 1000;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update and render notes
  if (gameState.countdownFinished) {
    updateNotes(currentTime);
    if (settings.botPlay) {
      performBotPlay(currentTime);
    }
  }
  renderNotes();
  renderReceptors();
  renderHealthBar();
  
  // Show/hide skip intro prompt
  const skipPrompt = document.getElementById('skip-intro-prompt');
  if (gameState.skipIntroAvailable && currentTime < gameState.firstNoteTime - 2000) {
    skipPrompt.style.display = 'block';
  } else {
    skipPrompt.style.display = 'none';
    gameState.skipIntroAvailable = false;
  }
  
  // Check if song ended
  if (instAudio.ended) {
    endSong();
    return;
  }
  
  // Check for game over
  if (gameState.health <= 0) {
    gameOver();
    return;
  }
  
  requestAnimationFrame(gameLoop);
}

function performBotPlay(currentTime) {
  const lanes = ['left', 'down', 'up', 'right'];
  
  gameState.activeNotes.forEach(note => {
    const timeDiff = Math.abs(note.time - currentTime);
    
    if (!note.hit && timeDiff < 20) { // Hit within 20ms of note time
      const lane = lanes[note.lane];
      
      if (note.duration > 0) {
        // Hold note
        note.hit = true;
        note.holding = true;
        gameState.noteAnimations[lane] = Date.now();
        gameState.heldNotes[lane] = note;
        registerHit('sick');
      } else {
        // Regular note
        note.hit = true;
        note.active = false;
        gameState.noteAnimations[lane] = Date.now();
        registerHit('sick');
      }
    }
    
    // Auto-release hold notes at the right time
    if (note.holding && gameState.heldNotes[lanes[note.lane]] === note) {
      const holdEndTime = note.time + note.duration;
      if (currentTime >= holdEndTime - 10) { // Release slightly early to be safe
        note.active = false;
        gameState.heldNotes[lanes[note.lane]] = null;
        registerHit('sick');
      }
    }
  });
}

function updateNotes(currentTime) {
  const chart = gameState.chart;
  const lookahead = 2000; // 2 seconds ahead
  
  // Add new notes to active notes
  while (gameState.noteIndex < chart.playerNotes.length) {
    const note = chart.playerNotes[gameState.noteIndex];
    if (note.time <= currentTime + lookahead) {
      gameState.activeNotes.push({
        ...note,
        active: true,
        hit: false,
        holding: false,
        y: -100
      });
      gameState.noteIndex++;
    } else {
      break;
    }
  }
  
  // Update note positions and check for misses
  gameState.activeNotes = gameState.activeNotes.filter(note => {
    if (!note.active) return false;
    
    const timeDiff = note.time - currentTime;
    const scrollSpeed = chart.speed * gameState.scrollSpeed * settings.noteSpeed;
    note.y = canvas.height - 150 - (timeDiff * scrollSpeed * 0.45);
    
    // For hold notes that are being held
    if (note.holding) {
      const holdEndTime = note.time + note.duration;
      
      // Check if hold duration has passed
      if (currentTime > holdEndTime + 150) {
        // Hold ended too late or player is still holding
        note.active = false;
        const lanes = ['left', 'down', 'up', 'right'];
        const lane = lanes[note.lane];
        if (gameState.heldNotes[lane] === note) {
          gameState.heldNotes[lane] = null;
        }
        return false;
      }
      return true;
    }
    
    // Check for miss (note passed too far)
    if (timeDiff < -166 && !note.hit) {
      registerHit('miss');
      return false;
    }
    
    return note.active && note.y < canvas.height + 100;
  });
}

function renderReceptors() {
  const receptorY = canvas.height - 150;
  const lanes = ['left', 'down', 'up', 'right'];
  const opponentX = canvas.width * 0.25;
  const playerX = canvas.width * 0.75;
  const laneWidth = 80;
  const spacing = 100;
  const now = Date.now();
  
  // Opponent receptors (left side)
  lanes.forEach((lane, i) => {
    const x = opponentX - (spacing * 1.5) + (i * spacing);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x - laneWidth/2, receptorY - laneWidth/2, laneWidth, laneWidth);
    ctx.strokeStyle = settings.colors[lane];
    ctx.lineWidth = 3;
    ctx.strokeRect(x - laneWidth/2, receptorY - laneWidth/2, laneWidth, laneWidth);
  });
  
  // Player receptors (right side) with bounce animation
  lanes.forEach((lane, i) => {
    const x = playerX - (spacing * 1.5) + (i * spacing);
    const pressed = gameState.pressedKeys[lane] || (settings.botPlay && gameState.noteAnimations[lane]);
    
    // Calculate bounce effect
    let scale = 1;
    let offsetY = 0;
    if (gameState.noteAnimations[lane]) {
      const timeSinceHit = now - gameState.noteAnimations[lane];
      if (timeSinceHit < 200) {
        const progress = timeSinceHit / 200;
        scale = 1 + (0.2 * Math.sin(progress * Math.PI));
        offsetY = -10 * Math.sin(progress * Math.PI);
      } else {
        delete gameState.noteAnimations[lane];
      }
    }
    
    const scaledWidth = laneWidth * scale;
    const scaledHeight = laneWidth * scale;
    const adjustedY = receptorY + offsetY;
    
    ctx.fillStyle = pressed ? settings.colors[lane] + '80' : 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x - scaledWidth/2, adjustedY - scaledHeight/2, scaledWidth, scaledHeight);
    ctx.strokeStyle = settings.colors[lane];
    ctx.lineWidth = pressed ? 5 : 3;
    ctx.strokeRect(x - scaledWidth/2, adjustedY - scaledHeight/2, scaledWidth, scaledHeight);
  });
}

function renderHealthBar() {
  const barWidth = 400;
  const barHeight = 30;
  const barX = (canvas.width - barWidth) / 2;
  const barY = 20;
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(barX, barY, barWidth, barHeight);
  
  // Health fill
  const healthWidth = (gameState.health / 100) * barWidth;
  const healthColor = gameState.health > 60 ? '#00ff00' : gameState.health > 30 ? '#ffff00' : '#ff0000';
  ctx.fillStyle = healthColor;
  ctx.fillRect(barX, barY, healthWidth, barHeight);
  
  // Border
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Health: ${Math.round(gameState.health)}%`, canvas.width / 2, barY + barHeight + 20);
}

function renderNotes() {
  const lanes = ['left', 'down', 'up', 'right'];
  const playerX = canvas.width * 0.75;
  const spacing = 100;
  const noteSize = 70;
  const chart = gameState.chart;
  const currentTime = instAudio.currentTime * 1000;
  const scrollSpeed = chart.speed * gameState.scrollSpeed;
  
  // Render player notes
  gameState.activeNotes.forEach(note => {
    const x = playerX - (spacing * 1.5) + (note.lane * spacing);
    const lane = lanes[note.lane];
    
    // Render hold note tail if it has duration
    if (note.duration > 0) {
      const holdEndTime = note.time + note.duration;
      const holdEndY = canvas.height - 150 - ((holdEndTime - currentTime) * scrollSpeed * 0.45);
      const holdHeight = Math.abs(note.y - holdEndY);
      
      // Draw hold tail
      ctx.fillStyle = settings.colors[lane] + '80';
      ctx.fillRect(x - 15, Math.min(note.y, holdEndY), 30, holdHeight);
      ctx.strokeStyle = settings.colors[lane];
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 15, Math.min(note.y, holdEndY), 30, holdHeight);
    }
    
    // Render note head
    ctx.fillStyle = settings.colors[lane];
    ctx.fillRect(x - noteSize/2, note.y - noteSize/2, noteSize, noteSize);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - noteSize/2, note.y - noteSize/2, noteSize, noteSize);
  });
  
  // Render opponent notes (visual only)
  const opponentX = canvas.width * 0.25;
  
  chart.opponentNotes.forEach(note => {
    const timeDiff = note.time - currentTime;
    if (timeDiff > -200 && timeDiff < 2000) {
      const effectiveScrollSpeed = chart.speed * gameState.scrollSpeed * settings.noteSpeed;
      const y = canvas.height - 150 - (timeDiff * effectiveScrollSpeed * 0.45);
      const x = opponentX - (spacing * 1.5) + (note.lane * spacing);
      const lane = lanes[note.lane];
      
      // Render hold note tail if it has duration
      if (note.duration > 0) {
        const holdEndTime = note.time + note.duration;
        const holdEndY = canvas.height - 150 - ((holdEndTime - currentTime) * effectiveScrollSpeed * 0.45);
        const holdHeight = Math.abs(y - holdEndY);
        
        // Draw hold tail
        ctx.fillStyle = settings.colors[lane] + '40';
        ctx.fillRect(x - 15, Math.min(y, holdEndY), 30, holdHeight);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 15, Math.min(y, holdEndY), 30, holdHeight);
      }
      
      // Render note head
      ctx.fillStyle = settings.colors[lane] + '60';
      ctx.fillRect(x - noteSize/2, y - noteSize/2, noteSize, noteSize);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - noteSize/2, y - noteSize/2, noteSize, noteSize);
    }
  });
}

function handleKeyDown(e) {
  const key = e.key.toUpperCase();
  const lane = Object.keys(settings.keybinds).find(k => settings.keybinds[k] === key);
  
  if (lane && !gameState.pressedKeys[lane] && !gameState.paused) {
    gameState.pressedKeys[lane] = true;
    checkNoteHit(lane);
  }
  
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
    togglePause();
  }
  
  // Skip intro with E key
  if ((e.key === 'e' || e.key === 'E') && gameState.skipIntroAvailable && !gameState.paused) {
    skipToNotes();
  }
}

function handleKeyUp(e) {
  const key = e.key.toUpperCase();
  const lane = Object.keys(settings.keybinds).find(k => settings.keybinds[k] === key);
  
  if (lane) {
    gameState.pressedKeys[lane] = false;
    
    // Check if we're releasing a hold note
    if (gameState.heldNotes[lane]) {
      const heldNote = gameState.heldNotes[lane];
      const currentTime = instAudio.currentTime * 1000;
      const holdEndTime = heldNote.time + heldNote.duration;
      const releaseDiff = Math.abs(currentTime - holdEndTime);
      
      // Check if released at the right time (within 150ms of hold end)
      if (releaseDiff < 150) {
        // Successfully held the note
        registerHit('sick');
      } else if (currentTime < holdEndTime - 150) {
        // Released too early
        registerHit('bad');
      }
      
      heldNote.active = false;
      gameState.heldNotes[lane] = null;
    }
  }
}

function checkNoteHit(lane) {
  const laneIndex = ['left', 'down', 'up', 'right'].indexOf(lane);
  const receptorY = canvas.height - 150;
  const currentTime = instAudio.currentTime * 1000;
  
  let closestNote = null;
  let closestDist = Infinity;
  
  gameState.activeNotes.forEach(note => {
    if (note.lane === laneIndex && !note.hit) {
      const dist = Math.abs(note.y - receptorY);
      if (dist < closestDist && dist < 135) { // More lenient hit window
        closestDist = dist;
        closestNote = note;
      }
    }
  });
  
  if (closestNote) {
    let rating;
    if (closestDist < 30) rating = 'sick';
    else if (closestDist < 70) rating = 'good';
    else rating = 'bad';
    
    if (closestNote.duration > 0) {
      // This is a hold note - mark as held
      closestNote.hit = true;
      closestNote.holding = true;
      closestNote.holdStartTime = currentTime;
      gameState.heldNotes[lane] = closestNote;
      gameState.noteAnimations[lane] = Date.now();
      registerHit(rating);
    } else {
      // Regular note
      closestNote.hit = true;
      closestNote.active = false;
      gameState.noteAnimations[lane] = Date.now();
      registerHit(rating);
    }
  } else if (!settings.ghostTapping) {
    // Only penalize ghost taps if the setting is disabled
    registerHit('miss');
  }
}

function registerHit(rating) {
  gameState.hits[rating]++;
  
  if (rating === 'miss') {
    gameState.combo = 0;
    gameState.health = Math.max(0, gameState.health - 5);
    playMissSound();
  } else {
    gameState.combo++;
    if (gameState.combo > gameState.maxCombo) {
      gameState.maxCombo = gameState.combo;
    }
    
    const points = { sick: 350, good: 200, bad: 50 };
    gameState.score += points[rating] || 0;
    
    // Health regeneration
    if (rating === 'sick') gameState.health = Math.min(100, gameState.health + 2);
    else if (rating === 'good') gameState.health = Math.min(100, gameState.health + 1);
    else if (rating === 'bad') gameState.health = Math.max(0, gameState.health - 1);
  }
  
  updateUI();
}

function playMissSound() {
  const missSound = settings.customMissSounds.length > 0
    ? settings.customMissSounds[Math.floor(Math.random() * settings.customMissSounds.length)]
    : `assets/sounds/missnote${Math.floor(Math.random() * 3) + 1}.ogg`;
  
  const sound = new Audio(missSound);
  sound.volume = 0.5;
  sound.play().catch(e => console.log('Miss sound failed:', e));
}

function updateUI() {
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('combo').textContent = gameState.combo;
  document.getElementById('misses').textContent = gameState.hits.miss;
  
  const totalNotes = Object.values(gameState.hits).reduce((a, b) => a + b, 0);
  const accuracy = totalNotes > 0 ? 
    ((gameState.hits.sick * 100 + gameState.hits.good * 75 + gameState.hits.bad * 25) / totalNotes).toFixed(2) : 
    100;
  document.getElementById('accuracy').textContent = accuracy + '%';
}

function gameOver() {
  if (instAudio) instAudio.pause();
  if (opponentAudio) opponentAudio.pause();
  if (playerAudio) playerAudio.pause();
  
  alert(`Game Over!\nScore: ${gameState.score}\nMax Combo: ${gameState.maxCombo}\nMisses: ${gameState.hits.miss}`);
  quitToMenu();
}

function togglePause() {
  gameState.paused = !gameState.paused;
  const bgVideo = document.getElementById('background-video');
  
  if (gameState.paused) {
    instAudio.pause();
    if (opponentAudio) opponentAudio.pause();
    if (playerAudio) playerAudio.pause();
    if (bgVideo && bgVideo.src) bgVideo.pause();
    document.getElementById('pause-menu').style.display = 'block';
  } else {
    instAudio.play();
    if (opponentAudio) opponentAudio.play();
    if (playerAudio) playerAudio.play();
    if (bgVideo && bgVideo.src) bgVideo.play();
    document.getElementById('pause-menu').style.display = 'none';
    gameLoop();
  }
}

function restartSong() {
  document.getElementById('pause-menu').style.display = 'none';
  if (gameState.customChart) {
    startGame();
  } else {
    startSong(gameState.currentSong, gameState.currentDifficulty, gameState.currentBasePath || 'assets/charts');
  }
}

function quitToMenu() {
  if (instAudio) instAudio.pause();
  if (opponentAudio) opponentAudio.pause();
  if (playerAudio) playerAudio.pause();
  
  const bgVideo = document.getElementById('background-video');
  if (bgVideo && bgVideo.src) {
    bgVideo.pause();
    bgVideo.src = '';
    bgVideo.style.display = 'none';
  }
  
  const bgImage = document.getElementById('background-image');
  if (bgImage) {
    bgImage.src = '';
    bgImage.style.display = 'none';
  }
  
  gameState.backgroundVideo = null;
  gameState.backgroundImage = null;
  
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('pause-menu').style.display = 'none';
  document.getElementById('main-menu').style.display = 'block';
}

function endSong() {
  alert(`Song Complete!\nScore: ${gameState.score}\nMax Combo: ${gameState.maxCombo}\nSick: ${gameState.hits.sick} | Good: ${gameState.hits.good} | Bad: ${gameState.hits.bad} | Miss: ${gameState.hits.miss}`);
  quitToMenu();
}

function saveSettings() {
  localStorage.setItem('rhythmGameSettings', JSON.stringify(settings));
}

function loadSettings() {
  const saved = localStorage.getItem('rhythmGameSettings');
  if (saved) {
    Object.assign(settings, JSON.parse(saved));
    
    // Apply saved settings to UI
    Object.keys(settings.keybinds).forEach(dir => {
      document.getElementById(`key-${dir}`).value = settings.keybinds[dir];
    });
    Object.keys(settings.colors).forEach(dir => {
      document.getElementById(`color-${dir}`).value = settings.colors[dir];
    });
    Object.keys(settings.volumes).forEach(type => {
      const val = Math.round(settings.volumes[type] * 100);
      document.getElementById(`volume-${type}`).value = val;
      document.getElementById(`volume-${type}-val`).textContent = val + '%';
    });
    document.getElementById('background-select').value = settings.background;
    document.getElementById('swap-sides').checked = settings.swapSides;
    document.getElementById('bot-play').checked = settings.botPlay;
    document.getElementById('ghost-tapping').checked = settings.ghostTapping;
    
    if (settings.noteSpeed !== undefined) {
      document.getElementById('note-speed').value = settings.noteSpeed;
      document.getElementById('note-speed-val').textContent = settings.noteSpeed.toFixed(1) + 'x';
    }
    
    if (settings.background !== 'custom') {
      document.getElementById('game-container').classList.add(settings.background);
    }
  }
}

// Make startSong globally accessible
window.startSong = startSong;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
