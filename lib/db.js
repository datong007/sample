import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!dbName) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const db = client.db(dbName);

    // 测试连接
    await db.command({ ping: 1 });
    console.log('Successfully connected to MongoDB.');

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function addOrder(orderData) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('orders');
    const result = await collection.insertOne(orderData);
    return result;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
}

export async function getOrders() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('orders');
    return await collection.find({})
      .sort({ orderDate: -1 })
      .toArray();
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}

export async function getOrderByNumber(orderNumber) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('orders');
    return await collection.findOne({ orderNumber });
  } catch (error) {
    console.error('Error getting order by number:', error);
    throw error;
  }
}

// 添加更新库存的函数
export async function updateProductStock(productId, quantity) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('products');
    const result = await collection.updateOne(
      { id: productId },
      { $inc: { stock: quantity } }
    );
    return result;
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
} 