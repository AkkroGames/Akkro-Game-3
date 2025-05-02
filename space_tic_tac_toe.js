const board = document.getElementById('board');
const statusText = document.getElementById('status');
const scoreText = document.getElementById('score');
const gameDiv = document.getElementById('game');
const modeMenu = document.getElementById('modeMenu');
const shopMenu = document.getElementById('shopMenu');

let currentPlayer = 'X';
let cells = [];
let gameOver = false;
let mode = 'classic';
let playerXScore = 0; // Player X's score
let fieldSize = 3; // Initial field size
let canKnightMove = false; // Can the player make a knight move
let goldenCrossChance = 0.05; // Golden cross chance (5%)

function showModeMenu() {
  gameDiv.style.display = 'none';
  modeMenu.style.display = 'flex';
}

function showShopMenu() {
  gameDiv.style.display = 'none';
  shopMenu.style.display = 'flex';
}

function backToMenu() {
  modeMenu.style.display = 'none';
  startGame('classic'); // Go back to the normal game
}

function backToGame() {
  shopMenu.style.display = 'none';
  gameDiv.style.display = 'flex';
}

function startGame(selectedMode) {
  mode = selectedMode;

  // Change the field size for the 2v2 mode
  if (mode === '2v2') {
    fieldSize = 4; // For example, 4x4 for 2v2
  } else {
    fieldSize = 3; // Standard size for other modes
  }

  modeMenu.style.display = 'none';
  gameDiv.style.display = 'flex';
  resetGame();
}

function resetGame() {
  board.innerHTML = '';
  currentPlayer = 'X';
  gameOver = false;

  cells = Array(fieldSize * fieldSize).fill(null);
  board.style.gridTemplateColumns = `repeat(${fieldSize}, 80px)`;
  board.style.gridTemplateRows = `repeat(${fieldSize}, 80px)`;

  for (let i = 0; i < cells.length; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.style.width = '80px';
    cell.style.height = '80px';
    cell.addEventListener('click', () => makeMove(i, cell));
    board.appendChild(cell);
  }

  statusText.textContent = '';
}

function makeMove(index, cell) {
  if (cells[index] || gameOver) return;

  cells[index] = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.setAttribute('data-symbol', currentPlayer);
  checkWinner();

  if (gameOver) return;

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

  if (mode === 'bot' && currentPlayer === 'O') {
    setTimeout(aiMove, 300); // Bot moves only for "O"
  }

  // If the "knight move" is used, reset it
  if (canKnightMove) {
    canKnightMove = false;
  }
}

function aiMove() {
  let bestMove = minimax(cells, 'O');
  makeMove(bestMove.index, board.children[bestMove.index]);
}

function minimax(boardState, player) {
  const availableMoves = boardState
    .map((value, index) => value === null ? index : null)
    .filter(index => index !== null);

  if (checkWin(boardState, 'X')) {
    return { score: -1 };
  }
  if (checkWin(boardState, 'O')) {
    return { score: 1 };
  }
  if (availableMoves.length === 0) {
    return { score: 0 }; // Draw
  }

  const moves = [];

  for (let i = 0; i < availableMoves.length; i++) {
    const move = availableMoves[i];
    const newBoard = [...boardState];
    newBoard[move] = player;

    const result = minimax(newBoard, player === 'O' ? 'X' : 'O');
    moves.push({ index: move, score: result.score });
  }

  let bestMove;

  if (player === 'O') {
    let bestScore = -Infinity;
    for (const move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;
    for (const move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

function checkWin(boardState, player) {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  return winningCombos.some(combo => combo.every(index => boardState[index] === player));
}

function checkWinner() {
  if (checkWin(cells, 'X')) {
    gameOver = true;
    statusText.textContent = 'X Wins!';
    playerXScore++;
    scoreText.textContent = `🏆 Score: X - ${playerXScore}`;
  } else if (checkWin(cells, 'O')) {
    gameOver = true;
    statusText.textContent = 'O Wins!';
  } else if (cells.every(cell => cell !== null)) {
    gameOver = true;
    statusText.textContent = 'It\'s a Draw!';
  }
}
