// src/graphql/resolvers.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'


const prisma = new PrismaClient()

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

export const resolvers = {
  Query: {
    me: async (_: any, __: any, { user }: any) => {
      if (!user) throw new Error('Not authenticated')
      return await prisma.user.findUnique({
        where: { id: user.id },
        include: { shifts: true }
      })
    },

    myShifts: async (_: any, __: any, { user }: any) => {
      if (!user) throw new Error('Not authenticated')
      return await prisma.shift.findMany({
        where: { userId: user.id },
        include: { user: true, organization: true },
        orderBy: { clockIn: 'desc' }
      })
    },

    organization: async () => {
      return await prisma.organization.findFirst()
    },

    dashboardStats: async (_: any, __: any, { user }: any) => {
      if (!user || user.role !== 'MANAGER') {
        throw new Error('Not authorized')
      }

      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const startOfDay = new Date(now.setHours(0, 0, 0, 0))

      const [shifts, todayClockIns, currentlyClocked] = await Promise.all([
        prisma.shift.findMany({
          where: {
            clockIn: { gte: sevenDaysAgo }
          },
          include: { user: true }
        }),
        prisma.shift.count({
          where: {
            clockIn: { gte: startOfDay }
          }
        }),
        prisma.shift.findMany({
          where: { clockOut: null },
          include: { user: true, organization: true }
        })
      ])

      const totalHours = shifts.reduce((acc: number, shift: any) => {
        if (shift.clockOut) {
          return acc + (new Date(shift.clockOut).getTime() - new Date(shift.clockIn).getTime()) / (1000 * 60 * 60)
        }
        return acc
      }, 0)

      const avgHours = shifts.length > 0 ? totalHours / 7 : 0

      return {
        averageHoursPerDay: avgHours,
        dailyClockIns: todayClockIns,
        totalHoursLast7Days: totalHours,
        currentlyClocked
      }
    },

    currentlyClocked: async (_: any, __: any, { user }: any) => {
      if (!user || user.role !== 'MANAGER') {
        throw new Error('Not authorized')
      }
      return await prisma.shift.findMany({
        where: { clockOut: null },
        include: { user: true, organization: true }
      })
    }
  },

  Mutation: {
    register: async (_: any, { input }: any) => {
      const hashedPassword = await bcrypt.hash(input.password, 12)
      return await prisma.user.create({
        data: {
          ...input,
          password: hashedPassword
        }
      })
    },

    clockIn: async (_: any, { input }: any, { user }: any) => {
      if (!user) throw new Error('Not authenticated')

      const organization = await prisma.organization.findFirst()
      if (!organization) throw new Error('Organization not found')

      const distance = calculateDistance(
        input.latitude,
        input.longitude,
        organization.latitude,
        organization.longitude
      )

      if (distance > organization.radius) {
        throw new Error('You are outside the allowed perimeter')
      }

      const activeShift = await prisma.shift.findFirst({
        where: {
          userId: user.id,
          clockOut: null
        }
      })

      if (activeShift) {
        throw new Error('You are already clocked in')
      }

      return await prisma.shift.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          clockIn: new Date(),
          noteIn: input.noteIn,
          clockInLat: input.latitude,
          clockInLng: input.longitude
        },
        include: { user: true, organization: true }
      })
    },

    clockOut: async (_: any, { input }: any, { user }: any) => {
      if (!user) throw new Error('Not authenticated')

      const activeShift = await prisma.shift.findFirst({
        where: {
          userId: user.id,
          clockOut: null
        }
      })

      if (!activeShift) {
        throw new Error('No active shift found')
      }

      return await prisma.shift.update({
        where: { id: activeShift.id },
        data: {
          clockOut: new Date(),
          noteOut: input.noteOut,
          clockOutLat: input.latitude,
          clockOutLng: input.longitude
        },
        include: { user: true, organization: true }
      })
    },

    updateLocation: async (_: any, { input }: any, { user }: any) => {
      if (!user || user.role !== 'MANAGER') {
        throw new Error('Not authorized')
      }

      const existing = await prisma.organization.findFirst()
      
      if (existing) {
        return await prisma.organization.update({
          where: { id: existing.id },
          data: input
        })
      } else {
        return await prisma.organization.create({
          data: input
        })
      }
    }
  },

  Shift: {
    duration: (shift: any) => {
      if (!shift.clockOut) return null
      return Math.floor((new Date(shift.clockOut).getTime() - new Date(shift.clockIn).getTime()) / (1000 * 60))
    }
  }
}