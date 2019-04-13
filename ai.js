import * as tf from '@tensorflow/tfjs-node';

const mongoose = require('mongoose');

const { SessionModel, SessionSchema } = require('./models');

// Read all data.
SessionModel.find({}, (err, data) => {
  let features = data;
  let labels = data;
  features = tf.tensor(features);
  labels = tf.tensor(labels);
  const { mean, variance } = tf.moments(features, 0);
  // Normalize data. Min-max.
  const standardizedFeatures = features.sub(mean).div(variance.pow(0.5));
  // slice data to means of 10 slices

  // split data
  // train model
  // predict
});

// KNN.
function knn(features, labels, predictionPoint, k) {
  const { mean, variance } = tf.moments(features, 0);
  const scaledPrediction = predictionPoint.sub(mean).div(variance.pow(0.5));
  const standardizedFeatures = features.sub(mean).div(variance.pow(0.5));

  return (
    standardizedFeatures
      .sub(scaledPrediction)
      .pow(2)
      .sum(1)
      .pow(0.5) // ^ distance of the point
      .expandDims(1) // expand distance result to [4,1]
      .concat(labels, 1) // concat to axis 1
      .unstack() // makes a normal array of tensors
      .sort((a, b) => (a.get(0) > b.get(0) ? 1 : -1)) // sorts an array of tensors
      .slice(0, k)
      .reduce((acc, obj) => {
        return acc + obj.get(1);
      }, 0) / k
  );
}
