// Game state
let currentPlayer = "X";
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let player1Name = "Player 1";
let player2Name = "Player 2";
let gameMode = "";
let scoreX = 0;
let scoreO = 0;

// DOM elements
const gameBoardElement = document.getElementById("game-board");
const resetButton = document.getElementById("reset-game");
const homeButton = document.getElementById("home-button");
const suggestMoveButton = document.getElementById("suggest-move");
const helpButton = document.getElementById("help-button");
const helpModal = document.getElementById("help-modal");
const closeHelpModal = helpModal.querySelector(".close");

// Event listeners
resetButton.addEventListener("click", resetGame);
homeButton.addEventListener("click", goToHome);
document
  .getElementById("two-players")
  .addEventListener("click", startTwoPlayerGame);
document
  .getElementById("player-vs-computer")
  .addEventListener("click", startPlayerVsComputerGame);
helpButton.addEventListener("click", showHelpModal);
closeHelpModal.addEventListener("click", closeHelpModalFunction);

// Initialize game
createGameBoard();

function createGameBoard() {
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.addEventListener("click", () => handleCellClick(i));
    gameBoardElement.appendChild(cell);
  }
}

function startTwoPlayerGame() {
  gameMode = "two-players";
  showPlayerNameModal("two-players");
}

function startPlayerVsComputerGame() {
  console.log("Starting Player vs Computer game");
  gameMode = "player-vs-computer";
  showPlayerNameModal("player-vs-computer");
}

function showPlayerNameModal(mode) {
  const playerNameModal = document.getElementById("player-name-modal");
  const playerNameInputs = document.getElementById("player-name-inputs");
  playerNameModal.style.display = "block";
  playerNameInputs.innerHTML = "";

  if (mode === "two-players") {
    addPlayerNameInput("Player 1");
    addPlayerNameInput("Player 2");
  } else {
    addPlayerNameInput("Your Name");
  }

  document.getElementById("start-game-button").onclick = () =>
    startGameWithNames(mode);
  document.getElementById("cancel-game-button").onclick = closePlayerNameModal;
}

function addPlayerNameInput(placeholder) {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = placeholder;
  document.getElementById("player-name-inputs").appendChild(input);
}

function startGameWithNames(mode) {
  const inputs = document.querySelectorAll("#player-name-inputs input");
  const names = Array.from(inputs).map(
    (input) => input.value.trim() || input.placeholder
  );

  if (mode === "two-players") {
    [player1Name, player2Name] = names;
    closePlayerNameModal();
    startGame();
  } else {
    closePlayerNameModal();
    showSymbolChoiceModal(names[0]);
  }
}

function closePlayerNameModal() {
  document.getElementById("player-name-modal").style.display = "none";
}

function startGame() {
  console.log("Starting game. Game mode:", gameMode);
  console.log("Player 1:", player1Name, "Player 2:", player2Name);
  console.log("Current player:", currentPlayer);
  document.getElementById("game-setup").style.display = "none";
  document.getElementById("game-area").style.display = "block";
  resetGame();
  updatePlayerDisplay();
  updateScoreboard();

  suggestMoveButton.style.display = "inline-block";
  resetButton.style.display = "none";

  if (gameMode === "player-vs-computer" && player1Name === "Computer") {
    setTimeout(() => {
      makeComputerMove();
    }, 500);
  }
}

function handleCellClick(index) {
  console.log("Cell clicked:", index);
  console.log("Current player:", currentPlayer);
  console.log("Game board before move:", gameBoard);

  if (gameBoard[index] === "" && gameActive) {
    if (
      (currentPlayer === "X" && player1Name !== "Computer") ||
      (currentPlayer === "O" && player2Name !== "Computer")
    ) {
      makeMove(index);
      // Remove the automatic call to makeComputerMove here
    }
  }
}

function makeMove(index) {
  gameBoard[index] = currentPlayer;
  updateBoard();
  const winningCombination = checkWin();
  if (winningCombination) {
    endGame(winningCombination);
  } else if (checkDraw()) {
    endGame(null);
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updatePlayerDisplay();
    // Add this check to make the computer move after the player's move
    if (
      gameMode === "player-vs-computer" &&
      ((currentPlayer === "X" && player1Name === "Computer") ||
        (currentPlayer === "O" && player2Name === "Computer"))
    ) {
      setTimeout(makeComputerMove, 500);
    }
  }
}

function makeComputerMove() {
  console.log("Making computer move");
  console.log("Current player:", currentPlayer);
  console.log("Game board before move:", gameBoard);

  if (!gameActive) return;

  let availableMoves = gameBoard.reduce((acc, cell, index) => {
    if (cell === "") acc.push(index);
    return acc;
  }, []);

  if (availableMoves.length > 0) {
    let move =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];
    makeMove(move);
  }
}

function updateBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    cell.textContent = gameBoard[index];
  });
}

function checkWin() {
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  for (let condition of winConditions) {
    if (condition.every((index) => gameBoard[index] === currentPlayer)) {
      return condition;
    }
  }
  return null;
}

function checkDraw() {
  return gameBoard.every((cell) => cell !== "");
}

function endGame(winningCombination) {
  gameActive = false;
  if (winningCombination) {
    highlightWinningCells(winningCombination);
    showWinningMessage(
      `${currentPlayer === "X" ? player1Name : player2Name} wins!`
    );
  } else {
    showWinningMessage("It's a draw!");
  }
  resetButton.style.display = "inline-block";
}

