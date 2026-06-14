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
    '<a class="logo" href="index.html">Venly.</a>' +
    '<ul class="nav-links">' + navLinks + '</ul>' +
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
    .venly-footer-grid {
      max-width: 1200px;
      margin: 0 auto;
      padding: 56px 48px 48px;
      display: grid;
      grid-template-columns: 1.6fr 1fr 1fr 1fr 1fr;
      gap: 40px;
    }
    .venly-footer-link {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      display: block;
      margin-bottom: 13px;
      transition: color 0.15s;
    }
    .venly-footer-link:hover { color: #fff; }
    .venly-footer-heading {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.3);
      margin-bottom: 20px;
    }
    .venly-footer-brand-col p {
      font-size: 13px;
      color: rgba(255,255,255,0.45);
      line-height: 1.7;
      max-width: 200px;
      margin-bottom: 20px;
    }
    .venly-footer-socials { display: flex; gap: 10px; }
    .venly-footer-social-icon {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .venly-footer-social-icon:hover { background: #e03a2f; color: #fff; }
    .venly-footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.07);
    }
    .venly-footer-bottom-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .venly-footer-bottom-left { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
    .venly-footer-bottom-link {
      font-size: 13px;
      color: rgba(255,255,255,0.4);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.15s;
    }
    .venly-footer-bottom-link:hover { color: rgba(255,255,255,0.8); }
    .venly-footer-copy { font-size: 12px; color: rgba(255,255,255,0.25); }
    .venly-footer-copy strong { color: rgba(255,255,255,0.4); }

    /* MOBILE */
    @media (max-width: 768px) {
      .venly-footer-grid {
        grid-template-columns: 1fr 1fr;
        padding: 40px 24px 32px;
        gap: 32px;
      }
      .venly-footer-brand-col {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .venly-footer-bottom-inner {
        padding: 16px 24px;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .venly-footer-bottom-left { gap: 14px; }
    }
    @media (max-width: 400px) {
      .venly-footer-grid { grid-template-columns: 1fr 1fr; padding: 32px 16px 24px; gap: 24px; }
      .venly-footer-link { font-size: 13px; }
      .venly-footer-bottom-inner { padding: 14px 16px; }
    }
  </style>

  <div class="venly-footer-grid">

    <!-- BRAND -->
    <div class="venly-footer-brand-col">
      <a href="index.html" style="font-size:26px;font-weight:800;color:#e03a2f;letter-spacing:-0.5px;text-decoration:none;display:block;margin-bottom:14px">Venly.</a>
      <p>The easiest way to find and list spaces across New Zealand. No ads, no stress.</p>
      <div class="venly-footer-socials">
        <a href="https://instagram.com/venly.co.nz" aria-label="Instagram" class="venly-footer-social-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4a4 4 0 11-8 0 4 4 0 018 0z"/><circle cx="16.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/></svg>
        </a>
        <a href="https://facebook.com/venly.co.nz" aria-label="Facebook" class="venly-footer-social-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
        </a>
        <a href="https://linkedin.com/company/venly" aria-label="LinkedIn" class="venly-footer-social-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
      </div>
    </div>

    <!-- DISCOVER -->
    <div>
      <div class="venly-footer-heading">Discover</div>
      <a href="index.html" class="venly-footer-link">Home</a>
      <a href="venly-find-a-space.html" class="venly-footer-link">Find a Space</a>
      <a href="venly-blog.html" class="venly-footer-link">Blog</a>
      <a href="venly-contact.html" class="venly-footer-link">Contact</a>
    </div>

    <!-- LIST A SPACE -->
    <div>
      <div class="venly-footer-heading">List a Space</div>
      <a href="venly-listing-fees.html" class="venly-footer-link">How It Works</a>
      <a href="venly-listing-fees.html" class="venly-footer-link">Pricing &amp; Plans</a>
      <a href="venly-listing-fees.html" class="venly-footer-link">List Your Space</a>
    </div>

    <!-- ACCOUNT -->
    <div>
      <div class="venly-footer-heading">Account</div>
      <a href="javascript:void(0)" onclick="handleFooterAccount()" class="venly-footer-link">${loggedIn ? 'My Dashboard' : 'Sign Up Free'}</a>
      <a href="javascript:void(0)" onclick="handleFooterLogin()" class="venly-footer-link">${loggedIn ? 'Log Out' : 'Log In'}</a>
      <a href="venly-contact.html" class="venly-footer-link">Support</a>
    </div>

    <!-- LEGAL -->
    <div>
      <div class="venly-footer-heading">Legal</div>
      <a href="#" class="venly-footer-link">Terms &amp; Conditions</a>
      <a href="#" class="venly-footer-link">Privacy Policy</a>
      <a href="#" class="venly-footer-link">Cookie Policy</a>
    </div>

  </div>

  <!-- BOTTOM STRIP -->
  <div class="venly-footer-bottom">
    <div class="venly-footer-bottom-inner">
      <div class="venly-footer-bottom-left">
        <a href="mailto:info@venly.co.nz" class="venly-footer-bottom-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          info@venly.co.nz
        </a>
        <span class="venly-footer-bottom-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Auckland, New Zealand
        </span>
      </div>
      <div class="venly-footer-copy">© ${new Date().getFullYear()} <strong>Venly</strong> · A product of WisenUp Limited</div>
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
