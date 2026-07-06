import type { CSSProperties } from 'react';

export const RDV_MODAL_STYLES: { container: CSSProperties; body: CSSProperties } = {
  container: { maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  body: { overflowY: 'auto', flex: '1 1 auto', maxHeight: '90vh' },
};
