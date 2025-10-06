import {execFileSync} from 'node:child_process';
import {getMocPath} from './get-moc-path.js';

export function getMocVersion(throwOnError = false) : string {
	let mocPath = getMocPath(false);
	if (!mocPath) {
		return '';
	}
	try {
		let match = execFileSync(mocPath, ['--version'])
			.toString()
			.trim()
			.match(/Motoko compiler ([^\s]+) .*/);
		return match?.[1] || '';
	}
	catch (e) {
		if (throwOnError) {
			console.error(e);
			throw new Error('moc not found');
		}
		return '';
	}
}
