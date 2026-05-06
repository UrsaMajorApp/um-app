import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { COLORS, RADIUS } from "../../constants/theme";

const GRID_SIZE = 4;
const CELL_MARGIN = 10;
const MAX_BOARD_SIZE = 520;

const TILE_COLORS: Record<number, string> = {
  2: "#EEE4DA",
  4: "#EDE0C8",
  8: "#F2B179",
  16: "#F59563",
  32: "#F67C5F",
  64: "#F65E3B",
  128: "#EDCF72",
  256: "#EDCC61",
  512: "#EDC850",
  1024: "#EDC53F",
  2048: "#EDC22E",
};

const TEXT_COLORS: Record<string | number, string> = {
  2: "#776E65",
  4: "#776E65",
  default: "white",
};

type Direction = "up" | "down" | "left" | "right";

type Tile = {
  id: number;
  row: number;
  col: number;
  value: number;
  isNew?: boolean;
  isMerged?: boolean;
};

function createEmptyGrid() {
  return Array(GRID_SIZE)
    .fill(0)
    .map(() => Array(GRID_SIZE).fill(0));
}

function buildGrid(tiles: Tile[]) {
  const grid = createEmptyGrid();
  tiles.forEach((tile) => {
    grid[tile.row][tile.col] = tile.value;
  });
  return grid;
}

