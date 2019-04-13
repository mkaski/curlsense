const express = require('express');
const bodyParser = require('body-parser');

const { SessionModel } = require('./models');

const environment = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3333;

const analyzeSession = data => {
  const analysis = {
    type: 'Curls',
  };
  return analysis;
};

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
      console.log('saved');
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

// Listen.
const server = app.listen(PORT, () => {
  console.log(
    'Express server listening on port %d in %s mode',
    server.address().port,
    app.settings.env
  );
});
