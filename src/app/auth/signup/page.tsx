// src/app/auth/signup/page.tsx
"use client";

import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, gql } from '@apollo/client';

const { Title, Text } = Typography;
const { Option } = Select;

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      email
      name
      role
    }
  }
`;

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [register] = useMutation(REGISTER_MUTATION);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await register({
        variables: {
          input: {
            email: values.email,
            password: values.password,
            name: values.name,
            role: values.role
          }
        }
      });
      
      message.success('Account created successfully! Please sign in.');
      router.push('/auth/signin');
    } catch (error: any) {
      message.error(error.message || 'An error occurred during registration');
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
      background: 'linear-gradient(135deg, #CFFF5E 0%, #8C7DFF 100%)',
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
            Join Healthcare Worker Management System
          </Text>
        </div>

        <Form
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your full name"
              style={{ borderRadius: '12px' }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Enter your email"
              style={{ borderRadius: '12px' }}
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select your role!' }]}
          >
            <Select 
              placeholder="Select your role"
              style={{ borderRadius: '12px' }}
            >
              <Option value="CAREWORKER">Care Worker</Option>
              <Option value="MANAGER">Manager</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              style={{ borderRadius: '12px' }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
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
                backgroundColor: '#8C7DFF',
                borderColor: '#8C7DFF',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              Sign Up
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Already have an account?{' '}
              <Link 
                href="/auth/signin"
                style={{ 
                  color: '#8C7DFF', 
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}
              >
                Sign In
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}