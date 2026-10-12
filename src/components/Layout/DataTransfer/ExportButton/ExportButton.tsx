import { Button } from 'antd';
import { Download } from 'lucide-react';
import { useExportData } from '#/services/dataTransferService.ts';

export function ExportButton() {
  const { exportData, isExporting } = useExportData();

  return (
    <Button
      shape="round"
      icon={<Download size={13} />}
      size="small"
      loading={isExporting}
      onClick={() => exportData()}
    >
      Exporter
    </Button>
  );
}
