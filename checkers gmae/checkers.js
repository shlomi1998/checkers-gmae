//build board
function render(gameBoard, index) {
  let boardString = "-board-" + index; // Construct the board string
  const colors = ["white", "black"]; // Array of alternating cell colors
  const board = document.getElementById("board" + boardString); // Get the board element
  // Remove all existing child elements of the board
  board.innerHTML = ``;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const cell = document.createElement("div"); // Create a new cell element
      cell.classList.add("box"); // Add the 'box' class
      cell.classList.add(colors[(i + j) % 2]); // Alternating cell colors
      cell.id = i * 8 + j + 1 + boardString;
      board.appendChild(cell);
      if (gameBoard[i][j].burnt === true) {
        // Check if the cell is currently burning
        cell.classList.add("burnt");
        setTimeout(() => {
          cell.classList.remove("burnt");
          cell.innerHTML = ``;
          gameBoard[i][j] = getNewCell();
          cell.classList.add(colors[(i + j) % 2]);
        }, 500);
      }

      // Add dragover event listener to allow dropping pieces onto cells
      cell.addEventListener("dragover", function (ev) {
        ev.preventDefault();
        // Check if the cell has the class 'selected-cell'
        if (this.classList.contains("selected-cell")) {
          ev.dataTransfer.dropEffect = "move"; // Specify the drop effect
        } else {
          ev.dataTransfer.dropEffect = "none"; // Prevent dropping on cells without 'selected-cell' class
        }
      });

      // Add drop event listener to handle dropping pieces into cells
      cell.addEventListener("drop", function (ev) {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text/plain");
        // Extract the cell ID from the piece ID
        const pieceId = data;
        console.log(pieceId);
        const cellId = pieceId.replace("piece", ""); // Extract the cell ID from the piece ID
        const piece = document.getElementById(pieceId);
        this.appendChild(piece);
        const { type, isRed, selected, optionToMove, fromI, fromJ } =
          gameBoard[i][j];
        move(fromI, fromJ, i, j, index);
      });
      // הגדרת תאים עם אפשרות להזזה והצגת חיילים
      const { type, isRed, selected, optionToMove, fromI, fromJ } =
        gameBoard[i][j];
      if (optionToMove) {
        cell.classList.add("selected-cell");
      }
      // Add the 'piece' class to the cell element
      if (type === "soldier" || type === "queen") {
        addPiece(i, j, isRed, type, boardString, index);
        if (selected) {
          cell.classList.add("selected-piece");
        }
      }
    }
  }
  console.log(gameBoard);
  applyTurnStyling("title" + boardString);
}
//build new board
function buildNewBoard(gameBoard, index) {
  let boardString = "-board-" + index; // Construct the board string
  createGameSkeleton(index);
  const board = document.getElementById("board" + boardString);
  board.classList.add("board");
  render(gameBoard, index);
}
//add piece
function addPiece(i, j, pieceColor, type, boardString, index) {
  const piece = document.createElement("img");
  let cellId = i * 8 + j + 1 + boardString;
  const pieceId = "piece" + cellId; // Construct the piece ID
  piece.id = pieceId; // Set the piece ID
  piece.classList.add("piece");
  piece.draggable = true; // Make the piece draggable

  piece.src =
    type === "soldier"
      ? pieceColor
        ? "images/red.png"
        : "images/black.png"
      : pieceColor
      ? "images/red_queen.png"
      : "images/black_queen.png";
  // Add the 'piece' class to the cell element
  const cell = document.getElementById(cellId);
  cell.appendChild(piece);
  piece.addEventListener("click", function (event) {
    event.stopPropagation();
    selectCellsAndOptions(i, j, index);
  });
  piece.addEventListener("dragstart", function (ev) {
    ev.dataTransfer.setData("text/plain", pieceId); // Set the piece ID as the dragged data
  });
}
//apply turn
function applyTurnStyling(field) {
  let index = getBoardNumber(field);
  let elem = document.getElementById(field);
  isRedTurn = getRedTurn(index);
  elem.innerHTML = isRedTurn ? "Red" : "Black";
  elem.classList.add(isRedTurn ? "red_font" : "black_font");
  elem.classList.remove(isRedTurn ? "black_font" : "red_font");
}
//get board number
function getBoardNumber(string) {
  let parts = string.split("-");

  let number = parts[parts.length - 1];
  return number;
}

