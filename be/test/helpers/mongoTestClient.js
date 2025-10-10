const mongoose = require('mongoose');
const { MongoMemoryServer, MongoMemoryReplSet } = require('mongodb-memory-server');

let mongoServer;

async function connect(options = {}) {
  const { useReplicaSet = false } = options;

  if (mongoServer) {
    return mongoose.connection.asPromise();
  }

  process.env.MONGOMS_DISABLE_POSTINSTALL = process.env.MONGOMS_DISABLE_POSTINSTALL || '1';
  process.env.MONGOMS_START_TIMEOUT = process.env.MONGOMS_START_TIMEOUT || '120000';

  if (useReplicaSet) {
    mongoServer = await MongoMemoryReplSet.create({
      binary: {
        version: process.env.MONGOMS_VERSION || '7.0.5'
      },
      replSet: {
        count: 1,
        name: 'brewtests',
        storageEngine: 'wiredTiger'
      }
    });
  } else {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: process.env.MONGOMS_VERSION || '7.0.5'
      }
    });
  }

  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    dbName: 'brewbucks-test'
  });
}

async function disconnect() {
  await mongoose.connection.dropDatabase().catch(() => {});
  await mongoose.connection.close();

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

async function clearDatabase() {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const { collections } = mongoose.connection;
  const clearJobs = Object.values(collections).map((collection) => collection.deleteMany());
  await Promise.all(clearJobs);
}

module.exports = {
  connect,
  disconnect,
  clearDatabase
};
