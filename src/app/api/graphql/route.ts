// src/app/api/graphql/route.ts
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { typeDefs } from '@/graphql/schema'
import { resolvers } from '@/graphql/resolvers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const handler = startServerAndCreateNextHandler(server, {
  context: async (request) => {
    const session = await getServerSession(authOptions)
    return {
      user: session?.user || null,
    }
  },
})

export { handler as GET, handler as POST }