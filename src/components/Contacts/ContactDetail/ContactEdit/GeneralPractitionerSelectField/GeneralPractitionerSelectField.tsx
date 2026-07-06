import { useState } from 'react';
import { Button, Form, Select } from 'antd';
import { Plus } from 'lucide-react';
import { formatGeneralPractitionerName } from '#/models/GeneralPractitionerModel.ts';
import { GeneralPractitionerFormModal } from '#/components/Contacts/GeneralPractitionerFormModal.tsx';
import { GeneralPractitionerDisplayName } from '#/components/Contacts/ContactDetail/GeneralPractitionerDisplayName.tsx';
import { useGetAllGeneralPractitioners } from '#/services/generalPractitionerService.ts';

export function GeneralPractitionerSelectField() {
  const form = Form.useFormInstance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: generalPractitioners = [] } = useGetAllGeneralPractitioners();

  const practitionerOptions = generalPractitioners.map((gp) => {
    const practitionerName = formatGeneralPractitionerName(gp);

    return {
      value: gp.id,
      label: <GeneralPractitionerDisplayName generalPractitioner={gp} />,
      searchText: gp.address ? `${practitionerName} ${gp.address}` : practitionerName,
    };
  });

  const handleCreated = (newId: number) => {
    form.setFieldValue('generalPractitionerId', newId);
  };

  return (
    <div className="flex items-end gap-2">
      <Form.Item name="generalPractitionerId" label="Médecin traitant" className="flex-1">
        <Select
          placeholder="Sélectionner un médecin traitant"
          options={practitionerOptions}
          allowClear
          showSearch
          filterOption={(searchInput, option) =>
            String(option?.searchText ?? '').toLowerCase().includes(searchInput.toLowerCase())
          }
        />
      </Form.Item>
      <Form.Item label=" " colon={false}>
        <Button
          icon={<Plus size={14} />}
          onClick={() => setIsModalOpen(true)}
          title="Ajouter un médecin traitant"
        />
      </Form.Item>
      <GeneralPractitionerFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleCreated}
      />
    </div>
  );
}
