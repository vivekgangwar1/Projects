const boardElement = document.getElementById("chessboard");
const turnElement = document.getElementById("turn");
const restartBtn = document.getElementById("restartBtn");

const pieces = {
    white: {
        king: "♔",
        queen: "♕",
        rook: "♖",
        bishop: "♗",
        knight: "♘",
        pawn: "♙"
    },

    black: {
        king: "♚",
        queen: "♛",
        rook: "♜",
        bishop: "♝",
        knight: "♞",
        pawn: "♟"
    }
};

let board;
let currentTurn = "white";
let selectedSquare = null;


/* =========================
   CREATE INITIAL BOARD
========================= */

function createInitialBoard() {

    return [

        [
            { type: "rook", color: "black" },
            { type: "knight", color: "black" },
            { type: "bishop", color: "black" },
            { type: "queen", color: "black" },
            { type: "king", color: "black" },
            { type: "bishop", color: "black" },
            { type: "knight", color: "black" },
            { type: "rook", color: "black" }
        ],

        [
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" }
        ],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" }
        ],

        [
            { type: "rook", color: "white" },
            { type: "knight", color: "white" },
            { type: "bishop", color: "white" },
            { type: "queen", color: "white" },
            { type: "king", color: "white" },
            { type: "bishop", color: "white" },
            { type: "knight", color: "white" },
            { type: "rook", color: "white" }
        ]
    ];
}


/* =========================
   DRAW BOARD
========================= */

function drawBoard() {

    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("square");

            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];

            if (piece) {

                const pieceElement = document.createElement("span");

                pieceElement.classList.add("piece");

                pieceElement.textContent =
                    pieces[piece.color][piece.type];

                square.appendChild(pieceElement);
            }

            square.addEventListener("click", handleSquareClick);

            boardElement.appendChild(square);
        }
    }
}


/* =========================
   CLICK HANDLER
========================= */

function handleSquareClick(event) {

    const square = event.currentTarget;

    const row = Number(square.dataset.row);
    const col = Number(square.dataset.col);

    const piece = board[row][col];

    if (!selectedSquare) {

        if (piece && piece.color === currentTurn) {

            selectedSquare = {
                row: row,
                col: col
            };

            square.classList.add("selected");

            showValidMoves(row, col);
        }

        return;
    }


    const fromRow = selectedSquare.row;
    const fromCol = selectedSquare.col;

    const selectedPiece = board[fromRow][fromCol];


    /* Select another own piece */

    if (piece && piece.color === currentTurn) {

        clearHighlights();

        selectedSquare = {
            row: row,
            col: col
        };

        square.classList.add("selected");

        showValidMoves(row, col);

        return;
    }


    /* Check valid movement */

    if (isValidMove(
        fromRow,
        fromCol,
        row,
        col
    )) {

        board[row][col] = selectedPiece;
        board[fromRow][fromCol] = null;

        promotePawn(row, col);

        currentTurn =
            currentTurn === "white"
                ? "black"
                : "white";

        turnElement.textContent =
            currentTurn === "white"
                ? "White's Turn"
                : "Black's Turn";

        selectedSquare = null;

        drawBoard();

    } else {

        alert("Invalid Move!");
    }
}


/* =========================
   SHOW VALID MOVES
========================= */

function showValidMoves(row, col) {

    clearHighlights();

    const squares =
        document.querySelectorAll(".square");

    squares.forEach(square => {

        const targetRow =
            Number(square.dataset.row);

        const targetCol =
            Number(square.dataset.col);

        if (
            isValidMove(
                row,
                col,
                targetRow,
                targetCol
            )
        ) {

            square.classList.add("valid-move");

            if (board[targetRow][targetCol]) {
                square.classList.add("valid-capture");
            }
        }
    });
}


/* =========================
   CLEAR HIGHLIGHTS
========================= */

function clearHighlights() {

    document
        .querySelectorAll(".square")
        .forEach(square => {

            square.classList.remove(
                "selected",
                "valid-move",
                "valid-capture"
            );
        });
}


/* =========================
   VALID MOVE
========================= */

function isValidMove(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    if (
        fromRow === toRow &&
        fromCol === toCol
    ) {
        return false;
    }

    const piece =
        board[fromRow][fromCol];

    if (!piece) {
        return false;
    }

    const target =
        board[toRow][toCol];

    /* Cannot capture own piece */

    if (
        target &&
        target.color === piece.color
    ) {
        return false;
    }

    const rowDiff =
        toRow - fromRow;

    const colDiff =
        toCol - fromCol;


    /* =================
       PAWN
    ================= */

    if (piece.type === "pawn") {

        const direction =
            piece.color === "white"
                ? -1
                : 1;

        const startRow =
            piece.color === "white"
                ? 6
                : 1;

        /* Normal move */

        if (
            colDiff === 0 &&
            rowDiff === direction &&
            !target
        ) {
            return true;
        }

        /* First double move */

        if (
            colDiff === 0 &&
            rowDiff === direction * 2 &&
            fromRow === startRow &&
            !target &&
            !board[
                fromRow + direction
            ][fromCol]
        ) {
            return true;
        }

        /* Capture */

        if (
            Math.abs(colDiff) === 1 &&
            rowDiff === direction &&
            target
        ) {
            return true;
        }

        return false;
    }


    /* =================
       ROOK
    ================= */

    if (piece.type === "rook") {

        if (
            fromRow !== toRow &&
            fromCol !== toCol
        ) {
            return false;
        }

        return isPathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }


    /* =================
       BISHOP
    ================= */

    if (piece.type === "bishop") {

        if (
            Math.abs(rowDiff) !==
            Math.abs(colDiff)
        ) {
            return false;
        }

        return isPathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }


    /* =================
       QUEEN
    ================= */

    if (piece.type === "queen") {

        const straight =
            fromRow === toRow ||
            fromCol === toCol;

        const diagonal =
            Math.abs(rowDiff) ===
            Math.abs(colDiff);

        if (!straight && !diagonal) {
            return false;
        }

        return isPathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }


    /* =================
       KNIGHT
    ================= */

    if (piece.type === "knight") {

        return (
            Math.abs(rowDiff) === 2 &&
            Math.abs(colDiff) === 1
        ) ||
        (
            Math.abs(rowDiff) === 1 &&
            Math.abs(colDiff) === 2
        );
    }


    /* =================
       KING
    ================= */

    if (piece.type === "king") {

        return (
            Math.abs(rowDiff) <= 1 &&
            Math.abs(colDiff) <= 1
        );
    }


    return false;
}


/* =========================
   CHECK PATH
========================= */

function isPathClear(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const rowStep =
        Math.sign(toRow - fromRow);

    const colStep =
        Math.sign(toCol - fromCol);

    let row =
        fromRow + rowStep;

    let col =
        fromCol + colStep;

    while (
        row !== toRow ||
        col !== toCol
    ) {

        if (board[row][col]) {
            return false;
        }

        row += rowStep;
        col += colStep;
    }

    return true;
}


/* =========================
   PAWN PROMOTION
========================= */

function promotePawn(row, col) {

    const piece = board[row][col];

    if (
        piece &&
        piece.type === "pawn" &&
        (
            row === 0 ||
            row === 7
        )
    ) {

        piece.type = "queen";
    }
}


/* =========================
   RESTART GAME
========================= */

restartBtn.addEventListener(
    "click",
    () => {

        board = createInitialBoard();

        currentTurn = "white";

        selectedSquare = null;

        turnElement.textContent =
            "White's Turn";

        drawBoard();
    }
);


/* =========================
   START GAME
========================= */

board = createInitialBoard();

drawBoard();