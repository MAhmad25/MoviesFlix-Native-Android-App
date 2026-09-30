# MoviesFlix Native

An Expo Go app for browsing TMDB movies and TV shows, cast, reviews, seasons, official trailers, and the existing player routes.

## Run on your phone

```sh
npm install
npx expo start --clear
```

Set `EXPO_PUBLIC_TMDB_KEY` in `.env` to your TMDB API Read Access Token; `.env.example` contains the configuration names. Scan the Expo QR code from Expo Go while your phone and computer are on the same Wi-Fi network.

## Navigation and media actions

- The full-width Reacticx Masked Tab Bar uses the existing Expo Router Stack routes. Its background is solid, with a rounded selected tab and safe-area padding beneath it.
- Home autoplay pauses during touch/drag/momentum and resumes from the last settled card after 4.5 seconds. It pauses when Home loses focus or the app enters the background.
- Movie and TV details use Reacticx Radiant Buttons for Watch, Trailer, and Download. TV actions open the season/episode picker first.
- Season posters fit fully inside the modal, with more space above and below it than at the sides. The episode content scrolls independently, with Watch and Download always visible in the footer. Reopening a season resets the episode selection to 1.
- Download opens the matching VidVault movie or selected TV episode directly in the phone's system browser. Choose MP4/MKV and quality there; the browser handles the file and its download location. This flow works with Expo Go and does not request media-library permissions. Existing download routes offer the same browser handoff with a retry option.
- Trailer and watch routes retain the existing fullscreen presentation. Downloads use a portrait screen with their own Back button. The top status bar stays hidden on all screens and in the season modal.

## Interaction sounds

Cuelume's semantic cues play for cards, navigation, category choices, seasons, episode selection, modal dismissal, and download actions. Navigation uses a short tap cue, including when reselecting a tab. Finished clips rewind for each new tap, and the first tap waits briefly for a cue that is still loading. Search adds focus, typing, deletion, clearing, and submit feedback. Manual horizontal swipes have selection feedback; carousel autoplay stays silent and haptic feedback has been removed. Main-page buttons and links in the player WebView also send interaction cues to native audio. Cross-origin embedded frames and system video controls remain controlled by their providers.

Sounds are always enabled in the app, including in silent mode; there is no Home toggle. Media action buttons use stronger cues, ordinary taps use normal cues, and typing stays softer. Audio mixes with the existing player rather than stopping it.

Cuelume synthesizes with browser Web Audio. For Expo Go, `assets/sounds/*.wav` contains offline renders of the installed Cuelume engine, played using `expo-audio`. The WAVs are bundled and work without a sound service or network connection. Their MIT attribution is included in `assets/sounds/LICENSE-cuelume.txt`.

To regenerate the cues after a Cuelume update:

```sh
npx playwright install chromium
npm run sounds:render
```

On Windows with Microsoft Edge already installed, you can use it for the offline renderer:

```powershell
$env:SOUND_BROWSER_CHANNEL = 'msedge'
npm run sounds:render
```

## Expo Go checks

1. Switch between all five navigation destinations and check Back behavior.
2. Swipe Home several cards ahead, let go, and wait: autoplay should advance from that card. Hold a card and confirm autoplay pauses.
3. Open a season with many episodes. Scroll from the complete poster to the last episode, select it, and use Watch or Download.
4. Test Trailer, Watch, and Download on a movie. On TV, test the selected season/episode handoff.
5. Tap Download for a movie, then for a selected TV episode. Confirm the phone browser opens the correct title/episode and choose MP4/MKV and quality there.
6. Tap cards, categories, episode choices, and media buttons; type, delete, and submit a search; manually swipe a slider. Check the different sound cues and confirm autoplay stays silent.
7. Open and dismiss the season picker and navigate between pages; confirm the status bar stays hidden and the modal has visible space above and below.

Source checks:

```sh
npm run typecheck
npx expo export --platform android --output-dir .expo/validation-native --no-bytecode
```

## Project structure

- `src/app/`: Expo Router Stack screens, including movie and TV download routes.
- `src/components/`: Shared cards, navigation, media actions, season picker, WebView download screen, and native sound wrappers.
- `src/components/ui/`: Copied Reacticx Masked Tab Bar and Radiant Button source.
- `src/hooks/`: TMDB fetching hooks.
- `src/lib/`: TMDB helpers, VidVault route construction, and native sound playback.
- `src/constants/`: Existing theme and font tokens.
- `scripts/render-sounds.mjs`: Offline Cuelume audio generation.
