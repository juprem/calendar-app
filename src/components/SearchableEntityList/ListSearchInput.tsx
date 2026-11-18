import { Input } from 'antd';
import type { ReactNode } from 'react';
import { Search } from 'lucide-react';

interface ListSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  headerAction?: ReactNode;
}

export function ListSearchInput({ value, onChange, placeholder, headerAction }: ListSearchInputProps) {
  return (
    <div className="p-3 border-b border-[#E7E5E4]">
      <div className="flex items-center gap-2">
        <Input
          prefix={<Search size={14} className="text-[#78716C]" />}
          placeholder={placeholder}
          value={value}
          allowClear
          onChange={(changeEvent) => onChange(changeEvent.target.value)}
          variant="filled"
          size="small"
          className="flex-1"
        />
        {headerAction}
      </div>
    </div>
  );
}
