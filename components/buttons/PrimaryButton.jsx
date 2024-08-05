// components/buttons/PrimaryButton.js
import React from 'react';

function PrimaryButton({ children, sub, icon, onClick, link, isLandingPage }) {
  const handleClick = () => {
    if (link) {
      // Open link in a new tab for downloading
      window.open(link, '_blank');
    } else if (onClick) {
      onClick(); // Call the provided onClick handler
    }
  };

  return (
    <button
      className={`${isLandingPage
        ? "rounded-b-md"
        : "rounded-md"
        } cursor-pointer hover:bg-primary-hover transition-all bg-primary-light px-5 text-gray-100 text-left font-medium w-full p-2`}
      onClick={handleClick}
    >
      <div className="flex space-x-3 items-center">
        {icon && <div className="text-2xl py-2">{icon}</div>}
        <div>
          <div>{children}</div>
          <div className="text-sm font-light text-secondary-light">{sub}</div>
        </div>
      </div>
    </button>
  );
}

export default PrimaryButton;
