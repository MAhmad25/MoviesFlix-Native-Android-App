# Android in-app updates

MoviesFlix checks the public GitHub Releases API when the app opens and again after returning to the foreground. While open, it checks every six hours. A newer stable semantic-version release with an `.apk` asset opens the themed update dialog. The app downloads the APK to its cache, verifies the downloaded size, and opens Android's package installer.

## Publish each update

1. Set `expo.version` in `app.json` to the next version, such as `1.0.2`, and raise `expo.android.versionCode` to a number greater than the last distributed APK. Keep the Android package name `com.ahmad123dev.moviesflixnative` unchanged.
2. Build an installable APK with the same EAS Android signing credentials used for the APK already installed by users:

   ```powershell
   eas build --platform android --profile preview
   ```

3. Create a **published, non-prerelease** GitHub Release in `MAhmad25/TheMoviesFlix-Streaming-Platform` with a versioned tag that matches `expo.version`, for example `v1.0.2`.
4. Attach the EAS `.apk` output to that release. The updater downloads the first `.apk` release asset, so attach the universal installable APK (not an `.aab`). Add concise release notes to the release body; those appear in the prompt.
5. Existing installs check again at launch/foreground and download the newer release. Android displays its own install confirmation. The user must accept it; Android does not allow this app to silently replace itself.

## First updater release

The repository's current latest release is tagged `Android`, named “Movies Flix Android App”, with the asset `MoviesFlix.apk`. That tag has no version the app can compare. This implementation sets the next app version to `1.0.1` and Android version code to `2`, so publish its APK as release `v1.0.1`. Existing `1.0.0` installs can then discover it. Future releases should use tags `v1.0.2`, `v1.0.3`, and so on.

Users must install the updater-enabled APK once through their existing update path: apps already installed before this code exists cannot check GitHub or gain the new installer permission retroactively. After that bootstrap install, the flow above handles future releases.

## Android install permission

The manifest declares `android.permission.REQUEST_INSTALL_PACKAGES`. If Android blocks installation, the dialog offers the per-app “Install unknown apps” settings screen. The user must allow MoviesFlix and confirm each Android install. A new EAS APK build is required after changing the manifest permission.

Every release APK must use the same application ID and signing certificate as the installed APK, and must have a higher `versionCode`; Android rejects mismatches or downgrades. Keep the EAS signing credentials backed up. Do not embed a GitHub token in the app—the configured repository is public, and public release metadata can be read without authentication.
