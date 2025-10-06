import {readFileSync, writeFileSync} from 'node:fs';

// remove scripts
let text = readFileSync('dist/package.json', 'utf8');
let json = JSON.parse(text);
delete json.scripts;

// dist/bin/cli.js -> bin/cli.js
json.bin.mops = 'bin/mops.js';
json.bin['ic-mops'] = 'bin/mops.js';

writeFileSync('dist/package.json', JSON.stringify(json, null, 2));
