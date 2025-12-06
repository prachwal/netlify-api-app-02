import { MongoClient, Db, Collection, Document, ObjectId } from 'mongodb'

export class MongoDBHandler {
  private client: MongoClient | null = null
  private db: Db | null = null

  constructor(private uri: string, private dbName: string) {}

  async connect(): Promise<void> {
    if (!this.client) {
      this.client = new MongoClient(this.uri)
      await this.client.connect()
      this.db = this.client.db(this.dbName)
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
    }
  }

  private getCollection(collectionName: string): Collection<Document> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.')
    }
    return this.db.collection(collectionName)
  }

  async find(collectionName: string, query: Document = {}, options: Document = {}): Promise<Document[]> {
    const collection = this.getCollection(collectionName)
    const cursor = collection.find(query, options)
    return cursor.toArray()
  }

  async findOne(collectionName: string, query: Document): Promise<Document | null> {
    const collection = this.getCollection(collectionName)
    return collection.findOne(query)
  }

  async insertOne(collectionName: string, document: Document): Promise<ObjectId> {
    const collection = this.getCollection(collectionName)
    const result = await collection.insertOne(document)
    return result.insertedId
  }

  async insertMany(collectionName: string, documents: Document[]): Promise<ObjectId[]> {
    const collection = this.getCollection(collectionName)
    const result = await collection.insertMany(documents)
    return Object.values(result.insertedIds)
  }

  async updateOne(collectionName: string, query: Document, update: Document): Promise<number> {
    const collection = this.getCollection(collectionName)
    const result = await collection.updateOne(query, update)
    return result.modifiedCount
  }

  async updateMany(collectionName: string, query: Document, update: Document): Promise<number> {
    const collection = this.getCollection(collectionName)
    const result = await collection.updateMany(query, update)
    return result.modifiedCount
  }

  async deleteOne(collectionName: string, query: Document): Promise<number> {
    const collection = this.getCollection(collectionName)
    const result = await collection.deleteOne(query)
    return result.deletedCount
  }

  async deleteMany(collectionName: string, query: Document): Promise<number> {
    const collection = this.getCollection(collectionName)
    const result = await collection.deleteMany(query)
    return result.deletedCount
  }

  async countDocuments(collectionName: string, query: Document = {}): Promise<number> {
    const collection = this.getCollection(collectionName)
    return collection.countDocuments(query)
  }
}