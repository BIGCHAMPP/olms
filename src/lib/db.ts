import { PrismaClient } from '@prisma/client'
import * as path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get the correct database path based on environment
const getDatabasePath = () => {
  if (process.env.DATABASE_URL) {
    return undefined // Use the URL from environment
  }
  
  // Default path for development
  return undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:./db/custom.db'
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
