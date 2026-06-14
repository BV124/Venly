// ============================================================
// VENLY — SHARED COMPONENTS
// Nav and footer live here. Edit once, updates everywhere.
// ============================================================

// ============================================================
// NAV
// Pass { loggedIn: true } to show profile/logout
// Pass { admin: true } to show admin dashboard button
// Pass { activePage: 'home' } to highlight the active link
// ============================================================
function renderNav(options) {
  options = options || {};
  var active = options.activePage || '';
  var loggedIn = options.loggedIn || !!localStorage.getItem('venly_current_user');
  var isAdmin = options.admin || false;
  var user = JSON.parse(localStorage.getItem('venly_current_user') || 'null');
  var initials = user && user.name
    ? user.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().slice(0,2)
    : 'BV';

  var links = [
    { href: 'index.html',        label: 'Home',         key: 'home' },
    { href: 'venly-find-a-space.html',label: 'Find a Space', key: 'find' },
    { href: 'venly-contact.html',     label: 'Contact',      key: 'contact' },
    { href: 'venly-blog.html',        label: 'Blog',         key: 'blog' },
  ];

  var navLinks = links.map(function(l) {
    var isActive = active === l.key;
    return '<li><a href="' + l.href + '"' + (isActive ? ' style="color:var(--red);font-weight:600"' : '') + '>' + l.label + '</a></li>';
  }).join('');

  var navRight = loggedIn
    ? '<div class="nav-right">' +
        '<span style="font-size:13px;color:var(--text-muted)">Profile</span>' +
        '<div class="avatar" style="width:34px;height:34px;border-radius:50%;background:var(--red);color:#fff;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="window.location.href=\'venly-dashboard.html\'">' + initials + '</div>' +
        (isAdmin ? '<button class="btn btn-primary" onclick="window.location.href=\'venly-admin.html\'" style="font-size:13px;padding:7px 16px">Admin dashboard</button>' : '') +
        '<button class="btn btn-outline" onclick="signOut()" style="font-size:13px;padding:7px 16px">Log out</button>' +
      '</div>'
    : '<div class="nav-right">' +
        '<button class="btn btn-outline" onclick="window.location.href=\'venly-auth.html\'">Login</button>' +
        '<button class="btn btn-primary" onclick="window.location.href=\'venly-auth.html?tab=signup\'">Sign Up</button>' +
      '</div>';

  var navHTML = '<nav>' +
    '<div style="display:flex;align-items:center;gap:32px">' +
      '<a class="logo" href="index.html">Venly.</a>' +
      '<ul class="nav-links" style="display:flex;gap:28px;list-style:none;margin:0;padding:0">' + navLinks + '</ul>' +
    '</div>' +
    navRight +
    '</nav>';

  var el = document.getElementById('venly-nav');
  if (el) {
    el.outerHTML = navHTML;
  } else {
    // Insert at top of body if no placeholder
    document.body.insertAdjacentHTML('afterbegin', navHTML);
  }
}