function getRedTurn(index) {
  return boards[index][66][0];
}
function setRedTurn(index, value) {
  boards[index][66][0] = value;
}
function openModal(type, index) {
  const modal = document.getElementById("modal-board-" + index);
  modal.style.display = "block";
  document.body.addEventListener("keydown", disableKeyboard);
  const modalActions = {
    resign: requestResignationConfirmation,
    draw: requestDrawConfirmation,
    winner: displayWinningMessage,
    cannotmove: displayCannotMove,
  };

  // בדיקה אם קיים טיפול לסוג המודל הנתון, ואם כן - ביצוע הפונקציה
  if (modalActions[type]) {
    modalActions[type](index);
  } else {
    console.error("Unknown modal type:", type);
  }
}
//resign
function requestResignationConfirmation(index) {
  let text = "";
  let resignColor = getRedTurn(index) ? "Red" : "Black";
  text = resignColor + " are you sure you want to resign?";
  addText(text, index);
  addModalButtons(index);
  const yesButton = document.getElementById("yes-board-" + index);
  yesButton.addEventListener("click", function () {
    executeResignation(index);
  });
}
// מבצעת את הפעולות הדרושות לאחר בחירת שחקן לוותר במשחק
function executeResignation(index) {
  removeButtons(index);
  const container = document.getElementById("modal-content-board-" + index);
  const text = document.getElementById("modal-text-board-" + index);
  container.removeChild(text);
  console.log(getRedTurn(index));
  setRedTurn(index, !getRedTurn(index));
  displayWinningMessage(index);
}
// הפונקציה מציגה הודעה ששחקן מסוים אינו יכול לבצע תזוזה חוקית
function displayCannotMove(index) {
  const container = document.getElementById("modal-content-board-" + index);
  const lostMessage = document.createElement("div");
  lostMessage.id = "lost-message-board-" + index;
  const loser = document.createElement("span");
  loser.id = "loser-board-" + index;
  loser.classList.add("turn");
  loser.classList.add("bold");
  lostMessage.appendChild(loser);
  setRedTurn(index, !getRedTurn(index));
  let text = " doesn't have any legal moves left...";
  var newText = document.createTextNode(text);
  lostMessage.appendChild(newText);
  container.appendChild(lostMessage);
  applyTurnStyling("loser-board-" + index);
  container.appendChild(document.createElement("br"));
  setRedTurn(index, !getRedTurn(index));
  displayWinningMessage(index);
}

function displayWinningMessage(index) {
  const container = document.getElementById("modal-content-board-" + index);
  const colorSpan = document.createElement("span");
  colorSpan.id = "winner-board-" + index;
  container.classList.add("turn");
  container.classList.add("bold");
  container.appendChild(colorSpan);
  applyTurnStyling(colorSpan.id);
  let text = " wins !";
  var newText = document.createTextNode(text);
  container.appendChild(newText);
  addResetGameButton(index);
}
// פונקציה להצגת הודעת ניצחון בלוח המשחק המתאים
function requestDrawConfirmation(index) {
  let text = "";
  let drawColor = getRedTurn(index) ? "Black" : "Red";
  text = drawColor + " do you agree to draw ?";
  addText(text, index);
  addModalButtons(index);
  const yesButton = document.getElementById("yes-board-" + index);
  yesButton.addEventListener("click", function () {
    executeDraw(index);
  });
}
// מטפלת בסיום המשחק בתיקו
function executeDraw(index) {
  removeButtons(index);
  const container = document.getElementById("modal-content-board-" + index);
  const text = document.getElementById("modal-text-board-" + index);
  container.removeChild(text);
  const colorSpan = document.createElement("span");
  colorSpan.id = "draw-board-" + index;
  colorSpan.textContent = "it's a Draw 🤝";
  container.classList.add("turn");
  container.classList.add("bold");
  container.appendChild(colorSpan);
  addResetGameButton(index);
}

