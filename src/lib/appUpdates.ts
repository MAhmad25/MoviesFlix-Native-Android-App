import Constants from "expo-constants";

export type AppUpdate = {
  version: string;
  title: string;
  notes: string;
  pageUrl: string;
  apkUrl: string;
  apkName: string;
  apkSize: number;
};

type GitHubReleaseAsset = {
  name?: unknown;
  size?: unknown;
  browser_download_url?: unknown;
};

type GitHubRelease = {
  tag_name?: unknown;
  name?: unknown;
  body?: unknown;
  html_url?: unknown;
  draft?: unknown;
  prerelease?: unknown;
  assets?: unknown;
};

type ParsedVersion = {
  value: string;
  parts: [number, number, number];
};

const RELEASES_PER_PAGE = 30;

function parseVersion(value: unknown): ParsedVersion | null {
  if (typeof value !== "string") return null;

  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(value.trim());
  if (!match) return null;

  const parts = [Number(match[1]), Number(match[2]), Number(match[3])] as [number, number, number];
  if (parts.some((part) => !Number.isSafeInteger(part))) return null;

  return { value: `${parts[0]}.${parts[1]}.${parts[2]}`, parts };
}

function compareVersions(left: ParsedVersion, right: ParsedVersion) {
  for (let index = 0; index < left.parts.length; index += 1) {
    if (left.parts[index] !== right.parts[index]) {
      return left.parts[index] - right.parts[index];
    }
  }

  return 0;
}

function getRepository() {
  const repository = Constants.expoConfig?.extra?.githubRepo;
  return typeof repository === "string" && /^[\w.-]+\/[\w.-]+$/.test(repository)
    ? repository
    : null;
}

export async function findAppUpdate(): Promise<AppUpdate | null> {
  const repository = getRepository();
  const currentVersion = parseVersion(Constants.expoConfig?.version);
  if (!repository || !currentVersion) return null;

  const response = await fetch(
    `https://api.github.com/repos/${repository}/releases?per_page=${RELEASES_PER_PAGE}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} while checking releases.`);
  }

  const releases: unknown = await response.json();
  if (!Array.isArray(releases)) return null;

  let newestRelease: { release: GitHubRelease; version: ParsedVersion } | null = null;

  for (const item of releases) {
    if (!item || typeof item !== "object") continue;
    const release = item as GitHubRelease;
    if (release.draft === true || release.prerelease === true) continue;

    const version = parseVersion(release.tag_name);
    if (!version) continue;

    if (!newestRelease || compareVersions(version, newestRelease.version) > 0) {
      newestRelease = { release, version };
    }
  }

  if (!newestRelease || compareVersions(newestRelease.version, currentVersion) <= 0) {
    return null;
  }

  const assets = Array.isArray(newestRelease.release.assets)
    ? (newestRelease.release.assets as GitHubReleaseAsset[])
    : [];
  const apk = assets.find(
    (asset) => typeof asset.name === "string" && asset.name.toLowerCase().endsWith(".apk"),
  );

  if (
    !apk ||
    typeof apk.browser_download_url !== "string" ||
    !apk.browser_download_url.startsWith("https://")
  ) {
    throw new Error(`Release ${newestRelease.version.value} does not include a downloadable APK.`);
  }

  return {
    version: newestRelease.version.value,
    title:
      typeof newestRelease.release.name === "string" && newestRelease.release.name.trim()
        ? newestRelease.release.name.trim()
        : `MoviesFlix ${newestRelease.version.value}`,
    notes: typeof newestRelease.release.body === "string" ? newestRelease.release.body : "",
    pageUrl:
      typeof newestRelease.release.html_url === "string" ? newestRelease.release.html_url : "",
    apkUrl: apk.browser_download_url,
    apkName: typeof apk.name === "string" ? apk.name : "MoviesFlix.apk",
    apkSize: typeof apk.size === "number" ? apk.size : 0,
  };
}

export function formatFileSize(bytes: number) {
  if (bytes < 1) return "APK";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

