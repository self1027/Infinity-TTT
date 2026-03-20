const socket = io();
let mySymbol = null;
let currentRoomId = null;
let currentGameMode = null;
let selectedMode = null;
let lastBoardState = null;
const urlParams = new URLSearchParams(window.location.search);
const roomIdFromUrl = urlParams.get('room');
const usernameInput = document.getElementById('username');
const savedName = localStorage.getItem('ttt_username');
if (savedName) {
	usernameInput.value = savedName;
}
usernameInput.addEventListener('input', (e) => {
	localStorage.setItem('ttt_username', e.target.value);
});
if (roomIdFromUrl) {
	document.getElementById('step-1').classList.add('hidden');
	socket.on('connect', () => {
		const nameToUse = localStorage.getItem('ttt_username') || "Convidado";
		socket.emit('join_game', {
			name: nameToUse,
			mode: 'infinity',
			roomId: roomIdFromUrl
		});
	});
}

function selectMode(mode) {
	selectedMode = mode;
	document.getElementById('step-1').classList.add('hidden');
	document.getElementById('step-2').classList.remove('hidden');
	document.getElementById('mode-selected-text').innerText = `Modo: ${mode === 'infinity' ? 'Infinito' : 'Clássico'}`;
}

function goBack() {
	window.location.reload();
}

function startMatchmaking() {
	const nameInput = document.getElementById('username').value || 'Anônimo';
	localStorage.setItem('ttt_username', nameInput);
	document.getElementById('step-2').classList.add('hidden');
	document.getElementById('invite-area').classList.remove('hidden');
	document.getElementById('private-only').classList.add('hidden');
	document.getElementById('waiting-msg-text').innerText = "Buscando oponente...";
	socket.emit('join_game', {
		name: nameInput,
		mode: selectedMode
	});
}

function createPrivateFlow() {
	const nameInput = document.getElementById('username').value || 'Anônimo';
	localStorage.setItem('ttt_username', nameInput);
	document.getElementById('step-2').classList.add('hidden');
	document.getElementById('invite-area').classList.remove('hidden');
	document.getElementById('private-only').classList.remove('hidden');
	document.getElementById('waiting-msg-text').innerText = "Aguardando amigo entrar...";
	socket.emit('create_private', {
		name: nameInput,
		mode: selectedMode
	});
}

function updateInterface(gameState) {
	if (lastBoardState) {
		const changed = gameState.board.some((v, i) => v !== lastBoardState[i]);
		const moveCount = gameState.board.filter(v => v !== null).length;
		if (changed && moveCount > 0) {
			window.SoundManager.play("move");
		}
	}
	lastBoardState = [...gameState.board];
	const cells = document.querySelectorAll('.cell');
	if (cells.length === 0) return;
	gameState.board.forEach((value, index) => {
		const cell = cells[index];
		if (!cell) return;
		cell.innerText = value || '';
		cell.className = 'cell';
		if (value === 'X') cell.classList.add('x-piece');
		if (value === 'O') cell.classList.add('o-piece');
		if (currentGameMode === 'infinity' && !gameState.winner) {
			const playerMoves = gameState.history.filter(m => m.symbol === gameState.turn);
			if (playerMoves.length === 3 && playerMoves[0].position === index) {
				cell.classList.add('next-to-disappear');
			}
		}
	});
	const status = document.getElementById('status');
	if (gameState.winner) {
		if (!window._winnerSoundPlayed) {
			if (gameState.winner !== 'DRAW') {
				if (gameState.winner === mySymbol) {
					window.SoundManager.play("victory");
				} else {
					window.SoundManager.play("defeat");
				}
			}
			window._winnerSoundPlayed = true;
		}
		status.innerText = gameState.winner === 'DRAW' ? "Empate!" : `Vitória de ${gameState.winner}!`;
		document.getElementById('board').style.pointerEvents = 'none';
		document.getElementById('rematch-area').classList.remove('hidden');
		if (gameState.winPattern) {
			drawWinLine(gameState.winPattern);
		}
	} else {
		window._winnerSoundPlayed = false;
		status.innerText = gameState.turn === mySymbol ? "Sua vez" : "Vez do oponente";
	}
}
socket.on('queue_update', (counts) => {
	document.getElementById('count-classic').innerText = counts.classic;
	document.getElementById('count-infinity').innerText = counts.infinity;
});
socket.on('room_created', (data) => {
	document.getElementById('share-link').value = `${window.location.origin}${window.location.pathname}?room=${data.roomId}`;
});
socket.on('game_start', (data) => {
	currentRoomId = data.roomId;
	mySymbol = data.symbol;
	currentGameMode = data.mode;
	// Reset visual do botão de revanche
	const rematchBtn = document.getElementById('rematch-btn');
	rematchBtn.innerText = "Solicitar Revanche";
	rematchBtn.classList.remove('waiting');
	rematchBtn.style.background = "";
	rematchBtn.disabled = false;
	document.getElementById('rematch-area').classList.add('hidden');
	removeWinLine();
	document.getElementById('lobby').classList.add('hidden');
	document.getElementById('game-overlay').classList.add('hidden');
	document.getElementById('game-container').classList.remove('hidden');
	document.getElementById('player-label').innerText = `Você (${mySymbol})`;
	document.getElementById('opponent-label').innerText = `${data.opponentName} (${mySymbol === 'X' ? 'O' : 'X'})`;
	const boardElement = document.getElementById('board');
	boardElement.innerHTML = '';
	boardElement.style.pointerEvents = 'auto';
	for (let i = 0; i < 9; i++) {
		const cell = document.createElement('div');
		cell.classList.add('cell');
		cell.onclick = () => socket.emit('make_move', {
			position: i,
			roomId: currentRoomId
		});
		boardElement.appendChild(cell);
	}
	if (data.initialState) updateInterface(data.initialState);
	window.history.replaceState({}, document.title, "/");
});
socket.on('update_game', (gameState) => {
	updateInterface(gameState);
});

