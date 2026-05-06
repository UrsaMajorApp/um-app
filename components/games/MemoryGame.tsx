import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '$constants/theme';

const GRID_SIZE = 4;
const GRID_GAP = 12;
const MAX_BOARD_SIZE = 560;

const EMOJIS = ['🚀', '🎨', '🧩', '🧪', '🧬', '🧠', '💻', '🎮'];
const ALL_CARDS = [...EMOJIS, ...EMOJIS];

export default function MemoryGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { width } = useWindowDimensions();
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    shuffle();
  }, []);

  const boardSize = Math.min(width - 48, MAX_BOARD_SIZE);
  const cardSize = (boardSize - GRID_GAP * (GRID_SIZE - 1)) / GRID_SIZE;
  const emojiSize = Math.max(28, Math.min(44, cardSize * 0.36));

  const shuffle = () => {
    const shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
  };

  const handleClick = (index: number) => {
    if (disabled || flipped.includes(index) || solved.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setDisabled(true);

      const [first, second] = newFlipped;
      if (cards[first] === cards[second]) {
        setSolved([...solved, first, second]);
        setFlipped([]);
        setDisabled(false);

        if (solved.length + 2 === cards.length) {
          setTimeout(() => {
            onFinish(Math.max(100 - moves * 2, 10));
            Alert.alert('Победа!', `Вы нашли все пары за ${moves + 1} ходов!`);
          }, 500);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { width: boardSize }]}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Ходы</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <TouchableOpacity onPress={shuffle} style={styles.resetBtn}>
          <Feather name="refresh-cw" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={[styles.grid, { width: boardSize }]}>
        {cards.map((emoji, index) => {
          const isFlipped = flipped.includes(index) || solved.includes(index);
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleClick(index)}
              style={[
                styles.card,
                { width: cardSize, height: cardSize },
                isFlipped && styles.cardFlipped,
                solved.includes(index) && styles.cardSolved,
              ]}
              disabled={isFlipped}
            >
              <Text style={[styles.emoji, { fontSize: emojiSize }]}>{isFlipped ? emoji : '?'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  resetBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: GRID_GAP,
  },
  card: {
    borderRadius: RADIUS.lg,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    ...SHADOWS.sm,
  },
  cardFlipped: {
    backgroundColor: `${COLORS.primary}10`,
    borderColor: COLORS.primary,
  },
  cardSolved: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
    opacity: 0.6,
  },
  emoji: {
    fontWeight: '900',
  },
});
