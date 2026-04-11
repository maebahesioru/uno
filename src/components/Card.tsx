import { Card as CardType } from '@/types/game';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  isBack?: boolean;
}

export default function Card({ card, onClick, disabled, isBack }: CardProps) {
  const colorMap = {
    red: '#E53E3E',
    blue: '#3182CE',
    green: '#38A169',
    yellow: '#D69E2E',
    wild: '#2D3748'
  };

  const getCardSymbol = (value: string) => {
    switch (value) {
      case 'skip': return '⊘';
      case 'reverse': return '⇄';
      case 'draw2': return '+2';
      case 'wild': return '🌈';
      case 'wild4': return '+4';
      case 'wildSwap': return '⇄⇄';
      case 'wildShuffle': return '🔀';
      case 'wildCustom': return '✏️';
      default: return value;
    }
  };

  if (isBack) {
    return (
      <div
        className={`w-14 h-20 sm:w-20 sm:h-28 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={!disabled ? onClick : undefined}
      >
        <svg viewBox="0 0 100 140" className="w-full h-full">
          <rect width="100" height="140" rx="8" fill="#1A202C" />
          <circle cx="50" cy="70" r="30" fill="#2D3748" />
          <text x="50" y="80" textAnchor="middle" fill="#4A5568" fontSize="40" fontWeight="bold">
            UNO
          </text>
        </svg>
      </div>
    );
  }

  const color = colorMap[card.color];
  const symbol = getCardSymbol(card.value);
  const isWild = card.value === 'wild' || card.value === 'wild4' || card.value === 'wildSwap' || card.value === 'wildShuffle' || card.value === 'wildCustom';

  return (
    <div
      className={`w-14 h-20 sm:w-20 sm:h-28 rounded-lg shadow-lg transition-all duration-300 ${
        onClick && !disabled ? 'cursor-pointer hover:scale-110 hover:-translate-y-3 hover:rotate-2 hover:shadow-2xl' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={!disabled && onClick ? onClick : undefined}
    >
      <svg viewBox="0 0 100 140" className="w-full h-full">
        <rect width="100" height="140" rx="8" fill={color} />
        <rect x="8" y="8" width="84" height="124" rx="6" fill="white" />
        
        {isWild ? (
          <>
            <rect x="12" y="12" width="38" height="58" fill="#E53E3E" />
            <rect x="50" y="12" width="38" height="58" fill="#3182CE" />
            <rect x="12" y="70" width="38" height="58" fill="#38A169" />
            <rect x="50" y="70" width="38" height="58" fill="#D69E2E" />
            <text x="50" y="80" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" stroke="#000" strokeWidth="1">
              {symbol}
            </text>
          </>
        ) : (
          <>
            <ellipse cx="50" cy="70" rx="35" ry="50" fill={color} />
            <text x="50" y="85" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">
              {symbol}
            </text>
            <text x="20" y="30" fill={color} fontSize="16" fontWeight="bold">
              {symbol}
            </text>
            <text x="80" y="130" fill={color} fontSize="16" fontWeight="bold" transform="rotate(180 80 130)">
              {symbol}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
