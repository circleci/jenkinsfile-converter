const fs = require('fs');

(async () => {
  const res = await require('./main.js').jenkinsToCCI(fs.readFileSync(process.argv[2], 'utf8'));

  console.log(res);

  if (process.argv[3]) {
    fs.writeFileSync(process.argv[3], res);
  }
})();
