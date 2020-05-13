const fs = require('fs');
const util = require('util');

(async () => {
  const res = await require('./main.js').jenkinsToCCI(fs.readFileSync(process.argv[2])).catch((err) => err);

  console.log(res);

  if (process.argv[3]) {
    fs.writeFileSync(process.argv[3], util.format(res));
  }
})();
