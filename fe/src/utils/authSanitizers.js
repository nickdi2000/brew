export const sanitizeAdminGooglePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid authentication payload')
  }

  const token = payload.token
  const refreshToken = payload.refreshToken
  const refreshTokenExpiresAt = payload.refreshTokenExpiresAt
  const rawUser = payload.user

  if (!rawUser || typeof rawUser !== 'object') {
    throw new Error('Authentication payload missing user data')
  }

  return {
    token,
    refreshToken,
    refreshTokenExpiresAt,
    user: {
      id: rawUser.id || rawUser._id,
      email: rawUser.email,
      firstName: rawUser.firstName,
      lastName: rawUser.lastName,
      isAdmin: rawUser.isAdmin,
      organizations: rawUser.organizations || [],
      sso: rawUser.sso || null
    }
  }
}

