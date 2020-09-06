var fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('module.json', 'utf8'));
// first argument is node, second is the filename of the script, third is the version we pass in our workflow.
// expected tag format is 'refs/tags/v{major}.{minor}.{patch}"
manifest.download = manifest.download.replace('latest', manifest.version);
fs.writeFileSync('module.json', JSON.stringify(manifest, null, 2));