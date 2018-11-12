/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

class Game {
  constructor(height, width) {
    this.height = height;
    this.width = width;
    this.totalPlayers = MIN_PLAYERS;
    this.boundHandleClick = this.handleClick.bind(this);
    this.createStartForm();
  }

  // creates all the Form data on the landing page of the game
  createStartForm() {
    // creates form inputs for all players
    const createPlayersFormInput = totalPlayers => {
      // remove prior form inputs
      const removeOldFormInputs = document.getElementById(
        'playersInputFormDiv'
      );
      if (removeOldFormInputs) {
        removeOldFormInputs.remove();
      }

      const gameEl = document.getElementById('game');
      const playersInputFormDiv = document.createElement('div');
      playersInputFormDiv.setAttribute('id', 'playersInputFormDiv');

      // bank of available default colors for players - assumes max 4 players
      const defaultColorList = [
        'red',
        'blue',
        'green',
        'orange',
        'pink',
        'yellow'
      ];

      // create individual player form
      const createPlayerForm = idNum => {
        const playerInputFormDiv = document.createElement('div');
        const playerColorInputLabel = document.createElement('label');
        playerColorInputLabel.setAttribute('for', `player${idNum}Color`);
        playerColorInputLabel.innerText = `Player ${idNum} Color:`;
        playerInputFormDiv.appendChild(playerColorInputLabel);
        const playerColorInputText = document.createElement('input');
        playerColorInputText.setAttribute('type', 'text');
        playerColorInputText.setAttribute('name', `player${idNum}Color`);
        playerColorInputText.setAttribute('id', `player${idNum}Color`);
        playerColorInputText.setAttribute('placeholder', 'valid color');
        // select color based on id and select color at array Index
        playerColorInputText.setAttribute('value', defaultColorList[idNum - 1]);
        playerInputFormDiv.appendChild(playerColorInputText);
        playersInputFormDiv.appendChild(playerInputFormDiv);
      };

      // initialized all the player forms needed for the game
      for (let idNum = 1; idNum <= totalPlayers; idNum++) {
        createPlayerForm(idNum);
      }

      gameEl.appendChild(playersInputFormDiv);
    };

    // creates DropDown Selection for amount of players to play with
    const createPlaysersDropDownInput = () => {
      const gameEl = document.getElementById('game');
      const totalPlayersInputDiv = document.createElement('div');

      const totalPlayersLabel = document.createElement('label');
      totalPlayersLabel.setAttribute('for', 'totalPlayers');
      totalPlayersLabel.innerText = 'Total Players';
      totalPlayersInputDiv.appendChild(totalPlayersLabel);

      // Create dropdown option for 2 to 4 players
      const totalPlayersDropDown = document.createElement('select');
      totalPlayersDropDown.setAttribute('id', 'totalPlayers');
      for (var i = MIN_PLAYERS; i <= MAX_PLAYERS; i++) {
        const option = document.createElement('option');
        option.setAttribute('value', i);
        option.innerText = i;
        totalPlayersDropDown.appendChild(option);
      }

      // Create Dropdown Box Change Event Listener to Dynamically Update Forms
      totalPlayersDropDown.addEventListener('change', () => {
        createPlayersFormInput(totalPlayersDropDown.value);
      });

      totalPlayersInputDiv.appendChild(totalPlayersDropDown);
      gameEl.appendChild(totalPlayersInputDiv);
    };

    // creates SubmitButton and EventListener for it
    const createSubmitButtonInput = () => {
      const gameEl = document.getElementById('game');
      const startButtonDiv = document.createElement('div');
      const startButton = document.createElement('button');
      startButton.innerText = 'Start New Game';
      startButton.setAttribute('id', 'startButton');
      startButton.addEventListener('click', this.startGame.bind(this));
      startButtonDiv.appendChild(startButton);
      gameEl.appendChild(startButtonDiv);
    };

    createSubmitButtonInput();
    createPlaysersDropDownInput();
    const initialTotalPlayers = parseInt(
      document.getElementById('totalPlayers').value
    );
    createPlayersFormInput(initialTotalPlayers);
  }

  // validates that player color inputs are unique
  areUserColorsValid() {
    const potentialPlayers = parseInt(
      document.getElementById('totalPlayers').value
    );

    let uniqColors = new Set();
    for (var idNum = 1; idNum <= potentialPlayers; idNum++) {
      const playerSelectedColor = document.getElementById(`player${idNum}Color`)
        .value;
      uniqColors.add(playerSelectedColor);
    }

    if (uniqColors.size < potentialPlayers) {
      return false;
    }
    return true;
  }

  // starts a new instance of the connection 4 game
  startGame() {
    // sets the new game to the amount of players participating
    const setNumberOfPlayers = () => {
      this.totalPlayers = parseInt(
        document.getElementById('totalPlayers').value
      );
    };

    if (!this.areUserColorsValid()) {
      alert('Please choose valid colors');
      return;
    }

    /** makePlayers: create the specified amount of players
     * players = array of Player instances
     */
    const makePlayers = players => {
      for (let idNum = 1; idNum <= players; idNum++) {
        const playerSelectedColor = document.getElementById(
          `player${idNum}Color`
        ).value;
        this.players.push(new Player(playerSelectedColor));
      }
    };

    // set actual players from DropDownSelector
    setNumberOfPlayers();

    // clear previous gameboard
    const boardEl = document.getElementById('board');
    boardEl.innerText = '';

    this.board = []; // array of rows, each row is array of cells  (board[y][x])
    this.isGameOver = false;
    this.players = []; // array of player instances, call method to initialize
    makePlayers(this.totalPlayers);
    this.currPlayer = this.players[0]; // active player: first Player in totalPlayer array
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
    // returns the next player in the players Array, loops back to first if at the end
    const getNextPlayer = () => {
      const currPlayerIdx = this.players.indexOf(this.currPlayer);
      if (currPlayerIdx === this.players.length - 1) {
        return this.players[0];
      } else {
        return this.players[currPlayerIdx + 1];
      }
    };

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

    this.currPlayer = getNextPlayer();
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

const game1 = new Game(HEIGHT, WIDTH);
