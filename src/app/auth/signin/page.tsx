// src/app/auth/signin/page.tsx
"use client";

import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        message.error('Invalid credentials');
      } else {
        message.success('Signed in successfully');
        router.push('/dashboard');
      }
    } catch (error) {
      message.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #8C7DFF 0%, #CFFF5E 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: 400, 
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={1} style={{ color: '#1a1a1a', marginBottom: '8px' }}>
            SALUS
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Healthcare Worker Management System
          </Text>
        </div>

        <Form
          name="signin"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your email"
              style={{ borderRadius: '12px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              style={{ borderRadius: '12px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: '50px',
                borderRadius: '12px',
                backgroundColor: '#CFFF5E',
                borderColor: '#CFFF5E',
                color: '#1a1a1a',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              Sign In
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Don't have an account?{' '}
              <Link 
                href="/auth/signup"
                style={{ 
                  color: '#8C7DFF', 
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}
              >
                Sign Up
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}