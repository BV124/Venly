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
  var c = VENLY_CONFIG;
  var footerHTML = '<footer>' +
    '<div class="footer-top">' +
      '<div>' +
        '<div class="footer-logo">Venly.</div>' +
        '<div class="footer-contact" style="margin-top:28px">' +
          '<h4 style="font-size:13px;font-weight:600;margin-bottom:10px;color:#fff">Spaces Made Simple</h4>' +
          '<p style="font-size:13px;color:rgba(255,255,255,0.55);line-height:1.6;margin-bottom:16px">For more information or support feel free to contact us.<br><a href="mailto:' + c.supportEmail + '" style="color:var(--red)">' + c.supportEmail + '</a></p>' +
          '<div style="display:flex;gap:12px">' +
            '<a href="' + c.social.instagram + '" aria-label="Instagram" style="width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.55);transition:all 0.15s;text-decoration:none">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4a4 4 0 11-8 0 4 4 0 018 0z"/><circle cx="16.5" cy="7.5" r="1" fill="currentColor" stroke="none"/></svg></a>' +
            '<a href="' + c.social.facebook + '" aria-label="Facebook" style="width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.55);transition:all 0.15s;text-decoration:none">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>' +
            '<a href="' + c.social.linkedin + '" aria-label="LinkedIn" style="width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.55);transition:all 0.15s;text-decoration:none">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="footer-col">' +
        '<h4>Discover</h4>' +
        '<ul>' +
          '<li><a href="index.html">Home</a></li>' +
          '<li><a href="venly-find-a-space.html">Find a Space</a></li>' +
          '<li><a href="venly-blog.html">Blog</a></li>' +
        '</ul>' +
      '</div>' +
      '<div class="footer-col">' +
        '<h4>Support</h4>' +
        '<ul>' +
          '<li><a href="venly-dashboard.html">Account</a></li>' +
          '<li><a href="venly-contact.html">Contact Us</a></li>' +
          '<li><a href="venly-contact.html">Support</a></li>' +
        '</ul>' +
      '</div>' +
      '<div class="footer-col">' +
        '<h4>Listing A Space</h4>' +
        '<ul>' +
          '<li><a href="venly-listing-fees.html">How It Works</a></li>' +
          '<li><a href="venly-listing-fees.html">Listing Fees</a></li>' +
          '<li><a href="venly-listing-fees.html">List Your Space</a></li>' +
        '</ul>' +
      '</div>' +
      '<div class="footer-col">' +
        '<h4>Terms &amp; Policies</h4>' +
        '<ul>' +
          '<li><a href="#">Terms &amp; Conditions</a></li>' +
          '<li><a href="#">Privacy Policy</a></li>' +
          '<li><a href="#">Cookie Policy</a></li>' +
        '</ul>' +
      '</div>' +
    '</div>' +
    '<div class="footer-bottom"><strong>Venly</strong> a product of WisenUp Limited &copy; ' + new Date().getFullYear() + '</div>' +
  '</footer>';

  var el = document.getElementById('venly-footer');
  if (el) {
    el.outerHTML = footerHTML;
  } else {
    document.body.insertAdjacentHTML('beforeend', footerHTML);
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
