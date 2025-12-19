import {
  NONE,
  WHITE_NORMAL,
  WHITE_JATSHIE,
  YELLOW_NORMAL,
  YELLOW_JATSHIE,
  ROLE_JATSHIE,
  ROLE_LAPACH,
  ROLE_POTYSIN,
  ROLE_PYRITS,
  ROLE_HADRIV,
  ROLE_POLUIS,
} from "./consts.js";

export function checkRoles(
  content: string[][],
  roles: string[][][],
  flipped: boolean = false
): string[][][] {
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      roles[i][j] = [];
      if (content[i][j] === NONE) continue;

      roles[i][j] = checkRole(content, i, j, flipped);
    }
  }

  return roles;
}

export function checkRole(
  content: string[][],
  i: number,
  j: number,
  flipped: boolean = false
): string[] {
  const result = [ROLE_POLUIS];

  // JATSHIE
  const color =
    content[i][j] === WHITE_NORMAL || content[i][j] === WHITE_JATSHIE
      ? "W"
      : "Y";

  let diagonalNeighbors = 0;
  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  for (const [dx, dy] of directions) {
    const ni = i + dx;
    const nj = j + dy;
    if (ni < 0 || ni >= 7 || nj < 0 || nj >= 7) continue;
    if (content[ni][nj] === NONE) continue;
    const neighborColor =
      content[ni][nj] === WHITE_NORMAL || content[ni][nj] === WHITE_JATSHIE
        ? "W"
        : "Y";
    if (neighborColor !== color) continue;
    diagonalNeighbors++;
  }

  if (diagonalNeighbors >= 3) {
    content[i][j] = color === "W" ? WHITE_JATSHIE : YELLOW_JATSHIE;
    result.push(ROLE_JATSHIE);
  } else {
    content[i][j] = color === "W" ? WHITE_NORMAL : YELLOW_NORMAL;
  }

  // LAPACH
  if (!flipped && ((color === "Y" && i < 3) || (color === "W" && i > 3))) {
    result.push(ROLE_LAPACH);
  }
  if (flipped && ((color === "Y" && i > 3) || (color === "W" && i < 3))) {
    result.push(ROLE_LAPACH);
  }

  // POTYSIN
  let orthoNeighbors = 0;
  const orthoDirections = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dx, dy] of orthoDirections) {
    const ni = i + dx;
    const nj = j + dy;
    if (ni < 0 || ni >= 7 || nj < 0 || nj >= 7) continue;
    if (content[ni][nj] === NONE) continue;
    const neighborColor =
      content[ni][nj] === WHITE_NORMAL || content[ni][nj] === WHITE_JATSHIE
        ? "W"
        : "Y";
    if (neighborColor !== color) continue;
    orthoNeighbors++;
  }
  if (orthoNeighbors + diagonalNeighbors >= 3) {
    result.push(ROLE_POTYSIN);
  }

  // PYRITS
  if (i === 0 || i === 6 || j === 0 || j === 6) {
    result.push(ROLE_PYRITS);
  }

  // HADRIV
  if (orthoNeighbors >= 1) {
    result.push(ROLE_HADRIV);
  }

  return result;
}

export function isLegalMove(
  role: string,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  board: string[][]
): boolean {
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;
  const rowDiffAbs = Math.abs(rowDiff);
  const colDiffAbs = Math.abs(colDiff);

  if (role === ROLE_JATSHIE) {
    if (rowDiffAbs === 0 && colDiffAbs === 1) return true;
    if (rowDiffAbs === 1 && colDiffAbs === 0) return true;
    return false;
  }

  if (role === ROLE_LAPACH) {
    if (rowDiffAbs === 0 || colDiffAbs === 0) return true;
    if (rowDiffAbs === 1 && colDiffAbs === 1) return true;
    return false;
  }

  if (role === ROLE_POTYSIN) {
    if (rowDiffAbs === 1 && colDiffAbs === 1) return true;
    if (rowDiffAbs === 0 && colDiffAbs === 1) return true;
    if (rowDiffAbs === 1 && colDiffAbs === 0) return true;
    return false;
  }

  if (role === ROLE_PYRITS) {
    if ((fromCol === 0 || fromCol === 6) && rowDiffAbs === 0) return true;
    if ((fromRow === 0 || fromRow === 6) && colDiffAbs === 0) return true;
    return false;
  }

  if (role === ROLE_HADRIV) {
    if (
      (board[fromRow + 1][fromCol] === YELLOW_NORMAL ||
        board[fromRow + 1][fromCol] === YELLOW_JATSHIE) &&
      rowDiff === 2 &&
      colDiffAbs === 1
    )
      return true;

    if (
      (board[fromRow - 1][fromCol] === YELLOW_NORMAL ||
        board[fromRow - 1][fromCol] === YELLOW_JATSHIE) &&
      rowDiff === -2 &&
      colDiffAbs === 1
    )
      return true;

    if (
      (board[fromRow][fromCol + 1] === YELLOW_NORMAL ||
        board[fromRow][fromCol + 1] === YELLOW_JATSHIE) &&
      colDiff === 2 &&
      rowDiffAbs === 1
    )
      return true;

    if (
      (board[fromRow][fromCol - 1] === YELLOW_NORMAL ||
        board[fromRow][fromCol - 1] === YELLOW_JATSHIE) &&
      colDiff === -2 &&
      rowDiffAbs === 1
    )
      return true;

    return false;
  }

  if (role === ROLE_POLUIS) {
    const color =
      board[fromRow][fromCol] === YELLOW_NORMAL ||
      board[fromRow][fromCol] === YELLOW_JATSHIE
        ? "Y"
        : "W";
    if (color === "Y" && rowDiff === -1 && colDiff === 0) return true;
    if (color === "W" && rowDiff === 1 && colDiff === 0) return true;
    return false;
  }

  return false;
}
