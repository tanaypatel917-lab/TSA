import { LAUNCH_ENDINGS, type LaunchEnding } from "../content/launchDay";

export function launchEnding(trust: number): LaunchEnding {
  if (trust >= 3) return LAUNCH_ENDINGS[0];
  if (trust >= -2) return LAUNCH_ENDINGS[1];
  return LAUNCH_ENDINGS[2];
}
