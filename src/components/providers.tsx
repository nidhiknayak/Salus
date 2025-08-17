// src/components/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/lib/apollo-client";
import { ConfigProvider, theme } from 'antd';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ApolloProvider client={apolloClient}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#CFFF5E',
              borderRadius: 12,
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            },
          }}
        >
          {children}
        </ConfigProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}