function hasMovesRemaining(tiles: Tile[]) {
  if (tiles.length < GRID_SIZE * GRID_SIZE) return true;

  const grid = buildGrid(tiles);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (c < GRID_SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
      if (r < GRID_SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

function moveTiles(tiles: Tile[], direction: Direction) {
  const nextTiles: Tile[] = [];
  let scoreDelta = 0;
  let moved = false;

  const getLineTiles = (line: number) => {
    if (direction === "left")
      return tiles
        .filter((tile) => tile.row === line)
        .sort((a, b) => a.col - b.col);
    if (direction === "right")
      return tiles
        .filter((tile) => tile.row === line)
        .sort((a, b) => b.col - a.col);
    if (direction === "up")
      return tiles
        .filter((tile) => tile.col === line)
        .sort((a, b) => a.row - b.row);
    return tiles
      .filter((tile) => tile.col === line)
      .sort((a, b) => b.row - a.row);
  };

  const getTargetPosition = (line: number, offset: number) => {
    if (direction === "left") return { row: line, col: offset };
    if (direction === "right")
      return { row: line, col: GRID_SIZE - 1 - offset };
    if (direction === "up") return { row: offset, col: line };
    return { row: GRID_SIZE - 1 - offset, col: line };
  };

  for (let line = 0; line < GRID_SIZE; line++) {
    const lineTiles = getLineTiles(line);
    let targetOffset = 0;

    for (let i = 0; i < lineTiles.length; i++) {
      const current = lineTiles[i];
      const next = lineTiles[i + 1];
      const target = getTargetPosition(line, targetOffset);

      if (next && current.value === next.value) {
        const value = current.value * 2;
        scoreDelta += value;
        moved =
          moved ||
          current.row !== target.row ||
          current.col !== target.col ||
          next.row !== target.row ||
          next.col !== target.col;
        nextTiles.push({
          ...current,
          ...target,
          value,
          isMerged: true,
          isNew: false,
        });
        i++;
      } else {
        moved =
          moved || current.row !== target.row || current.col !== target.col;
        nextTiles.push({
          ...current,
          ...target,
          isMerged: false,
          isNew: false,
        });
      }

      targetOffset++;
    }
  }

  return { moved, scoreDelta, tiles: nextTiles };
}

function AnimatedTile({ tile, cellSize }: { tile: Tile; cellSize: number }) {
  const targetLeft =
    CELL_MARGIN + CELL_MARGIN / 2 + tile.col * (cellSize + CELL_MARGIN);
  const targetTop =
    CELL_MARGIN + CELL_MARGIN / 2 + tile.row * (cellSize + CELL_MARGIN);

  const leftVal = useSharedValue(targetLeft);
  const topVal = useSharedValue(targetTop);
  const scale = useSharedValue(1);

  useEffect(() => {
    leftVal.value = withTiming(targetLeft, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
    topVal.value = withTiming(targetTop, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
  }, [targetLeft, targetTop]);

  useEffect(() => {
    if (tile.isMerged) {
      scale.value = withSequence(
        withTiming(1.12, { duration: 80 }),
        withTiming(1, { duration: 120 }),
      );
    }
  }, [tile.isMerged, tile.value]);

  const animatedStyle = useAnimatedStyle(() => ({
    left: leftVal.value,
    top: topVal.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      exiting={FadeOut.duration(90)}
      style={[
        styles.tile,
        {
          width: cellSize,
          height: cellSize,
          backgroundColor: TILE_COLORS[tile.value] || "#3C3A32",
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.cellText,
          {
            color: TEXT_COLORS[tile.value] || TEXT_COLORS.default,
            fontSize:
              tile.value > 100
                ? Math.max(22, cellSize * 0.28)
                : Math.max(28, cellSize * 0.38),
          },
        ]}
      >
        {tile.value}
      </Text>
    </Animated.View>
  );
}

export default function Game2048({
  onFinish,
}: {
  onFinish: (score: number) => void;
}) {
  const { width } = useWindowDimensions();
  const nextTileId = useRef(1);
  const isMoving = useRef(false);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const boardSize = Math.min(width - 48, MAX_BOARD_SIZE);
  const cellSize = (boardSize - CELL_MARGIN * (GRID_SIZE + 2)) / GRID_SIZE;
  const isDesktopWeb = Platform.OS === "web" && width >= 768;
  const hintText = isDesktopWeb
    ? "Используйте стрелки или мышь, чтобы перемещать плитки"
    : "Свайпайте, чтобы перемещать плитки";

  const addRandomTile = useCallback((currentTiles: Tile[]) => {
    const occupied = new Set(
      currentTiles.map((tile) => `${tile.row}:${tile.col}`),
    );
    const emptyCells = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!occupied.has(`${row}:${col}`)) emptyCells.push({ row, col });
      }
    }

    if (emptyCells.length === 0) return currentTiles;

    const { row, col } =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return [
      ...currentTiles,
      {
        id: nextTileId.current++,
        row,
        col,
        value: Math.random() < 0.9 ? 2 : 4,
        isNew: true,
      },
    ];
  }, []);

  const initGame = useCallback(() => {
    nextTileId.current = 1;
    let nextTiles: Tile[] = [];
    nextTiles = addRandomTile(nextTiles);
    nextTiles = addRandomTile(nextTiles);
    setTiles(nextTiles);
    setScore(0);
    setGameOver(false);
  }, [addRandomTile]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const move = useCallback(
    (direction: Direction) => {
      if (gameOver || isMoving.current) return;

      const result = moveTiles(tiles, direction);
      if (!result.moved) return;

      isMoving.current = true;
      const newScore = score + result.scoreDelta;
      setTiles(result.tiles);
      setScore(newScore);

      setTimeout(() => {
        isMoving.current = false;
        const tilesWithNewTile = addRandomTile(result.tiles);
        setTiles(tilesWithNewTile);
        if (!hasMovesRemaining(tilesWithNewTile)) {
          setGameOver(true);
          onFinish(newScore);
        }
      }, 110);
    },
    [addRandomTile, gameOver, onFinish, score, tiles],
  );

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyToDirection: Record<string, "up" | "down" | "left" | "right"> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const direction = keyToDirection[event.key];
      if (!direction) return;

      event.preventDefault();
      move(direction);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  const swipeGesture = React.useMemo(
    () =>
      Gesture.Pan().onEnd((e) => {
        const { translationX, translationY } = e;
        const absX = Math.abs(translationX);
        const absY = Math.abs(translationY);

        if (Math.max(absX, absY) < 30) return;

        if (absX > absY) {
          if (translationX > 0) runOnJS(move)("right");
          else runOnJS(move)("left");
        } else {
          // Отрицательный translationY - свайп вверх, положительный - вниз.
          if (translationY < 0) runOnJS(move)("up");
          else runOnJS(move)("down");
        }
      }),
    [move],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { width: boardSize }]}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>СЧЕТ</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <TouchableOpacity onPress={initGame} style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>НОВАЯ ИГРА</Text>
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={swipeGesture}>
        <View style={[styles.board, { width: boardSize, height: boardSize }]}>
          {Array.from({ length: GRID_SIZE }).map((_, r) => (
            <View key={r} style={styles.row}>
              {Array.from({ length: GRID_SIZE }).map((__, c) => (
                <View
                  key={c}
                  style={[styles.cell, { width: cellSize, height: cellSize }]}
                />
              ))}
            </View>
          ))}
          {tiles.map((tile) => (
            <AnimatedTile key={tile.id} tile={tile} cellSize={cellSize} />
          ))}
          {gameOver && (
            <View style={styles.overlay}>
              <Text style={styles.gameOverText}>Игра окончена!</Text>
              <TouchableOpacity onPress={initGame} style={styles.overlayBtn}>
                <Text style={styles.overlayBtnText}>Еще раз</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </GestureDetector>

      <Text style={styles.hint}>{hintText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  scoreContainer: {
    backgroundColor: "#BBADA0",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  scoreLabel: {
    color: "#EEE4DA",
    fontWeight: "bold",
    fontSize: 10,
  },
  scoreValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },
  resetBtn: {
    backgroundColor: "#8F7A66",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
  },
  resetBtnText: {
    color: "white",
    fontWeight: "900",
    fontSize: 14,
  },
  board: {
    backgroundColor: "#BBADA0",
    padding: CELL_MARGIN,
    borderRadius: RADIUS.lg,
    position: "relative",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    margin: CELL_MARGIN / 2,
    backgroundColor: "#CDC1B4",
    borderRadius: RADIUS.sm,
  },
  tile: {
    position: "absolute",
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  cellText: {
    fontWeight: "900",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(238, 228, 218, 0.73)",
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  gameOverText: {
    fontSize: 40,
    fontWeight: "900",
    color: "#776E65",
    marginBottom: 20,
  },
  overlayBtn: {
    backgroundColor: "#8F7A66",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
  },
  overlayBtnText: {
    color: "white",
    fontWeight: "900",
  },
  hint: {
    marginTop: 20,
    color: COLORS.mutedForeground,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    opacity: 0.5,
  },
});