function showWinningMessage(message) {
  // Apply blur effect to the game board
  document.querySelector(".container").classList.add("blur-background");

  const winFrame = document.createElement("div");
  winFrame.classList.add("win-frame");
  winFrame.innerHTML = `
    <div class="win-message">${message}</div>
    <button id="close-win-frame">Close</button>
  `;
  document.body.appendChild(winFrame);

  // Create party popper animation
  const partyPopper = document.createElement("div");
  partyPopper.classList.add("party-popper");
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.setProperty("--x", Math.random());
    confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    partyPopper.appendChild(confetti);
  }
  document.body.appendChild(partyPopper);

  // Remove party popper and win frame after 5 seconds
  setTimeout(() => {
    partyPopper.remove();
    winFrame.remove();
    // Remove blur effect
    document.querySelector(".container").classList.remove("blur-background");
  }, 5000);

  // Add event listener to close button
  document.getElementById("close-win-frame").addEventListener("click", () => {
    partyPopper.remove();
    winFrame.remove();
    // Remove blur effect
    document.querySelector(".container").classList.remove("blur-background");
  });

  updateScore();
}

function updateScore() {
  if (currentPlayer === "X") {
    scoreX++;
  } else {
    scoreO++;
  }
  updateScoreboard();
}

function resetGame() {
  currentPlayer = "X";
  gameBoard = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  updateBoard();
  updatePlayerDisplay();

  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.classList.remove("winning-cell");
  });

  resetButton.style.display = "none";

  // Add this condition to make the computer move if it's supposed to go first
  if (gameMode === "player-vs-computer" && player1Name === "Computer") {
    setTimeout(() => {
      makeComputerMove();
    }, 500);
  }
}

function updatePlayerDisplay() {
  const playerDisplay = document.getElementById("player-display");
  playerDisplay.innerHTML = `
        <div>${player1Name} (X) vs ${player2Name} (O)</div>
        <div>Current turn: ${
          currentPlayer === "X" ? player1Name : player2Name
        } (${currentPlayer})</div>
    `;
}

function updateScoreboard() {
  const scoreboard = document.getElementById("scoreboard");
  scoreboard.textContent = `X: ${scoreX} | O: ${scoreO}`;
}

function highlightWinningCells(combination) {
  const cells = document.querySelectorAll(".cell");
  combination.forEach((index) => {
    cells[index].classList.add("winning-cell");
  });
}

function goToHome() {
  document.getElementById("game-area").style.display = "none";
  document.getElementById("game-setup").style.display = "block";
  scoreX = 0;
  scoreO = 0;
  resetGame();
  updateScoreboard();
}

suggestMoveButton.addEventListener("click", suggestMove);

function suggestMove() {
  if (!gameActive) return;

  let availableMoves = gameBoard.reduce((acc, cell, index) => {
    if (cell === "") acc.push(index);
    return acc;
  }, []);

  if (availableMoves.length > 0) {
    let suggestedMove =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];
    const cells = document.querySelectorAll(".cell");
    cells[suggestedMove].classList.add("suggested-move");

    // Remove the highlight after 2 seconds
    setTimeout(() => {
      cells[suggestedMove].classList.remove("suggested-move");
    }, 2000);
  } else {
    alert("No moves available");
  }
}

function showSymbolChoiceModal(playerName) {
  console.log("Showing symbol choice modal for player:", playerName);
  const choiceModal = document.createElement("div");
  choiceModal.classList.add("modal");
  choiceModal.innerHTML = `
        <div class="modal-content">
            <h2>Choose Your Symbol</h2>
            <p>${playerName}, do you want to play as X or O?</p>
            <div class="modal-buttons">
                <button id="choose-x">X</button>
                <button id="choose-o">O</button>
            </div>
        </div>
    `;
  document.body.appendChild(choiceModal);

  choiceModal.style.display = "block";

  document.getElementById("choose-x").onclick = () => {
    player1Name = playerName;
    player2Name = "Computer";
    currentPlayer = "X";
    choiceModal.remove();
    startGame();
  };

  document.getElementById("choose-o").onclick = () => {
    player1Name = "Computer";
    player2Name = playerName;
    currentPlayer = "X"; // Computer starts as X
    choiceModal.remove();
    startGame();
  };
}

function showHelpModal() {
  helpModal.style.display = "block";
  renderHelpSlides();
}

function closeHelpModalFunction() {
  helpModal.style.display = "none";
}

function renderHelpSlides() {
  const slides = [
    "Welcome to Tic-Tac-Toe!",
    "The game is played on a 3x3 grid.",
    "Players take turns placing X or O.",
    "The first player to get 3 in a row wins!",
    "If the grid is full with no winner, it's a draw.",
  ];

  const slidesContainer = document.getElementById("help-slides");
  slidesContainer.innerHTML = "";

  slides.forEach((slide, index) => {
    const slideElement = document.createElement("div");
    slideElement.classList.add("slide");
    slideElement.textContent = slide;
    slideElement.style.display = index === 0 ? "block" : "none";
    slidesContainer.appendChild(slideElement);
  });

  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.onclick = () => changeSlide(-1);

  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.onclick = () => changeSlide(1);

  slidesContainer.appendChild(prevButton);
  slidesContainer.appendChild(nextButton);
}

function changeSlide(direction) {
  const slides = document.querySelectorAll(".slide");
  let currentSlide = Array.from(slides).findIndex(
    (slide) => slide.style.display === "block"
  );
  slides[currentSlide].style.display = "none";
  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  slides[currentSlide].style.display = "block";
}
