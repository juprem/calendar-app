import { RouterProvider } from 'react-router';
import { ConfigProvider } from 'antd';
import frFR from 'antd/locale/fr_FR';
import { router } from './routes';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

// Configure dayjs to use French locale globally
dayjs.locale('fr');

export default function App() {
  return (
    <ConfigProvider
      locale={frFR}
      theme={{
        token: {
          colorPrimary: '#92400E',
          colorLink: '#92400E',
          colorSuccess: '#16A34A',
          colorWarning: '#F59E0B',
          colorError: '#DC2626',
          borderRadius: 8,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        },
        components: {
          Button: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Select: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Card: {
            borderRadius: 12,
          },
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
