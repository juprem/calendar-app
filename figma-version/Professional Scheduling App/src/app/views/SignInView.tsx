import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';

export function SignInView() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (values: any) => {
    setLoading(true);
    // Simulate authentication
    setTimeout(() => {
      setLoading(false);
      message.success('Connexion réussie');
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#92400E] to-[#EA580C] p-12 items-center justify-center">
        <div className="text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
              <Calendar className="w-16 h-16" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Calendrier</h1>
          <p className="text-xl text-white/90">
            Gérez votre agenda en toute simplicité
          </p>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#FFFBF5]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-[#92400E] to-[#EA580C] p-6 rounded-2xl mb-4">
              <Calendar className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-[#92400E] mb-2">Calendrier</h1>
            <p className="text-[#78716C]">Gérez votre agenda en toute simplicité</p>
          </div>

          {/* Sign In Card */}
          <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-lg p-8">
            <div className="hidden md:flex items-center gap-2 mb-6">
              <Calendar className="w-6 h-6 text-[#92400E]" />
              <span className="text-xl font-semibold text-[#92400E]">Calendrier</span>
            </div>

            <h2 className="text-2xl font-semibold text-[#1C1917] mb-6">
              Connexion
            </h2>

            <Form
              layout="vertical"
              onFinish={handleSignIn}
              requiredMark={false}
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Veuillez entrer votre email' },
                  { type: 'email', message: 'Email invalide' }
                ]}
              >
                <Input
                  size="large"
                  placeholder="votre@email.fr"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label="Mot de passe"
                name="password"
                rules={[{ required: true, message: 'Veuillez entrer votre mot de passe' }]}
              >
                <Input.Password
                  size="large"
                  placeholder="••••••••"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  style={{
                    backgroundColor: '#92400E',
                    borderColor: '#92400E',
                    borderRadius: '8px',
                    height: '48px',
                  }}
                  className="hover:!bg-[#78350F]"
                >
                  Se connecter
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center mt-6">
              <a href="#" className="text-sm text-[#92400E] hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <p className="text-center text-sm text-[#78716C] mt-6">
            Vous n'avez pas de compte ?{' '}
            <a href="#" className="text-[#92400E] hover:underline font-medium">
              Créer un compte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