// ============================================================
// FOOTER — edit once, updates everywhere
// ============================================================
function renderFooter() {
  var loggedIn = !!localStorage.getItem('venly_current_user');

  var footerHTML = `
<footer style="background:#111;color:#fff;font-family:Inter,sans-serif">

  <style>
    .vf-grid {
      max-width: 1200px;
      margin: 0 auto;
      padding: 56px 48px 48px;
      display: grid;
      grid-template-columns: 1.6fr 1fr 1fr 1fr 1fr;
      gap: 40px;
      box-sizing: border-box;
      width: 100%;
    }
    .vf-brand p {
      font-size: 13px;
      color: rgba(255,255,255,0.45);
      line-height: 1.7;
      max-width: 200px;
      margin-bottom: 20px;
    }
    .vf-socials { display: flex; gap: 10px; }
    .vf-social {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .vf-social:hover { background: #e03a2f; color: #fff; }
    .vf-col-heading {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.3);
      margin-bottom: 20px;
      display: block;
    }
    .vf-link {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      display: block;
      margin-bottom: 13px;
      transition: color 0.15s;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      font-family: Inter, sans-serif;
      text-align: left;
    }
    .vf-link:hover { color: #fff; }
    .vf-bottom {
      border-top: 1px solid rgba(255,255,255,0.07);
    }
    .vf-bottom-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: 100%;
    }
    .vf-copy { font-size: 12px; color: rgba(255,255,255,0.25); text-align: center; }
    .vf-copy strong { color: rgba(255,255,255,0.4); }

    @media (max-width: 768px) {
      .vf-grid {
        grid-template-columns: 1fr 1fr;
        padding: 36px 20px 28px;
        gap: 28px 20px;
      }
      .vf-brand {
        grid-column: 1 / -1;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        margin-bottom: 4px;
      }
      .vf-brand p { max-width: 100%; font-size: 14px; }
      .vf-col-heading { font-size: 10px; margin-bottom: 14px; }
      .vf-link { font-size: 15px; margin-bottom: 14px; }
      .vf-bottom-inner { padding: 16px 20px; }
      .vf-copy { font-size: 12px; }
    }
    @media (max-width: 480px) {
      .vf-grid { padding: 32px 16px 24px; gap: 24px 16px; }
      .vf-link { font-size: 14px; margin-bottom: 12px; }
      .vf-bottom-inner { padding: 14px 16px; }
    }
  </style>

  <div class="vf-grid">

    <!-- BRAND -->
    <div class="vf-brand">
      <a href="index.html" style="font-size:26px;font-weight:800;color:#e03a2f;letter-spacing:-0.5px;text-decoration:none;display:block;margin-bottom:14px">Venly.</a>
      <p>The easiest way to find and list spaces across New Zealand. No ads, no stress.</p>
      <div class="vf-socials">
        <a href="https://instagram.com/venly.co.nz" aria-label="Instagram" class="vf-social">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4a4 4 0 11-8 0 4 4 0 018 0z"/><circle cx="16.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/></svg>
        </a>
        <a href="https://facebook.com/venly.co.nz" aria-label="Facebook" class="vf-social">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
        </a>
        <a href="https://linkedin.com/company/venly" aria-label="LinkedIn" class="vf-social">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
      </div>
    </div>

    <!-- DISCOVER -->
    <div>
      <span class="vf-col-heading">Discover</span>
      <a href="index.html" class="vf-link">Home</a>
      <a href="venly-find-a-space.html" class="vf-link">Find a Space</a>
      <a href="venly-blog.html" class="vf-link">Blog</a>
      <a href="venly-contact.html" class="vf-link">Contact</a>
    </div>

    <!-- LIST A SPACE -->
    <div>
      <span class="vf-col-heading">List a Space</span>
      <a href="venly-listing-fees.html" class="vf-link">How It Works</a>
      <a href="venly-listing-fees.html" class="vf-link">Pricing &amp; Plans</a>
      <a href="venly-listing-fees.html" class="vf-link">List Your Space</a>
    </div>

    <!-- ACCOUNT -->
    <div>
      <span class="vf-col-heading">Account</span>
      <button class="vf-link" onclick="handleFooterAccount()">${loggedIn ? 'My Dashboard' : 'Sign Up Free'}</button>
      <button class="vf-link" onclick="handleFooterLogin()">${loggedIn ? 'Log Out' : 'Log In'}</button>
      <a href="venly-contact.html" class="vf-link">Support</a>
    </div>

    <!-- LEGAL -->
    <div>
      <span class="vf-col-heading">Legal</span>
      <a href="#" class="vf-link">Terms &amp; Conditions</a>
      <a href="#" class="vf-link">Privacy Policy</a>
      <a href="#" class="vf-link">Cookie Policy</a>
    </div>

  </div>

  <!-- BOTTOM -->
  <div class="vf-bottom">
    <div class="vf-bottom-inner">
      <div class="vf-copy">© ${new Date().getFullYear()} <strong>Venly</strong> · A product of WisenUp Limited</div>
    </div>
  </div>

</footer>`;

  var el = document.getElementById('venly-footer');
  if (el) { el.outerHTML = footerHTML; }
  else { document.body.insertAdjacentHTML('beforeend', footerHTML); }
}


function handleFooterAccount() {
  var user = localStorage.getItem('venly_current_user');
  if (user) {
    window.location.href = 'venly-dashboard.html';
  } else {
    window.location.href = 'venly-auth.html?tab=signup';
  }
}

function handleFooterLogin() {
  var user = localStorage.getItem('venly_current_user');
  if (user) {
    signOut();
  } else {
    window.location.href = 'venly-auth.html';
  }
}


// ============================================================
// AUTH STATE — updates nav automatically on every page
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
  // Check login state and re-render nav if needed
  if (SUPABASE_READY) {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      localStorage.setItem('venly_current_user', JSON.stringify({
        id: session.user.id,
        email: session.user.email,
        name: (session.user.user_metadata.first_name || '') + ' ' + (session.user.user_metadata.last_name || '')
      }));
    }
  }
});