// מוסיפה כפתור להתחלת משחק חדש במודל
function addResetGameButton(index) {
  const container = document.getElementById("modal-content-board-" + index);
  const redo = document.createElement("button");
  redo.id = "redo-board-" + index;
  redo.classList.add("main-button");
  redo.classList.add("modal-button");
  redo.textContent = "New Game"; // Set the text content of the button
  // הוספת אירוע לחיצה לכפתור, שכאשר ילחץ יתחיל משחק חדש
  redo.addEventListener("click", function () {
    let currentGameId = numOfOngoingGames;
    numOfOngoingGames = index - 1;
    newGame(true);
    numOfOngoingGames = currentGameId;
    closeModal(index);
  });
  // יצירת קונטיינר חדש לכפתור
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");
  buttonContainer.appendChild(redo);
  container.appendChild(buttonContainer);
}
// הוספת טקסט למודל
function addText(text, index) {
  const modalText = document.getElementById("modal-text-board-" + index);
  if (modalText != null) {
    modalText.classList.add("modal-text");
    modalText.textContent = text;
  }
}
// מוסיפה כפתורים למודל
function addModalButtons(index) {
  // Create the first button element
  const yes = document.createElement("button");
  yes.id = "yes-board-" + index;
  yes.classList.add("main-button");
  yes.classList.add("modal-button");
  yes.textContent = "Yes"; // Set the text content of the button

  // Create the second button element
  const no = document.createElement("button");
  no.id = "no-board-" + index;
  no.classList.add("main-button");
  no.classList.add("modal-button");
  no.textContent = "No"; // Set the text content of the button
  no.addEventListener("click", function () {
    closeModal(index);
  });
  const container = document.getElementById("modal-content-board-" + index);

  // Get a reference to the modal-text div
  const modalText = document.getElementById("modal-text-board-" + index);

  const modalButtonContainer = document.createElement("div");
  modalButtonContainer.classList.add("modal-button-container");
  modalButtonContainer.id = "modal-button-container-board-" + index;
  modalButtonContainer.appendChild(yes);
  modalButtonContainer.appendChild(no);
  container.insertBefore(modalButtonContainer, modalText.nextElementSibling);
}
// מסיר את המודל
function closeModal(index, modalDiv) {
  if (modalDiv === undefined) {
    modalDiv = document.getElementById("modal-board-" + index);
  }
  modalDiv.style.display = "none";
  // Remove event listener to re-enable keyboard input
  document.body.removeEventListener("keydown", disableKeyboard);
  //removeButtons(index);
  const modalContentDiv = document.getElementById(
    "modal-content-board-" + index
  );
  modalContentDiv.innerHTML = `<div id="modal-text-board-${index}"></div>`;
  modalContentDiv.classList.remove("turn");
  modalContentDiv.classList.remove("bold");
}

