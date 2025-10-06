import process from "node:process";
import path from "node:path";
import fs from "fs-extra";
import { SemVer } from "semver";

import { globalCacheDir } from "../../mops.js";
import * as toolchainUtils from "./toolchain-utils.js";

let cacheDir = path.join(globalCacheDir, "moc");

export let repo = "dfinity/motoko";

export let getLatestReleaseTag = async () => {
  return toolchainUtils.getLatestReleaseTag(repo);
};

export let getReleases = async () => {
  return toolchainUtils.getReleases(repo);
};

export let isCached = (version: string) => {
  let dir = path.join(cacheDir, version);
  return fs.existsSync(dir) && fs.existsSync(path.join(dir, "moc"));
};

export let download = async (
  version: string,
  { silent = false, verbose = false } = {},
) => {
  if (process.platform == "win32") {
    console.error("Windows is not supported. Please use WSL");
    process.exit(1);
  }
  if (!version) {
    console.error("version is not defined");
    process.exit(1);
  }
  if (isCached(version)) {
    if (verbose) {
      console.log(`moc ${version} is already installed`);
    }
    return;
  }

  let url;
  if (new SemVer(version).compare(new SemVer("0.14.6")) >= 0) {
    let platfrom = process.platform == "darwin" ? "Darwin" : "Linux";
    let arch = process.arch.startsWith("arm")
      ? process.platform == "darwin"
        ? "arm64"
        : "aarch64"
      : "x86_64";
    url = `https://github.com/dfinity/motoko/releases/download/${version}/motoko-${platfrom}-${arch}-${version}.tar.gz`;
  } else if (new SemVer(version).compare(new SemVer("0.9.5")) >= 0) {
    let platfrom = process.platform == "darwin" ? "Darwin" : "Linux";
    let arch = "x86_64";
    url = `https://github.com/dfinity/motoko/releases/download/${version}/motoko-${platfrom}-${arch}-${version}.tar.gz`;
  } else {
    let platfrom = process.platform == "darwin" ? "macos" : "linux64";
    url = `https://github.com/dfinity/motoko/releases/download/${version}/motoko-${platfrom}-${version}.tar.gz`;
  }

  if (verbose && !silent) {
    console.log(`Downloading ${url}`);
  }

  await toolchainUtils.downloadAndExtract(url, path.join(cacheDir, version));
};
