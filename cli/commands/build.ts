import chalk from "chalk";
import { execa } from "execa";
import { exists } from "fs-extra";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getMocPath } from "../helpers/get-moc-path";
import { readDfxJson } from "../mops";
import { sourcesArgs } from "./sources";

export interface BuildOptions {
  outputDir: string;
  verbose: boolean;
  extraArgs: string[];
}

function isMotokoCanister(canisterConfig: any): boolean {
  return !canisterConfig.type || canisterConfig.type === "motoko";
}

export const DEFAULT_BUILD_OUTPUT_DIR = ".mops/.build";

export async function build(
  canisterNames: string[] | undefined,
  options: Partial<BuildOptions>,
): Promise<void> {
  if (canisterNames?.length == 0) {
    throw new Error("No canisters specified to build");
  }
  let outputDir = options.outputDir ?? DEFAULT_BUILD_OUTPUT_DIR;
  let mocPath = getMocPath();
  let dfxConfig = readDfxJson();
  let resolvedCanisterNames: string[] =
    canisterNames ??
    Object.keys(dfxConfig.canisters).filter((c) =>
      isMotokoCanister(dfxConfig.canisters[c]),
    );
  if (!(await exists(outputDir))) {
    await mkdir(outputDir, { recursive: true });
  }
  for (let canisterName of resolvedCanisterNames) {
    options.verbose && console.time(`build canister ${canisterName}`);
    console.log(chalk.blue("build canister"), chalk.bold(canisterName));
    let canisterConfig = dfxConfig.canisters[canisterName];
    if (!canisterConfig) {
      throw new Error(`Cannot find canister ${canisterName} in dfx.json`);
    }
    if (canisterConfig.type && canisterConfig.type !== "motoko") {
      throw new Error(`Canister ${canisterName} is not a Motoko canister`);
    }
    let motokoPath = canisterConfig.main;
    if (!motokoPath) {
      throw new Error(`No main file is specified for canister ${canisterName}`);
    }
    try {
      const result = await execa(
        mocPath,
        [
          "-c",
          "--idl",
          "-o",
          join(outputDir, `${canisterName}.wasm`),
          motokoPath,
          ...(options.extraArgs || []),
          ...(await sourcesArgs()).flat(),
        ],
        {
          stdio: options.verbose ? "inherit" : "pipe",
          reject: false,
        },
      );

      if (result.exitCode !== 0) {
        console.error(
          chalk.red(`Error: Failed to build canister ${canisterName}`),
        );
        if (!options.verbose) {
          if (result.stderr) {
            console.error(chalk.red(result.stderr));
          }
          if (result.stdout?.trim()) {
            console.error(chalk.yellow("Build output:"));
            console.error(result.stdout);
          }
        }
        // throw new Error(
        //   `Build failed for canister ${canisterName} (exit code: ${result.exitCode})`,
        // );
        process.exit(1);
      }

      if (options.verbose && result.stdout && result.stdout.trim()) {
        console.log(result.stdout);
      }
    } catch (error: any) {
      if (error.message?.includes("Build failed for canister")) {
        throw error;
      }

      console.error(
        chalk.red(
          `Error: Failed to execute moc compiler for canister ${canisterName}`,
        ),
      );

      if (error.code === "ENOENT") {
        console.error(
          chalk.red(
            "moc compiler not found. Please ensure it's installed and in your PATH.",
          ),
        );
      } else if (error.message) {
        console.error(chalk.red(`Details: ${error.message}`));
      }

      throw new Error(`Build execution failed for canister ${canisterName}`);
    }
    options.verbose && console.timeEnd(`build canister ${canisterName}`);
  }

  if (resolvedCanisterNames.length > 1) {
    console.log(
      chalk.green(
        `\n✓ Successfully built ${resolvedCanisterNames.length} canisters`,
      ),
    );
  }
}
