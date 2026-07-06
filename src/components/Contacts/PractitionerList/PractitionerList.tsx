import { useState } from 'react';
import { Button } from 'antd';
import { Plus } from 'lucide-react';
import type { GeneralPractitioner } from '#/domain/generalPractitioner/models.ts';
import { SearchableEntityList } from '#/components/SearchableEntityList/SearchableEntityList.tsx';
import { PractitionerListItem } from '#/components/Contacts/PractitionerList/PractitionerListItem.tsx';
import { GeneralPractitionerFormModal } from '#/components/Contacts/GeneralPractitionerFormModal.tsx';
import { useGetAllGeneralPractitioners } from '#/services/generalPractitionerService.ts';

const PRACTITIONER_ROW_HEIGHT = 68;

type PractitionerFormTarget = 'create' | GeneralPractitioner | null;

export function PractitionerList() {
  const { data: practitioners = [], isLoading, isError } = useGetAllGeneralPractitioners();
  const [practitionerFormTarget, setPractitionerFormTarget] = useState<PractitionerFormTarget>(null);

  return (
    <>
      <SearchableEntityList
        items={practitioners}
        getSearchableName={(practitioner) => practitioner}
        estimateSize={PRACTITIONER_ROW_HEIGHT}
        isLoading={isLoading}
        isError={isError}
        emptyText="Aucun médecin trouvé"
        searchPlaceholder="Rechercher un médecin..."
        renderItem={(practitioner) => (
          <PractitionerListItem practitioner={practitioner} onEdit={setPractitionerFormTarget} />
        )}
        headerAction={
          <Button
            shape="round"
            size="small"
            icon={<Plus size={14} />}
            title="Ajouter un médecin traitant"
            onClick={() => setPractitionerFormTarget('create')}
          />
        }
      />

      <GeneralPractitionerFormModal
        key={practitionerFormTarget?.toString()}
        open={practitionerFormTarget !== null}
        onClose={() => setPractitionerFormTarget(null)}
        practitioner={practitionerFormTarget === 'create' ? null : practitionerFormTarget}
        onSaved={() => setPractitionerFormTarget(null)}
      />
    </>
  );
}
