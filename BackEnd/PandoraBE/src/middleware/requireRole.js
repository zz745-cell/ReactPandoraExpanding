function requireRole(...allowedRoles) {
  return function requireRoleMiddleware(req, res, next) {
    // Support tokens that encode a single role (`role`) or multiple roles (`roles`),
    // plus a few common JWT shapes (`realm_access.roles`, `resource_access.*.roles`).
    // Compare case-insensitively and normalize role strings like `ROLE_USER`.
    const debugEnabled = process.env.AUTH_DEBUG === '1' || process.env.AUTH_DEBUG === 'true';
    const normalizedAllowed = allowedRoles
      .filter(Boolean)
      .map((r) => String(r).toLowerCase());

    const userRoles = new Set();
    const payload = req.user || {};
    const role = payload.role;
    const roles = payload.roles;


    function normalizeRoleString(value) {
      const v = String(value).trim();
      if (!v) return [];
      // "user,admin" => ["user","admin"]
      const parts = v.includes(',') ? v.split(',') : [v];
      return parts
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean)
        .map((p) => (p.startsWith('role_') ? p.slice('role_'.length) : p));
    }

    function addRoleValue(value) {
      if (typeof value === 'string' || typeof value === 'number') {
        normalizeRoleString(value).forEach((r) => userRoles.add(r));
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((v) => addRoleValue(v));
      }
    }

    addRoleValue(role);
    addRoleValue(roles);

    // Keycloak-style: { realm_access: { roles: [] } }
    if (payload.realm_access && payload.realm_access.roles) {
      addRoleValue(payload.realm_access.roles);
    }

    // Keycloak-style: { resource_access: { [clientId]: { roles: [] } } }
    if (payload.resource_access && typeof payload.resource_access === 'object') {
      Object.values(payload.resource_access).forEach((entry) => {
        if (entry && entry.roles) addRoleValue(entry.roles);
      });
    }

    const isAllowed = normalizedAllowed.some((r) => userRoles.has(r));
    if (!isAllowed) {
      // Keep response stable by default; opt-in to debug to see what the API evaluated.
      if (!debugEnabled) return res.status(403).json({ error: 'Forbidden' });

      return res.status(403).json({
        error: 'Forbidden',
        debug: {
          allowedRoles: normalizedAllowed,
          userRoles: Array.from(userRoles.values()),
          userPayloadKeys: Object.keys(payload),
        },
      });
    }

    return next();
  };
}

module.exports = { requireRole };


