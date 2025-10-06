import {execa} from 'execa';
import {getMocPath} from '../helpers/get-moc-path';
import {readDfxJson} from '../mops';
import {sources} from './sources';

type BuildOptions = {
	outputDir : string;
	// replica : ReplicaName,
	// replicaVersion : string,
	// compiler : 'moc',
	verbose : boolean;
	// compilerVersion : string;
	// gc : 'copying' | 'compacting' | 'generational' | 'incremental';
	// forceGc : boolean;
	// save : boolean,
	// compare : boolean,
	// silent : boolean,
	// profile : 'Debug' | 'Release';
	extraArgs ?: string[];
};

function isMotokoCanister(canisterConfig : any) : boolean {
	return !canisterConfig.type || canisterConfig.type === 'motoko';
}

export const DEFAULT_BUILD_OUTPUT_DIR = '.mops/_build';

export async function build(
	canisterNames : string[] | undefined,
	options : Partial<BuildOptions>,
) : Promise<void> {
	if (canisterNames?.length == 0) {
		throw new Error('No canisters specified to build');
	}
	let outputDir = options.outputDir ?? DEFAULT_BUILD_OUTPUT_DIR;

	// let buildDir = options.directory ?? '.dfx/local/canisters';
	let mocPath = getMocPath();
	options.verbose && console.time(`build ${canisterNames ?? 'all canisters'}`);

	let dfxConfig = readDfxJson();
	console.log(dfxConfig); ////
	let resolvedCanisterNames : string[] =
		canisterNames ??
		Object.keys(dfxConfig.canisters).filter((c) =>
			isMotokoCanister(dfxConfig.canisters[c]),
		);
	let mopsSources = await sources();
	for (let canisterName of resolvedCanisterNames) {
		console.log('Building canister', canisterName);
		let canisterConfig = dfxConfig.canisters[canisterName];
		if (!canisterConfig) {
			throw new Error(`Cannot find canister ${canisterName} in dfx.json`);
		}
		if (canisterConfig.type && canisterConfig.type !== 'motoko') {
			throw new Error(`Canister ${canisterName} is not a Motoko canister`);
		}
		let path = canisterConfig.main;
		if (!path) {
			throw new Error(`No main file is specified for canister ${canisterName}`);
		}
		await execa(
			mocPath,
			[
				'-c',
				'--idl',
				'-o',
				outputDir,
				path,
				...(options.extraArgs || []),
				...mopsSources,
			],
			{
				stdio: options.verbose ? 'pipe' : ['pipe', 'ignore', 'pipe'],
			},
		);
		options.verbose && console.timeEnd(`build ${canisterName}`);
	}
}
