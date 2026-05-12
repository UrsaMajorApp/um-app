// Sudoku: реализует сетку судоку, ввод чисел, проверку ошибок и завершение игры.
import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  Platform, StyleSheet, Text, UIManager, useWindowDimensions, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import {
  SUDOKU_BASE_BOARD,
  SUDOKU_BOARD_PADDING as BOARD_PADDING,
  SUDOKU_GRID_SIZE as GRID_SIZE,
  SUDOKU_MAX_BOARD_SIZE as MAX_BOARD_SIZE,
} from '$constants/games';
import { COLORS, RADIUS, SHADOWS } from '$constants/theme';
import type { SudokuCell as Cell } from '$types/games';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Sudoku({ onFinish }: { onFinish: (score: number) => void }) {
  const { width } = useWindowDimensions();
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const generateSudoku = useCallback(() => {
    // Simple Sudoku generator using shuffling of a base board
    // Shuffle rows within 3x3 blocks
    const shuffle = <T,>(arr: T[]) => arr.sort(() => Math.random() - 0.5);

    const rowBlocks = [0, 1, 2].map((i) => shuffle([i * 3, i * 3 + 1, i * 3 + 2]));
    const shuffledRows = rowBlocks.flat();

    let board = shuffledRows.map((r) => SUDOKU_BASE_BOARD[r]);

    // Shuffle columns within 3x3 blocks
    const colBlocks = [0, 1, 2].map((i) => shuffle([i * 3, i * 3 + 1, i * 3 + 2]));
    const shuffledCols = colBlocks.flat();

    board = board.map((row) => shuffledCols.map((c) => row[c]));

    setSolution(board.map((row) => [...row]));

    // Mask cells for difficulty
    const maskedGrid: Cell[][] = board.map((row, r) =>
      row.map((val, c) => ({
        r,
        c,
        value: Math.random() > 0.4 ? val : 0,
        original: true,
        error: false,
      })),
    );

    // Mark original non-zero cells
    maskedGrid.forEach((row) => {
      row.forEach((cell) => {
        if (cell.value === 0) cell.original = false;
      });
    });

    setGrid(maskedGrid);
    setGameOver(false);
    setMistakes(0);
    setSelectedCell(null);
  }, []);

  useEffect(() => {
    generateSudoku();
  }, [generateSudoku]);

  const boardSize = Math.min(width - BOARD_PADDING * 2, MAX_BOARD_SIZE);
  const cellSize = Math.floor((boardSize - 13) / GRID_SIZE);
  const numberPadButtonSize = Math.min(50, Math.max(40, cellSize * 0.82));
  const cellTextSize = Math.max(16, Math.min(24, cellSize * 0.36));

  const handleNumberInput = (num: number) => {
    if (!selectedCell || gameOver) return;
    const { r, c } = selectedCell;
    if (grid[r][c].original) return;

    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    const isCorrect = solution[r][c] === num;

    if (isCorrect) {
      newGrid[r][c].value = num;
      newGrid[r][c].error = false;
      setGrid(newGrid);
      checkWin(newGrid);
    } else {
      newGrid[r][c].value = num;
      newGrid[r][c].error = true;
      setMistakes((prev) => prev + 1);
      setGrid(newGrid);
      if (mistakes + 1 >= 5) {
        // Game over logic if too many mistakes? For now just visual.
      }
    }
  };

  const checkWin = (currentGrid: Cell[][]) => {
    const isComplete = currentGrid.every((row) =>
      row.every((cell) => cell.value !== 0 && !cell.error),
    );
    if (isComplete) {
      setGameOver(true);
      onFinish(150); // 150 points for Sudoku
    }
  };

  const isRelated = (r: number, c: number) => {
    if (!selectedCell) return false;
    const { r: sr, c: sc } = selectedCell;
    // Same row, column or 3x3 box
    if (r === sr || c === sc) return true;
    if (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3))
      return true;
    // Same value
    if (grid[r][c].value !== 0 && grid[r][c].value === grid[sr][sc].value) return true;
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { width: boardSize }]}>
        <View style={styles.statBox}>
          <Feather
            name="x-circle"
            size={16}
            color={mistakes > 0 ? COLORS.destructive : COLORS.mutedForeground}
          />
          <Text style={styles.statText}>{mistakes}/5</Text>
        </View>
        <PressableScale onPress={generateSudoku} style={styles.resetBtn}>
          <Feather name="refresh-cw" size={20} color="white" />
        </PressableScale>
        <View style={styles.statBox}>
          <Feather name="award" size={16} color="#F59E0B" />
          <Text style={styles.statText}>150 IQ</Text>
        </View>
      </View>

      <View style={styles.board}>
        <View style={styles.boardInner}>
          {grid.map((row) => {
            const rowNumber = row[0]?.r ?? 0;
            return (
              <View
                key={`row-${rowNumber}`}
                style={[styles.row, rowNumber % 3 === 2 && rowNumber !== 8 && styles.rowBorder]}
              >
                {row.map((cell) => (
                  <PressableScale
                    key={`cell-${cell.r}-${cell.c}`}
                    activeOpacity={1}
                    onPress={() => setSelectedCell({ r: cell.r, c: cell.c })}
                    style={[
                      styles.cell,
                      { width: cellSize, height: cellSize },
                      cell.c % 3 === 2 && cell.c !== 8 && styles.cellBorder,
                      selectedCell?.r === cell.r && selectedCell?.c === cell.c && styles.cellActive,
                      !cell.original && isRelated(cell.r, cell.c) && styles.cellRelated,
                      cell.error && styles.cellError,
                      cell.r === 0 && cell.c === 0 && styles.cellTopLeft,
                      cell.r === 0 && cell.c === GRID_SIZE - 1 && styles.cellTopRight,
                      cell.r === GRID_SIZE - 1 && cell.c === 0 && styles.cellBottomLeft,
                      cell.r === GRID_SIZE - 1 &&
                        cell.c === GRID_SIZE - 1 &&
                        styles.cellBottomRight,
                    ]}
                  >
                    {cell.value !== 0 && (
                      <Text
                        style={[
                          styles.cellText,
                          { fontSize: cellTextSize },
                          cell.original ? styles.textOriginal : styles.textInput,
                          cell.error && styles.textError,
                        ]}
                      >
                        {cell.value}
                      </Text>
                    )}
                  </PressableScale>
                ))}
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.numberPad, { width: boardSize }]}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <PressableScale
            key={num}
            onPress={() => handleNumberInput(num)}
            style={[styles.padBtn, { width: numberPadButtonSize, height: numberPadButtonSize }]}
          >
            <Text style={styles.padBtnText}>{num}</Text>
          </PressableScale>
        ))}
      </View>

      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Feather name="check-circle" size={48} color="#10B981" />
            <Text style={styles.winText}>Превосходно!</Text>
            <Text style={styles.winSub}>Головоломка решена</Text>
            <PressableScale onPress={generateSudoku} style={styles.continueBtn}>
              <Text style={styles.continueText}>Еще разок</Text>
            </PressableScale>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: BOARD_PADDING,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
    gap: 6,
  },
  statText: {
    fontWeight: '900',
    color: COLORS.foreground,
    fontSize: 13,
  },
  resetBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  board: {
    backgroundColor: '#1F2937',
    padding: 3,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  boardInner: {
    backgroundColor: '#1F2937',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  rowBorder: {
    borderBottomWidth: 2,
    borderBottomColor: '#1F2937',
  },
  cell: {
    backgroundColor: 'white',
    margin: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellTopLeft: {
    borderTopLeftRadius: RADIUS.md,
  },
  cellTopRight: {
    borderTopRightRadius: RADIUS.md,
  },
  cellBottomLeft: {
    borderBottomLeftRadius: RADIUS.md,
  },
  cellBottomRight: {
    borderBottomRightRadius: RADIUS.md,
  },
  cellBorder: {
    borderRightWidth: 2,
    borderRightColor: '#1F2937',
  },
  cellActive: {
    backgroundColor: '#E0E7FF',
  },
  cellRelated: {
    backgroundColor: '#F3F4F6',
  },
  cellError: {
    backgroundColor: '#FEE2E2',
  },
  cellText: {
    fontWeight: '700',
  },
  textOriginal: {
    color: '#1F2937',
    fontWeight: '900',
  },
  textInput: {
    color: COLORS.primary,
  },
  textError: {
    color: COLORS.destructive,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 30,
    gap: 10,
  },
  padBtn: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  padBtnText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  overlayContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 40,
    borderRadius: RADIUS.xxl,
    ...SHADOWS.lg,
  },
  winText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.foreground,
    marginTop: 20,
  },
  winSub: {
    color: COLORS.mutedForeground,
    marginBottom: 30,
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: RADIUS.xl,
  },
  continueText: {
    color: 'white',
    fontWeight: '900',
  },
});
