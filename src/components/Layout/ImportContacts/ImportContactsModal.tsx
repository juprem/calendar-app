import { useState } from 'react';
import { Button, Modal, Table, Tag, Upload } from 'antd';
import { InboxIcon } from 'lucide-react';
import { useBulkCreateContacts } from '#/services/contactService.ts';
import { parseContactsFile, type ParsedImportResult } from './xlsxUtils.ts';

interface ImportContactsModalProps {
  open: boolean;
  closeModal: () => void;
}

const PREVIEW_COLUMNS = [
  { title: 'Civilité', dataIndex: 'civility', key: 'civility', width: 70 },
  { title: 'Prénom', dataIndex: 'firstname', key: 'firstname' },
  { title: 'Nom', dataIndex: 'lastname', key: 'lastname' },
  { title: 'Téléphone', dataIndex: 'phone_number', key: 'phone_number' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
];

export function ImportContactsModal({ open, closeModal }: ImportContactsModalProps) {
  const [parseResult, setParseResult] = useState<ParsedImportResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const { mutate, isPending } = useBulkCreateContacts();

  const handleClose = () => {
    setParseResult(null);
    setParseError(null);
    closeModal();
  };

  const handleFileSelected = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    setParseResult(null);
    try {
      const result = await parseContactsFile(file);
      setParseResult(result);
    } catch {
      setParseError('Impossible de lire le fichier. Vérifiez le format (xlsx, xls, csv).');
    } finally {
      setIsParsing(false);
    }
    return false;
  };

  const handleImport = () => {
    if (!parseResult) return;
    mutate(parseResult.contacts, {
      onSuccess: () => handleClose(),
    });
  };

  const previewData = parseResult?.contacts.slice(0, 5).map((contact, rowIndex) => ({
    key: rowIndex,
    ...contact,
  }));

  return (
    <Modal
      title="Importer des contacts"
      open={open}
      footer={null}
      centered
      width={700}
      onCancel={handleClose}
    >
      <div className="mt-4 flex flex-col gap-4">
        <Upload.Dragger
          accept=".xlsx,.xls,.csv"
          multiple={false}
          showUploadList={false}
          beforeUpload={handleFileSelected}
        >
          <p className="flex justify-center mb-2">
            <InboxIcon size={36} className="text-[#EA580C]" />
          </p>
          <p className="text-sm font-medium">Glissez un fichier ou cliquez pour sélectionner</p>
          <p className="text-xs text-gray-400">Formats acceptés : .xlsx, .xls, .csv</p>
        </Upload.Dragger>

        {isParsing && (
          <p className="text-sm text-gray-500 text-center">Analyse du fichier en cours…</p>
        )}

        {parseError && (
          <p className="text-sm text-red-500">{parseError}</p>
        )}

        {parseResult && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <Tag color="green">{parseResult.contacts.length} contacts détectés</Tag>
              {parseResult.skippedCount > 0 && (
                <Tag color="orange">
                  {parseResult.skippedCount} lignes ignorées (sans prénom ni nom)
                </Tag>
              )}
            </div>

            {parseResult.contacts.length > 5 && (
              <p className="text-xs text-gray-400">
                Aperçu des 5 premiers sur {parseResult.contacts.length} contacts
              </p>
            )}
            <Table
              dataSource={previewData}
              columns={PREVIEW_COLUMNS}
              size="small"
              pagination={false}
            />

            <div className="flex justify-end gap-2">
              <Button onClick={handleClose}>Annuler</Button>
              <Button
                type="primary"
                loading={isPending}
                disabled={parseResult.contacts.length === 0}
                onClick={handleImport}
              >
                Importer {parseResult.contacts.length} contact(s)
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
