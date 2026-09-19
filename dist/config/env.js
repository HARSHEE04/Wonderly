import dotenv from 'dotenv';
dotenv.config();
export const env = {
    port: Number(process.env.PORT ?? 4000),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/the-prevengers',
    firecrawlApiKey: process.env.FIRECRAWL_API_KEY ?? '',
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',
    openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
};
