document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const cells = document.querySelectorAll(".cell");
  const statusDisplay = document.getElementById("status");
  const restartButton = document.getElementById("restart");

  let gameActive = true;
  let currentPlayer = "X";
  let gameState = ["", "", "", "", "", "", "", "", ""];
  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  const statusMessages = {
    playerTurn: () => `Your Turn ${currentPlayer}`,
    aiTurn: () => `AI is thinking...`,
    playerWin: () => `You win!`,
    aiWin: () => `AI wins!`,
    draw: () => `Game ended in a draw!`,
  };

  function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute("data-index"));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
      return;
    }

    // Player Move
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add("x");

    // Check for win or draw
    if (checkWin()) {
      highlightWinningCells();
      statusDisplay.textContent = statusMessages.playerWin();
      gameActive = false;
      return;
    }

    if (checkDraw()) {
      statusDisplay.textContent = statusMessages.draw();
      gameActive = false;
      return;
    }

    // Switch to AI turn
    currentPlayer = "O";
    statusDisplay.textContent = statusMessages.aiTurn();

    // Delay AI move for better UX
    setTimeout(() => {
      makeAiMove();

      // Check for win or draw after AI move
      if (checkWin()) {
        highlightWinningCells();
        statusDisplay.textContent = statusMessages.aiWin();
        gameActive = false;
        return;
      }

      if (checkDraw()) {
        statusDisplay.textContent = statusMessages.draw();
        gameActive = false;
        return;
      }

      // Back to Player turn
      currentPlayer = "X";
      statusDisplay.textContent = statusMessages.playerTurn();
    }, 600);
  }

  function makeAiMove() {
    // Simple AI: choose a random empty cell

    // Try to win
    for (let i = 0; i < winningConditions.length; i++) {
      if (gameState[i] === "") {
        gameState[i] = "O";
        if (checkWin()) {
          updateCell(i, "O");
          return;
        }
        gameState[i] = ""; // Undo the move
      }
    }

    // Block player from winning
    for (let i = 0; i < winningConditions.length; i++) {
      if (gameState[i] === "") {
        gameState[i] = "X";
        if (checkWin()) {
          gameState[i] = "O"; // Block the player
          updateCell(i, "O");
          return;
        }
        gameState[i] = ""; // Undo the move
      }
    }

    // Take Center
    if (gameState[4] === "") {
      gameState[4] = "O";
      updateCell(4, "O");
      return;
    }

    // Take a Random Cell
    const availableCells = gameState
      .map((cell, index) => (cell === "" ? index : null))
      .filter((cell) => cell !== null);

    if (availableCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      const cellIndex = availableCells[randomIndex];
      gameState[cellIndex] = "O";
      updateCell(cellIndex, "O");
    }
  }

  function updateCell(index, player) {
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
  }

  function checkWin() {
    for (let i = 0; i < winningConditions.length; i++) {
      const [a, b, c] = winningConditions[i];
      if (
        gameState[a] &&
        gameState[a] === gameState[b] &&
        gameState[a] === gameState[c]
      ) {
        return true;
      }
    }
    return false;
  }

  function highlightWinningCells() {
    for (let i = 0; i < winningConditions.length; i++) {
      const [a, b, c] = winningConditions[i];
      if (
        gameState[a] &&
        gameState[a] === gameState[b] &&
        gameState[a] === gameState[c]
      ) {
        cells[a].classList.add("winning");
        cells[b].classList.add("winning");
        cells[c].classList.add("winning");
        return;
      }
    }
  }

  function checkDraw() {
    return !gameState.includes("");
  }

  function restartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.textContent = statusMessages.playerTurn();

    cells.forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove("x", "o", "winning");
    });
  }

  // Event Listeners
  cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
  restartButton.addEventListener("click", restartGame);

  // Initialize game status
  statusDisplay.textContent = statusMessages.playerTurn();
});