function requestRematch() {
	if (!currentRoomId) {
		const currentMode = TTTLocalGame.game.mode;
		TTTLocalGame.init(currentMode);
		return;
	}
	window.SoundManager.play("rematch");
	const btn = document.getElementById('rematch-btn');
	btn.innerText = "Aguardando...";
	btn.classList.add('waiting');
	btn.disabled = true;
	btn.style.background = "#555";
	socket.emit('request_rematch', {
		roomId: currentRoomId
	});
}
socket.on('rematch_requested', () => {
	const btn = document.getElementById('rematch-btn');
	if (!btn.disabled || btn.innerText === "Solicitar Revanche") {
		window.SoundManager.play("rematch");
		btn.innerText = "Aceitar Revanche?";
		btn.style.background = "#00e676";
		btn.classList.remove('waiting');
	}
});

function drawWinLine(pattern) {
	removeWinLine();
	const board = document.getElementById('board');
	const line = document.createElement('div');
	line.id = 'win-line';
	line.className = 'win-line';
	const [a, b, c] = pattern;
	if (a % 3 === 0 && b === a + 1) {
		line.classList.add('horizontal');
		line.style.top = `${(Math.floor(a / 3) * 33.3) + 16.6}%`;
		setTimeout(() => line.style.width = '90%', 50);
	} else if (a < 3 && b === a + 3) {
		line.classList.add('vertical');
		line.style.left = `${(a * 33.3) + 16.6}%`;
		setTimeout(() => line.style.height = '90%', 50);
	} else if (a === 0 && c === 8) {
		line.classList.add('diagonal-1');
		setTimeout(() => line.style.width = '120%', 50);
	} else if (a === 2 && c === 6) {
		line.classList.add('diagonal-2');
		setTimeout(() => line.style.width = '120%', 50);
	}
	board.appendChild(line);
}

function removeWinLine() {
	const line = document.getElementById('win-line');
	if (line) line.remove();
}
socket.on('opponent_left', () => {
	window.SoundManager.play("deserter");
	showOverlay("Oponente abandonou!")
});
socket.on('error_msg', (msg) => showOverlay(msg));

function showOverlay(msg) {
	document.getElementById('overlay-msg').innerText = msg;
	document.getElementById('game-overlay').classList.remove('hidden');
}

function copyLink() {
	const input = document.getElementById('share-link');
	const button = document.querySelector('.copy-box button');

	navigator.clipboard.writeText(input.value);

	const originalText = button.innerText;

	button.innerText = "✓ Copiado!";
	button.classList.add('copy-success', 'copy-pressed');

	setTimeout(() => {
		button.innerText = originalText;
		button.classList.remove('copy-success', 'copy-pressed');
	}, 1000);
}

function leaveGame() {
	if (currentRoomId) {
		socket.emit('leave_room', { roomId: currentRoomId });
		currentRoomId = null;
	}

	mySymbol = null;
	currentGameMode = null;
	lastBoardState = null;

	window.location.href = '/';
}