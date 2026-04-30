import { ConfigProvider } from 'antd';
import frFR from 'antd/locale/fr_FR';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function AntDesignConfigProvider({ children }: Props) {
  return (
    <ConfigProvider
      locale={frFR}
      theme={{
        token: {
          colorPrimary: '#92400E',
          colorInfo: '#F59E0B',
          colorSuccess: '#16A34A',
          colorError: '#DC2626',
          colorWarning: '#F59E0B',
          borderRadius: 8,
          colorBorder: '#E7E5E4',
          colorText: '#1C1917',
          colorTextSecondary: '#78716C',
          colorBgContainer: '#FFFFFF',
          colorBgLayout: '#FFFBF5',
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
          Card: {
            borderRadiusLG: 12,
          },
          Modal: {
            borderRadiusLG: 12,
          },
          Tag: {
            borderRadiusSM: 6,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
