import React from 'react';
import '../../styles/fonts.css';

export const Header = (): JSX.Element => {
  return (
    <header className="w-full h-20 bg-[#1900ff] flex items-center justify-center">
      <h1 className="font-satoshi font-bold text-white text-xl tracking-[-0.23px] leading-5">
        TIME MANAGEMENT
      </h1>
    </header>
  );
}; 