import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS } from '../../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GRID_SIZE = 9;
const BOARD_PADDING = 24;
const MAX_BOARD_SIZE = 560;

type Cell = {
    value: number;
    original: boolean;
    error: boolean;
};

export default function Sudoku({ onFinish }: { onFinish: (score: number) => void }) {
    const { width } = useWindowDimensions();
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [solution, setSolution] = useState<number[][]>([]);
    const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [mistakes, setMistakes] = useState(0);

    const generateSudoku = useCallback(() => {
        // Simple Sudoku generator using shuffling of a base board
        const base = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 1, 5, 6, 4, 8, 9, 7],
            [5, 6, 4, 8, 9, 7, 2, 3, 1],
            [8, 9, 7, 2, 3, 1, 5, 6, 4],
            [3, 1, 2, 6, 4, 5, 9, 7, 8],
            [6, 4, 5, 9, 7, 8, 3, 1, 2],
            [9, 7, 8, 3, 1, 2, 6, 4, 5]
        ];

        // Shuffle rows within 3x3 blocks
        const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
        
        const rowBlocks = [0, 1, 2].map(i => shuffle([i * 3, i * 3 + 1, i * 3 + 2]));
        const shuffledRows = rowBlocks.flat();
        
        let board = shuffledRows.map(r => base[r]);

        // Shuffle columns within 3x3 blocks
        const colBlocks = [0, 1, 2].map(i => shuffle([i * 3, i * 3 + 1, i * 3 + 2]));
        const shuffledCols = colBlocks.flat();
        
        board = board.map(row => shuffledCols.map(c => row[c]));

        setSolution(board.map(row => [...row]));

        // Mask cells for difficulty
        const maskedGrid: Cell[][] = board.map((row, r) => row.map((val, c) => ({
            value: Math.random() > 0.4 ? val : 0,
            original: true,
            error: false
        })));

        // Mark original non-zero cells
        maskedGrid.forEach(row => row.forEach(cell => {
            if (cell.value === 0) cell.original = false;
        }));

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

        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
        const isCorrect = solution[r][c] === num;

        if (isCorrect) {
            newGrid[r][c].value = num;
            newGrid[r][c].error = false;
            setGrid(newGrid);
            checkWin(newGrid);
        } else {
            newGrid[r][c].value = num;
            newGrid[r][c].error = true;
            setMistakes(prev => prev + 1);
            setGrid(newGrid);
            if (mistakes + 1 >= 5) {
                // Game over logic if too many mistakes? For now just visual.
            }
        }
    };

    const checkWin = (currentGrid: Cell[][]) => {
        const isComplete = currentGrid.every(row => row.every(cell => cell.value !== 0 && !cell.error));
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
        if (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3)) return true;
        // Same value
        if (grid[r][c].value !== 0 && grid[r][c].value === grid[sr][sc].value) return true;
        return false;
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { width: boardSize }]}>
                <View style={styles.statBox}>
                    <Feather name="x-circle" size={16} color={mistakes > 0 ? COLORS.destructive : COLORS.mutedForeground} />
                    <Text style={styles.statText}>{mistakes}/5</Text>
                </View>
                <TouchableOpacity onPress={generateSudoku} style={styles.resetBtn}>
                    <Feather name="refresh-cw" size={20} color="white" />
                </TouchableOpacity>
                <View style={styles.statBox}>
                    <Feather name="award" size={16} color="#F59E0B" />
                    <Text style={styles.statText}>150 IQ</Text>
                </View>
            </View>

            <View style={styles.board}>
                {grid.map((row, r) => (
                    <View key={r} style={[styles.row, r % 3 === 2 && r !== 8 && styles.rowBorder]}>
                        {row.map((cell, c) => (
                            <TouchableOpacity
                                key={c}
                                activeOpacity={1}
                                onPress={() => setSelectedCell({ r, c })}
                                style={[
                                    styles.cell,
                                    { width: cellSize, height: cellSize },
                                    c % 3 === 2 && c !== 8 && styles.cellBorder,
                                    selectedCell?.r === r && selectedCell?.c === c && styles.cellActive,
                                    !grid[r][c].original && isRelated(r, c) && styles.cellRelated,
                                    cell.error && styles.cellError
                                ]}
                            >
                                {cell.value !== 0 && (
                                    <Text style={[
                                        styles.cellText,
                                        { fontSize: cellTextSize },
                                        cell.original ? styles.textOriginal : styles.textInput,
                                        cell.error && styles.textError
                                    ]}>
                                        {cell.value}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>

            <View style={[styles.numberPad, { width: boardSize }]}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <TouchableOpacity
                        key={num}
                        onPress={() => handleNumberInput(num)}
                        style={[styles.padBtn, { width: numberPadButtonSize, height: numberPadButtonSize }]}
                    >
                        <Text style={styles.padBtnText}>{num}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {gameOver && (
                <View style={styles.overlay}>
                    <View style={styles.overlayContent}>
                        <Feather name="check-circle" size={48} color="#10B981" />
                        <Text style={styles.winText}>Превосходно!</Text>
                        <Text style={styles.winSub}>Головоломка решена</Text>
                        <TouchableOpacity onPress={generateSudoku} style={styles.continueBtn}>
                            <Text style={styles.continueText}>Еще разок</Text>
                        </TouchableOpacity>
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
        padding: 2,
        borderRadius: RADIUS.sm,
        ...SHADOWS.lg,
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
    }
});
