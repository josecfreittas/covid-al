export const getRadius = (quantity, total, maxSize, totalEntries) => {
  if (quantity === 0) {
    return 0;
  }

  const minSize = maxSize / 20;
  const getBaseLog = (x, y) => Math.log(y) / Math.log(x);
  const percent = getBaseLog(total + totalEntries, (quantity + 1));
  return (maxSize * percent) + minSize;
};

export const getTotals = (data) => {
  return {
    suspects: data.reduce((prev, next) => {
      const newQuantity = next.suspects ? next.suspects : 0;
      return prev + newQuantity;
    }, 0),
    confirmed: data.reduce((prev, next) => {
      const newQuantity = next.confirmed ? next.confirmed : 0;
      return prev + newQuantity;
    }, 0),
    deaths: data.reduce((prev, next) => {
      const newQuantity = next.deaths ? next.deaths : 0;
      return prev + newQuantity;
    }, 0),
  }
};
