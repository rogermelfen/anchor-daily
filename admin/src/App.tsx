// ============================================
// Anchor Daily - Admin Panel (React SPA)
// ============================================
// Authentication: Supabase Auth (email/password).
// Data operations: Proxied through admin-api Edge Function.
// No service role key in the browser.

import React, { useState, useEffect } from 'react';
import { supabase, adminGet, adminPost } from './supabase';

// ============================================
// Types
// ============================================
interface Reflection {
  id: string;
  title: string;
  theme: 'stress' | 'decisions' | 'relationships';
  short_reflection: string;
  practical_application: string;
  question: string;
  premium_extended_version: string | null;
  tags: string[];
  status: 'draft' | 'published';
  publish_date: string | null;
  is_premium_only: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  published: number;
  draft: number;
  stress: number;
  decisions: number;
  relationships: number;
}

interface AppUser {
  id: string;
  email: string;
  selected_focus: string | null;
  is_premium: boolean;
  subscription_status: string;
  trial_start_date: string | null;
  trial_end_date: string | null;
  push_enabled: boolean;
  created_at: string;
}

type Page = 'dashboard' | 'reflections' | 'users';

// ============================================
// Empty Reflection Template
// ============================================
const emptyReflection: Omit<Reflection, 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  theme: 'stress',
  short_reflection: '',
  practical_application: '',
  question: '',
  premium_extended_version: '',
  tags: [],
  status: 'draft',
  publish_date: new Date().toISOString().split('T')[0],
  is_premium_only: false,
  sort_order: 0,
};

// ============================================
// Validation
// ============================================
function validateReflection(r: Partial<Reflection>): string | null {
  if (!r.title || r.title.trim().length === 0) return 'Title is required.';
  if (!r.short_reflection || r.short_reflection.trim().length === 0) return 'Short reflection is required.';
  if (!r.practical_application || r.practical_application.trim().length === 0) return 'Practical application is required.';
  if (!r.question || r.question.trim().length === 0) return 'Reflection question is required.';
  if (!r.publish_date) return 'Publish date is required.';
  return null;
}

