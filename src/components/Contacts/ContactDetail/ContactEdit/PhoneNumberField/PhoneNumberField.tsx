import { Input, Select, Space } from 'antd';
import type { ChangeEvent } from 'react';
import { frenchNationalToE164, toFrenchNationalDisplay } from '#/utils/contactUtils.ts';

interface PhoneNumberFieldProps {
  value?: string | null;
  onChange?: (phoneNumber: string | undefined) => void;
}

export function PhoneNumberField({ value, onChange }: PhoneNumberFieldProps) {
  const handleNationalNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(frenchNationalToE164(event.target.value));
  };

  return (
    <Space.Compact block>
      <Select value="+33" disabled style={{width: "fit-content"}} options={[{ value: '+33', label: '+33' }]} />
      <Input value={toFrenchNationalDisplay(value)} onChange={handleNationalNumberChange} placeholder="6 12 34 56 78" />
    </Space.Compact>
  );
}
