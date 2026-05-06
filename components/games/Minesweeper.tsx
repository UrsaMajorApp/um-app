import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '$constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GRID_SIZE = 10;
const MINES_COUNT = 15;
const MAX_BOARD_SIZE = 620;

type Cell = {
  r: number;
  c: number;
  hasMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

export default function Minesweeper({ onFinish }: { onFinish: (score: number) => void }) {
  const { width } = useWindowDimensions();
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState<'playing' | 'won' | 'lost'>('playing');
  const [minesLeft, setMinesLeft] = useState(MINES_COUNT);
  const [firstClick, setFirstClick] = useState(true);

  const initGrid = useCallback(() => {
    const newGrid: Cell[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push({
          r,
          c,
          hasMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setGameOver('playing');
    setMinesLeft(MINES_COUNT);
    setFirstClick(true);
  }, []);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  const boardSize = Math.min(width - 48, MAX_BOARD_SIZE);
  const cellSize = Math.floor((boardSize - 4 - GRID_SIZE * 2) / GRID_SIZE);
  const numberSize = Math.max(14, Math.min(18, cellSize * 0.32));

  const placeMines = (startR: number, startC: number, currentGrid: Cell[][]) => {
    let placed = 0;
    const newGrid = currentGrid.map((row) => row.map((cell) => ({ ...cell })));

    while (placed < MINES_COUNT) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);

      // Don't place on first click cell or its neighbors
      if (Math.abs(r - startR) <= 1 && Math.abs(c - startC) <= 1) continue;
      if (newGrid[r][c].hasMine) continue;

      newGrid[r][c].hasMine = true;
      placed++;
    }

    // Calculate neighbors
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c].hasMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && newGrid[nr][nc].hasMine) {
              count++;
            }
          }
        }
        newGrid[r][c].neighborMines = count;
      }
    }
    return newGrid;
  };

  const revealCell = (r: number, c: number) => {
    if (gameOver !== 'playing' || grid[r][c].isRevealed || grid[r][c].isFlagged) return;

    let newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

    if (firstClick) {
      newGrid = placeMines(r, c, newGrid);
      setFirstClick(false);
    }

    if (newGrid[r][c].hasMine) {
      // Hit mine - reveal all mines
      newGrid.forEach((row) => {
        row.forEach((cell) => {
          if (cell.hasMine) cell.isRevealed = true;
        });
      });
      setGrid(newGrid);
      setGameOver('lost');
      return;
    }

    const floodFill = (row: number, col: number) => {
      if (
        row < 0 ||
        row >= GRID_SIZE ||
        col < 0 ||
        col >= GRID_SIZE ||
        newGrid[row][col].isRevealed ||
        newGrid[row][col].isFlagged
      )
        return;

      newGrid[row][col].isRevealed = true;
      if (newGrid[row][col].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            floodFill(row + dr, col + dc);
          }
        }
      }
    };

    floodFill(r, c);
    setGrid(newGrid);
    checkWin(newGrid);
  };

  const toggleFlag = (r: number, c: number) => {
    if (gameOver !== 'playing' || grid[r][c].isRevealed) return;

    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    const wasFlagged = newGrid[r][c].isFlagged;
    newGrid[r][c].isFlagged = !wasFlagged;
    setMinesLeft((prev) => (wasFlagged ? prev + 1 : prev - 1));
    setGrid(newGrid);
  };

  const checkWin = (currentGrid: Cell[][]) => {
    let revealedCount = 0;
    currentGrid.forEach((row) => {
      row.forEach((cell) => {
        if (cell.isRevealed) revealedCount++;
      });
    });

    if (revealedCount === GRID_SIZE * GRID_SIZE - MINES_COUNT) {
      setGameOver('won');
      onFinish(100); // 100 points for win
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { width: boardSize }]}>
        <View style={styles.statBox}>
          <Feather name="flag" size={16} color="#EF4444" />
          <Text style={styles.statText}>{minesLeft}</Text>
        </View>
        <TouchableOpacity onPress={initGrid} style={styles.resetBtn}>
          <Feather
            name={gameOver === 'won' ? 'smile' : gameOver === 'lost' ? 'frown' : 'refresh-cw'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        <View style={styles.statBox}>
          <Feather name="clock" size={16} color="#3B82F6" />
          <Text style={styles.statText}>IQ 100</Text>
        </View>
      </View>

      <View style={styles.board}>
        <View style={styles.boardInner}>
          {grid.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((cell, c) => (
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.7}
                  onPress={() => revealCell(r, c)}
                  onLongPress={() => toggleFlag(r, c)}
                  style={[
                    styles.cell,
                    { width: cellSize, height: cellSize },
                    cell.isRevealed && styles.cellRevealed,
                    cell.isRevealed && cell.hasMine && styles.cellMine,
                    r === 0 && c === 0 && styles.cellTopLeft,
                    r === 0 && c === GRID_SIZE - 1 && styles.cellTopRight,
                    r === GRID_SIZE - 1 && c === 0 && styles.cellBottomLeft,
                    r === GRID_SIZE - 1 && c === GRID_SIZE - 1 && styles.cellBottomRight,
                  ]}
                >
                  {cell.isRevealed ? (
                    cell.hasMine ? (
                      <Feather name="zap" size={numberSize} color="white" />
                    ) : cell.neighborMines > 0 ? (
                      <Text
                        style={[
                          styles.number,
                          {
                            color: NUMBER_COLORS[cell.neighborMines],
                            fontSize: numberSize,
                          },
                        ]}
                      >
                        {cell.neighborMines}
                      </Text>
                    ) : null
                  ) : cell.isFlagged ? (
                    <Feather name="flag" size={numberSize} color="#EF4444" />
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>Длинное нажатие — поставить флаг</Text>
        {gameOver !== 'playing' && (
          <View style={styles.overlay}>
            <Text style={styles.resultText}>{gameOver === 'won' ? 'Победа!' : 'Бум! Майна!'}</Text>
            <TouchableOpacity onPress={initGrid} style={styles.retryBtn}>
              <Text style={styles.retryText}>Еще раз</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const NUMBER_COLORS: Record<number, string> = {
  1: '#3B82F6',
  2: '#10B981',
  3: '#EF4444',
  4: '#6366F1',
  5: '#8B5CF6',
  6: '#EC4899',
  7: '#F59E0B',
  8: '#1F2937',
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
    gap: 8,
  },
  statText: {
    fontWeight: '900',
    color: COLORS.foreground,
  },
  resetBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  board: {
    backgroundColor: '#D1D5DB',
    padding: 2,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  boardInner: {
    backgroundColor: '#D1D5DB',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    backgroundColor: '#E5E7EB',
    margin: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellTopLeft: {
    borderTopLeftRadius: RADIUS.lg,
  },
  cellTopRight: {
    borderTopRightRadius: RADIUS.lg,
  },
  cellBottomLeft: {
    borderBottomLeftRadius: RADIUS.lg,
  },
  cellBottomRight: {
    borderBottomRightRadius: RADIUS.lg,
  },
  cellRevealed: {
    backgroundColor: 'white',
  },
  cellMine: {
    backgroundColor: '#EF4444',
  },
  number: {
    fontWeight: '900',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  hint: {
    color: COLORS.mutedForeground,
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  overlay: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.foreground,
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  retryText: {
    color: 'white',
    fontWeight: '900',
  },
});