function removeButtons(index) {
  console.log("index", index);
  const yesButton = document.getElementById("yes-board-" + index);
  const noButton = document.getElementById("no-board-" + index);
  const container = document.getElementById("modal-content-board-" + index);

  const modalButtonContainer = document.getElementById(
    "modal-button-container-board-" + index
  );
  if (modalButtonContainer != null) {
    modalButtonContainer.removeChild(yesButton);
    modalButtonContainer.removeChild(noButton);
    container.removeChild(modalButtonContainer);
  }
}
// Disable keyboard input
function disableKeyboard(event) {
  // Close modal if Escape key is pressed
  event.preventDefault();
}
//בניית לוח חדש מקבליות בלוחות
function createGameSkeleton(index) {
  // Create board-container element
  const boardContainer = document.createElement("div");
  boardContainer.id = "board-container-" + index;

  // Create turn div
  const turnDiv = document.createElement("div");
  turnDiv.classList.add("turn");
  const boldSpan = document.createElement("span");
  boldSpan.classList.add("bold");
  boldSpan.id = "title-board-" + index;
  turnDiv.appendChild(boldSpan);
  boardContainer.appendChild(turnDiv);
  // הוספת טקסט המציין "תור:" לאלמנט תור השחקן
  const playerName = document.createTextNode(": Turn");
  turnDiv.appendChild(playerName);

  boardContainer.appendChild(turnDiv);

  // Create board div
  const boardDiv = document.createElement("div");
  boardDiv.id = "board-board-" + index;
  boardContainer.appendChild(boardDiv);

  // Create buttons div
  const buttonsDiv = document.createElement("div");
  buttonsDiv.id = "buttons-board-" + index;
  buttonsDiv.classList.add("buttons");
  boardContainer.appendChild(buttonsDiv);

  // Create Resign button
  const resignButton = document.createElement("button");
  resignButton.classList.add("main-button");
  resignButton.id = "resign-board-" + index;
  resignButton.textContent = "Resign";
  buttonsDiv.appendChild(resignButton);

  // Create Draw button
  const drawButton = document.createElement("button");
  drawButton.classList.add("main-button");
  drawButton.id = "draw-board-" + index;
  drawButton.textContent = "Draw";
  buttonsDiv.appendChild(drawButton);

  // Create Add board button
  const addButton = document.createElement("button");
  addButton.classList.add("main-button");
  addButton.id = "add-board-board-" + index;
  addButton.textContent = "Add Board +";
  buttonsDiv.appendChild(addButton);

  // Create modal div
  const modalDiv = document.createElement("div");
  modalDiv.id = "modal-board-" + index;
  modalDiv.classList.add("modal");
  boardContainer.appendChild(modalDiv);

  // Create modal content div
  const modalContentDiv = document.createElement("div");
  modalContentDiv.id = "modal-content-board-" + index;
  modalContentDiv.classList.add("modal-content");
  modalDiv.appendChild(modalContentDiv);

  // Create modal text div
  const modalTextDiv = document.createElement("div");
  modalTextDiv.id = "modal-text-board-" + index;
  modalContentDiv.appendChild(modalTextDiv);

  // Append board-container to the body
  document.body.appendChild(boardContainer);

  drawButton.addEventListener("click", function () {
    openModal("draw", index);
  });
  resignButton.addEventListener("click", function () {
    openModal("resign", index);
  });

  addButton.addEventListener("click", function () {
    newGame();
  });
  window.onclick = function (event) {
    if (event.target === modalDiv) {
      closeModal(index, modalDiv);
    }
  };
}

let isRedTurn;//bool
let gameBoard;
let lockedPiece;//חייל נעול
let numOfOngoingGames = 0;
let boards = [];//מצבי הלוחות הכללים כל תא מיצג לוח
//בניית לוח חדש
function newGame(reset) {
  numOfOngoingGames++;// עדכון מונה המשחקים הפעילים
  isRedTurn = true;// הגדרת תור התחלתי לשחקן האדום
  gameBoard = [];// איתחול לוח המשחק
  lockedPiece = false;// אין חייל נעול בהתחלת המשחק
  let even = true;// משתנה עזר לסימון שורות זוגיות/אי-זוגיות
  let color = false; // צבע החיילים (false=שחור, true=אדום)
 // יצירת לוח המשחק
  for (let i = 0; i < 8; i++) {
    let row = [];
    for (let j = 0; j < 8; j++) {
      const isSoldier =
        ((even && j % 2 !== 0) || (!even && j % 2 === 0)) && !(i > 2 && i < 5);
      row.push({
        type: isSoldier ? "soldier" : "cell",
        isRed: isSoldier ? color : null,
        selected: false,
        fromI: null,
        fromJ: null,
        optionToMove: false,
        burnt: false,
      });
    }
    even = !even;
    if (i > 2) {
      color = true;
    }
    gameBoard.push(row);
  }
  gameBoard[66] = [isRedTurn, lockedPiece];
   // שמירת הלוח במערך הלוחות של כל המשחקים הפעילים
  boards[numOfOngoingGames] = gameBoard;
  if (reset) render(gameBoard, numOfOngoingGames);
  else buildNewBoard(gameBoard, numOfOngoingGames);
}
// ניהול בחירת חייל ואפשרויות התזוזה עבורו
function selectCellsAndOptions(i, j, index) {
  setGameBoard(index);
  console.log(isRedTurn, lockedPiece);
  if (gameBoard[i][j].isRed !== isRedTurn || lockedPiece) return;
  if (gameBoard[i][j].selected) {
    cleanSelections();
  } else {
    cleanSelections();
    gameBoard[i][j].selected = true;
    selectOptions(i, j);
  }
  storePotentialCaptures();
  render(gameBoard, index);
}
// פונקציה לחישוב אפשרויות התזוזה לחייל במיקום (i, j)
function selectOptions(i, j) {
  let moves = getPieceMoves(i, j);
  moves.forEach((move) => {
    gameBoard[move.i][move.j].optionToMove = true;
    gameBoard[move.i][move.j].fromI = i;
    gameBoard[move.i][move.j].fromJ = j;
  });
  gameBoard[64] = moves;
}
//סריקה ובדיקה אם יש אפשרות אכילה
function storePotentialCaptures() {
  let results = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (gameBoard[i][j].isRed === isRedTurn) {
        let moves = getPieceMoves(i, j);
        let canCapture = moves.some(
          (move) => move.type === "capture" || move.type === "multiple-capture"
        );
        if (canCapture) results.push({ i: i, j: j });
      }
    }
  }
   // שומר את כל אפשרויות הלכידה במערך הגלובלי gameBoard באינדקס 65
  gameBoard[65] = results;
}

