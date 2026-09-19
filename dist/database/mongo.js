import mongoose from 'mongoose';
import { env } from '../config/env.js';
export let mongoAvailable = false;
export async function connectMongo() {
    if (!env.mongodbUri || env.mongodbUri.includes('localhost') === false && env.mongodbUri.includes('mongodb') === false) {
        console.warn('MongoDB URI is not configured; continuing without MongoDB persistence.');
        return false;
    }
    try {
        await mongoose.connect(env.mongodbUri);
        mongoAvailable = true;
        console.log('MongoDB connected.');
        return true;
    }
    catch (error) {
        mongoAvailable = false;
        console.warn('MongoDB unavailable; running in local/in-memory mode.', error);
        return false;
    }
}
export function isMongoConnected() {
    return mongoose.connection.readyState === 1;
}
