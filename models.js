const mongoose = require('mongoose');

const databaseURI =
  process.env.PRODUCTION_DB || 'mongodb://localhost:27017/local';

// Mongoose setup
mongoose.connect(databaseURI);
const db = mongoose.connection;
db.on('error', () => {
  console.log('---FAILED to connect to mongoose');
});
db.once('open', () => {
  console.log('+++Connected to mongoose');
});

const { Schema } = mongoose;

const SessionSchema = new Schema(
  {
    analysis: { type: Object },
    type: { type: String },
    dataset: [
      {
        sensor: String,
        data: [
          {
            timestamp: Number,
            x: Number,
            y: Number,
            z: Number,
          },
        ],
      },
    ],
  },
  { collection: 'Sessions' }
);

const SessionModel = mongoose.model('Session', SessionSchema);

module.exports = {
  SessionModel,
  SessionSchema,
};
