
import React, { useState, useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
// FIX: Imported Screen enum to fix type error on backScreen prop.
import { ItemCategory, ShopItem, Screen } from '../types';
import Header from '../components/Header';
import Avatar from '../components/Avatar';

const ShopScreen: React.FC = () => {
  const context = useContext(GameContext);
  const [activeTab, setActiveTab] = useState<ItemCategory>(ItemCategory.Hat);
  
  if (!context) return null;
  
  const { gameState, buyShopItem, equipItem, getCurrentPlayer, setScreen } = context;
  const player = getCurrentPlayer();

  const handleBuy = (item: ShopItem) => {
    if (player.coins >= item.price && !player.ownedItems.includes(item.id)) {
      buyShopItem(item.id);
    }
  };

  const handleEquip = (item: ShopItem) => {
    if (player.ownedItems.includes(item.id)) {
        equipItem(item.id);
    }
  };

  const isEquipped = (item: ShopItem) => {
    return player.equippedItems[item.category] === item.id;
  }
  
  const filteredItems = gameState.shopItems.filter(item => item.category === activeTab);

  return (
    <div className="flex flex-col h-full bg-[#fffbeb]">
      {/* FIX: Used Screen.Map enum member instead of string literal 'map'. */}
      <Header title="Tienda" showBackButton={true} backScreen={Screen.Map} />
      <div className="p-4 flex-grow overflow-y-auto pb-24">
        <div className="bg-white rounded-xl shadow p-4 mb-4 flex items-center space-x-4">
            <Avatar player={player} shopItems={gameState.shopItems} className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28" />
            <div className="flex-grow text-center">
                <p className="text-lg font-bold text-gray-700">Personaliza tu Avatar</p>
            </div>
        </div>

        <div className="flex justify-around bg-yellow-100 rounded-lg p-1 mb-4">
            {(Object.values(ItemCategory) as ItemCategory[]).map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-4 py-2 rounded-md font-bold text-sm transition ${activeTab === cat ? 'bg-yellow-400 text-yellow-800 shadow' : 'text-yellow-700'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
            {filteredItems.map(item => {
                const owned = player.ownedItems.includes(item.id);
                const equipped = isEquipped(item);
                return (
                    <div key={item.id} className="bg-white rounded-lg p-2 text-center shadow border-2 border-yellow-200 flex flex-col items-center">
                        <div className="bg-yellow-50 h-16 sm:h-20 md:h-24 w-full flex items-center justify-center rounded-md mb-2">
                          <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full" />
                        </div>
                        <p className="text-xs font-bold text-gray-700 h-8">{item.name}</p>
                        
                        {owned ? (
                            <button
                                onClick={() => handleEquip(item)}
                                disabled={equipped}
                                className={`w-full mt-2 text-xs font-bold py-1 rounded-full ${equipped ? 'bg-gray-300 text-gray-500' : 'bg-green-500 text-white hover:bg-green-600'}`}
                            >
                                {equipped ? 'Equipado' : 'Equipar'}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleBuy(item)}
                                disabled={player.coins < item.price}
                                className="w-full mt-2 text-xs font-bold py-1 rounded-full bg-orange-400 text-white hover:bg-orange-500 disabled:bg-gray-300 flex items-center justify-center space-x-1"
                            >
                                <span>{item.price}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-200" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.5 10a.5.5 0 01.5-.5h1.172l.26-1.037a.5.5 0 01.976-.02l.63 2.518a.5.5 0 01-.482.64H7a.5.5 0 01-.5-.5zm4.828 2.58a.5.5 0 01.488-.63l.63-2.518a.5.5 0 01.976.02L14.69 11h1.172a.5.5 0 110 1h-1.026l-.26 1.037a.5.5 0 01-.976.02L12.57 11h-1.284a.5.5 0 01-.458-.62z"/></svg>
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default ShopScreen;
