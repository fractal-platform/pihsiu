const path = require('path');

const printResult = taskName => {
  return (err, stats) => {
    if (err || stats.hasErrors()) {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error(info.errors);
      }

      if (stats.hasWarnings()) {
        console.warn(info.warnings);
      }
      return;
    } else {
      console.log(`compile task ${taskName} finished`);
    }
  };
};

const getArgv = (prefix, val) => {
  const envArgv = process.argv.find(a => a.startsWith(prefix));
  return envArgv ? envArgv.split('.')[1] : val;
};

const cwd = process.cwd();
const dist = path.join(cwd, 'dist', 'extensions');
const src = path.join(cwd, 'src', 'ext');
const release = path.join(cwd, 'release');

module.exports = { printResult, getArgv, dist, src, release };
