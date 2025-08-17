// src/app/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, Spin, Typography, Button, Space } from "antd";
import { ClockCircleOutlined, TeamOutlined, SafetyOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title, Paragraph } = Typography;

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #8C7DFF 0%, #CFFF5E 100%)'
      }}>
        <Card style={{ textAlign: 'center', minWidth: 300, borderRadius: '16px', border: 'none' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Loading...</p>
        </Card>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8C7DFF 0%, #CFFF5E 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        {/* Main Hero Card */}
        <Card
          style={{
            borderRadius: '24px',
            border: 'none',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            marginBottom: '32px'
          }}
        >
          <div style={{ padding: '40px 20px' }}>
            <Title level={1} style={{ fontSize: '4rem', marginBottom: '16px', color: '#1a1a1a' }}>
              SALUS
            </Title>
            <Title level={3} style={{ color: '#666', fontWeight: 400, marginBottom: '24px' }}>
              Healthcare Worker Management System
            </Title>
            <Paragraph style={{ fontSize: '18px', color: '#888', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              Modern, efficient clock-in/clock-out system designed specifically for healthcare professionals. 
              Track shifts, manage locations, and ensure compliance with ease.
            </Paragraph>
            
            <Space size="large">
              <Link href="/auth/signin">
                <Button
                  type="primary"
                  size="large"
                  style={{
                    height: '56px',
                    paddingInline: '32px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: '#CFFF5E',
                    borderColor: '#CFFF5E',
                    color: '#1a1a1a',
                    borderRadius: '16px'
                  }}
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="large"
                  style={{
                    height: '56px',
                    paddingInline: '32px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: 'transparent',
                    borderColor: '#8C7DFF',
                    color: '#8C7DFF',
                    borderRadius: '16px',
                    borderWidth: '2px'
                  }}
                >
                  Get Started
                </Button>
              </Link>
            </Space>
          </div>
        </Card>

        {/* Features Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px',
          marginTop: '32px'
        }}>
          <Card
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #CFFF5E 0%, #B8FF3C 100%)'
            }}
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <ClockCircleOutlined style={{ fontSize: '48px', color: '#1a1a1a', marginBottom: '16px' }} />
              <Title level={4} style={{ color: '#1a1a1a', marginBottom: '12px' }}>
                Smart Clock System
              </Title>
              <Paragraph style={{ color: '#333' }}>
                GPS-based location tracking ensures staff can only clock in within designated areas.
              </Paragraph>
            </div>
          </Card>

          <Card
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #8C7DFF 0%, #7B6CFF 100%)'
            }}
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <TeamOutlined style={{ fontSize: '48px', color: 'white', marginBottom: '16px' }} />
              <Title level={4} style={{ color: 'white', marginBottom: '12px' }}>
                Team Management
              </Title>
              <Paragraph style={{ color: '#E8E4FF' }}>
                Comprehensive dashboard for managers to track staff hours and attendance in real-time.
              </Paragraph>
            </div>
          </Card>

          <Card
            style={{
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #B87EED 0%, #A96CE8 100%)'
            }}
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <SafetyOutlined style={{ fontSize: '48px', color: 'white', marginBottom: '16px' }} />
              <Title level={4} style={{ color: 'white', marginBottom: '12px' }}>
                Secure & Compliant
              </Title>
              <Paragraph style={{ color: '#F0ECFF' }}>
                Built with healthcare regulations in mind, ensuring data security and compliance.
              </Paragraph>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '48px', textAlign: 'center' }}>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
            © 2025 SALUS Healthcare Management System. Built for healthcare professionals.
          </Paragraph>
        </div>
      </div>
    </div>
  );
}