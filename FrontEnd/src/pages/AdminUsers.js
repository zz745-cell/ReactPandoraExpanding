import React, { useEffect, useState } from 'react';
import { http } from '../api/http';

const EMPTY_UPDATE = { password: '', claimKey: '', claimValue: '' };
const EMPTY_CREATE = { email: '', password: '', claimKey: '', claimValue: '' };

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updateState, setUpdateState] = useState(EMPTY_UPDATE);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [removingClaimKey, setRemovingClaimKey] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createState, setCreateState] = useState(EMPTY_CREATE);
  const [createError, setCreateError] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      try {
        const data = await http.get('/auth/users');
        if (!cancelled) {
          setUsers(data.users || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load users');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshUsers = async () => {
    const data = await http.get('/auth/users');
    setUsers(data.users || []);
    return data.users || [];
  };

  const handleSelect = (user) => {
    setSelectedUser(user);
    setUpdateState(EMPTY_UPDATE);
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleInput = (field) => (event) => {
    setUpdateState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreateInput = (field) => (event) => {
    setCreateState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreate = async () => {
    const email = createState.email.trim();
    const password = createState.password.trim();
    const claimKey = createState.claimKey.trim();
    const claimValue = createState.claimValue.trim();
    if (!email || !password || !claimKey || !claimValue) {
      setCreateError('Email, password, and claim/key are required.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        email,
        password,
        claims: {
          [claimKey]: claimValue,
        },
      };
      await http.post('/auth/users', payload);
      setCreateModalOpen(false);
      setCreateState(EMPTY_CREATE);
      await refreshUsers();
    } catch (err) {
      setCreateError(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    setUpdateError(null);
    setUpdateSuccess(null);
    const payload = {};
    if (updateState.password.trim()) {
      payload.password = updateState.password.trim();
    }
    if (updateState.claimKey.trim() && updateState.claimValue.trim()) {
      payload.claims = {
        [updateState.claimKey.trim()]: updateState.claimValue.trim(),
      };
    }
    if (!payload.password && !payload.claims) {
      setUpdateError('Provide a new password or a claim to update.');
      return;
    }

    try {
      setUpdating(true);
      const { status } = await http.requestRaw(
        `/auth/users/${selectedUser.uid}`,
        {
          method: 'PUT',
          body: payload,
        }
      );
      if (![200, 202].includes(status)) {
        throw new Error(`Unexpected response status ${status}`);
      }
      setUpdateSuccess('User updated');
      setUpdateState(EMPTY_UPDATE);
      const refreshed = await refreshUsers();
      setSelectedUser(
        refreshed.find((u) => u.uid === selectedUser.uid) || null
      );
    } catch (err) {
      setUpdateError(err.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveClaim = async (key) => {
    if (!selectedUser) return;
    setUpdateError(null);
    setUpdateSuccess(null);
    setRemovingClaimKey(key);
    try {
      await http.put(`/auth/users/${selectedUser.uid}`, {
        claims: { [key]: null },
      });
      setUpdateSuccess(`Removed claim ${key}`);
      const refreshed = await refreshUsers();
      setSelectedUser(
        refreshed.find((u) => u.uid === selectedUser.uid) || null
      );
    } catch (err) {
      setUpdateError(err.message || 'Failed to remove claim');
    } finally {
      setRemovingClaimKey(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      await http.del(`/auth/users/${deletingUser.uid}`);
      setDeletingUser(null);
      await refreshUsers();
    } catch (err) {
      console.error(err);
      setDeletingUser(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatClaimValue = (value) => {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        Loading users…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-sm">{error}</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Firebase users</h1>
          <p className="text-sm text-gray-500">
            Select a user to update password, add claims, or remove existing ones.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateModalOpen(true);
            setCreateState(EMPTY_CREATE);
            setCreateError(null);
          }}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
        >
          Create user
        </button>
      </div>
      {selectedUser && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800">
              Updating {selectedUser.email || selectedUser.uid}
            </p>
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="text-xs uppercase tracking-wide text-blue-600 hover:underline"
            >
              Cancel
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedUser.customClaims || {}).length === 0 && (
              <span className="text-xs text-gray-500">No claims</span>
            )}
            {Object.entries(selectedUser.customClaims || {}).map(
              ([key, value]) => (
                <span
                  key={key}
                  className="flex items-center gap-1 rounded-full border border-blue-300 bg-white px-3 py-1 text-xs font-semibold text-blue-800"
                >
                  <span>
                    {key}: {formatClaimValue(value)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveClaim(key)}
                    disabled={removingClaimKey === key}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              )
            )}
          </div>
          {updateError && <p className="text-sm text-red-500">{updateError}</p>}
          {updateSuccess && (
            <p className="text-sm text-green-600">{updateSuccess}</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-gray-600 uppercase tracking-wider">
              Password
              <input
                type="password"
                value={updateState.password}
                onChange={handleInput('password')}
                placeholder="Leave empty to keep current"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-gray-600 uppercase tracking-wider">
              Claim key
              <input
                type="text"
                value={updateState.claimKey}
                onChange={handleInput('claimKey')}
                placeholder="e.g. role"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-gray-600 uppercase tracking-wider sm:col-span-2">
              Claim value
              <input
                type="text"
                value={updateState.claimValue}
                onChange={handleInput('claimValue')}
                placeholder="e.g. admin"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={updating}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {updating ? 'Updating…' : 'Update user'}
          </button>
        </div>
      )}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] tracking-wide">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Claims</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const isSelected = selectedUser?.uid === user.uid;
              return (
                <tr
                  key={user.uid}
                  className={`odd:bg-white even:bg-gray-50 ${
                    isSelected ? 'bg-blue-50' : ''
                  } ${user.currentActiveUser ? 'ring-1 ring-yellow-300 bg-yellow-50' : ''}`}
                >
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{user.email || '—'}</span>
                    {user.currentActiveUser && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-yellow-800">
                        You
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {user.disabled ? 'No' : 'Yes'}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-gray-600">
                  {(() => {
                    const entries = Object.keys(user.customClaims || {});
                    if (!entries.length) return 'none';
                    const formatted = entries.map((key) => {
                      const value = user.customClaims[key];
                      if (value === null || value === undefined) return 'null';
                      if (typeof value === 'string') return value;
                      return JSON.stringify(value);
                    });
                    const visible = formatted.slice(0, 3);
                    if (formatted.length <= 3) return visible.join(', ');
                    return `${visible.join(', ')} +${formatted.length - 3}`;
                  })()}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleSelect(user)}
                    className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-60"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingUser(user)}
                    className="ml-2 rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
            })}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {deletingUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="pointer-events-none absolute inset-0" />
          <div className="pointer-events-auto max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Confirm delete</h2>
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="text-lg text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              This action cannot be reverted. Are you sure you want to permanently delete {deletingUser.email || 'this user'}?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
              >
                {deleting ? 'Deleting…' : 'Confirm delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {createModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="pointer-events-none absolute inset-0" />
          <div className="pointer-events-auto w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-2xl">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Create user</h2>
              <button
                type="button"
                onClick={() => {
                  setCreateModalOpen(false);
                  setCreateError(null);
                }}
                className="text-lg text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Fill out the required fields below to create a new Firebase user.
            </p>
            {createError && (
              <p className="mt-3 text-sm text-red-500">{createError}</p>
            )}
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Email
                <input
                  type="email"
                  value={createState.email}
                  onChange={handleCreateInput('email')}
                  autoComplete="username"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Password
                <input
                  type="password"
                  value={createState.password}
                  onChange={handleCreateInput('password')}
                  autoComplete="new-password"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Claim key
                  <input
                    type="text"
                    value={createState.claimKey}
                    onChange={handleCreateInput('claimKey')}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Claim value
                  <input
                    type="text"
                    value={createState.claimValue}
                    onChange={handleCreateInput('claimValue')}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCreateModalOpen(false);
                  setCreateError(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;

