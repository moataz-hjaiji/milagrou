import mongoose, { Types } from 'mongoose';
import Logger from '../core/Logger';
import { db, environment } from '../configVars';

// Build the connection string
const dbURI = db.uri;
mongoose.set('strictQuery', false);

// Create the database connection with retry logic
export async function connect() {
  const maxRetries = 10;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(dbURI, {
        serverSelectionTimeoutMS: 10000, // Increased to 10 seconds
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      });
      Logger.info('Mongoose connection done 👍');
      return;
    } catch (e) {
      Logger.info(`Mongoose connection attempt ${attempt}/${maxRetries} failed`);
      Logger.error(e);
      
      if (attempt === maxRetries) {
        Logger.error('Max retry attempts reached. Database connection failed.');
        return; // Don't throw, just log and continue
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

if (environment !== 'test') {
  connect().catch(err => {
    Logger.error('Database connection failed:', err);
  });
}


mongoose.connection.on('connected', () => {
  Logger.info('Mongoose default connection open to ' + db.host + ' 👍');
});

mongoose.connection.on('error', (err) => {
  Logger.error('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  Logger.info('Mongoose default connection disconnected ');
});

process.on('SIGINT', () => {
  mongoose.connection.close();
  Logger.info(
    'Mongoose default connection disconnected through app termination'
  );
  process.exit(0);
});

export async function deleteDocumentsByUserId(userId: any) {
  try {
    const collections = mongoose.connection.collections;

    for (const collectionName in collections) {
      if (collectionName === 'users') {
        continue;
      }

      const collection = collections[collectionName];
      const userIdObject = new Types.ObjectId(userId); 

      const filter = {
        $or: [
          { user: userIdObject },
          { createdBy: userIdObject },
          { organizer: userIdObject },
          { teamInvited: userIdObject },
          { user_id: userIdObject },
          { sender: userIdObject },
          { receiver: userIdObject },
          { receiver_id: userIdObject },
          { player_id: userIdObject },
        ],
      };

      const result = await collection.deleteMany(filter);
      if (result.deletedCount > 0) {
        Logger.info(
          `Deleted ${result.deletedCount} documents from ${collectionName}`
        );
      } else {
        Logger.info(
          `No matching documents found for ${userId} in ${collectionName}`
        );
      }
    }
  } catch (error) {
    Logger.error(`Error deleting documents: ${error}`);
  }
}
