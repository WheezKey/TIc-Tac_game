document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const cells = document.querySelectorAll(".cell");
  const statusDisplay = document.getElementById("status");
  const restartButton = document.getElementById("restart-btn");

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
    playerTurn: () => `PLAYER ${currentPlayer} TURN`,
    aiTurn: () => `CPU THINKING...`,
    playerWin: () => `PLAYER WINS!`,
    aiWin: () => `CPU WINS!`,
    draw: () => `GAME OVER - DRAW!`,
  };

  // Add retro sound effects
  const sounds = {
    click: new Audio(),
    win: new Audio(),
    lose: new Audio(),
    draw: new Audio(),
  };

  // Simulate retro sounds with oscillator
  function playRetroSound(type) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      switch (type) {
        case "click":
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.1);
          break;
        case "win":
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
          oscillator.start();
          oscillator.frequency.setValueAtTime(660, audioCtx.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2);
          oscillator.stop(audioCtx.currentTime + 0.3);
          break;
        case "lose":
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(330, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
          oscillator.start();
          oscillator.frequency.setValueAtTime(220, audioCtx.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(110, audioCtx.currentTime + 0.2);
          oscillator.stop(audioCtx.currentTime + 0.3);
          break;
        case "draw":
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(330, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
          oscillator.start();
          oscillator.frequency.setValueAtTime(330, audioCtx.currentTime + 0.2);
          oscillator.stop(audioCtx.currentTime + 0.3);
          break;
      }
    } catch (e) {
      console.log("Audio not supported");
    }
  }

  function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute("data-index"));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
      return;
    }

    // Player's move
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add("x");
    playRetroSound("click");

    // Check if player won or if it's a draw
    if (checkWin()) {
      highlightWinningCells();
      statusDisplay.textContent = statusMessages.playerWin();
      gameActive = false;
      playRetroSound("win");
      return;
    }

    if (checkDraw()) {
      statusDisplay.textContent = statusMessages.draw();
      gameActive = false;
      playRetroSound("draw");
      return;
    }

    // AI's turn
    currentPlayer = "O";
    statusDisplay.textContent = statusMessages.aiTurn();

    // Delay AI move to make it feel more natural
    setTimeout(() => {
      makeAiMove();

      // Check if AI won or if it's a draw
      if (checkWin()) {
        highlightWinningCells();
        statusDisplay.textContent = statusMessages.aiWin();
        gameActive = false;
        playRetroSound("lose");
        return;
      }

      if (checkDraw()) {
        statusDisplay.textContent = statusMessages.draw();
        gameActive = false;
        playRetroSound("draw");
        return;
      }

      // Back to player's turn
      currentPlayer = "X";
      statusDisplay.textContent = statusMessages.playerTurn();
    }, 600);
  }

  function makeAiMove() {
    // Simple AI: First try to win, then block player, then take center, then random move

    // Try to win
    for (let i = 0; i < gameState.length; i++) {
      if (gameState[i] === "") {
        gameState[i] = "O";
        if (checkWin()) {
          updateCell(i, "O");
          return;
        }
        gameState[i] = ""; // Undo the move
      }
    }

    // Try to block player
    for (let i = 0; i < gameState.length; i++) {
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

    // Take center if available
    if (gameState[4] === "") {
      gameState[4] = "O";
      updateCell(4, "O");
      return;
    }

    // Take a random available cell
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
    playRetroSound("click");

    cells.forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove("x", "o", "winning");
    });
  }

  // Event listeners
  cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
  restartButton.addEventListener("click", restartGame);

  // Initialize game
  statusDisplay.textContent = statusMessages.playerTurn();
});
