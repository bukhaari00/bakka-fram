/**
 * Modern, responsive standalone Web Portal for Bakka Farm Management System
 * Served directly by Express to provide instant web access on Railway and anywhere.
 */
export function renderPortalHtml(req, res) {
  const html = `<!DOCTYPE html>
<html lang="so">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bakka Farm Management System | Galitaanka Nidaamka</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>">
  <style>
    :root {
      --primary: #10b981;
      --primary-hover: #059669;
      --primary-dark: #064e3b;
      --bg-dark: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --danger: #ef4444;
      --success: #22c55e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body {
      background: linear-gradient(135deg, #0b1120 0%, #0f172a 50%, #1e293b 100%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      width: 100%;
      max-width: 480px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05);
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .header {
      background: linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, transparent 100%);
      padding: 30px 24px 20px;
      text-align: center;
      border-bottom: 1px solid var(--card-border);
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 58px;
      height: 58px;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.4);
      border-radius: 16px;
      font-size: 28px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }
    h1 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 4px; letter-spacing: -0.3px; }
    .subtitle { font-size: 13px; color: var(--text-muted); font-weight: 400; }
    .status-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 14px;
      padding: 6px 14px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
      width: fit-content;
      margin-left: auto;
      margin-right: auto;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      display: inline-block;
      box-shadow: 0 0 8px var(--success);
    }
    .status-dot.degraded { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
    .tab-switch {
      display: flex;
      border-bottom: 1px solid var(--card-border);
      background: rgba(15, 23, 42, 0.4);
    }
    .tab-btn {
      flex: 1;
      padding: 13px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
    }
    .tab-btn.active {
      color: var(--primary);
      border-bottom: 2px solid var(--primary);
      background: rgba(16, 185, 129, 0.06);
    }
    .form-content { padding: 24px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 6px; }
    input, select {
      width: 100%;
      padding: 12px 14px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
      outline: none;
      transition: border 0.2s;
    }
    input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
    .role-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 16px;
    }
    .role-btn {
      padding: 9px 4px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }
    .role-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
    }
    .submit-btn {
      width: 100%;
      padding: 13px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      margin-top: 6px;
    }
    .submit-btn:hover { background: var(--primary-hover); }
    .submit-btn:active { transform: scale(0.99); }
    .alert {
      padding: 12px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      display: none;
    }
    .alert.error { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; display: block; }
    .alert.success { background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); color: #86efac; display: block; }
    .dashboard-view {
      display: none;
      padding: 24px;
      text-align: center;
    }
    .user-avatar {
      width: 64px;
      height: 64px;
      background: var(--primary-dark);
      border: 2px solid var(--primary);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      margin-bottom: 12px;
    }
    .user-name { font-size: 18px; font-weight: 700; }
    .user-role-badge {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid var(--primary);
      color: var(--primary);
      border-radius: 14px;
      font-size: 11px;
      font-weight: 700;
      margin: 6px 0 16px;
    }
    .info-list {
      text-align: left;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 18px;
      font-size: 13px;
    }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: var(--text-muted); }
    .logout-btn {
      width: 100%;
      padding: 11px;
      background: transparent;
      border: 1px solid var(--danger);
      color: var(--danger);
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .footer {
      text-align: center;
      margin-top: 18px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .footer a { color: var(--primary); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>

  <div class="container">
    <div class="header">
      <div class="logo-badge">🌱</div>
      <h1>Bakka Farm System</h1>
      <p class="subtitle">Nidaamka Maamulka Beeraha & Xarunta Tababarka</p>
      <div class="status-bar" id="statusBar">
        <span class="status-dot" id="statusDot"></span>
        <span id="statusText">Checking system...</span>
      </div>
    </div>

    <!-- Authenticated Dashboard Panel -->
    <div class="dashboard-view" id="dashboardView">
      <div class="user-avatar" id="dashAvatar">👨‍🌾</div>
      <div class="user-name" id="dashName">User</div>
      <div class="user-role-badge" id="dashRole">ROLE</div>
      <div class="info-list">
        <div class="info-row"><span class="info-label">Email:</span><strong id="dashEmail">-</strong></div>
        <div class="info-row"><span class="info-label">Farm ID:</span><span id="dashFarmId" style="font-family:monospace;font-size:11px;">-</span></div>
        <div class="info-row"><span class="info-label">Database:</span><span style="color:var(--success);">Connected (PostgreSQL)</span></div>
      </div>
      <button class="logout-btn" onclick="handleLogout()">Ka Bax Nidaamka (Sign Out)</button>
    </div>

    <!-- Login / Signup Forms -->
    <div id="authForms">
      <div class="tab-switch">
        <button class="tab-btn active" id="tabLoginBtn" onclick="switchTab('login')">Soo Gal (Sign In)</button>
        <button class="tab-btn" id="tabSignupBtn" onclick="switchTab('signup')">Is Diiwaangeli (Register)</button>
      </div>

      <div class="form-content">
        <div class="alert" id="alertBox"></div>

        <!-- LOGIN FORM -->
        <form id="loginForm" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label>Nooca Koontada (Account Type)</label>
            <div class="role-grid">
              <button type="button" class="role-btn active" onclick="selectRole('ADMIN', this)">Admin</button>
              <button type="button" class="role-btn" onclick="selectRole('STAFF', this)">Staff</button>
              <button type="button" class="role-btn" onclick="selectRole('STUDENT', this)">Student</button>
            </div>
          </div>
          <div class="form-group">
            <label>Email ama Username</label>
            <input type="text" id="loginIdentifier" placeholder="tusaale@bakkafarm.com" required autocomplete="username">
          </div>
          <div class="form-group">
            <label>Furaha Sirta ah (Password)</label>
            <input type="password" id="loginPassword" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <button type="submit" class="submit-btn" id="loginSubmitBtn">Gal Nidaamka →</button>
        </form>

        <!-- SIGNUP FORM -->
        <form id="signupForm" style="display:none;" onsubmit="handleSignup(event)">
          <div class="form-group">
            <label>Magacaaga Oo Dhammaystiran</label>
            <input type="text" id="regName" placeholder="Maxamed Cali" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="regEmail" placeholder="user@bakkafarm.com" required>
          </div>
          <div class="form-group">
            <label>Dooro Doorkaaga (Role)</label>
            <select id="regRole">
              <option value="STAFF">Shaqaale Beereed (Staff)</option>
              <option value="STUDENT">Arday Tababaranaya (Student)</option>
              <option value="CUSTOMER">Macaamil / Ganacsade (Customer)</option>
              <option value="ADMIN">Maamule Sare (Admin)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Furaha Sirta ah (Ugu yaraan 6 xaraf)</label>
            <input type="password" id="regPassword" placeholder="••••••••" required minlength="6">
          </div>
          <button type="submit" class="submit-btn" id="signupSubmitBtn">Sameyso Koonto Cusub →</button>
        </form>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Bakka Farm Management Platform &copy; 2026 • Afgooye River Valley</p>
    <p style="margin-top:4px;"><a href="/health" target="_blank">System Health JSON</a> • <a href="https://bakka-fram.vercel.app" target="_blank">Vercel UI Mirror</a></p>
  </div>

  <script>
    let activeRole = 'ADMIN';

    function selectRole(role, btn) {
      activeRole = role;
      document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    function switchTab(tab) {
      showAlert('');
      if (tab === 'login') {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('tabLoginBtn').classList.add('active');
        document.getElementById('tabSignupBtn').classList.remove('active');
      } else {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'block';
        document.getElementById('tabLoginBtn').classList.remove('active');
        document.getElementById('tabSignupBtn').classList.add('active');
      }
    }

    function showAlert(text, type = 'error') {
      const box = document.getElementById('alertBox');
      if (!text) {
        box.style.display = 'none';
        box.textContent = '';
        return;
      }
      box.textContent = text;
      box.className = 'alert ' + type;
      box.style.display = 'block';
    }

    // Check system health on load
    async function checkHealth() {
      try {
        const res = await fetch('/health');
        const data = await res.json();
        const dot = document.getElementById('statusDot');
        const text = document.getElementById('statusText');
        if (data.data?.database === 'connected') {
          dot.className = 'status-dot';
          text.textContent = 'API & Database Online';
        } else {
          dot.className = 'status-dot degraded';
          text.textContent = 'API Online • DB Initializing';
        }
      } catch (e) {
        document.getElementById('statusText').textContent = 'Connecting...';
      }
    }
    checkHealth();

    // Check if already logged in via stored user
    const savedUser = localStorage.getItem('bakka_user');
    if (savedUser) {
      try {
        showDashboard(JSON.parse(savedUser));
      } catch {}
    }

    function showDashboard(user) {
      document.getElementById('authForms').style.display = 'none';
      document.getElementById('dashboardView').style.display = 'block';
      document.getElementById('dashName').textContent = user.name || user.email;
      document.getElementById('dashEmail').textContent = user.email;
      document.getElementById('dashRole').textContent = user.roleName || user.role || 'USER';
      document.getElementById('dashFarmId').textContent = user.farm_id || user.farmId || 'Default Farm';
    }

    function handleLogout() {
      localStorage.removeItem('bakka_user');
      document.getElementById('dashboardView').style.display = 'none';
      document.getElementById('authForms').style.display = 'block';
      showAlert('Waad ka baxday nidaamka.', 'success');
    }

    async function handleLogin(e) {
      e.preventDefault();
      showAlert('');
      const btn = document.getElementById('loginSubmitBtn');
      btn.disabled = true;
      btn.textContent = 'Fadlan sug...';

      const identifier = document.getElementById('loginIdentifier').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });
        const result = await res.json();

        if (result.success && result.data?.user) {
          localStorage.setItem('bakka_user', JSON.stringify(result.data.user));
          showAlert('Guul! Waad soo gashay...', 'success');
          setTimeout(() => showDashboard(result.data.user), 600);
        } else {
          showAlert(result.error?.message || 'Email-ka ama furaha sirta ah ma saxna.');
        }
      } catch (err) {
        showAlert('Cilad ayaa dhacday: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Gal Nidaamka →';
      }
    }

    async function handleSignup(e) {
      e.preventDefault();
      showAlert('');
      const btn = document.getElementById('signupSubmitBtn');
      btn.disabled = true;
      btn.textContent = 'Fadlan sug...';

      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const role = document.getElementById('regRole').value;

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });
        const result = await res.json();

        if (result.success && result.data?.user) {
          localStorage.setItem('bakka_user', JSON.stringify(result.data.user));
          showAlert('Koontadaada si guul leh ayaa loo diiwaangeliyey!', 'success');
          setTimeout(() => showDashboard(result.data.user), 600);
        } else {
          showAlert(result.error?.message || 'Diiwaangelintu ma suurtagelin.');
        }
      } catch (err) {
        showAlert('Cilad ayaa dhacday: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Sameyso Koonto Cusub →';
      }
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
