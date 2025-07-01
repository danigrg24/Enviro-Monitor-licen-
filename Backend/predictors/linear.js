function linearRegression(x, y) {
  if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length === 0) {
    throw new Error("Input invalid");
  }

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    throw new Error("Denumitor zero la regresie (date constante?)");
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  function predict (xValue) {
    return slope * xValue + intercept;
  }
  return { slope, intercept, predict };
}

module.exports = linearRegression;