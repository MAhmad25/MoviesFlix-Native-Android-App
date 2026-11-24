const requiredVariables = ["EXPO_PUBLIC_TMDB_KEY"];
const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());

if (missingVariables.length > 0) {
  console.error(
    "Missing " +
      missingVariables.join(", ") +
      ". Add these to the matching Expo EAS environment before building.",
  );
  process.exit(1);
}
