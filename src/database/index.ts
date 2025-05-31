import mongoose, { Types } from 'mongoose';
import Logger from '../core/Logger';
import { db, environment } from '../configVars';

// Build the connection string
const dbURI = db.uri;
mongoose.set('strictQuery', false);

// Create the database connection
export async function connect() {
  await mongoose
    .connect(dbURI)
    .then(() => {
      Logger.info('Mongoose connection done 👍');
    })
    .catch((e) => {
      Logger.info('Mongoose connection error');
      Logger.error(e);
    });
}

environment !== 'test' && connect(); // Connect to database only if not in test mode

// CONNECTION EVENTS

// When successfully connected
mongoose.connection.on('connected', () => {
  Logger.info('Mongoose default connection open to ' + db.host + ' 👍');
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  Logger.error('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  Logger.info('Mongoose default connection disconnected ');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close();
  Logger.info(
    'Mongoose default connection disconnected through app termination'
  );
  process.exit(0);
});

// Add the new function for deleting documents based on user ID
export async function deleteDocumentsByUserId(userId: any) {
  try {
    const collections = mongoose.connection.collections;

    // Iterate through each collection and perform deleteMany
    for (const collectionName in collections) {
      // Skip certain collections if needed
      if (collectionName === 'users') {
        continue;
      }

      const collection = collections[collectionName];
      const userIdObject = new Types.ObjectId(userId); // Convert userId to ObjectId

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

      // Perform deleteMany operation if a matching field is found
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
