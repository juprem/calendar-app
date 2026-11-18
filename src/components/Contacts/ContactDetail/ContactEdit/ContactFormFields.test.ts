import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HOMONYM_CHECK_DEBOUNCE_MS, requireBirthDateForHomonym } from './ContactFormFields.tsx';

const HOMONYM_ERROR = 'Un contact porte déjà ce nom : la date de naissance est obligatoire';

const createFormValues = (initialValues: { firstname?: string; lastname?: string }) => {
  const formValues: Record<string, string | undefined> = { ...initialValues };
  return { formValues, getFieldValue: (fieldName: string) => formValues[fieldName] };
};

const validateBirthDate = (
  checkHomonym: (firstname: string, lastname: string) => Promise<boolean>,
  getFieldValue: (fieldName: string) => string | undefined,
  birthDate: unknown,
) => requireBirthDateForHomonym(checkHomonym)({ getFieldValue }).validator({}, birthDate);

describe('requireBirthDateForHomonym', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects after the delay when the server finds a homonym and no birth date is set', async () => {
    const checkHomonym = vi.fn(() => Promise.resolve(true));
    const { getFieldValue } = createFormValues({ firstname: 'Jean', lastname: 'Dupont' });

    const validation = validateBirthDate(checkHomonym, getFieldValue, undefined);
    const assertion = expect(validation).rejects.toThrow(HOMONYM_ERROR);
    expect(checkHomonym).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(HOMONYM_CHECK_DEBOUNCE_MS);

    await assertion;
    expect(checkHomonym).toHaveBeenCalledExactlyOnceWith('Jean', 'Dupont');
  });

  it('passes when the server finds no homonym', async () => {
    const checkHomonym = vi.fn(() => Promise.resolve(false));
    const { getFieldValue } = createFormValues({ firstname: 'Jean', lastname: 'Dupont' });

    const validation = validateBirthDate(checkHomonym, getFieldValue, undefined);
    await vi.advanceTimersByTimeAsync(HOMONYM_CHECK_DEBOUNCE_MS);

    await expect(validation).resolves.toBeUndefined();
  });

  it('does not call the server when a birth date is set', async () => {
    const checkHomonym = vi.fn(() => Promise.resolve(true));
    const { getFieldValue } = createFormValues({ firstname: 'Jean', lastname: 'Dupont' });

    await expect(validateBirthDate(checkHomonym, getFieldValue, new Date())).resolves.toBeUndefined();
    expect(checkHomonym).not.toHaveBeenCalled();
  });

  it('does not call the server while a name is empty', async () => {
    const checkHomonym = vi.fn(() => Promise.resolve(true));
    const { getFieldValue } = createFormValues({ firstname: 'Jean', lastname: '' });

    await expect(validateBirthDate(checkHomonym, getFieldValue, undefined)).resolves.toBeUndefined();
    expect(checkHomonym).not.toHaveBeenCalled();
  });

  it('drops the check when a name changes during the delay, so typing fires a single call', async () => {
    const checkHomonym = vi.fn(() => Promise.resolve(true));
    const { formValues, getFieldValue } = createFormValues({ firstname: 'Jean', lastname: 'Dupo' });

    const staleValidation = validateBirthDate(checkHomonym, getFieldValue, undefined);
    formValues.lastname = 'Dupont';
    const latestValidation = validateBirthDate(checkHomonym, getFieldValue, undefined);
    const latestAssertion = expect(latestValidation).rejects.toThrow(HOMONYM_ERROR);
    await vi.advanceTimersByTimeAsync(HOMONYM_CHECK_DEBOUNCE_MS);

    await expect(staleValidation).resolves.toBeUndefined();
    await latestAssertion;
    expect(checkHomonym).toHaveBeenCalledExactlyOnceWith('Jean', 'Dupont');
  });

  it('passes when the server call fails, leaving the submit-time server rule to decide', async () => {
    const checkHomonym = vi.fn(() => Promise.reject(new Error('network')));
    const { getFieldValue } = createFormValues({ firstname: 'Jean', lastname: 'Dupont' });

    const validation = validateBirthDate(checkHomonym, getFieldValue, undefined);
    await vi.advanceTimersByTimeAsync(HOMONYM_CHECK_DEBOUNCE_MS);

    await expect(validation).resolves.toBeUndefined();
  });
});
