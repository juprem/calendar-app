import { useState } from 'react';
import { Tabs } from 'antd';
import { Stethoscope, Users } from 'lucide-react';
import { ContactListPanel } from '#/components/Contacts/ContactList/ContactListPanel.tsx';
import { PractitionerList } from '#/components/Contacts/PractitionerList/PractitionerList.tsx';

type ListMode = 'contacts' | 'practitioners';

function isListMode(value: string): value is ListMode {
  return value === 'contacts' || value === 'practitioners';
}

interface ContactListProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function ContactList({ selectedId, onSelect }: ContactListProps) {
  const [listMode, setListMode] = useState<ListMode>('contacts');

  return (
    <div className="flex flex-col h-full border-r border-[#E7E5E4]">
      <Tabs
        size="small"
        styles={{
          header: { paddingLeft: '2rem' },
        }}
        activeKey={listMode}
        onChange={(value) => {
          if (isListMode(value)) setListMode(value);
        }}
        items={[
          {
            key: 'contacts',
            label: (
              <span className="inline-flex items-center gap-1.5">
                <Users size={13} />
                Contacts
              </span>
            ),
          },
          {
            key: 'practitioners',
            label: (
              <span className="inline-flex items-center gap-1.5">
                <Stethoscope size={13} />
                Médecins
              </span>
            ),
          },
        ]}
      />

      {listMode === 'contacts' ? (
        <ContactListPanel selectedId={selectedId} onSelect={onSelect} />
      ) : (
        <PractitionerList />
      )}
    </div>
  );
}
