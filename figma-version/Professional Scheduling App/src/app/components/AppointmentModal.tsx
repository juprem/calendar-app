import { Modal, Form, Input, Select, DatePicker, TimePicker, Button } from 'antd';
import { contacts } from '../data/mockData';
import dayjs from 'dayjs';

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
}

export function AppointmentModal({ open, onClose, initialDate }: AppointmentModalProps) {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('New appointment:', values);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Nouveau Rendez-vous"
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          date: initialDate ? dayjs(initialDate) : dayjs(),
          type: 'consultation',
          status: 'confirmed',
        }}
      >
        <Form.Item
          label="Contact"
          name="contactId"
          rules={[{ required: true, message: 'Veuillez sélectionner un contact' }]}
        >
          <Select
            placeholder="Sélectionner un contact"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={contacts.map(contact => ({
              value: contact.id,
              label: `${contact.firstName} ${contact.lastName}`,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: 'Veuillez sélectionner une date' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="DD/MM/YYYY"
          />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item
            label="Heure de début"
            name="startTime"
            rules={[{ required: true, message: 'Requis' }]}
            className="flex-1"
          >
            <TimePicker 
              format="HH:mm" 
              style={{ width: '100%' }} 
              minuteStep={15}
            />
          </Form.Item>

          <Form.Item
            label="Heure de fin"
            name="endTime"
            rules={[{ required: true, message: 'Requis' }]}
            className="flex-1"
          >
            <TimePicker 
              format="HH:mm" 
              style={{ width: '100%' }} 
              minuteStep={15}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: 'consultation', label: 'Consultation' },
              { value: 'suivi', label: 'Suivi' },
              { value: 'urgence', label: 'Urgence' },
              { value: 'bilan', label: 'Bilan' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Statut"
          name="status"
        >
          <Select
            options={[
              { value: 'confirmed', label: 'Confirmé' },
              { value: 'pending', label: 'En attente' },
              { value: 'cancelled', label: 'Annulé' },
            ]}
          />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={3} placeholder="Ajouter des notes..." />
        </Form.Item>

        <Form.Item className="mb-0 flex justify-end gap-2">
          <Button onClick={onClose}>Annuler</Button>
          <Button 
            type="primary" 
            htmlType="submit"
            style={{ backgroundColor: '#92400E' }}
          >
            Créer
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
