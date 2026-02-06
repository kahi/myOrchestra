import { openDB, type IDBPDatabase } from 'idb'
import type { SoundCard } from './types'

const DB_NAME = 'myorchestra'
const DB_VERSION = 1
const STORE_NAME = 'cards'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export async function getAllCards(): Promise<SoundCard[]> {
  const db = await getDb()
  const cards = await db.getAll(STORE_NAME)
  cards.sort((a: SoundCard, b: SoundCard) => a.createdAt - b.createdAt)
  return cards
}

export async function saveCard(card: SoundCard): Promise<void> {
  const db = await getDb()
  await db.put(STORE_NAME, card)
}

export async function deleteCard(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE_NAME, id)
}
