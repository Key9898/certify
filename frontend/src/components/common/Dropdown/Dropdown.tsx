import React from 'react';
import type { DropdownProps } from './Dropdown.types';

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'end',
  className = '',
}) => {
  return (
    <div className={`dropdown dropdown-${align} ${className}`}>
      <div tabIndex={0} role="button" className="m-0">
        {trigger}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-lg border border-base-200"
      >
        {items.map((item, index) => (
          <li key={index}>
            <button
              onClick={item.onClick}
              disabled={item.disabled}
              className={item.variant === 'error' ? 'text-error hover:bg-error hover:text-error-content' : ''}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
