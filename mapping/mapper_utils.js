const isLiteral = (step) => {
  return (
    Object.prototype.hasOwnProperty.call(step[`arguments`][0][`value`], `isLiteral`) &&
    step[`arguments`][0][`value`][`isLiteral`]
  );
};

const assignedFields = (obj) => {
  return Object.values(obj).filter((value) => value !== undefined).length > 0;
};

const skewerCase = (string) => {
  return string.replace(/ /g, '-').toLowerCase();
};

module.exports = { isLiteral, assignedFields, skewerCase };
