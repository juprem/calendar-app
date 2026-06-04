import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import ClerkProvider from '../integrations/clerk/provider';

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';

import appCss from '../styles.css?url';

import type { QueryClient } from '@tanstack/react-query';

import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { Layout } from '#/components/Layout/Layout.tsx';
import 'dayjs/locale/fr';
import dayjs from 'dayjs';
import { ConfigProvider } from 'antd';
import frFR from 'antd/locale/fr_FR';
import { Toaster } from 'sonner';
import type { TRPCRouter } from '#/integrations/trpc/router/router.ts';

dayjs.locale('fr');

interface MyRouterContext {
  queryClient: QueryClient;

  trpc: TRPCOptionsProxy<TRPCRouter>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Calendrier',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkProvider>
          <ConfigProvider
            locale={frFR}
            theme={{
              token: {
                colorPrimary: '#92400E',
                colorBorder: '#E7E5E4',
                colorText: '#1C1917',
                colorTextSecondary: '#78716C',
                colorBgContainer: '#FFFFFF',
                colorBgLayout: '#FFFBF5',
                borderRadius: 8,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              },
            }}
          >
            <Layout>{children}</Layout>
            <Toaster position="bottom-right" richColors />
            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
                TanStackQueryDevtools,
              ]}
            />
          </ConfigProvider>
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  );
}
