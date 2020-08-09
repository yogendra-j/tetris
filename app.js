let canvas;
let c;
let gameArrayHeight = 20;
let gameArrayWidth = 12;
let startX = 4;
let startY = 0;
let score = 0;
let level = 1;
let status = "playing";

//2D game board and position array
let gameBoardArray = [...Array(gameArrayHeight)].map((col) =>
  Array(gameArrayWidth).fill(0)
);
let positionArray = [...Array(gameArrayHeight)].map((col) =>
  Array(gameArrayWidth).fill(0)
);
let bottomPiecesArray = [...Array(gameArrayHeight)].map((col) =>
  Array(gameArrayWidth).fill(0)
);
let piecesArray = [];
let pieceColorArray = ["green", "red", "yellow", "silver"];
let Direction = {
  idle: 0,
  down: 1,
  left: 2,
  right: 3,
};
let pieceDirection;
//tetris piece
let piece = [
  [1, 0],
  [0, 1],
  [1, 1],
  [2, 1],
];
let pieceColor;

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
//creat mapping btween gameboard [r][c] and canvas [x][y]
const createPositionArray = () => {
  let i = 0,
    j = 0;
  for (let y = 9; y <= 446; y += 23) {
    for (let x = 11; x <= 264; x += 23) {
      positionArray[j][i] = new Position(x, y);
      i++;
    }
    i = 0;
    j++;
  }
};

//setup playarea
const SetupGame = () => {
  canvas = document.getElementById("canvas");
  c = canvas.getContext("2d");
  canvas.width = 463;
  canvas.height = 470;
  // c.scale(2, 2);
  c.fillStyle = "rgba(255, 255, 255, .1)";
  c.fillRect(8, 8, canvas.width, canvas.height);
  c.strokeStyle = "black";
  c.strokeRect(8, 8, 280, 462);
  c.strokeStyle = "blue";
  c.strokeRect(8, 8, 280, 462);

  //logo
  tetrisLogo = new Image(128, 128);
  tetrisLogo.onload = drawLogo;
  tetrisLogo.src = "tetris.png";
  //score
  c.fillStyle = "black";
  c.font = "21px Arial";
  c.fillText("SCORE", 300, 98);
  c.strokeRect(300, 107, 161, 24);
  c.fillText(score.toString(), 310, 127);
  c.fillText("LEVEL", 300, 157);
  c.strokeRect(300, 171, 161, 24);
  c.fillText(level.toString(), 310, 190);
  c.fillText("WIN / Lose", 300, 221);
  c.fillText(status, 310, 261);
  c.strokeRect(300, 232, 161, 95);
  c.fillText("CONTROLS", 300, 354);
  c.strokeRect(300, 366, 161, 104);

  c.font = "19px Arial";
  c.fillText("A/⬅: Move Left", 310, 388);
  c.fillText("D/➡: Move Right", 310, 413);
  c.fillText("S/⬇: Move Down", 310, 438);
  c.fillText("E: Rotate Right", 310, 463);

  //event listner for keypress
  document.addEventListener("keydown", buttonPressAction);
  createPiecesArray();
  createPiece();
  createPositionArray();
  drawTetris();
};

const drawLogo = () => {
  c.drawImage(tetrisLogo, 330, 8, 80, 70);
};

const drawTetris = () => {
  for (let i = 0; i < piece.length; i++) {
    let x = piece[i][0] + startX;
    let y = piece[i][1] + startY;
    gameBoardArray[x][y] = 1;
    let posX = positionArray[y][x].x;
    let posY = positionArray[y][x].y;
    c.fillStyle = pieceColor;
    c.fillRect(posX, posY, 21, 21);
  }
};

