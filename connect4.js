/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;

class Game {
  constructor(height, width) {
    this.height = height;
    this.width = width;
    this.boundHandleClick = this.handleClick.bind(this);
    this.createStartForm();
  }

  createStartForm() {
    const gameEl = document.getElementById('game');

    // create playerOne Color Text Submission
    const playerOneColorInputLabel = document.createElement('label');
    playerOneColorInputLabel.setAttribute('for', 'playerOneColor');
    playerOneColorInputLabel.innerText = 'Player One Color:';
    gameEl.appendChild(playerOneColorInputLabel);
    const playerOneColorInputText = document.createElement('input');
    playerOneColorInputText.setAttribute('type', 'text');
    playerOneColorInputText.setAttribute('name', 'playerOneColor');
    playerOneColorInputText.setAttribute('id', 'playerOneColor');
    playerOneColorInputText.setAttribute('placeholder', 'valid color');
    playerOneColorInputText.setAttribute('value', 'red');
    gameEl.appendChild(playerOneColorInputText);

    // create playerTwo Color Text Submission
    const playerTwoColorInput = document.createElement('label');
    playerTwoColorInput.setAttribute('for', 'playerTwoColor');
    playerTwoColorInput.innerText = 'Player Two Color:';
    gameEl.appendChild(playerTwoColorInput);
    const playerTwoColorInputText = document.createElement('input');
    playerTwoColorInputText.setAttribute('type', 'text');
    playerTwoColorInputText.setAttribute('name', 'playerTwoColor');
    playerTwoColorInputText.setAttribute('id', 'playerTwoColor');
    playerTwoColorInputText.setAttribute('placeholder', 'valid color');
    playerTwoColorInputText.setAttribute('value', 'blue');
    gameEl.appendChild(playerTwoColorInputText);

    // create startButton Submission
    const startButton = document.createElement('button');
    startButton.innerText = 'Start New Game';
    startButton.setAttribute('id', 'startButton');
    startButton.addEventListener('click', this.startGame.bind(this));
    gameEl.appendChild(startButton);

    // <input type = 'text' name = 'PlayerOneColo
  }

  startGame() {
    const playerOneColorEl = document.getElementById('playerOneColor');
    const playerTwoColorEl = document.getElementById('playerTwoColor');
    const p1color = playerOneColorEl.value;
    const p2color = playerTwoColorEl.value;
    if (p1color === p2color || p1color === '' || p2color === '') {
      alert('Please choose valid colors');
      return;
    }

    // clear previous gameboard
    const boardEl = document.getElementById('board');
    boardEl.innerText = '';

    this.board = []; // array of rows, each row is array of cells  (board[y][x])
    this.isGameOver = false;
    this.playerOne = new Player(p1color);
    this.playerTwo = new Player(p2color);
    this.currPlayer = this.playerOne; // active player: 1 or 2
    this.makeBoard();
    this.makeHtmlBoard();
  }

  /** makeBoard: create in-JS board structure:
   *   board = array of rows, each row is array of cells  (board[y][x])
   */
  makeBoard() {
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }));
    }
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */
  makeHtmlBoard() {
    const board = document.getElementById('board');

    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.addEventListener('click', this.boundHandleClick);

    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }

    board.append(top);

    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }

      board.append(row);
    }
  }

  /** findSpotForCol: given column x, return top empty y (null if filled) */

  findSpotForCol(x) {
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  /** placeInTable: update DOM to place piece into HTML board */

  placeInTable(y, x) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.style.backgroundColor = this.currPlayer.color;
    piece.style.top = -50 * (y + 2);

    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

  /** endGame: announce game end */

  endGame(msg) {
    this.isGameOver = true;
    alert(msg);
    const top = document.getElementById('column-top');
    if (top) {
      top.removeEventListener('click', this.boundHandleClick);
    }
  }

  /** handleClick: handle click of column top to play piece */

  handleClick(evt) {
    // get x from ID of clicked cell
    const x = +evt.target.id;
    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null || this.isGameOver === true) {
      return;
    }

    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer.color;
    this.placeInTable(y, x);

    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      return this.endGame('Tie!');
    }

    // check for win
    if (this.checkForWin()) {
      return this.endGame(`Player ${this.currPlayer.color} won!`);
    }

    // switch players
    this.currPlayer =
      this.currPlayer === this.playerOne ? this.playerTwo : this.playerOne;
  }

  /** checkForWin: check board cell-by-cell for "does a win start here?" */

  checkForWin() {
    const _win = cells => {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer

      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === this.currPlayer.color
      );
    };

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }
}

class Player {
  constructor(color) {
    this.color = color;
  }
}

new Game(HEIGHT, WIDTH);
