import mongoose from 'mongoose';
import { env } from './env';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      // Recommended Atlas settings
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    const dbName = conn.connection.name || 'unknown';
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`   Database: ${dbName}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);

    if (msg.includes('ENOTFOUND') || msg.includes('ETIMEOUT')) {
      console.error('❌ MongoDB connection failed: Cannot reach Atlas cluster.');
      console.error('   → Check your Atlas Network Access: add your current IP address.');
    } else if (msg.includes('Authentication failed') || msg.includes('bad auth')) {
      console.error('❌ MongoDB connection failed: Authentication error.');
      console.error('   → Verify the username and password in your MONGODB_URI.');
    } else if (msg.includes('querySrv') || msg.includes('ESERVFAIL')) {
      console.error('❌ MongoDB connection failed: DNS resolution error.');
      console.error('   → Check the cluster hostname in your MONGODB_URI.');
    } else {
      console.error('❌ MongoDB connection failed:', msg);
    }

    process.exit(1);
  }
};

export default connectDB;