const buttonPressAction = (key) => {
  if (status === "Game Over") {
    return;
  }
  if (key.keyCode === 65 || key.keyCode === 37) {
    pieceDirection = Direction.left;
    if (leftRightOutOfBound() || horizontalCollision()) {
      return;
    }
    deletePiece();
    startX--;
    drawTetris();
  } else if (key.keyCode === 68 || key.keyCode === 39) {
    pieceDirection = Direction.right;
    if (leftRightOutOfBound() || horizontalCollision()) {
      return;
    }
    deletePiece();
    startX++;
    drawTetris();
  } else if (key.keyCode === 83 || key.keyCode === 40) {
    downMovement();
  } else if (key.keyCode == 69) {
    rotatePiece();
  }
};

const downMovement = () => {
  pieceDirection = Direction.down;

  if (downCollision()) {
    return;
  } else {
    deletePiece();
    startY++;
    drawTetris();
  }
};

const downCollision = () => {
  let pieceCopy = piece;
  let collision = false;
  for (let i = 0; i < pieceCopy.length; i++) {
    let square = pieceCopy[i];
    let x = square[0] + startX;
    let y = square[1] + startY;
    if (pieceDirection === Direction.down) {
      y++;
    }
    if (typeof bottomPiecesArray[x][y + 1] === "string") {
      deletePiece();
      startY++;
      drawTetris();
      collision = true;
      break;
    }
    if (y >= 20) {
      collision = true;
      break;
    }
  }
  if (collision) {
    //verticcal collision at the top
    if (startY <= 1) {
      status = "Game Over";
      //changeing status
      c.fillStyle = "white";
      c.fillRect(310, 242, 140, 30);
      c.fillStyle = "red";
      c.fillText(status, 310, 261);
      //anumation game over
      let animationTime = 10; //animation time
      let initialTime = 0;
      for (let i = positionArray.length - 1; i >= 0; i--) {
        for (let j = 0; j < positionArray[0].length; j++) {
          initialTime += animationTime;

          setTimeout(() => {
            c.fillStyle = "black";
            c.fillRect(positionArray[i][j].x, positionArray[i][j].y, 21, 21);
          }, initialTime);
        }
      }
      setTimeout(() => {
        c.fillStyle = "yellow";
        c.fillRect(45, 140, 200, 200);
        c.fillStyle = "red";
        c.fillText(status, 90, 250, 1000);
      }, initialTime);
    } else {
      for (let i = 0; i < piece.length; i++) {
        let square = piece[i];
        let x = square[0] + startX;
        let y = square[1] + startY;
        bottomPiecesArray[x][y] = pieceColor;
      }
      didScore();
      createPiece();
      pieceDirection = Direction.idle;
      startX = 4;
      startY = 0;
      drawTetris();
    }
  }
  return collision;
};

