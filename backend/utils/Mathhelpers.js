// Sigmoid activation (Perceptron/Logistic Regression)
const sigmoid = (z) => 1 / (1 + Math.exp(-z));

// Normalize a value between min and max to [0, 1]
const normalize = (value, min, max) => {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

// Compute weighted dot product
const dotProduct = (features, weights) => {
  return Object.keys(weights).reduce((sum, key) => {
    if (key === 'bias') return sum + weights[key];
    return sum + (features[key] || 0) * weights[key];
  }, 0);
};

// Compute average of an array
const average = (arr) => {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

// Clamp value between min and max
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

module.exports = { sigmoid, normalize, dotProduct, average, clamp };