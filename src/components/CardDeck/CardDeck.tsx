import type { FC } from 'react';
import Card from '@components/Card/Card';
import { useRoomStore } from '@store/useRoomStore';

interface CardDeckProps {
  onVote: (card: string) => void;
  disabled: boolean;
}

const CardDeck: FC<CardDeckProps> = ({ onVote, disabled }) => {
  const cards = useRoomStore(({ cards }) => cards);
  const self = useRoomStore(({ self }) => self);
  const participants = useRoomStore(({ participants }) => participants);

  const participantCard = participants.find((p) => p.id === self?.id)?.card;

  return (
    <div className='flex flex-wrap items-center justify-center max-w-xl mt-10'>
      {cards.map((card) => (
        <Card
          key={card}
          value={card}
          disabled={disabled}
          selected={self?.card === card && participantCard === card}
          onSelect={() => {
            onVote(card);
          }}
        />
      ))}
    </div>
  );
};

export default CardDeck;
