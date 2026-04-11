import { Card, CardColor, CardValue, GameState, Player, DeckOptions, HouseRules } from '@/types/game';

export function createDeck(options?: DeckOptions): Card[] {
  const deck: Card[] = [];
  const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];
  const values: CardValue[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];

  colors.forEach(color => {
    values.forEach(value => {
      const count = value === '0' ? 1 : 2;
      for (let i = 0; i < count; i++) {
        deck.push({
          id: `${color}-${value}-${i}`,
          color,
          value
        });
      }
    });
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: `wild-${i}`, color: 'wild', value: 'wild' });
    deck.push({ id: `wild4-${i}`, color: 'wild', value: 'wild4' });
  }

  // 2016年以降のリニューアル版カード（オプション）
  if (options?.includeWildSwap) {
    deck.push({ id: 'wildSwap-0', color: 'wild', value: 'wildSwap' });
  }
  
  if (options?.includeWildShuffle) {
    deck.push({ id: 'wildShuffle-0', color: 'wild', value: 'wildShuffle' });
  }
  
  if (options?.includeWildCustom) {
    // 白いワイルド（3枚）
    for (let i = 0; i < 3; i++) {
      deck.push({ id: `wildCustom-${i}`, color: 'wild', value: 'wildCustom' });
    }
  }

  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function canPlayCard(card: Card, topCard: Card, currentColor: CardColor): boolean {
  if (card.value === 'wild' || card.value === 'wild4' || card.value === 'wildSwap' || card.value === 'wildShuffle' || card.value === 'wildCustom') return true;
  if (card.color === currentColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}

export function initializeGame(aiPlayerCount: number = 3, deckOptions?: DeckOptions, scoringRule: 'international' | 'japanese' = 'international', houseRules?: HouseRules): GameState {
  const deck = createDeck(deckOptions);
  const players: Player[] = [
    { id: 'player', name: 'あなた', hand: [], isAI: false }
  ];
  
  for (let i = 1; i <= aiPlayerCount; i++) {
    players.push({
      id: `ai${i}`,
      name: `AI ${i}`,
      hand: [],
      isAI: true
    });
  }

  players.forEach(player => {
    for (let i = 0; i < 7; i++) {
      player.hand.push(deck.pop()!);
    }
  });

  let firstCard = deck.pop()!;
  
  // ワイルドドロー4が場札の場合は引き直し
  while (firstCard.value === 'wild4') {
    deck.unshift(firstCard);
    shuffleDeck(deck);
    firstCard = deck.pop()!;
  }
  
  let currentPlayerIndex = 0;
  let direction: 1 | -1 = 1;
  
  // 初期場札の処理
  if (firstCard.value === 'reverse') {
    direction = -1;
    currentPlayerIndex = players.length - 1;
  } else if (firstCard.value === 'skip') {
    currentPlayerIndex = 1 % players.length;
  } else if (firstCard.value === 'draw2') {
    players[1 % players.length].hand.push(deck.pop()!);
    players[1 % players.length].hand.push(deck.pop()!);
    currentPlayerIndex = 2 % players.length;
  }
  
  const scores: Record<string, number> = {};
  players.forEach(p => scores[p.id] = 0);
  
  const defaultHouseRules: HouseRules = {
    allowDrawStacking: false,
    allowWild4Anytime: false,
    allowMultipleCards: false,
    allowSequentialNumbers: false,
    forbidActionCardFinish: false,
    lastManStanding: false
  };

  return {
    players,
    currentPlayerIndex,
    deck,
    discardPile: [firstCard],
    direction,
    currentColor: firstCard.color === 'wild' ? 'red' : firstCard.color,
    gameOver: false,
    winner: null,
    unoDeclarations: new Set(),
    scores,
    challengeAvailable: false,
    lastWild4Player: null,
    scoringRule,
    roundNumber: 1,
    houseRules: houseRules || defaultHouseRules,
    finishedPlayers: []
  };
}

export function drawCard(gameState: GameState, playerId: string): GameState {
  const newState = { ...gameState };
  const player = newState.players.find(p => p.id === playerId);
  
  if (!player) return newState;
  
  // 山札が尽きた場合、場札を残してシャッフル
  if (newState.deck.length === 0) {
    if (newState.discardPile.length <= 1) return newState;
    
    const topCard = newState.discardPile.pop()!;
    newState.deck = shuffleDeck([...newState.discardPile]);
    newState.discardPile = [topCard];
  }
  
  const card = newState.deck.pop()!;
  player.hand.push(card);
  
  return newState;
}

export function playCard(
  gameState: GameState,
  playerId: string,
  cardId: string,
  chosenColor?: CardColor
): GameState {
  const newState = { ...gameState };
  const player = newState.players.find(p => p.id === playerId);
  
  if (!player) return newState;
  
  const cardIndex = player.hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return newState;
  
  const card = player.hand[cardIndex];
  const topCard = newState.discardPile[newState.discardPile.length - 1];
  
  if (!canPlayCard(card, topCard, newState.currentColor)) return newState;
  
  player.hand.splice(cardIndex, 1);
  newState.discardPile.push(card);
  
  if (card.value === 'wild' || card.value === 'wild4' || card.value === 'wildSwap' || card.value === 'wildShuffle' || card.value === 'wildCustom') {
    newState.currentColor = chosenColor || 'red';
  } else {
    newState.currentColor = card.color;
  }
  
  // UNO宣言をクリア（カードを出したので）
  if (player.hand.length !== 1) {
    newState.unoDeclarations.delete(playerId);
  }
  
  if (player.hand.length === 0) {
    newState.gameOver = true;
    newState.winner = player.name;
    
    // 得点計算
    if (newState.scoringRule === 'international') {
      // 国際ルール: 敗者全員の残ったカードの点数を合計して勝者に加算
      let totalPoints = 0;
      newState.players.forEach(p => {
        if (p.id !== playerId) {
          totalPoints += calculateHandPoints(p.hand);
        }
      });
      newState.scores[playerId] += totalPoints;
    } else {
      // 日本ルール: 各敗者の残ったカードの点数をそれぞれ減算してその分を勝者に加算
      newState.players.forEach(p => {
        if (p.id !== playerId) {
          const points = calculateHandPoints(p.hand);
          newState.scores[playerId] += points;
          newState.scores[p.id] -= points;
        }
      });
    }
    
    return newState;
  }
  
  newState.currentPlayerIndex = getNextPlayerIndex(newState);
  newState.challengeAvailable = false;
  newState.lastWild4Player = null;
  
  if (card.value === 'skip') {
    newState.currentPlayerIndex = getNextPlayerIndex(newState);
  } else if (card.value === 'reverse') {
    // 2人プレイの場合はスキップと同じ効果
    if (newState.players.length === 2) {
      newState.currentPlayerIndex = getNextPlayerIndex(newState);
    } else {
      newState.direction *= -1 as 1 | -1;
    }
  } else if (card.value === 'draw2') {
    const nextPlayer = newState.players[newState.currentPlayerIndex];
    for (let i = 0; i < 2; i++) {
      if (newState.deck.length > 0) {
        nextPlayer.hand.push(newState.deck.pop()!);
      }
    }
    newState.currentPlayerIndex = getNextPlayerIndex(newState);
  } else if (card.value === 'wild4') {
    const nextPlayer = newState.players[newState.currentPlayerIndex];
    
    // チャレンジ可能にする
    newState.challengeAvailable = true;
    newState.lastWild4Player = playerId;
    
    for (let i = 0; i < 4; i++) {
      const drawnState = drawCard(newState, nextPlayer.id);
      newState.deck = drawnState.deck;
      newState.discardPile = drawnState.discardPile;
      nextPlayer.hand = drawnState.players.find(p => p.id === nextPlayer.id)!.hand;
    }
    newState.currentPlayerIndex = getNextPlayerIndex(newState);
  } else if (card.value === 'wildSwap') {
    // とりかえっこワイルド: 指定した相手と手札を交換
    // AI用の簡易実装: ランダムな相手と交換
    const otherPlayers = newState.players.filter(p => p.id !== playerId);
    if (otherPlayers.length > 0) {
      const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
      const tempHand = player.hand;
      player.hand = randomPlayer.hand;
      randomPlayer.hand = tempHand;
    }
  } else if (card.value === 'wildShuffle') {
    // シャッフルワイルド: 全員の手札を集めてシャッフルして再配布
    const allCards: Card[] = [];
    newState.players.forEach(p => {
      allCards.push(...p.hand);
      p.hand = [];
    });
    
    const shuffledCards = shuffleDeck(allCards);
    const cardsPerPlayer = Math.floor(shuffledCards.length / newState.players.length);
    
    newState.players.forEach(p => {
      for (let i = 0; i < cardsPerPlayer && shuffledCards.length > 0; i++) {
        p.hand.push(shuffledCards.pop()!);
      }
    });
    
    // 余ったカードは最初のプレイヤーに
    while (shuffledCards.length > 0) {
      newState.players[0].hand.push(shuffledCards.pop()!);
    }
  } else if (card.value === 'wildCustom') {
    // 白いワイルド: カスタムルール（この実装では通常のワイルドとして動作）
    // 実際のゲームでは独自ルールを書き込めるが、ここでは簡略化
  }
  
  return newState;
}

function getNextPlayerIndex(gameState: GameState): number {
  const { currentPlayerIndex, direction, players } = gameState;
  let nextIndex = currentPlayerIndex + direction;
  
  if (nextIndex >= players.length) nextIndex = 0;
  if (nextIndex < 0) nextIndex = players.length - 1;
  
  return nextIndex;
}

export function calculateHandPoints(hand: Card[]): number {
  return hand.reduce((total, card) => {
    if (card.value >= '0' && card.value <= '9') {
      return total + parseInt(card.value);
    } else if (card.value === 'skip' || card.value === 'reverse' || card.value === 'draw2') {
      return total + 20;
    } else {
      // wild, wild4, wildSwap, wildShuffle, wildCustom
      return total + 50;
    }
  }, 0);
}

export function declareUno(gameState: GameState, playerId: string): GameState {
  const newState = { ...gameState };
  const player = newState.players.find(p => p.id === playerId);
  
  if (player && player.hand.length === 1) {
    newState.unoDeclarations.add(playerId);
  }
  
  return newState;
}

export function checkUnoViolation(gameState: GameState, playerId: string): GameState {
  const newState = { ...gameState };
  const player = newState.players.find(p => p.id === playerId);
  
  if (player && player.hand.length === 1 && !newState.unoDeclarations.has(playerId)) {
    // ペナルティ: 2枚引く
    for (let i = 0; i < 2; i++) {
      const drawnState = drawCard(newState, playerId);
      newState.deck = drawnState.deck;
      newState.discardPile = drawnState.discardPile;
      player.hand = drawnState.players.find(p => p.id === playerId)!.hand;
    }
  }
  
  return newState;
}

export function challengeWild4(gameState: GameState, challengerId: string): { success: boolean; newState: GameState } {
  const newState = { ...gameState };
  
  if (!newState.challengeAvailable || !newState.lastWild4Player) {
    return { success: false, newState };
  }
  
  const wild4Player = newState.players.find(p => p.id === newState.lastWild4Player);
  const challenger = newState.players.find(p => p.id === challengerId);
  
  if (!wild4Player || !challenger) {
    return { success: false, newState };
  }
  
  // ワイルドドロー4を出したプレイヤーの手札をチェック
  // 場札の前のカード（ワイルドドロー4の前）を取得
  const previousCard = newState.discardPile[newState.discardPile.length - 2];
  
  // 他に出せるカードがあったかチェック
  const hadPlayableCard = wild4Player.hand.some(card => {
    if (card.value === 'wild' || card.value === 'wild4' || card.value === 'wildSwap' || card.value === 'wildShuffle' || card.value === 'wildCustom') {
      return false; // ワイルドカードは除外
    }
    return canPlayCard(card, previousCard, newState.currentColor);
  });
  
  newState.challengeAvailable = false;
  newState.lastWild4Player = null;
  
  if (hadPlayableCard) {
    // チャレンジ成功: ワイルドドロー4を出したプレイヤーが4枚引く
    for (let i = 0; i < 4; i++) {
      const drawnState = drawCard(newState, wild4Player.id);
      newState.deck = drawnState.deck;
      newState.discardPile = drawnState.discardPile;
      wild4Player.hand = drawnState.players.find(p => p.id === wild4Player.id)!.hand;
    }
    
    // ワイルドドロー4を手札に戻す
    const wild4Card = newState.discardPile.pop()!;
    wild4Player.hand.push(wild4Card);
    
    return { success: true, newState };
  } else {
    // チャレンジ失敗: チャレンジャーが6枚引く
    for (let i = 0; i < 6; i++) {
      const drawnState = drawCard(newState, challengerId);
      newState.deck = drawnState.deck;
      newState.discardPile = drawnState.discardPile;
      challenger.hand = drawnState.players.find(p => p.id === challengerId)!.hand;
    }
    
    return { success: false, newState };
  }
}
