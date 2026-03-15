const LocalManager = {
    game: {
        board: Array(9).fill(null),
        history: [],
        turn: 'X',
        winner: null,
        winPattern: null,
        mode: 'classic'
    },

    strategies: {
        classic: {
            processMove: (board, move, history) => {
                const newBoard = [...board];
                newBoard[move.position] = move.symbol;
                return { newBoard, newHistory: [...history, move] };
            },
            checkDraw: (board) => !board.includes(null)
        },
        infinity: {
            processMove: (board, move, history) => {
                let newBoard = [...board];
                let newHistory = [...history];
                const playerMoves = newHistory.filter(m => m.symbol === move.symbol);

                if (playerMoves.length >= 3) {
                    const oldestMove = playerMoves[0];
                    newBoard[oldestMove.position] = null;
                    newHistory = newHistory.filter(m => m !== oldestMove);
                }

                newBoard[move.position] = move.symbol;
                newHistory.push(move);
                return { newBoard, newHistory };
            },
            checkDraw: () => false
        }
    },

    init: function(mode) {
        this.game = {
            board: Array(9).fill(null),
            history: [],
            turn: 'X',
            winner: null,
            winPattern: null,
            mode: mode
        };

        // UI Updates
        document.getElementById('lobby').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        document.getElementById('player-label').innerText = "Jogador 1 (X)";
        document.getElementById('opponent-label').innerText = "Jogador 2 (O)";
        document.getElementById('rematch-area').classList.add('hidden');
        
        this.render();
        this.updateUI();
    },

    render: function() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        if (window.removeWinLine) window.removeWinLine();

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.onclick = () => this.handleMove(i);
            boardElement.appendChild(cell);
        }
    },

    handleMove: function(position) {
        if (this.game.board[position] || this.game.winner) return;

        const strategy = this.strategies[this.game.mode];
        const { newBoard, newHistory } = strategy.processMove(
            this.game.board, 
            { position, symbol: this.game.turn }, 
            this.game.history
        );

        this.game.board = newBoard;
        this.game.history = newHistory;

        const winPattern = this.checkWinner(this.game.board);
        
        if (winPattern) {
            this.game.winner = this.game.turn;
            this.game.winPattern = winPattern;
        } else if (strategy.checkDraw(this.game.board)) {
            this.game.winner = 'DRAW';
        } else {
            this.game.turn = this.game.turn === 'X' ? 'O' : 'X';
        }
        
        this.updateUI();
    },

    checkWinner: function(board) {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let p of lines) {
            if (board[p[0]] && board[p[0]] === board[p[1]] && board[p[0]] === board[p[2]]) return p;
        }
        return null;
    },

    updateUI: function() {
        const cells = document.querySelectorAll('.cell');
        this.game.board.forEach((val, i) => {
            const cell = cells[i];
            if (!cell) return;
            cell.innerText = val || '';
            cell.className = 'cell';
            if (val === 'X') cell.classList.add('x-piece');
            if (val === 'O') cell.classList.add('o-piece');
            
            if (this.game.mode === 'infinity' && !this.game.winner) {
                const playerMoves = this.game.history.filter(m => m.symbol === this.game.turn);
                if (playerMoves.length === 3 && playerMoves[0].position === i) {
                    cell.classList.add('next-to-disappear');
                }
            }
        });

        const status = document.getElementById('status');
        if (this.game.winner) {
            status.innerText = this.game.winner === 'DRAW' ? "Empate!" : `Vitória do ${this.game.winner}!`;
            document.getElementById('rematch-area').classList.remove('hidden');
            if (this.game.winPattern && window.drawWinLine) window.drawWinLine(this.game.winPattern);
        } else {
            status.innerText = `Turno: ${this.game.turn}`;
        }
    }
};

function startLocalFlow() {
    const mode = prompt("1 - Clássico\n2 - Infinito", "2");
    const selectedMode = (mode === "1") ? 'classic' : 'infinity';
    LocalManager.init(selectedMode);
}