// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Layout, 
  Card, 
  Button, 
  Table, 
  Input, 
  Form, 
  Modal, 
  message, 
  Statistic, 
  Row, 
  Col, 
  Tag, 
  Space,
  Alert,
  Spin
} from 'antd';
import { 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  UserOutlined, 
  DashboardOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { signOut } from 'next-auth/react';
import { useQuery, useMutation, gql } from '@apollo/client';

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;

// GraphQL Queries and Mutations
const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`;

const MY_SHIFTS_QUERY = gql`
  query MyShifts {
    myShifts {
      id
      clockIn
      clockOut
      noteIn
      noteOut
      duration
    }
  }
`;

const ORGANIZATION_QUERY = gql`
  query Organization {
    organization {
      id
      name
      latitude
      longitude
      radius
    }
  }
`;

const DASHBOARD_STATS_QUERY = gql`
  query DashboardStats {
    dashboardStats {
      averageHoursPerDay
      dailyClockIns
      totalHoursLast7Days
      currentlyClocked {
        id
        user {
          name
          email
        }
        clockIn
        noteIn
      }
    }
  }
`;

const CLOCK_IN_MUTATION = gql`
  mutation ClockIn($input: ClockInInput!) {
    clockIn(input: $input) {
      id
      clockIn
      noteIn
    }
  }
`;

const CLOCK_OUT_MUTATION = gql`
  mutation ClockOut($input: ClockOutInput!) {
    clockOut(input: $input) {
      id
      clockOut
      noteOut
    }
  }
`;

const UPDATE_LOCATION_MUTATION = gql`
  mutation UpdateLocation($input: UpdateLocationInput!) {
    updateLocation(input: $input) {
      id
      name
      latitude
      longitude
      radius
    }
  }
`;

// Custom hook for geolocation
const useLocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          setLocationError(error.message);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  return { location, locationError };
};

// Helper function to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Clock In/Out Component
const ClockInOut: React.FC = () => {
  const { location, locationError } = useLocation();
  const [noteModalVisible, setNoteModalVisible] = useState<boolean>(false);
  const [noteModalType, setNoteModalType] = useState<'clockIn' | 'clockOut'>('clockIn');
  const [note, setNote] = useState<string>('');
  
  const { data: orgData } = useQuery(ORGANIZATION_QUERY);
  const { data: shiftsData, refetch: refetchShifts } = useQuery(MY_SHIFTS_QUERY);
  
  const [clockIn, { loading: clockingIn }] = useMutation(CLOCK_IN_MUTATION);
  const [clockOut, { loading: clockingOut }] = useMutation(CLOCK_OUT_MUTATION);

  const currentShift = shiftsData?.myShifts?.find((shift: any) => !shift.clockOut);
  const organization = orgData?.organization;

  const isWithinPerimeter = (): boolean => {
    if (!location || !organization) return false;
    const distance = calculateDistance(
      location.latitude, 
      location.longitude, 
      organization.latitude, 
      organization.longitude
    );
    return distance <= organization.radius;
  };

  const handleClockIn = () => {
    if (locationError) {
      message.error('Location access required to clock in');
      return;
    }

    if (!location) {
      message.error('Getting your location...');
      return;
    }

    if (!isWithinPerimeter()) {
      message.error('You are not allowed to clock in outside the designated perimeter.');
      return;
    }

    setNoteModalType('clockIn');
    setNoteModalVisible(true);
  };

  const handleClockOut = () => {
    setNoteModalType('clockOut');
    setNoteModalVisible(true);
  };

  const confirmAction = async () => {
    try {
      if (noteModalType === 'clockIn' && location) {
        await clockIn({
          variables: {
            input: {
              latitude: location.latitude,
              longitude: location.longitude,
              noteIn: note || undefined
            }
          }
        });
        message.success('Clocked in successfully!');
      } else if (noteModalType === 'clockOut') {
        await clockOut({
          variables: {
            input: {
              latitude: location?.latitude,
              longitude: location?.longitude,
              noteOut: note || undefined
            }
          }
        });
        message.success('Clocked out successfully!');
      }
      
      setNoteModalVisible(false);
      setNote('');
      refetchShifts();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const distance = location && organization ? calculateDistance(
    location.latitude, 
    location.longitude, 
    organization.latitude, 
    organization.longitude
  ) : null;

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card 
            title="Quick Actions" 
            style={{ 
              background: 'linear-gradient(135deg, #CFFF5E 0%, #B8FF3C 100%)',
              border: 'none',
              borderRadius: '16px'
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {!currentShift ? (
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ClockCircleOutlined />}
                  onClick={handleClockIn}
                  block
                  loading={clockingIn}
                  style={{ 
                    height: '60px', 
                    fontSize: '16px',
                    backgroundColor: '#1a1a1a',
                    borderColor: '#1a1a1a',
                    borderRadius: '12px'
                  }}
                >
                  Clock In
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  danger
                  size="large" 
                  icon={<ClockCircleOutlined />}
                  onClick={handleClockOut}
                  block
                  loading={clockingOut}
                  style={{ 
                    height: '60px', 
                    fontSize: '16px',
                    borderRadius: '12px'
                  }}
                >
                  Clock Out
                </Button>
              )}

              {currentShift && (
                <Card 
                  size="small" 
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    border: 'none'
                  }}
                >
                  <p><strong>Current Shift:</strong></p>
                  <p>Started: {new Date(currentShift.clockIn).toLocaleTimeString()}</p>
                  {currentShift.noteIn && <p>Note: {currentShift.noteIn}</p>}
                </Card>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card 
            title="Location Status"
            style={{
              background: 'linear-gradient(135deg, #8C7DFF 0%, #7B6CFF 100%)',
              border: 'none',
              borderRadius: '16px',
              color: 'white'
            }}
            headStyle={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {locationError ? (
                <Alert message="Location Error" description={locationError} type="error" />
              ) : location ? (
                <>
                  <div style={{ color: 'white' }}>
                    <EnvironmentOutlined /> Current Location:
                    <br />
                    <small>
                      Lat: {location.latitude.toFixed(6)}, 
                      Lng: {location.longitude.toFixed(6)}
                    </small>
                  </div>
                  
                  {distance && organization && (
                    <div style={{ color: 'white' }}>
                      <p>Distance from {organization.name}: <strong>{(distance/1000).toFixed(2)} km</strong></p>
                      <Tag color={isWithinPerimeter() ? 'green' : 'red'}>
                        {isWithinPerimeter() ? 'Within Perimeter' : 'Outside Perimeter'}
                      </Tag>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <Spin style={{ color: 'white' }} />
                  <p>Getting location...</p>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal
        title={noteModalType === 'clockIn' ? 'Clock In' : 'Clock Out'}
        open={noteModalVisible}
        onOk={confirmAction}
        onCancel={() => {
          setNoteModalVisible(false);
          setNote('');
        }}
        confirmLoading={clockingIn || clockingOut}
        okButtonProps={{
          style: { backgroundColor: '#CFFF5E', borderColor: '#CFFF5E', color: '#1a1a1a' }
        }}
      >
        <Form layout="vertical">
          <Form.Item label="Add a note (optional)">
            <TextArea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter any notes about your shift..."
              rows={3}
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Manager Dashboard Component
const ManagerDashboard: React.FC = () => {
  const { data: statsData, loading } = useQuery(DASHBOARD_STATS_QUERY);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

  const stats = statsData?.dashboardStats;
  const currentlyClocked = stats?.currentlyClocked || [];

  const currentlyColumns = [
    {
      title: 'Staff Name',
      dataIndex: ['user', 'name'],
      key: 'name',
    },
    {
      title: 'Clock In Time',
      dataIndex: 'clockIn',
      key: 'clockIn',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (text: string, record: any) => {
        const duration = Date.now() - new Date(record.clockIn).getTime();
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      },
    },
    {
      title: 'Note',
      dataIndex: 'noteIn',
      key: 'note',
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="green">Active</Tag>,
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#1a1a1a' }}>Manager Dashboard</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card style={{ 
            background: 'linear-gradient(135deg, #CFFF5E 0%, #B8FF3C 100%)',
            border: 'none',
            borderRadius: '16px'
          }}>
            <Statistic
              title="Average Hours/Day"
              value={stats?.averageHoursPerDay || 0}
              precision={1}
              prefix={<ClockCircleOutlined />}
              suffix="hrs"
              valueStyle={{ color: '#1a1a1a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ 
            background: 'linear-gradient(135deg, #8C7DFF 0%, #7B6CFF 100%)',
            border: 'none',
            borderRadius: '16px'
          }}>
            <Statistic
              title="Daily Clock-ins Today"
              value={stats?.dailyClockIns || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: 'white' }}
              style={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ 
            background: 'linear-gradient(135deg, #B87EED 0%, #A96CE8 100%)',
            border: 'none',
            borderRadius: '16px'
          }}>
            <Statistic
              title="Total Hours (7 days)"
              value={stats?.totalHoursLast7Days || 0}
              precision={1}
              suffix="hrs"
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Currently Clocked In Staff" 
        style={{ 
          marginBottom: '24px',
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Table 
          columns={currentlyColumns} 
          dataSource={currentlyClocked}
          rowKey="id"
          pagination={false}
          style={{ borderRadius: '12px' }}
        />
      </Card>

      <LocationSettings />
    </div>
  );
};

// Location Settings Component
const LocationSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const { data: orgData, refetch } = useQuery(ORGANIZATION_QUERY);
  const [updateLocation, { loading }] = useMutation(UPDATE_LOCATION_MUTATION);

  const currentLocation = orgData?.organization;

  const handleSave = async (values: any) => {
    try {
      await updateLocation({
        variables: {
          input: {
            name: values.name,
            latitude: parseFloat(values.latitude),
            longitude: parseFloat(values.longitude),
            radius: parseInt(values.radius)
          }
        }
      });
      message.success('Location perimeter updated successfully!');
      setModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  return (
    <Card 
      title="Location Perimeter Settings"
      style={{
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {currentLocation ? (
          <div>
            <p><strong>Current Location:</strong> {currentLocation.name}</p>
            <p><strong>Coordinates:</strong> {currentLocation.latitude}, {currentLocation.longitude}</p>
            <p><strong>Perimeter Radius:</strong> {currentLocation.radius}m ({(currentLocation.radius/1000).toFixed(1)}km)</p>
          </div>
        ) : (
          <p>No location configured yet.</p>
        )}
        
        <Button 
          type="primary" 
          icon={<SettingOutlined />}
          onClick={() => setModalVisible(true)}
          style={{
            backgroundColor: '#8C7DFF',
            borderColor: '#8C7DFF',
            borderRadius: '8px'
          }}
        >
          Update Location Settings
        </Button>
      </Space>

      <Modal
        title="Update Location Perimeter"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okButtonProps={{
          style: { backgroundColor: '#CFFF5E', borderColor: '#CFFF5E', color: '#1a1a1a' }
        }}
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item
            name="name"
            label="Location Name"
            initialValue={currentLocation?.name || 'Hospital Location'}
            rules={[{ required: true, message: 'Please enter location name' }]}
          >
            <Input style={{ borderRadius: '8px' }} />
          </Form.Item>
          <Form.Item
            name="latitude"
            label="Latitude"
            initialValue={currentLocation?.latitude || 37.7562}
            rules={[{ required: true, message: 'Please enter latitude' }]}
          >
            <Input type="number" step="any" style={{ borderRadius: '8px' }} />
          </Form.Item>
          <Form.Item
            name="longitude"
            label="Longitude"
            initialValue={currentLocation?.longitude || -122.4031}
            rules={[{ required: true, message: 'Please enter longitude' }]}
          >
            <Input type="number" step="any" style={{ borderRadius: '8px' }} />
          </Form.Item>
          <Form.Item
            name="radius"
            label="Radius (meters)"
            initialValue={currentLocation?.radius || 2000}
            rules={[{ required: true, message: 'Please enter radius' }, { type: 'number', min: 100, message: 'Minimum radius is 100 meters' }]}
          >
            <Input type="number" style={{ borderRadius: '8px' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

// Personal History Component
const PersonalHistory: React.FC = () => {
  const { data: shiftsData, loading } = useQuery(MY_SHIFTS_QUERY);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

  const shifts = shiftsData?.myShifts || [];

  const columns = [
    {
      title: 'Date',
      key: 'date',
      render: (text: string, record: any) => new Date(record.clockIn).toLocaleDateString(),
    },
    {
      title: 'Clock In',
      dataIndex: 'clockIn',
      key: 'clockIn',
      render: (time: string) => new Date(time).toLocaleTimeString(),
    },
    {
      title: 'Clock Out',
      dataIndex: 'clockOut',
      key: 'clockOut',
      render: (time: string | null) => time ? new Date(time).toLocaleTimeString() : 'Still active',
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (text: string, record: any) => {
        if (!record.clockOut) return 'Active';
        if (record.duration) {
          const hours = Math.floor(record.duration / 60);
          const minutes = record.duration % 60;
          return `${hours}h ${minutes}m`;
        }
        return 'N/A';
      },
    },
    {
      title: 'Notes In',
      dataIndex: 'noteIn',
      key: 'noteIn',
    },
    {
      title: 'Notes Out',
      dataIndex: 'noteOut',
      key: 'noteOut',
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card 
        title="My Shift History"
        style={{
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Table 
          columns={columns} 
          dataSource={shifts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          style={{ borderRadius: '12px' }}
        />
      </Card>
    </div>
  );
};

// Main Application Component
const DashboardApp: React.FC = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<string>('1');
  const router = useRouter();
  const { data: userData } = useQuery(ME_QUERY, { skip: !session });

  // Show loading screen while checking authentication
  if (status === 'loading') {
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
          <p style={{ marginTop: 16 }}>Loading Salus Healthcare System...</p>
        </Card>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  const userRole = userData?.me?.role || session?.user?.role;
  const userName = userData?.me?.name || session?.user?.name || session?.user?.email;

  const menuItems = userRole === 'MANAGER' ? [
    { key: '1', label: 'Dashboard', icon: <DashboardOutlined /> },
    { key: '2', label: 'My History', icon: <ClockCircleOutlined /> },
  ] : [
    { key: '1', label: 'Clock In/Out', icon: <ClockCircleOutlined /> },
    { key: '2', label: 'My History', icon: <UserOutlined /> },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 100%)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ color: '#CFFF5E', fontSize: '24px', fontWeight: 'bold' }}>
          SALUS
        </div>
        <Space>
          <span style={{ color: 'white' }}>
            Welcome, {userName} ({userRole})
          </span>
          <Button 
            type="primary" 
            ghost 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ 
              borderColor: '#CFFF5E', 
              color: '#CFFF5E',
              borderRadius: '8px'
            }}
          >
            Logout
          </Button>
        </Space>
      </Header>

      <Layout>
        <Sider 
          width={220} 
          theme="light" 
          breakpoint="lg" 
          collapsedWidth="0"
          style={{ 
            background: 'white',
            boxShadow: '2px 0 10px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ padding: '24px 16px' }}>
            {menuItems.map(item => (
              <Button
                key={item.key}
                type={activeTab === item.key ? 'primary' : 'text'}
                icon={item.icon}
                block
                style={{ 
                  marginBottom: '12px',
                  textAlign: 'left',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: activeTab === item.key ? '#CFFF5E' : 'transparent',
                  color: activeTab === item.key ? '#1a1a1a' : '#666',
                  border: 'none',
                  fontWeight: activeTab === item.key ? 'bold' : 'normal'
                }}
                onClick={() => setActiveTab(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </Sider>

        <Layout style={{ padding: '0', backgroundColor: '#f5f5f5' }}>
          <Content style={{ margin: 0, minHeight: 280 }}>
            {userRole === 'MANAGER' ? (
              activeTab === '1' ? <ManagerDashboard /> : <PersonalHistory />
            ) : (
              activeTab === '1' ? <ClockInOut /> : <PersonalHistory />
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DashboardApp;