function setGameBoard(index) {
  gameBoard = boards[index];
  isRedTurn = gameBoard[66][0];
  lockedPiece = gameBoard[66][1];
}
//כל התזוזות האפשריות עבור חייל
function getPieceMoves(fromI, fromJ) {
  let moves = [];
  if (gameBoard[fromI][fromJ].type === "soldier") {
    const offset = isRed(fromI, fromJ) ? -1 : 1;

    for (let jOffset of [-1, 1]) {
      let toX = fromI + offset;
      let toY = fromJ + jOffset;

      if (isInsideBoard(toX, toY)) {
        if (isEmpty(toX, toY)) {
          moves.push({ i: toX, j: toY, type: "move" });
        } else if (isRed(toX, toY) !== isRed(fromI, fromJ)) {
          let captures = getCapturePosibilities(fromI, fromJ, toX, toY, false);
          for (let capture of captures) {
            let capturesChain = getCapturePosibilities(
              capture.i,
              capture.j,
              toX,
              toY,
              true
            );
            moves.push(...capturesChain);
          }
          moves.push(...captures);
        }
      }
    }
  } else {
    let offsets = [
      { dx: -1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: 1, dy: 1 },
    ];
     // סריקת כל ארבעת הכיוונים לתזוזה ו/או לכידה
    for (let offset of offsets) {
      let stepI = fromI + offset.dx;
      let stepJ = fromJ + offset.dy;
      while (isInsideBoard(stepI, stepJ) && isEmpty(stepI, stepJ)) {
        moves.push({ i: stepI, j: stepJ, type: "move" });
        stepI += offset.dx;
        stepJ += offset.dy;
      }
      if (
        isInsideBoard(stepI, stepJ) &&
        !isEmpty(stepI, stepJ) &&
        isRed(stepI, stepJ) !== isRed(fromI, fromJ)
      ) {
        startI = stepI - offset.dx;
        startJ = stepJ - offset.dy;
        let captures = getCapturePosibilities(
          startI,
          startJ,
          stepI,
          stepJ,
          false
        );
        moves.push(...captures);
      }
    }
  }
  return removeDuplicates(moves);
}
//סריקה ובדיקה אם יש אפשרות לכידה רגילה ומרובה
function getCapturePosibilities(fromI, fromJ, toX, toY, multiple) {
  let results = [];
  if (isSoldier(fromI, fromJ) && !multiple) {
    offsetX = -(fromI - toX);
    offsetY = -(fromJ - toY);
    if (
      isInsideBoard(toX + offsetX, toY + offsetY) &&
      isEmpty(toX + offsetX, toY + offsetY)
    )
      results.push({ i: toX + offsetX, j: toY + offsetY, type: "capture" });
  } else {
    function addCaptureIfValid(fromI, fromJ, x, y, path) {
      // Check if the move coordinates (x, y) are already in results
      let isDuplicate = results.some((move) => move.i === x && move.j === y);

      // If it's not a duplicate and it's a valid move, add it to results
      if (
        !isDuplicate &&
        isInsideBoard(x, y) &&
        isEmpty(x, y) &&
        hasOpponentPiece(fromI, fromJ, x, y)
      ) {
        let moveType = path.length >= 1 ? "multiple-capture" : "capture"; // Determine the move type
        results.push({ i: x, j: y, type: moveType, path: path }); // Add the move and its path to results
        // Continue exploring in all directions for multiple captures
        exploreCaptureMoves(x, y, [...path, { i: x, j: y }]);
      }
    }

    function exploreCaptureMoves(x, y, path, i = null, j = null) {
      let directions = [
        { dx: -2, dy: -2 },
        { dx: -2, dy: 2 },
        { dx: 2, dy: -2 },
        { dx: 2, dy: 2 },
      ];
      for (let dir of directions) {
        let newX = x + dir.dx;
        let newY = y + dir.dy;
        if (i !== null && j !== null && isQueen(i, j)) {
          let middleX = x + dir.dx / 2;
          let middleY = y + dir.dy / 2;
          if (middleX !== i && middleY !== j) {
            continue;
          }
        }
        addCaptureIfValid(x, y, newX, newY, [...path]); // Pass the path to addCaptureIfValid
      }
    }
    // Start exploring capture moves from the current position
    exploreCaptureMoves(fromI, fromJ, [{ i: fromI, j: fromJ }], toX, toY);
  }

  return results;
}

