import React from 'react';
import { Search, ShoppingCart, Globe, User } from 'lucide-react';

export const PaymentHeader: React.FC = () => {
  return (
    <header className="w-full bg-[#F2D3AC] sticky top-0 z-50">
      <div className="px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo with Border Box */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 border-2 border-[#333333] rounded px-2.5 py-2">
              <div className="w-7 h-7 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">🏠</span>
              </div>
              <h1 className="text-base font-bold text-[#333333] font-inria-sans whitespace-nowrap">
                Woodify
              </h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 min-w-0 mx-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full px-4 py-2.5 pl-10 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BE9C73] text-sm"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Navigation Menu - Desktop Only */}
          <nav className="hidden lg:flex items-center gap-8 flex-shrink-0">
            <a href="#" className="text-[#333333] hover:text-[#BE9C73] transition font-arimo text-sm whitespace-nowrap">
              Sản phẩm
            </a>
            <a href="#" className="text-[#333333] hover:text-[#BE9C73] transition font-arimo text-sm whitespace-nowrap">
              Workshops
            </a>
            <a href="#" className="text-[#333333] hover:text-[#BE9C73] transition font-arimo text-sm whitespace-nowrap">
              AI Generator
            </a>
            <a href="#" className="text-[#333333] hover:text-[#BE9C73] transition font-arimo text-sm whitespace-nowrap">
              Cộng đồng
            </a>
            <a href="#" className="text-[#333333] hover:text-[#BE9C73] transition font-arimo text-sm whitespace-nowrap">
              Hỗ trợ
            </a>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Cart */}
            <div className="relative cursor-pointer">
              <ShoppingCart className="w-5 h-5 text-[#333333]" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold text-[11px]">
                1
              </span>
            </div>

            {/* Language Selector */}
            <button className="flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#333333]" />
            </button>

            {/* User Profile */}
            <button className="flex items-center justify-center">
              <User className="w-5 h-5 text-[#333333]" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className="lg:hidden border-t border-[rgba(0,0,0,0.1)] px-6 py-2 flex gap-3 overflow-x-auto">
        <a href="#" className="text-[#333333] text-xs hover:text-[#BE9C73] font-arimo whitespace-nowrap">Sản phẩm</a>
        <a href="#" className="text-[#333333] text-xs hover:text-[#BE9C73] font-arimo whitespace-nowrap">Workshops</a>
        <a href="#" className="text-[#333333] text-xs hover:text-[#BE9C73] font-arimo whitespace-nowrap">AI Generator</a>
        <a href="#" className="text-[#333333] text-xs hover:text-[#BE9C73] font-arimo whitespace-nowrap">Cộng đồng</a>
        <a href="#" className="text-[#333333] text-xs hover:text-[#BE9C73] font-arimo whitespace-nowrap">Hỗ trợ</a>
      </div>
    </header>
  );
};
