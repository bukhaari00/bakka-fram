'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../lib/i18n/I18nContext';
import {
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Search,
  Filter,
  Edit2,
  Trash2,
  Lock,
  CheckCircle2,
  X,
  AlertTriangle
} from 'lucide-react';
import { generateUUID } from '../../lib/utils/uuid';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ManagedUser {
  id: string;
  email: string;
  username?: string;
  full_name: string;
  role_name: string;
  phone: string;
  is_active: boolean;
}

const INITIAL_USERS: ManagedUser[] = [
  { id: 'u-1', email: 'admin@bakkafarm.com', username: 'admin', full_name: 'Bakka System Administrator', role_name: 'ADMIN', phone: '+252-61-5550100', is_active: true },
  { id: 'u-2', email: 'staff1@bakkafarm.com', username: 'axmed_staff', full_name: 'Axmed Cabdulle (Staff)', role_name: 'STAFF', phone: '+252-61-5550101', is_active: true },
  { id: 'u-3', email: 'student1@bakkafarm.com', username: 'sahal_j', full_name: 'Sahal Jaamac (Student)', role_name: 'STUDENT', phone: '+252-61-5550102', is_active: true },
  { id: 'u-4', email: 'student2@bakkafarm.com', username: 'faadumo_a', full_name: 'Faadumo Axmed (Student)', role_name: 'STUDENT', phone: '+252-61-5550103', is_active: true },
  { id: 'u-5', email: 'manager@bakkafarm.com', username: 'manager_beerta', full_name: 'Maareeye Xasan', role_name: 'FARM_MANAGER', phone: '+252-61-5550104', is_active: true },
  { id: 'u-6', email: 'supervisor@bakkafarm.com', username: 'supervisor_cali', full_name: 'Cali Nuur (Supervisor)', role_name: 'FIELD_SUPERVISOR', phone: '+252-61-5550105', is_active: true },
  { id: 'u-7', email: 'store@bakkafarm.com', username: 'store_khadar', full_name: 'Khadar Warsame (Storekeeper)', role_name: 'STOREKEEPER', phone: '+252-61-5550106', is_active: true },
  { id: 'u-8', email: 'accountant@bakkafarm.com', username: 'sahra_finance', full_name: 'Sahra Xaashi (Accountant)', role_name: 'ACCOUNTANT', phone: '+252-61-5550107', is_active: true }
];

