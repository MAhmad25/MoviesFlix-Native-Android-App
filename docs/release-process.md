# Android release process

## One-time setup

In the GitHub repository `MAhmad25/MoviesFlix-Native-Android-App`, add these Actions secrets:

- `EXPO_TOKEN`: an Expo access token for the account that owns EAS project `21887552-2feb-4411-b68d-7c03878ccacc`.
- `RELEASES_TOKEN`: a fine-grained GitHub token with **Contents: read and write** access to `MAhmad25/TheMoviesFlix-Streaming-Platform`. The workflow mirrors APK releases there because already-installed app versions check that repository for updates.

In Expo's project environment settings, define `EXPO_PUBLIC_TMDB_BASE_URL` and `EXPO_PUBLIC_TMDB_KEY` for both the **preview** and **production** environments; the cloud build cannot read this machine's ignored `.env` file.

Before the first automated production build, confirm the Android signing credentials in EAS are the same keystore used to sign the APK already in users' hands. Keep the Android package name `com.ahmad123dev.moviesflixnative` unchanged. A different signing key or package ID prevents Android from installing an update over the existing app.

EAS remote versioning is enabled. Check the last APK's `versionCode` against `eas build:version:get --platform android --profile production`. If remote versioning has not been initialized, run `eas build:version:set --platform android --profile production` once and initialize it with that last shipped code. Production builds then increment the remote `versionCode` automatically.

## Ship a version

1. Update `expo.version` in `app.json` using SemVer: patch for fixes (`1.0.2`), minor for backward-compatible features (`1.1.0`), and major for breaking changes (`2.0.0`). Keep `extra.githubRepo` set to `MAhmad25/TheMoviesFlix-Streaming-Platform` while existing app versions use it for update checks.
2. Commit and push the release source to `master`.
3. Create and push a matching version tag on that commit, for example:

   ```sh
   git tag v1.0.2
   git push origin v1.0.2
   ```

4. The workflow checks the tag against `expo.version`, runs an EAS production APK build, and publishes the APK plus SHA-256 file to a versioned GitHub Release in both repositories. The compatibility release is published for current installed users; the source repository release keeps the build linked to its source tag.

Each production release gets a higher EAS-managed Android `versionCode`; `expo.version` is the user-facing version name. Do not reuse or manually decrement either value. A push to `master` creates a preview APK as a 14-day Actions artifact and does not publish a stable release.
