
import React from 'react';
import { Player, ShopItem, ItemCategory } from '../types';

interface AvatarProps {
  player: Player;
  shopItems: ShopItem[];
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ player, shopItems, className }) => {
  const equippedHat = player.equippedItems[ItemCategory.Hat];
  const hatItem = shopItems.find(item => item.id === equippedHat);

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <img src={player.avatar} alt="Player Avatar" className="w-full h-full object-contain" />
      {hatItem && (
        <img
          src={hatItem.imageUrl}
          alt={hatItem.name}
          className="absolute w-2/3"
          style={{ top: '-30%', left: '16%' }}
        />
      )}
    </div>
  );
};

export default Avatar;
