const session = require('express-session');

// Keeps Express login sessions in the app's existing MongoDB database and
// connection, so they survive process restarts and requests handled by another
// production instance.
class MongoSessionStore extends session.Store {
  constructor(mongoose, collectionName = 'web_sessions') {
    super();
    this.mongoose = mongoose;
    this.collectionName = collectionName;
    this.collectionPromise = null;
    this.indexPromise = null;
  }

  async getCollection() {
    await this.mongoose.connection.asPromise();
    if (!this.collectionPromise) {
      this.collectionPromise = Promise.resolve(this.mongoose.connection.db.collection(this.collectionName));
    }
    const collection = await this.collectionPromise;
    if (!this.indexPromise) {
      this.indexPromise = collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
        .catch(error => {
          this.indexPromise = null;
          throw error;
        });
    }
    await this.indexPromise;
    return collection;
  }

  get(sid, callback) {
    this.getCollection()
      .then(async collection => {
        const record = await collection.findOne({ _id: sid });
        if (!record) return null;
        if (record.expiresAt && record.expiresAt <= new Date()) {
          await collection.deleteOne({ _id: sid });
          return null;
        }
        return record.session;
      })
      .then(value => callback(null, value), callback);
  }

  set(sid, sessionData, callback = () => {}) {
    this.getCollection()
      .then(collection => {
        const cookie = sessionData.cookie || {};
        const expiresAt = cookie.expires
          ? new Date(cookie.expires)
          : new Date(Date.now() + Number(cookie.originalMaxAge || 24 * 60 * 60 * 1000));
        const plainSession = JSON.parse(JSON.stringify(sessionData));
        return collection.updateOne(
          { _id: sid },
          { $set: { session: plainSession, expiresAt } },
          { upsert: true }
        );
      })
      .then(() => callback(null), callback);
  }

  touch(sid, sessionData, callback = () => {}) {
    this.getCollection()
      .then(collection => {
        const cookie = sessionData.cookie || {};
        const expiresAt = cookie.expires
          ? new Date(cookie.expires)
          : new Date(Date.now() + Number(cookie.originalMaxAge || 24 * 60 * 60 * 1000));
        return collection.updateOne({ _id: sid }, { $set: { expiresAt } });
      })
      .then(() => callback(null), callback);
  }

  destroy(sid, callback = () => {}) {
    this.getCollection()
      .then(collection => collection.deleteOne({ _id: sid }))
      .then(() => callback(null), callback);
  }
}

module.exports = MongoSessionStore;
