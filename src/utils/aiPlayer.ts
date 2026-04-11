import { Card, CardColor, GameState } from '@/types/game';
import { canPlayCard } from './gameLogic';

export function getAIMove(gameState: GameState): { cardId: string | null; color?: CardColor } {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  
  const playableCards = currentPlayer.hand.filter(card => 
    canPlayCard(card, topCard, gameState.currentColor)
  );
  
  if (playableCards.length === 0) {
    return { cardId: null };
  }
  
  const priorityCard = playableCards.find(c => c.value === 'wild4') ||
                       playableCards.find(c => c.value === 'wildShuffle') ||
                       playableCards.find(c => c.value === 'wildSwap') ||
                       playableCards.find(c => c.value === 'draw2') ||
                       playableCards.find(c => c.value === 'skip') ||
                       playableCards.find(c => c.value === 'reverse') ||
                       playableCards.find(c => c.value === 'wild') ||
                       playableCards.find(c => c.value === 'wildCustom') ||
                       playableCards[0];
  
  let chosenColor: CardColor | undefined;
  if (priorityCard.value === 'wild' || priorityCard.value === 'wild4' || priorityCard.value === 'wildSwap' || priorityCard.value === 'wildShuffle' || priorityCard.value === 'wildCustom') {
    const colorCounts: Record<'red' | 'blue' | 'green' | 'yellow', number> = { red: 0, blue: 0, green: 0, yellow: 0 };
    currentPlayer.hand.forEach(card => {
      if (card.color !== 'wild') {
        colorCounts[card.color as 'red' | 'blue' | 'green' | 'yellow']++;
      }
    });
    
    chosenColor = (Object.keys(colorCounts) as Array<'red' | 'blue' | 'green' | 'yellow'>).reduce((a, b) => 
      colorCounts[a] > colorCounts[b] ? a : b
    );
  }
  
  return { cardId: priorityCard.id, color: chosenColor };
}
