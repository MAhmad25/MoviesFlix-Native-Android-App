# Android in-app updates

MoviesFlix checks the public GitHub Releases API when the app opens and again after returning to the foreground. While open, it checks every six hours. A newer stable semantic-version release with an `.apk` asset opens the themed update dialog. The app downloads the APK to its cache, verifies the downloaded size, and opens Android's package installer.

## Publish each update

1. Set `expo.version` in `app.json` to the next version and raise `expo.android.versionCode` above the last distributed APK. Keep the Android package name `com.ahmad123dev.moviesflixnative` unchanged.
2. Commit and push the changes to `master`.
3. Push a version tag that matches `expo.version`, such as `v1.0.3`:

   ```sh
   git tag v1.0.3
   git push origin v1.0.3
   ```

   The `Android APK` workflow validates the tag and credentials, builds a production APK with EAS, and publishes the APK to both this repository and `MAhmad25/TheMoviesFlix-Streaming-Platform`. A push to `master` alone only creates a preview build. The workflow requires `EXPO_TOKEN` and `RELEASES_TOKEN` repository secrets.

4. After the tag workflow succeeds and publishes the release, updater-enabled installs check at launch, foreground, and every six hours. They show the update prompt and download the APK; the user must confirm installation in Android.

## Updater bootstrap

The older `1.0.0` app has no in-app updater, so it cannot discover a new GitHub release by itself. Its users must install the updater-enabled APK once through the existing download path. The first updater-enabled APK is version `1.0.2` with Android version code `3`; after installing it, future versioned releases can be discovered in-app.

Apps installed before the updater and install permission were added cannot check GitHub or gain the new permission retroactively.

## Android install permission

The manifest declares `android.permission.REQUEST_INSTALL_PACKAGES`. If Android blocks installation, the dialog offers the per-app “Install unknown apps” settings screen. The user must allow MoviesFlix and confirm each Android install. A new EAS APK build is required after changing the manifest permission.

Every release APK must use the same application ID and signing certificate as the installed APK, and must have a higher `versionCode`; Android rejects mismatches or downgrades. Keep the EAS signing credentials backed up. Do not embed a GitHub token in the app—the configured repository is public, and public release metadata can be read without authentication.
