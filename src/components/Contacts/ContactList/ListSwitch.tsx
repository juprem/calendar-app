import type { ReactNode } from 'react';

type SwitchItem = { key: string; label: string; icon: ReactNode };

interface ListSwitchProps {
  items: SwitchItem[];
  activeKey: string;
  onChange: (value: string) => void;
}

export function ListSwitch({ items, activeKey, onChange }: ListSwitchProps) {
  const selectedCss = (key: string) =>
    key == activeKey ? 'before:absolute before:bottom-0 before:h-[2px] before:bg-amber-500 before:w-full' : '';

  return (
    <div className="flex gap-2 ml-2">
      {items.map((item) => {
        return (
          <button
            onClick={() => onChange(item.key)}
            className={`relative flex items-center gap-1 cursor-pointer ${selectedCss(item.key)}`}
            key={item.key}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );

      })}
    </div>
  );
}
