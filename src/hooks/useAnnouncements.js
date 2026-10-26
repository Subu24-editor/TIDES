import useDiscordFeed from "./useDiscordFeed.js"

/** Update-log posts that get merged into the Updates timeline. */
export default function useAnnouncements(refreshMs) {
  return useDiscordFeed("updates", refreshMs).items
}
