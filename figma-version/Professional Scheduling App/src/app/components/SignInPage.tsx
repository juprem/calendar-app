import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';

export function SignInPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(() => {
      // Mock sign-in - just navigate to the app
      navigate('/');
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Half - Brand Section */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-8 md:p-12"
        style={{
          background: 'linear-gradient(135deg, var(--app-primary) 0%, var(--app-secondary-accent) 100%)',
          color: 'white',
        }}
      >
        <div className="max-w-md w-full text-center">
          <CalendarOutlined style={{ fontSize: '64px', marginBottom: '24px' }} />
          <h1 className="text-4xl mb-4" style={{ fontWeight: 600 }}>
            Calendrier
          </h1>
          <p className="text-xl opacity-90">
            Gérez votre agenda en toute simplicité
          </p>
        </div>
      </div>

      {/* Right Half - Sign-in Form */}
      <div
        className="flex-1 flex items-center justify-center p-8 md:p-12"
        style={{ backgroundColor: 'var(--app-background)' }}
      >
        <div className="max-w-md w-full">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <CalendarOutlined
                style={{ fontSize: '32px', color: 'var(--app-primary)' }}
              />
              <span
                className="text-2xl"
                style={{ color: 'var(--app-primary)', fontWeight: 600 }}
              >
                Calendrier
              </span>
            </div>
            <h2 className="text-2xl mb-2" style={{ color: 'var(--app-text-primary)' }}>
              Connexion
            </h2>
            <p style={{ color: 'var(--app-text-secondary)' }}>
              Accédez à votre espace professionnel
            </p>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Veuillez saisir votre email' },
                { type: 'email', message: 'Email invalide' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'var(--app-text-secondary)' }} />}
                placeholder="votre@email.com"
                size="large"
                style={{
                  borderRadius: '8px',
                  borderColor: 'var(--app-border)',
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[{ required: true, message: 'Veuillez saisir votre mot de passe' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--app-text-secondary)' }} />}
                placeholder="••••••••"
                size="large"
                style={{
                  borderRadius: '8px',
                  borderColor: 'var(--app-border)',
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                style={{
                  backgroundColor: 'var(--app-primary)',
                  borderColor: 'var(--app-primary)',
                  borderRadius: '8px',
                  height: '48px',
                }}
              >
                Se connecter
              </Button>
            </Form.Item>

            <div className="text-center">
              <a
                href="#"
                style={{ color: 'var(--app-primary)' }}
                className="hover:underline"
              >
                Mot de passe oublié ?
              </a>
            </div>
          </Form>

          <div className="mt-8 text-center" style={{ color: 'var(--app-text-secondary)' }}>
            <p className="text-sm">
              Vous n'avez pas de compte ?{' '}
              <a
                href="#"
                style={{ color: 'var(--app-primary)' }}
                className="hover:underline"
              >
                Créer un compte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
