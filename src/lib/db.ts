import { PrismaClient } from '@prisma/client'
<<<<<<< HEAD
import * as path from 'path'
=======
>>>>>>> 04eb435d1a6e92ce3425f7e254d5829ee4bdb0c7

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

<<<<<<< HEAD
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
=======
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
>>>>>>> 04eb435d1a6e92ce3425f7e254d5829ee4bdb0c7
