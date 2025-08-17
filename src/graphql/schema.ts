// src/graphql/schema.ts
import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    role: Role!
    shifts: [Shift!]!
  }

  type Organization {
    id: ID!
    name: String!
    latitude: Float!
    longitude: Float!
    radius: Int!
  }

  type Shift {
    id: ID!
    user: User!
    clockIn: String!
    clockOut: String
    noteIn: String
    noteOut: String
    clockInLat: Float
    clockInLng: Float
    clockOutLat: Float
    clockOutLng: Float
    duration: Int
  }

  type DashboardStats {
    averageHoursPerDay: Float!
    dailyClockIns: Int!
    totalHoursLast7Days: Float!
    currentlyClocked: [Shift!]!
  }

  enum Role {
    MANAGER
    CAREWORKER
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
    role: Role!
  }

  input ClockInInput {
    noteIn: String
    latitude: Float!
    longitude: Float!
  }

  input ClockOutInput {
    noteOut: String
    latitude: Float
    longitude: Float
  }

  input UpdateLocationInput {
    name: String!
    latitude: Float!
    longitude: Float!
    radius: Int!
  }

  type Query {
    me: User
    myShifts: [Shift!]!
    organization: Organization
    dashboardStats: DashboardStats!
    currentlyClocked: [Shift!]!
  }

  type Mutation {
    register(input: RegisterInput!): User!
    clockIn(input: ClockInInput!): Shift!
    clockOut(input: ClockOutInput!): Shift!
    updateLocation(input: UpdateLocationInput!): Organization!
  }
`