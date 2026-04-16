import React from 'react';
import { Trash2 } from 'lucide-react';
import { CartItem } from '../../types/payment.types';

interface CartItemProps {
  item: CartItem;
  onQuantityChange: (id: string, quantity: number) => void;
  onDelete: (id: string) => void;
}

export const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onDelete,
}) => {
  return (
    <div className="flex gap-4 py-4 border-b border-[#E5E7EB] last:border-b-0">
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#333333] font-arimo">
            {item.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold text-[#BE9C73]">
              {item.currentPrice.toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-sm text-gray-400 line-through">
              {item.originalPrice.toLocaleString('vi-VN')} ₫
            </span>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-[#D1D5DC] rounded-lg">
            <button
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center text-[#333333] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              −
            </button>
            <span className="w-8 h-7 flex items-center justify-center text-sm font-semibold text-[#333333] border-l border-r border-[#D1D5DC]">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-[#333333] hover:bg-gray-100 transition"
            >
              +
            </button>
          </div>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(item.id)}
            className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Delete item"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