function hasOpponentPiece(fromI, fromJ, x, y) {
  return (
    isRedTurn !== gameBoard[(fromI + x) / 2][(fromJ + y) / 2].isRed &&
    !isEmpty((fromI + x) / 2, (fromJ + y) / 2)
  );
}

function isInsideBoard(x, y) {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}
//בדיקת תזוזה וציור מחדש
function move(fromI, fromJ, toX, toY, index) {
  setGameBoard(index);
  let hasCaptured = false;
  if (gameBoard[toX][toY].optionToMove) {
    gameBoard[toX][toY] = gameBoard[fromI][fromJ];
    gameBoard[fromI][fromJ] = getNewCell();
    if (isCapture(toX, toY)) {
      removeCapture(fromI, fromJ, toX, toY);
      hasCaptured = true;
      lockedPiece = false;
    } else if (isMultipleCapture(toX, toY)) {
      removeOpponentPieces(fromI, fromJ, toX, toY);
      hasCaptured = true;
      lockedPiece = false;
    } else {
      isAPieceCanBeBurned(fromI, fromJ, toX, toY);
    }
    if (toX === 7 || toX === 0) {
      crowning(gameBoard[toX][toY]);
    }
  }
  verifyEngame(index);
  if (hasCaptured && isCanStillCapture(toX, toY)) {
    lockedPiece = true;
    isRedTurn = !isRedTurn;
  }
  isRedTurn = !isRedTurn;
  gameBoard[66] = [isRedTurn, lockedPiece];
  render(gameBoard, index);
}
//עם המחשק הסתיים
function verifyEngame(index) {
  if (isHasRemovedAllOpponents()) {
    openModal("winner", index);
  } else if (isOpponentCannotMove()) {
    openModal("cannotmove", index);
  } else {
    cleanSelections();
  }
}
//לכידה נוספת
function isCanStillCapture(x, y) {
  let captures = getCapturePosibilities(x, y, null, null, true);
  if (captures.length > 0) {
    captures.forEach((move) => {
      gameBoard[move.i][move.j].optionToMove = true;
      gameBoard[move.i][move.j].fromI = x;
      gameBoard[move.i][move.j].fromJ = y;
    });
    gameBoard[64] = captures;
    gameBoard[x][y].selected = true;
    return true;
  } else {
    return false;
  }
}

