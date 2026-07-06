import { describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { notifyErrorService, notifySuccess } from './runtime.ts';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('notifySuccess', () => {
  it('shows a success toast with the given message', () => {
    notifySuccess('Contact créé');

    expect(toast.success).toHaveBeenCalledWith('Contact créé');
  });
});

describe('notifyErrorService', () => {
  it('shows an error toast with the error message when it has one', () => {
    notifyErrorService(new Error('Un contact "Marie Curie" existe déjà'), 'Erreur lors de la création du contact');

    expect(toast.error).toHaveBeenCalledWith('Un contact "Marie Curie" existe déjà');
  });

  it('falls back to the default message when the error has none', () => {
    notifyErrorService(new Error(), 'Erreur lors de la création du contact');

    expect(toast.error).toHaveBeenCalledWith('Erreur lors de la création du contact');
  });
});
