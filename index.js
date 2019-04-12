const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const environment = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3333;
const databaseURI =
  process.env.PRODUCTION_DB || 'mongodb://localhost:27017/local';

const analyzeSession = data => {
  const analysis = {
    type: 'Curls',
  };
  return analysis;
};

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

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Check status.
app.get('/health', (req, res) => res.sendStatus(200));

// Receive data from movesense.
app.post('/data', async (req, res) => {
  console.log(req.body);
  const { dataset } = req.body;
  if (dataset) {
    try {
      // Analyze session.
      const analysis = analyzeSession(dataset);
      const newSession = new SessionModel({
        analysis,
        dataset,
      });
      // Save to db.
      await newSession.save();
      return res.send(analysis).end();
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  }
  res.sendStatus(404);
});

// Get log data.
app.get('/data', async (req, res) => {
  try {
    const allSessions = await SessionModel.find({});
    console.log(allSessions);
    return res.send(allSessions).end();
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Mongoose setup
mongoose.connect(databaseURI);
const db = mongoose.connection;
db.on('error', () => {
  console.log('---FAILED to connect to mongoose');
});
db.once('open', () => {
  console.log('+++Connected to mongoose');
});

// Listen.
const server = app.listen(PORT, () => {
  console.log(
    'Express server listening on port %d in %s mode',
    server.address().port,
    app.settings.env
  );
});
