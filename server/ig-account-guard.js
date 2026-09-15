/**
 * Should an Instagram OAuth callback be allowed to replace the connected account?
 *
 * /instagram/auth/start and /auth/callback are a browser redirect through Instagram,
 * so they cannot carry the admin bearer. The state cookie stops someone forcing the
 * OWNER's browser through the flow; it does not stop a stranger completing the flow
 * with their own account, which would silently redirect the brand's daily posting.
 * Whether Meta permits that depends on the app's mode, which is not visible from the
 * server. So re-authorising the same account is always allowed, and a different
 * account is refused unless the switch is explicitly enabled.
 */
function accountSwitchBlocked(connectedUserId, incomingUserId, env = process.env) {
  if (!connectedUserId) return false; // first connection
  if (String(connectedUserId) === String(incomingUserId)) return false; // re-auth, same account
  return env.INSTAGRAM_ALLOW_ACCOUNT_SWITCH !== "1";
}

module.exports = { accountSwitchBlocked };