export default function StaffPage() {
  const { t, locale } = useI18n();
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [resettingUser, setResettingUser] = useState<ManagedUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);

  // Create Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('STAFF');
  const [password, setPassword] = useState('BakkaSecure#2026');

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('STAFF');

  // Reset Password State
  const [newPassword, setNewPassword] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Fetch online users if backend is connected
  useEffect(() => {
    async function loadUsers() {
      try {
        const token = localStorage.getItem('bakka_auth_token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setUsers(json.data);
          }
        }
      } catch (e) {}
    }
    loadUsers();
  }, []);

  const showFeedback = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: ManagedUser = {
      id: generateUUID(),
      email: email.trim(),
      username: username ? username.trim().toLowerCase() : email.split('@')[0],
      full_name: name.trim(),
      role_name: role,
      phone: phone.trim(),
      is_active: true
    };

    try {
      const token = localStorage.getItem('bakka_auth_token');
      if (token) {
        fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fullName: name.trim(),
            email: email.trim(),
            username: newUser.username,
            phone: phone.trim(),
            password,
            roleName: role
          })
        }).catch(() => {});
      }
    } catch (e) {}

    setUsers([newUser, ...users]);
    setShowCreateModal(false);
    setName('');
    setEmail('');
    setUsername('');
    setPhone('');
    showFeedback(`User account ${newUser.full_name} created successfully.`);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedList = users.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          full_name: editName.trim(),
          username: editUsername.trim().toLowerCase(),
          phone: editPhone.trim(),
          role_name: editRole
        };
      }
      return u;
    });

    try {
      const token = localStorage.getItem('bakka_auth_token');
      if (token) {
        fetch(`${API_BASE}/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fullName: editName.trim(),
            username: editUsername.trim().toLowerCase(),
            phone: editPhone.trim(),
            roleName: editRole
          })
        }).catch(() => {});
      }
    } catch (e) {}

    setUsers(updatedList);
    setEditingUser(null);
    showFeedback('User information updated successfully.');
  };

  const toggleStatus = async (user: ManagedUser) => {
    const updatedStatus = !user.is_active;
    const updatedList = users.map(u => u.id === user.id ? { ...u, is_active: updatedStatus } : u);

    try {
      const token = localStorage.getItem('bakka_auth_token');
      if (token) {
        fetch(`${API_BASE}/users/${user.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isActive: updatedStatus })
        }).catch(() => {});
      }
    } catch (e) {}

    setUsers(updatedList);
    showFeedback(`Account ${user.full_name} is now ${updatedStatus ? 'Activated' : 'Deactivated'}.`);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !newPassword) return;

    try {
      const token = localStorage.getItem('bakka_auth_token');
      if (token) {
        fetch(`${API_BASE}/users/${resettingUser.id}/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ newPassword })
        }).catch(() => {});
      }
    } catch (e) {}

    setResettingUser(null);
    setNewPassword('');
    showFeedback(`Password reset successfully for ${resettingUser.full_name}.`);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setUsers(users.filter(u => u.id !== deletingUser.id));

    try {
      const token = localStorage.getItem('bakka_auth_token');
      if (token) {
        fetch(`${API_BASE}/users/${deletingUser.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => {});
      }
    } catch (e) {}

    const name = deletingUser.full_name;
    setDeletingUser(null);
    showFeedback(`User ${name} has been deleted.`);
  };

  const openEditModal = (u: ManagedUser) => {
    setEditingUser(u);
    setEditName(u.full_name);
    setEditUsername(u.username || '');
    setEditPhone(u.phone || '');
    setEditRole(u.role_name);
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.role_name === roleFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q));
    return matchesRole && matchesSearch;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {locale === 'so' ? 'Maamulka Isticmaalayaasha & Shaqaalaha' : 'User & Staff Management (RBAC)'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Admin control: Provision accounts, assign roles (Admin, Staff, Student), activate, and reset passwords
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>

        {/* Action Notice Banner */}
        {actionNotice && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50/70 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Filter Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="ALL">All Roles ({users.length})</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="STUDENT">Student</option>
              <option value="FARM_MANAGER">Farm Manager</option>
              <option value="FIELD_SUPERVISOR">Field Supervisor</option>
              <option value="STOREKEEPER">Storekeeper</option>
              <option value="ACCOUNTANT">Accountant</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b text-[11px]">
              <tr>
                <th className="p-3.5">User Identity & Contact</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-gray-900">{u.full_name}</p>
                      <span className="text-[10px] text-gray-400">{u.email} • {u.phone}</span>
                    </td>
                    <td className="p-3.5 font-mono text-gray-600">
                      @{u.username || u.email.split('@')[0]}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role_name === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role_name === 'STAFF'
                          ? 'bg-blue-100 text-blue-800'
                          : u.role_name === 'STUDENT'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role_name}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => toggleStatus(u)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          u.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setResettingUser(u)}
                        className="p-1 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded"
                        title="Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingUser(u)}
                        className="p-1 text-gray-500 hover:text-red-700 hover:bg-gray-100 rounded"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal: Create User */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-gray-900">Provision New User Account</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sahal Jaamac Axmed"
                    className="w-full p-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Email</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full p-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Username</label>
                    <input
                      required
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="sahal_j"
                      className="w-full p-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Phone</label>
                    <input
                      required
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+252-61-XXXXXXX"
                      className="w-full p-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl bg-white font-semibold"
                    >
                      <option value="STAFF">STAFF (Operational)</option>
                      <option value="STUDENT">STUDENT (Learning)</option>
                      <option value="ADMIN">ADMIN (Full Access)</option>
                      <option value="FARM_MANAGER">FARM MANAGER</option>
                      <option value="FIELD_SUPERVISOR">FIELD SUPERVISOR</option>
                      <option value="STOREKEEPER">STOREKEEPER</option>
                      <option value="ACCOUNTANT">ACCOUNTANT</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Initial Password</label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-2 border rounded-xl text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit User */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-gray-900">Edit User Profile</h2>
                <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Username</label>
                    <input
                      required
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Assign Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="STUDENT">STUDENT</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="FARM_MANAGER">FARM MANAGER</option>
                    <option value="FIELD_SUPERVISOR">FIELD SUPERVISOR</option>
                    <option value="STOREKEEPER">STOREKEEPER</option>
                    <option value="ACCOUNTANT">ACCOUNTANT</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-3 py-2 border rounded-xl text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Reset Password */}
        {resettingUser && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-gray-900">Reset Password</h2>
                <p className="text-xs text-gray-500">For account: {resettingUser.full_name}</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">New Secure Password</label>
                  <input
                    required
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full p-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setResettingUser(null)}
                    className="px-3 py-2 border rounded-xl text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Confirmation */}
        {deletingUser && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-gray-900">Confirm Deletion</h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to permanently delete <strong>{deletingUser.full_name}</strong>?
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 border rounded-xl text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