function isAPieceCanBeBurned(fromI, fromJ, x, y) {
  if (gameBoard[65].length > 0) {
    indexI = 0;
    indexJ = 0;
    for (let piece of gameBoard[65]) {
      if (piece.i === fromI && piece.j === fromJ) {
        indexI = x;
        indexJ = y;
      } else {
        indexI = piece.i;
        indexJ = piece.j;
      }
      gameBoard[indexI][indexJ].burnt = true;
      break;
    }
  }
}
//בדיקת שרופים
function removeCapture(fromI, fromJ, toX, toY) {
  let indexI = fromI - toX < 0 ? -1 : 1;
  let indexJ = fromJ - toY < 0 ? -1 : 1;
  let capturedI = toX + indexI;
  let capturedJ = toY + indexJ;
  gameBoard[capturedI][capturedJ] = getNewCell();
}
//בדיקה שהכל הוסר להכריז נצחון
function isHasRemovedAllOpponents() {
  let threatenColor = !isRedTurn;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (gameBoard[i][j].isRed === threatenColor) {
        return false;
      }
    }
  }
  return true;
}
//אף תזוזה חוקית
function isOpponentCannotMove() {
  let threatenColor = !isRedTurn;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (
        gameBoard[i][j].isRed === threatenColor &&
        getPieceMoves(i, j).length > 0
      ) {
        return false;
      }
    }
  }
  return true;
}
//לכידה מרובה קפיצה
function removeOpponentPieces(fromI, fromJ, toX, toY) {
  for (let i = 0; i < gameBoard[64].length; i++) {
    let move = gameBoard[64][i];
    if (move.i === toX && move.j === toY && move.type === "multiple-capture") {
      let dx = 0;
      let dy = 0;
      let prevI = fromI;
      let prevJ = fromJ;
      for (let node of move.path) {
        dx = node.i - prevI > 0 ? 1 : -1;
        dy = node.j - prevJ > 0 ? 1 : -1;
        if (node.i - prevI == 0 && node.j - prevJ == 0) {
          dx = dy = 0;
        }
        console.log(
          "removedI: " + (node.i - dx) + " ;removedJ: " + (node.j - dy)
        );
        gameBoard[node.i - dx][node.j - dy] = getNewCell();
        prevI = node.i;
        prevJ = node.j;
      }
      dx = toX - prevI > 0 ? 1 : -1;
      dy = toY - prevJ > 0 ? 1 : -1;
      gameBoard[prevI + dx][prevJ + dy] = getNewCell();

      break;
    }
  }
}
//בדיקת הלכידה
function isCapture(toX, toY) {
  let result = false;
  for (let i = 0; i < gameBoard[64].length; i++) {
    let move = gameBoard[64][i];
    if (move.i === toX && move.j === toY && move.type === "capture") {
      result = true;
      break;
    }
  }
  return result;
}
//רצף אכילות
function isMultipleCapture(toX, toY) {
  let result = false;
  for (let i = 0; i < gameBoard[64].length; i++) {
    let move = gameBoard[64][i];
    if (move.i === toX && move.j === toY && move.type === "multiple-capture") {
      result = true;
      break;
    }
  }
  return result;
}

crowning = function (piece) {
  piece.type = "queen";
};

function getNewCell() {
  return {
    type: "cell",
    optionToMove: false,
  };
}

function isEmpty(i, j) {
  return gameBoard[i][j].type === "cell";
}
function isRed(i, j) {
  return gameBoard[i][j].isRed;
}

function isSoldier(i, j) {
  return gameBoard[i][j].type === "soldier";
}

function isQueen(i, j) {
  return gameBoard[i][j].type === "queen";
}
//ניקוי סימונים
function cleanSelections() {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (
        gameBoard[i][j].type === "soldier" ||
        gameBoard[i][j].type === "queen"
      )
        gameBoard[i][j].selected = false;
      gameBoard[i][j].optionToMove = false;
      gameBoard[i][j].fromI = null;
      gameBoard[i][j].fromJ = null;
    }
  }
}
//מקבלת מערך של תוצאות (במקרה זה, תנועות חוקיות
function removeDuplicates(results) {
  let uniqueResults = [];
  let seenPositions = new Set(); // מבנה נתונים לאחסון מיקומי תוצאות שנראו כבר

  // Iterate through the results array
  for (let move of results) {
    let positionKey = `${move.i},${move.j}`;

    // Check if the position has been seen before
    if (!seenPositions.has(positionKey)) {
      uniqueResults.push(move); // Add the move to the unique results array
      seenPositions.add(positionKey); // Mark the position as seen
    } else {
      let existingMoveIndex = uniqueResults.findIndex(
        (m) => m.i === move.i && m.j === move.j
      );
      if (existingMoveIndex !== -1 && move.type === "capture") {
        uniqueResults[existingMoveIndex] = move;
      }
    }
  }

  return uniqueResults;
}



