/**
 * Simple read/write access control based on roles or explicit permissions in the JWT.
 *
 * Supported JWT shapes:
 * - { role: "user" } or { roles: ["user","admin"] }
 * - Keycloak-style: { realm_access: { roles: [] } } / { resource_access: { ...: { roles: [] } } }
 * - Explicit permissions/scopes:
 *   - { permissions: ["products:read","products:write"] }
 *   - { scope: "products:read products:write" } (OAuth2-style)
 */
function requireAccess(resource, access) {
  const required = `${String(resource)}:${String(access)}`.toLowerCase();

  return function requireAccessMiddleware(req, res, next) {
    const payload = req.user || {};

    const debugEnabled = process.env.AUTH_DEBUG === '1' || process.env.AUTH_DEBUG === 'true';

    function normalizeMany(value) {
      const out = [];
      if (value == null) return out;

      if (typeof value === 'string' || typeof value === 'number') {
        const s = String(value).trim();
        if (!s) return out;
        // support comma-separated, space-separated, or single token
        const parts = s.includes(',') ? s.split(',') : s.split(/\s+/);
        parts
          .map((p) => p.trim())
          .filter(Boolean)
          .forEach((p) => out.push(p));
        return out;
      }

      if (Array.isArray(value)) {
        value.forEach((v) => normalizeMany(v).forEach((x) => out.push(x)));
      }

      return out;
    }

    function normalizeRole(value) {
      return String(value)
        .trim()
        .toLowerCase()
        .replace(/^role_/, '');
    }

    function extractRoles() {
      const roles = new Set();

      normalizeMany(payload.role).forEach((r) => roles.add(normalizeRole(r)));
      normalizeMany(payload.roles).forEach((r) => roles.add(normalizeRole(r)));

      if (payload.realm_access && payload.realm_access.roles) {
        normalizeMany(payload.realm_access.roles).forEach((r) => roles.add(normalizeRole(r)));
      }

      if (payload.resource_access && typeof payload.resource_access === 'object') {
        Object.values(payload.resource_access).forEach((entry) => {
          if (entry && entry.roles) {
            normalizeMany(entry.roles).forEach((r) => roles.add(normalizeRole(r)));
          }
        });
      }

      return roles;
    }

    const roles = extractRoles();

    // Role -> permissions mapping (extend as needed)
    const rolePermissions = {
      user: ['products:read'],
      admin: ['products:read', 'products:write'],
      // example: writer: ['products:read','products:write'],
    };

    const permissions = new Set();

    // Explicit permissions/scopes on token
    normalizeMany(payload.permissions).forEach((p) => permissions.add(String(p).toLowerCase()));
    normalizeMany(payload.scope).forEach((p) => permissions.add(String(p).toLowerCase()));

    // Derived from roles
    roles.forEach((role) => {
      const perms = rolePermissions[role] || [];
      perms.forEach((p) => permissions.add(String(p).toLowerCase()));
    });

    const ok = permissions.has(required);
    if (ok) return next();

    if (!debugEnabled) return res.status(403).json({ error: 'Forbidden' });

    return res.status(403).json({
      error: 'Forbidden',
      debug: {
        required,
        roles: Array.from(roles),
        permissions: Array.from(permissions),
        userPayloadKeys: Object.keys(payload),
      },
    });
  };
}

module.exports = { requireAccess };


