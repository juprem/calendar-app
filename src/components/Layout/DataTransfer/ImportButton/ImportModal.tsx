import { useState } from 'react';
import { Alert, Button, List, Modal, Popconfirm, Upload } from 'antd';
import { Inbox } from 'lucide-react';
import { useImportData } from '#/services/dataTransferService.ts';
import { parseImportFile, type ParsedImportFile } from '#/components/Layout/DataTransfer/utils/parseImportFile.ts';
import type { ImportData, ImportEntity, ImportRowError } from '#/domain/dataTransfer/models.ts';

interface ImportModalProps {
  open: boolean;
  closeModal: () => void;
}

type ReadyImportFile = Extract<ParsedImportFile, { status: 'ready' }>;

const ENTITY_LABELS: Record<ImportEntity, string> = {
  practitioners: 'Médecins',
  contacts: 'Contacts',
  rdvs: 'RDV',
};

const isReadyFile = (file: ParsedImportFile): file is ReadyImportFile => file.status === 'ready';

export function ImportModal({ open, closeModal }: ImportModalProps) {
  const [parsedFiles, setParsedFiles] = useState<ParsedImportFile[]>([]);
  const [rowErrors, setRowErrors] = useState<ImportRowError[]>([]);
  const { mutate: importData, isPending } = useImportData();

  const readyFiles = parsedFiles.filter(isReadyFile);
  const hasErrorFile = parsedFiles.some((parsedFile) => parsedFile.status === 'error');
  const canImport = readyFiles.length > 0 && !hasErrorFile;

  const fileNameOf = (entity: ImportEntity) =>
    readyFiles.find((readyFile) => readyFile.entity === entity)?.fileName ?? ENTITY_LABELS[entity];

  const addFile = async (file: File) => {
    const parsedFile = await parseImportFile(file);
    setRowErrors([]);
    setParsedFiles((previousFiles) => [
      ...previousFiles.filter(
        (previousFile) =>
          previousFile.fileName !== parsedFile.fileName &&
          !(
            isReadyFile(previousFile) &&
            isReadyFile(parsedFile) &&
            previousFile.entity === parsedFile.entity
          ),
      ),
      parsedFile,
    ]);
  };

  const removeFile = (fileName: string) =>
    setParsedFiles((previousFiles) => previousFiles.filter((previousFile) => previousFile.fileName !== fileName));

  const handleClose = () => {
    setParsedFiles([]);
    setRowErrors([]);
    closeModal();
  };

  const confirmImport = () => {
    const dataToImport: ImportData = {
      practitioners: readyFiles.find((readyFile) => readyFile.entity === 'practitioners')?.importData.practitioners ?? [],
      contacts: readyFiles.find((readyFile) => readyFile.entity === 'contacts')?.importData.contacts ?? [],
      rdvs: readyFiles.find((readyFile) => readyFile.entity === 'rdvs')?.importData.rdvs ?? [],
    };
    importData(dataToImport, {
      onSuccess: (result) => {
        if (result.status === 'imported') {
          handleClose();
          return;
        }
        setRowErrors(result.errors);
      },
    });
  };

  return (
    <Modal
      title="Importer des fichiers"
      open={open}
      centered
      onCancel={handleClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>Annuler</Button>
          <Popconfirm
            title="Les lignes existantes seront écrasées"
            okText="Importer"
            cancelText="Annuler"
            disabled={!canImport}
            onConfirm={confirmImport}
          >
            <Button type="primary" disabled={!canImport} loading={isPending}>
              Importer
            </Button>
          </Popconfirm>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Upload.Dragger
          accept=".xlsx"
          multiple
          showUploadList={false}
          beforeUpload={(file) => {
            void addFile(file);
            return false;
          }}
        >
          <div className="flex flex-col items-center gap-1 py-2">
            <Inbox size={28} />
            <p>Glissez les fichiers .xlsx ici ou cliquez pour les choisir</p>
          </div>
        </Upload.Dragger>
        {parsedFiles.length > 0 && (
          <List
            size="small"
            bordered
            dataSource={parsedFiles}
            renderItem={(parsedFile) => (
              <List.Item
                actions={[
                  <Button key="remove" type="link" size="small" onClick={() => removeFile(parsedFile.fileName)}>
                    Retirer
                  </Button>,
                ]}
              >
                {isReadyFile(parsedFile) ? (
                  <span>
                    {parsedFile.fileName} — {ENTITY_LABELS[parsedFile.entity]} : {parsedFile.rowCount} ligne(s)
                  </span>
                ) : (
                  <Alert
                    type="error"
                    showIcon
                    title={parsedFile.fileName}
                    description={
                      <ul className="list-disc pl-4">
                        {parsedFile.messages.map((message) => (
                          <li key={message}>{message}</li>
                        ))}
                      </ul>
                    }
                  />
                )}
              </List.Item>
            )}
          />
        )}
        {rowErrors.length > 0 && (
          <Alert
            type="error"
            showIcon
            title="Import refusé, aucune ligne n'a été écrite"
            description={
              <ul className="list-disc pl-4">
                {rowErrors.map((rowError) => (
                  <li key={`${rowError.entity}-${rowError.rowNumber}-${rowError.reason}`}>
                    {fileNameOf(rowError.entity)} — ligne {rowError.rowNumber} : {rowError.reason}
                  </li>
                ))}
              </ul>
            }
          />
        )}
      </div>
    </Modal>
  );
}