const horizontalCollision = () => {
  let pieceCopy = piece;
  let collision = false;
  for (let i = 0; i < pieceCopy.length; i++) {
    let square = pieceCopy[i];
    let x = square[0] + startX;
    let y = square[0] + startY;

    if (pieceDirection === Direction.left) {
      x--;
    } else if (pieceDirection === Direction.right) {
      x++;
    }
    let stoppedPiece = bottomPiecesArray[x][y];
    if (typeof stoppedPiece === "string") {
      collision = true;
      break;
    }
  }
  return collision;
};
//check if rows need to be deleted and change score
const didScore = () => {
  let rowsToRemove = 0;
  let startOfRemove = 0;
  for (let y = 0; y < gameArrayHeight; y++) {
    let completed = true;
    for (let x = 0; x < gameArrayWidth; x++) {
      let square = bottomPiecesArray[x][y];
      if (square === 0 || typeof square === "undefined") {
        completed = false;
        break;
      }
    }
    if (completed) {
      if (startOfRemove === 0) startOfRemove = y;
      rowsToRemove++;
      for (let i = 0; i < gameArrayWidth; i++) {
        bottomPiecesArray[i][y] = 0;
        gameBoardArray[i][y] = 0;
        let posX = positionArray[y][i].x;
        let posY = positionArray[y][i].y;
        c.fillStyle = "white";
        c.fillRect(posX, posY, 21, 21);
      }
    }
  }
  if (rowsToRemove > 0) {
    score += rowsToRemove;
    //check if level up
    if (score >= 10) {
      score = score - 10;
      level += 1;
      c.fillStyle = "white";
      c.fillRect(310, 174, 14, 19);
      c.fillStyle = "red";
      c.fillText(level.toString(), 310, 190);
      //level up animation
      levelUp();
    }
    c.fillStyle = "white";
    c.fillRect(310, 109, 140, 19);
    c.fillStyle = "black";
    c.fillText(score.toString(), 310, 127);
    rowsRemove(rowsToRemove, startOfRemove);
  }
};
//remove completed rows
const rowsRemove = (rowsToRemove, startOfRemove) => {
  for (let i = startOfRemove - 1; i >= 0; i--) {
    for (let x = 0; x < gameArrayWidth; x++) {
      let y2 = i + rowsToRemove;
      let square = bottomPiecesArray[x][i];
      let nextSquare = bottomPiecesArray[x][y2];
      if (typeof square === "string") {
        nextSquare = square;
        gameBoardArray[x][y2] = 1;
        bottomPiecesArray[x][y2] = square;
        let posX = positionArray[y2][x].x;
        let posY = positionArray[y2][x].y;
        c.fillStyle = nextSquare;
        c.fillRect(posX, posY, 21, 21);

        square = 0;
        gameBoardArray[x][i] = 0;
        bottomPiecesArray[x][i] = 0;
        posX = positionArray[i][x].x;
        posY = positionArray[i][x].y;
        c.fillStyle = "white";
        c.fillRect(posX, posY, 21, 21);
      }
    }
  }
};

//draw white
const deletePiece = () => {
  for (let i = 0; i < piece.length; i++) {
    let x = piece[i][0] + startX;
    let y = piece[i][1] + startY;
    gameBoardArray[x][y] = 0;
    let posX = positionArray[y][x].x;
    let posY = positionArray[y][x].y;
    c.fillStyle = "white";
    c.fillRect(posX, posY, 21, 21);
  }
};

const createPiecesArray = () => {
  //T
  piecesArray.push([
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ]);
  //I
  piecesArray.push([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ]);
  //J
  piecesArray.push([
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ]);
  //sqr
  piecesArray.push([
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ]);
  //L
  piecesArray.push([
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ]);
  //s
  piecesArray.push([
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ]);
  //z
  piecesArray.push([
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ]);
};

const createPiece = () => {
  const randomIndx = Math.floor(Math.random() * piece.length);
  piece = piecesArray[randomIndx];
  pieceColor = pieceColorArray[randomIndx];
};

const leftRightOutOfBound = () => {
  for (let i = 0; i < piece.length; i++) {
    let newX = piece[i][0] + startX;
    if (newX <= 0 && pieceDirection === Direction.left) {
      return true;
    } else if (newX >= 11 && pieceDirection === Direction.right) {
      return true;
    }
  }
  return false;
};

const rotatePiece = () => {
  let rotatedPiece = new Array();
  let pieceCopy = piece;
  let pieceBU;
  for (let i = 0; i < pieceCopy.length; i++) {
    pieceBU = [...pieceCopy];
    let x = pieceCopy[i][0];
    let y = pieceCopy[i][1];
    let newX = getLastSquareX() - y;
    let newY = x;
    rotatedPiece.push([newX, newY]);
  }
  deletePiece();
  try {
    piece = rotatedPiece;
    drawTetris();
  } catch (e) {
    if (e instanceof TypeError) {
      piece = pieceBU;
      deletePiece();
      drawTetris();
    }
  }
};

const getLastSquareX = () => {
  let lastX = 0;
  for (let i = 0; i < piece.length; i++) {
    let square = piece[i];
    if (square[0] > lastX) {
      lastX = square[0];
    }
    return lastX;
  }
};

//auto down movement depending upon level
window.setInterval(() => {
  if (status === "playing") {
    downMovement();
  }
}, 500 - 80 * level); //speed will increase with level
SetupGame();
