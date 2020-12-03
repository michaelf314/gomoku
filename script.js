const SQUARE_SIZE = 25;
const status = document.querySelector('#status');
const board = document.querySelector('#board');
const start = document.querySelector('#start');
board.style.width = board.style.height = SQUARE_SIZE*19+'px';
let rows, cols, diags1, diags2;
let turn = 0;
let gameOver = false;
let prevSquare;
const xo = ['X', 'O'];

function click(event) {
  if (gameOver || turn == 1 || event.target.innerHTML != '')
    return;
  let e = event.target.dataset;
  move(parseInt(e.row), parseInt(e.col));
  if (gameOver)
    return;
  let x = getBestMove();
  if (x)
    move(x[0], x[1]);
}

function move(r, c) {
  if (prevSquare)
    prevSquare.style.backgroundColor = 'transparent';
  let square = prevSquare = document.querySelector('#s'+r+'_'+c);
  square.innerHTML = xo[turn];
  square.style.backgroundColor = '#DDD';
  let d1 = r + c, d2 = r - c + 18;
  rows[turn][r] |= 1<<c; rows[2][r] |= 1<<c;
  cols[turn][c] |= 1<<r; cols[2][c] |= 1<<r;
  diags1[turn][d1] |= 1<<r; diags1[2][d1] |= 1<<r;
  diags2[turn][d2] |= 1<<r; diags2[2][d2] |= 1<<r;
  if (win(r, c, d1, d2)) {
    gameOver = true;
    status.innerHTML = xo[turn] + ' wins';
    return;
  }
  turn = 1-turn;
  updateTurn();
}

function getBestMove() {
  let bestMove, bestEval = -1000;
  for (let r = 0; r < 19; r++) {
    for (let c = 0; c < 19; c++) {
      if ((rows[2][r] & (1<<c)) != 0)
        continue;
      let e = eval(r, c) + Math.random()/10;
      if (e > bestEval) {
        bestMove = [r, c];
        bestEval = e;
      }
    }
  }
  return bestMove;
}

function eval(row, col) {
  let diag1 = row + col, diag2 = row - col + 18;

  let r = rows[turn][row];
  let c = cols[turn][col];
  let d1 = diags1[turn][diag1];
  let d2 = diags2[turn][diag2];

  let R = rows[1-turn][row];
  let C = cols[1-turn][col];
  let D1 = diags1[1-turn][diag1];
  let D2 = diags2[1-turn][diag2];

  let e1 = 0, e2 = 0;
  e1 += evalLine(r, R, col, 0, 18);
  e1 += evalLine(c, C, row, 0, 18);
  e1 += evalLine(d1, D1, row, Math.max(0, diag1-18), Math.min(18, diag1));
  e1 += evalLine(d2, D2, row, Math.max(0, diag2-18), Math.min(18, diag2));

  e2 += evalLine(R, r, col, 0, 18);
  e2 += evalLine(C, c, row, 0, 18);
  e2 += evalLine(D1, d1, row, Math.max(0, diag1-18), Math.min(18, diag1));
  e2 += evalLine(D2, d2, row, Math.max(0, diag2-18), Math.min(18, diag2));

  return Math.max(e1*3, e2*2)*3 + Math.min(e1*3, e2*2)*2;
}

function evalLine(line, Line, move, begin, end) {
  line |= (1<<move);
  let boundary1 = move, boundary2 = move;
  begin = Math.max(move-4, 0);
  end = Math.min(move+4, 18);
  while (boundary1 >= begin && (Line & (1<<boundary1)) == 0)
    boundary1--;
  while (boundary2 <= end && (Line & (1<<boundary2)) == 0)
    boundary2++;
  if (boundary2 - boundary1 <= 5)
    return 0;
  let count = 0, bestScore = 0, consecutive = 0;
  for (let i = boundary1+1; i < boundary2; i++) {
    if ((line & (1<<i)) != 0) {
      count++;
      consecutive++;
    }
    else {
      consecutive = 0;
    }
    if (i - boundary1 > 5 && (line & (1<<(i-5))) != 0)
      count--;
    let score = count * 2;
    if (count == consecutive && boundary2 - i > 1 && i - count > boundary1)
      score++;
    if (score > bestScore)
      bestScore = score;
  }
  let scores = [0, 0, 2, 3, 4, 8, 10, 13, 15, 100, 10000, 10000];
  return scores[bestScore];
}

function updateTurn() {
  status.innerHTML = xo[turn] + `'s turn`;
}

function win(row, col, diag1, diag2) {
  let r = rows[turn][row];
  let c = cols[turn][col];
  let d1 = diags1[turn][diag1];
  let d2 = diags2[turn][diag2];
  for (let i = 1; i < 5; ++i) {
    r &= (r<<1);
    c &= (c<<1);
    d1 &= (d1<<1);
    d2 &= (d2<<1);
  }
  return r || c || d1 || d2;
}

function reset() {
  rows = [[], [], []];
  cols = [[], [], []];
  diags1 = [[], [], []];
  diags2 = [[], [], []];

  turn = 0;
  updateTurn();
  board.innerHTML = '';
  for (let i = 0; i < 19; i++) {
    for (let j = 0; j < 19; j++) {
      let id = `s${i}_${j}`;
      board.insertAdjacentHTML('beforeend', `<div class="square" id="${id}" data-row="${i}" data-col="${j}" style="width:${SQUARE_SIZE}px; height:${SQUARE_SIZE}px; line-height:${SQUARE_SIZE}px;"></div>`);
    }
  }
  board.addEventListener('click', click);
  gameOver = false;
}

reset();
start.addEventListener('click', reset);