// ============================================
// Main App Component
// ============================================
export const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0, stress: 0, decisions: 0, relationships: 0 });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingReflection, setEditingReflection] = useState<Partial<Reflection> | null>(null);
  const [filterTheme, setFilterTheme] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [userStats, setUserStats] = useState({ total: 0, premium: 0, trial: 0, free: 0 });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');

  // ============================================
  // Auth: Check existing session on mount
  // ============================================
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setAdminEmail(session.user.email || '');
      }
      setIsCheckingAuth(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setAdminEmail(session.user.email || '');
      } else {
        setIsLoggedIn(false);
        setAdminEmail('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ============================================
  // Auth: Login with Supabase Auth
  // ============================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setLoginError(error.message);
      }
      // onAuthStateChange will set isLoggedIn
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setReflections([]);
    setUsers([]);
  };

  // ============================================
  // Data Fetching (via Edge Function)
  // ============================================
  const fetchReflections = async () => {
    setLoading(true);
    try {
      const data = await adminGet('reflections');
      setReflections(data);
      setStats({
        total: data.length,
        published: data.filter((r: Reflection) => r.status === 'published').length,
        draft: data.filter((r: Reflection) => r.status === 'draft').length,
        stress: data.filter((r: Reflection) => r.theme === 'stress').length,
        decisions: data.filter((r: Reflection) => r.theme === 'decisions').length,
        relationships: data.filter((r: Reflection) => r.theme === 'relationships').length,
      });
    } catch (err: any) {
      console.error('Failed to fetch reflections:', err);
      if (err.message?.includes('Access denied')) {
        alert('Your account does not have admin access. Contact the project owner.');
        handleSignOut();
      }
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const data = await adminGet('users');
      setUsers(data);
      setUserStats({
        total: data.length,
        premium: data.filter((u: AppUser) => u.is_premium && u.subscription_status === 'active').length,
        trial: data.filter((u: AppUser) => u.subscription_status === 'trial').length,
        free: data.filter((u: AppUser) => !u.is_premium && u.subscription_status !== 'trial').length,
      });
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchReflections();
      fetchUsers();
    }
  }, [isLoggedIn]);

  // ============================================
  // CRUD Operations (via Edge Function)
  // ============================================
  const handleSaveReflection = async () => {
    if (!editingReflection) return;

    // Validate
    const error = validateReflection(editingReflection);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);

    const { id, created_at, updated_at, ...data } = editingReflection as any;

    try {
      if (id) {
        await adminPost({ action: 'update_reflection', id, data });
      } else {
        await adminPost({ action: 'create_reflection', data });
      }
      setShowModal(false);
      setEditingReflection(null);
      fetchReflections();
    } catch (err: any) {
      alert('Error saving reflection: ' + err.message);
    }
  };

  const handleDeleteReflection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reflection?')) return;

    try {
      await adminPost({ action: 'delete_reflection', id });
      fetchReflections();
    } catch (err: any) {
      alert('Error deleting reflection: ' + err.message);
    }
  };

  const handleToggleStatus = async (reflection: Reflection) => {
    try {
      await adminPost({ action: 'toggle_reflection_status', id: reflection.id });
      fetchReflections();
    } catch (err: any) {
      alert('Error toggling status: ' + err.message);
    }
  };

  // ============================================
  // Filtered Reflections
  // ============================================
  const filteredReflections = reflections.filter(r => {
    if (filterTheme !== 'all' && r.theme !== filterTheme) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  // ============================================
  // Loading state
  // ============================================
  if (isCheckingAuth) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Anchor Daily</h1>
          <p>Checking session...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // Login Screen (Supabase Auth)
  // ============================================
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Anchor Daily</h1>
          <p>Admin Panel</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="admin@anchordaily.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
              />
            </div>
            {loginError && (
              <div style={{ color: '#c0392b', fontSize: '13px', marginBottom: '12px' }}>
                {loginError}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================
  // Main Admin Layout
  // ============================================
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Anchor Daily</h1>
          <p>Content Admin</p>
        </div>
        <ul className="sidebar-nav">
          <li>
            <a
              href="#"
              className={currentPage === 'dashboard' ? 'active' : ''}
              onClick={e => { e.preventDefault(); setCurrentPage('dashboard'); }}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              className={currentPage === 'reflections' ? 'active' : ''}
              onClick={e => { e.preventDefault(); setCurrentPage('reflections'); }}
            >
              Reflections
            </a>
          </li>
          <li>
            <a
              href="#"
              className={currentPage === 'users' ? 'active' : ''}
              onClick={e => { e.preventDefault(); setCurrentPage('users'); }}
            >
              Users
            </a>
          </li>
          <li style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', padding: '0 16px', display: 'block', marginBottom: '8px' }}>
              {adminEmail}
            </span>
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                handleSignOut();
              }}
            >
              Sign Out
            </a>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Dashboard */}
        {currentPage === 'dashboard' && (
          <>
            <div className="page-header">
              <h2>Dashboard</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="label">Total Reflections</div>
                <div className="value">{stats.total}</div>
              </div>
              <div className="stat-card">
                <div className="label">Published</div>
                <div className="value">{stats.published}</div>
              </div>
              <div className="stat-card">
                <div className="label">Drafts</div>
                <div className="value">{stats.draft}</div>
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="label">Stress & Anxiety</div>
                <div className="value">{stats.stress}</div>
              </div>
              <div className="stat-card">
                <div className="label">Difficult Decisions</div>
                <div className="value">{stats.decisions}</div>
              </div>
              <div className="stat-card">
                <div className="label">Relationships</div>
                <div className="value">{stats.relationships}</div>
              </div>
            </div>
            <div className="stats-grid" style={{ marginTop: '8px' }}>
              <div className="stat-card">
                <div className="label">Total Users</div>
                <div className="value">{userStats.total}</div>
              </div>
              <div className="stat-card">
                <div className="label">Premium Users</div>
                <div className="value">{userStats.premium}</div>
              </div>
              <div className="stat-card">
                <div className="label">Trial Users</div>
                <div className="value">{userStats.trial}</div>
              </div>
            </div>
          </>
        )}

        {/* Reflections List */}
        {currentPage === 'reflections' && (
          <>
            <div className="page-header">
              <h2>Reflections</h2>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingReflection({ ...emptyReflection });
                  setValidationError(null);
                  setShowModal(true);
                }}
              >
                + New Reflection
              </button>
            </div>

            {/* Filters */}
            <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b6b6b' }}>Filter:</span>
              <select
                value={filterTheme}
                onChange={e => setFilterTheme(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e0dbd5', fontSize: '13px' }}
              >
                <option value="all">All Themes</option>
                <option value="stress">Stress & Anxiety</option>
                <option value="decisions">Difficult Decisions</option>
                <option value="relationships">Relationships</option>
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e0dbd5', fontSize: '13px' }}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <span style={{ fontSize: '13px', color: '#6b6b6b' }}>
                Showing {filteredReflections.length} of {reflections.length}
              </span>
            </div>

            {/* Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Theme</th>
                    <th>Status</th>
                    <th>Access</th>
                    <th>Publish Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReflections.map(reflection => (
                    <tr key={reflection.id}>
                      <td style={{ fontWeight: 500 }}>{reflection.title}</td>
                      <td>
                        <span className={`badge badge-${reflection.theme}`}>
                          {reflection.theme}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${reflection.status}`}>
                          {reflection.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${reflection.is_premium_only ? 'badge-premium' : 'badge-free'}`}>
                          {reflection.is_premium_only ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: '#6b6b6b' }}>
                        {reflection.publish_date || '\u2014'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setEditingReflection({ ...reflection });
                              setValidationError(null);
                              setShowModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleToggleStatus(reflection)}
                          >
                            {reflection.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteReflection(reflection.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredReflections.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <h3>No reflections found</h3>
                          <p>Create your first reflection to get started.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Users List */}
        {currentPage === 'users' && (
          <>
            <div className="page-header">
              <h2>Users</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="label">Total Users</div>
                <div className="value">{userStats.total}</div>
              </div>
              <div className="stat-card">
                <div className="label">Premium</div>
                <div className="value">{userStats.premium}</div>
              </div>
              <div className="stat-card">
                <div className="label">Trial</div>
                <div className="value">{userStats.trial}</div>
              </div>
              <div className="stat-card">
                <div className="label">Free</div>
                <div className="value">{userStats.free}</div>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Focus</th>
                    <th>Status</th>
                    <th>Push</th>
                    <th>Trial End</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td style={{ fontWeight: 500 }}>{user.email}</td>
                      <td>
                        {user.selected_focus ? (
                          <span className={`badge badge-${user.selected_focus}`}>
                            {user.selected_focus}
                          </span>
                        ) : (
                          <span style={{ color: '#6b6b6b', fontSize: '13px' }}>Not set</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          user.subscription_status === 'active' ? 'badge-published' :
                          user.subscription_status === 'trial' ? 'badge-premium' :
                          'badge-draft'
                        }`}>
                          {user.subscription_status || 'free'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: user.push_enabled ? '#2e7d32' : '#6b6b6b', fontSize: '13px' }}>
                          {user.push_enabled ? 'On' : 'Off'}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: '#6b6b6b' }}>
                        {user.trial_end_date ? new Date(user.trial_end_date).toLocaleDateString() : '\u2014'}
                      </td>
                      <td style={{ fontSize: '13px', color: '#6b6b6b' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <h3>No users yet</h3>
                          <p>Users will appear here once they sign up in the app.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Edit/Create Modal */}
      {showModal && editingReflection && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingReflection.id ? 'Edit Reflection' : 'New Reflection'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>

            {validationError && (
              <div style={{
                background: '#fdecea',
                color: '#c0392b',
                padding: '10px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '12px',
              }}>
                {validationError}
              </div>
            )}

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={editingReflection.title || ''}
                onChange={e =>
                  setEditingReflection({ ...editingReflection, title: e.target.value })
                }
                placeholder="e.g., The Myth of Control"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Theme</label>
                <select
                  value={editingReflection.theme || 'stress'}
                  onChange={e =>
                    setEditingReflection({
                      ...editingReflection,
                      theme: e.target.value as any,
                    })
                  }
                >
                  <option value="stress">Stress & Anxiety</option>
                  <option value="decisions">Difficult Decisions</option>
                  <option value="relationships">Relationships & Conflict</option>
                </select>
              </div>
              <div className="form-group">
                <label>Publish Date *</label>
                <input
                  type="date"
                  value={editingReflection.publish_date || ''}
                  onChange={e =>
                    setEditingReflection({
                      ...editingReflection,
                      publish_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Short Reflection * (Free users see this)</label>
              <textarea
                value={editingReflection.short_reflection || ''}
                onChange={e =>
                  setEditingReflection({
                    ...editingReflection,
                    short_reflection: e.target.value,
                  })
                }
                placeholder="The main reflection text..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Practical Application *</label>
              <textarea
                value={editingReflection.practical_application || ''}
                onChange={e =>
                  setEditingReflection({
                    ...editingReflection,
                    practical_application: e.target.value,
                  })
                }
                placeholder="A concrete action the reader can take today..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Reflection Question *</label>
              <textarea
                value={editingReflection.question || ''}
                onChange={e =>
                  setEditingReflection({
                    ...editingReflection,
                    question: e.target.value,
                  })
                }
                placeholder="A question for the reader to reflect on..."
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Premium Extended Version (Optional)</label>
              <textarea
                value={editingReflection.premium_extended_version || ''}
                onChange={e =>
                  setEditingReflection({
                    ...editingReflection,
                    premium_extended_version: e.target.value,
                  })
                }
                placeholder="Deeper content for premium subscribers..."
                rows={5}
              />
            </div>

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                value={(editingReflection.tags || []).join(', ')}
                onChange={e =>
                  setEditingReflection({
                    ...editingReflection,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g., anxiety, trust, peace"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingReflection.status || 'draft'}
                  onChange={e =>
                    setEditingReflection({
                      ...editingReflection,
                      status: e.target.value as any,
                    })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="form-group">
                <label>Sort Order</label>
                <input
                  type="number"
                  value={editingReflection.sort_order || 0}
                  onChange={e =>
                    setEditingReflection({
                      ...editingReflection,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="is_premium_only"
                  checked={editingReflection.is_premium_only || false}
                  onChange={e =>
                    setEditingReflection({
                      ...editingReflection,
                      is_premium_only: e.target.checked,
                    })
                  }
                />
                <label htmlFor="is_premium_only" style={{ marginBottom: 0 }}>
                  Premium Only (only visible to premium subscribers)
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveReflection}>
                {editingReflection.id ? 'Save Changes' : 'Create Reflection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
