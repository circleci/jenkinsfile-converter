(async () => {
  console.log(
    await require('./main.js').jenkinsToCCI(require('fs').readFileSync(process.argv[2], 'utf8'))
  );
})();
