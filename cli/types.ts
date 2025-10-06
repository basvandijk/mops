export type Config = {
  package?: {
    name: string;
    version: string;
    description?: string;
    license?: string;
    repository?: string;
    keywords?: string[];
    baseDir?: string;
    readme?: string;
    files?: string[];
    homepage?: string;
    documentation?: string;
    dfx?: string;
    moc?: string;
    donation?: string;
  };
  dependencies?: Dependencies;
  "dev-dependencies"?: Dependencies;
  toolchain?: Toolchain;
  requirements?: Requirements;
  // format ?: Format;
};

export type Dependencies = Record<string, Dependency>;

export type Dependency = {
  name: string;
  version?: string; // mops package
  repo?: string; // github package
  path?: string; // local package
};

export type Toolchain = {
  moc?: string;
  wasmtime?: string;
  "pocket-ic"?: string;
};

export type Tool = "moc" | "wasmtime" | "pocket-ic";

export type Requirements = {
  moc?: string;
};

// export type Format = {
// 	useTabs ?: boolean;
// 	tabWidth ?: number;
// 	printWidth ?: number;
// 	semi ?: boolean;
// 	bracketSpacing ?: boolean;
// 	trailingComma ?: 'none' | 'all';
// };

export type TestMode = "interpreter" | "wasi" | "replica";
