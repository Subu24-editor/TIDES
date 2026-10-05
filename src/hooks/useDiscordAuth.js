import { useState, useEffect, useCallback } from "react"

const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || ""
const GUILD_ID = import.meta.env.VITE_DISCORD_GUILD_ID || "1498057802499883181"
const ALLOWED_ROLES = (
  import.meta.env.VITE_DISCORD_ALLOWED_ROLES || "1498057802499883185"
)
  .split(",")
  .map((r) => r.trim())

const ROLE_NAME = import.meta.env.VITE_DISCORD_ROLE_NAME || "Admin"
const STORAGE_KEY = "tdt_discord_token"
const ROLE_STORAGE_KEY = "tdt_role_name"

export default function useDiscordAuth() {
  const [user, setUser] = useState(null)
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authorized, setAuthorized] = useState(false)
  const [devMode, setDevMode] = useState(false)
  const [roleName, setRoleName] = useState(
    () => localStorage.getItem(ROLE_STORAGE_KEY) || ROLE_NAME,
  )

  const redirectUri = window.location.origin + window.location.pathname

  const login = useCallback(() => {
    if (!CLIENT_ID) {
      setError(
        "Discord Client ID is missing in environment variables. Set VITE_DISCORD_CLIENT_ID in your .env file.",
      )
      return
    }
    const scope = encodeURIComponent("identify guilds guilds.members.read")
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}`
    window.location.href = authUrl
  }, [redirectUri])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ROLE_STORAGE_KEY)
    setUser(null)
    setMember(null)
    setAuthorized(false)
    setDevMode(false)
    setRoleName(ROLE_NAME)
    window.history.replaceState(null, "", window.location.pathname)
  }, [])

  const verifyMemberPermissions = useCallback(async (token) => {
    setLoading(true)
    setError(null)
    try {
      // Fetch user profile
      const userRes = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!userRes.ok) {
        throw new Error(
          "Failed to fetch Discord user profile. Token may be expired.",
        )
      }
      const userData = await userRes.json()
      setUser(userData)

      // Fetch guild member info
      const memberRes = await fetch(
        `https://discord.com/api/v10/users/@me/guilds/${GUILD_ID}/member`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (memberRes.status === 404) {
        throw new Error(
          `You are not a member of the required Discord server (ID: ${GUILD_ID}).`,
        )
      }
      if (!memberRes.ok) {
        throw new Error("Failed to verify guild member permissions.")
      }

      const memberData = await memberRes.json()
      setMember(memberData)

      const userRoles = memberData.roles || []
      const hasPermission = ALLOWED_ROLES.some((role) =>
        userRoles.includes(role),
      )

      if (hasPermission) {
        setAuthorized(true)
        localStorage.setItem(STORAGE_KEY, token)

        // Dynamically fetch guild roles from Discord to get the exact role name
        try {
          let rolesData = null

          // 1. Try local backend proxy
          try {
            const rRes = await fetch(`/api/discord-roles?guildId=${GUILD_ID}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (rRes.ok) {
              const json = await rRes.json()
              if (Array.isArray(json) && json.length > 0) {
                rolesData = json
              }
            }
          } catch (err) {
            console.warn("Backend roles proxy fetch failed", err)
          }

          // 2. Try direct Discord API
          if (!rolesData) {
            try {
              const directRes = await fetch(
                `https://discord.com/api/v10/guilds/${GUILD_ID}/roles`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              )
              if (directRes.ok) {
                const json = await directRes.json()
                if (Array.isArray(json) && json.length > 0) {
                  rolesData = json
                }
              }
            } catch (err) {
              console.warn("Direct roles fetch failed", err)
            }
          }

          if (rolesData && Array.isArray(rolesData)) {
            // Sort roles by position descending (highest role first)
            const sorted = [...rolesData].sort(
              (a, b) => (b.position || 0) - (a.position || 0),
            )

            // Find highest role that user has matching allowed roles
            const matchedAllowed = sorted.find(
              (r) => userRoles.includes(r.id) && ALLOWED_ROLES.includes(r.id),
            )
            // Or highest non-everyone role
            const matchedHighest = sorted.find(
              (r) => userRoles.includes(r.id) && r.name !== "@everyone",
            )

            const chosenRole = matchedAllowed || matchedHighest
            if (chosenRole && chosenRole.name) {
              setRoleName(chosenRole.name)
              localStorage.setItem(ROLE_STORAGE_KEY, chosenRole.name)
            }
          }
        } catch (roleErr) {
          console.warn(
            "Could not dynamically resolve role name from Discord",
            roleErr,
          )
        }
      } else {
        setAuthorized(false)
        setError(
          `Access denied. You do not have the required Discord role to access this dashboard.`,
        )
      }
    } catch (err) {
      console.error(err)
      setError(err.message || "An error occurred during authentication.")
      localStorage.removeItem(STORAGE_KEY)
      setAuthorized(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const tokenFromHash = hashParams.get("access_token")
    const oauthError =
      hashParams.get("error_description") || hashParams.get("error")

    if (oauthError) {
      window.history.replaceState(null, "", window.location.pathname)
      setError(
        `Discord Authentication Error: ${decodeURIComponent(oauthError)}`,
      )
      setLoading(false)
      return
    }

    if (tokenFromHash) {
      window.history.replaceState(null, "", window.location.pathname)
      verifyMemberPermissions(tokenFromHash)
      return
    }

    // Check stored token
    const storedToken = localStorage.getItem(STORAGE_KEY)
    if (storedToken) {
      verifyMemberPermissions(storedToken)
      return
    }

    setLoading(false)
  }, [verifyMemberPermissions])

  const enableDevBypass = () => {
    setDevMode(true)
    setAuthorized(true)
    setRoleName("Dev Mode")
    setUser({ username: "Local Developer (Dev Mode)", id: "dev" })
  }

  return {
    user,
    member,
    loading,
    error,
    authorized,
    devMode,
    roleName,
    clientIdConfigured: Boolean(CLIENT_ID),
    guildId: GUILD_ID,
    allowedRoles: ALLOWED_ROLES,
    login,
    logout,
    enableDevBypass,
  }
}
