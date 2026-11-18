import { DatePicker, Form, Input, Select } from 'antd';
import type { FormInstance, RuleObject } from 'antd/es/form';
import TextArea from 'antd/es/input/TextArea';
import { CIVILITY_OPTIONS } from '#/models/ContactModel.ts';
import { useCheckContactHomonym } from '#/services/contactService.ts';
import { isValidFrenchPhoneNumber } from '#/utils/contactUtils.ts';
import { GeneralPractitionerSelectField } from '#/components/Contacts/ContactDetail/ContactEdit/GeneralPractitionerSelectField/GeneralPractitionerSelectField.tsx';
import { PhoneNumberField } from '#/components/Contacts/ContactDetail/ContactEdit/PhoneNumberField/PhoneNumberField.tsx';

function validateFrenchPhoneNumber(_rule: RuleObject, phoneNumber: string | undefined): Promise<void> {
  return isValidFrenchPhoneNumber(phoneNumber)
    ? Promise.resolve()
    : Promise.reject(new Error('Le numéro doit contenir 9 chiffres'));
}

export const HOMONYM_CHECK_DEBOUNCE_MS = 300;

const waitFor = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/**
 * Birth-date rule for homonyms (features/contacts/SPEC.md §5): when the birth date is empty, asks the server whether
 * another contact has the same first and last name, after `HOMONYM_CHECK_DEBOUNCE_MS`, and drops the check if a name
 * changed during the wait. The delay lives here because antd's `validateDebounce` skips validation triggered by
 * `dependencies`. A failed server call passes: the create/update mutation enforces the same rule on submit.
 * @param checkHomonym resolves true when another contact has this first and last name
 * @returns an antd rule factory reading the current names from the form
 */
export const requireBirthDateForHomonym =
  (checkHomonym: (firstname: string, lastname: string) => Promise<boolean>) =>
  ({ getFieldValue }: Pick<FormInstance, 'getFieldValue'>) => ({
    validator: async (_rule: RuleObject, birthDate: unknown): Promise<void> => {
      const firstname: string = getFieldValue('firstname') ?? '';
      const lastname: string = getFieldValue('lastname') ?? '';
      const hasNothingToCheck = Boolean(birthDate) || !firstname || !lastname;
      if (hasNothingToCheck) return;

      await waitFor(HOMONYM_CHECK_DEBOUNCE_MS);
      const haveNamesChanged = getFieldValue('firstname') !== firstname || getFieldValue('lastname') !== lastname;
      if (haveNamesChanged) return;

      const isHomonym = await checkHomonym(firstname, lastname).catch(() => false);
      if (isHomonym) throw new Error('Un contact porte déjà ce nom : la date de naissance est obligatoire');
    },
  });

interface ContactFormFieldsProps {
  editedContactId?: number;
}

export function ContactFormFields({ editedContactId }: ContactFormFieldsProps) {
  const checkHomonym = useCheckContactHomonym(editedContactId);

  return (
    <>
      <div className="grid grid-cols-[80px_1fr_1fr] gap-3">
        <Form.Item name="civility" label="Civilité">
          <Select placeholder="—" options={CIVILITY_OPTIONS} allowClear />
        </Form.Item>
        <Form.Item name="firstname" label="Prénom" rules={[{ required: true }]}>
          <Input placeholder="Prénom" />
        </Form.Item>
        <Form.Item name="lastname" label="Nom" rules={[{ required: true }]}>
          <Input placeholder="Nom" />
        </Form.Item>
      </div>

      <GeneralPractitionerSelectField />

      <div className="grid grid-cols-2 gap-3">
        <Form.Item name="email" label="Email">
          <Input placeholder="email@example.fr" type="email" />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Téléphone" rules={[{ validator: validateFrenchPhoneNumber }]}>
          <PhoneNumberField />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Form.Item
          name="birthDate"
          label="Date de naissance"
          dependencies={['firstname', 'lastname']}
          rules={[requireBirthDateForHomonym(checkHomonym)]}
        >
          <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="JJ/MM/AAAA" />
        </Form.Item>
        <Form.Item name="birthLocation" label="Lieu de naissance">
          <Input placeholder="Ville, Pays" />
        </Form.Item>
      </div>

      <Form.Item name="address" label="Adresse">
        <Input placeholder="12 rue de la Paix, 75001 Paris" />
      </Form.Item>

      <Form.Item name="notes" label="Notes">
        <TextArea rows={3} placeholder="Ajouter des notes..." />
      </Form.Item>
    </>
  );
}
