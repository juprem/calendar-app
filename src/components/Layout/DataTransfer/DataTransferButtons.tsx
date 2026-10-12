import { Button, Tooltip } from 'antd';
import { Download, Upload } from 'lucide-react';

export function DataTransferButtons() {
  return (
    <>
      <Tooltip title="Bientôt disponible">
        <Button shape="round" icon={<Upload size={13} />} size="small" disabled>
          Importer
        </Button>
      </Tooltip>
      <Tooltip title="Bientôt disponible">
        <Button shape="round" icon={<Download size={13} />} size="small" disabled>
          Exporter
        </Button>
      </Tooltip>
    </>
  );
}
