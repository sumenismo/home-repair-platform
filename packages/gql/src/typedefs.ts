import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const schemaDir = join(import.meta.dirname, '../schema')

const read = (file: string) => readFileSync(join(schemaDir, file), 'utf-8')

export const typeDefs = [
  read('schema.graphql'),
  read('identity.graphql'),
  read('listings.graphql'),
  read('bidding.graphql'),
  read('messaging.graphql'),
]
