import { Card as CardType } from '@/types/game';
import Card from './Card';

interface PlayerHandProps {
  cards: CardType[];
  onCardClick?: (cardId: string) => void;
  canPlay?: (card: CardType) => boolean;
  isCurrentPlayer?: boolean;
}

export default function PlayerHand({ cards, onCardClick, canPlay, isCurrentPlayer }: PlayerHandProps) {
  return (
    <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
      {cards.map(card => (
        <div key={card.id} id={`card-${card.id}`}>
          <Card
            card={card}
            onClick={onCardClick ? () => onCardClick(card.id) : undefined}
            disabled={!isCurrentPlayer || (canPlay && !canPlay(card))}
          />
        </div>
      ))}
    </div>
  );
}
