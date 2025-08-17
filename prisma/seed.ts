// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create organization
  const organization = await prisma.organization.upsert({
    where: { id: 'org1' },
    update: {},
    create: {
      id: 'org1',
      name: 'San Francisco General Hospital',
      latitude: 37.7562,
      longitude: -122.4031,
      radius: 2000, // 2km radius
    },
  });

  // Create manager user
  const hashedManagerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@hospital.com' },
    update: {},
    create: {
      email: 'manager@hospital.com',
      name: 'Hospital Manager',
      password: hashedManagerPassword,
      role: 'MANAGER',
    },
  });

  // Create care worker users
  const hashedWorkerPassword = await bcrypt.hash('worker123', 12);
  
  const worker1 = await prisma.user.upsert({
    where: { email: 'john@hospital.com' },
    update: {},
    create: {
      email: 'john@hospital.com',
      name: 'John Doe',
      password: hashedWorkerPassword,
      role: 'CAREWORKER',
    },
  });

  const worker2 = await prisma.user.upsert({
    where: { email: 'jane@hospital.com' },
    update: {},
    create: {
      email: 'jane@hospital.com',
      name: 'Jane Smith',
      password: hashedWorkerPassword,
      role: 'CAREWORKER',
    },
  });

  // Create some sample shifts
  await prisma.shift.createMany({
    data: [
      {
        userId: worker1.id,
        organizationId: organization.id,
        clockIn: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        clockOut: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        noteIn: 'Starting morning shift',
        noteOut: 'Completed rounds',
        clockInLat: 37.7562,
        clockInLng: -122.4031,
        clockOutLat: 37.7562,
        clockOutLng: -122.4031,
      },
      {
        userId: worker2.id,
        organizationId: organization.id,
        clockIn: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        clockOut: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        noteIn: 'Emergency call shift',
        noteOut: 'Emergency handled successfully',
        clockInLat: 37.7562,
        clockInLng: -122.4031,
        clockOutLat: 37.7562,
        clockOutLng: -122.4031,
      },
      // Active shift for worker1
      {
        userId: worker1.id,
        organizationId: organization.id,
        clockIn: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        noteIn: 'Afternoon shift',
        clockInLat: 37.7562,
        clockInLng: -122.4031,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Database seeded successfully!');
  console.log('\nTest accounts:');
  console.log('Manager: manager@hospital.com / manager123');
  console.log('Worker 1: john@hospital.com / worker123');
  console.log('Worker 2: jane@hospital.com / worker123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });