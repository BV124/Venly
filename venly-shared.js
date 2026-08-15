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

  var links = [
    { href: 'index.html',              label: 'Home',         key: 'home' },
    { href: 'venly-find-a-space.html', label: 'Find a Space', key: 'find' },
    { href: 'venly-how-it-works.html', label: 'How It Works', key: 'how'  },
    { href: 'venly-blog.html',         label: 'Blog',         key: 'blog' },
  ];

  var navLinks = links.map(function(l) {
    var isActive = active === l.key;
    return '<li><a href="' + l.href + '"' + (isActive ? ' style="color:var(--red);font-weight:600"' : '') + '>' + l.label + '</a></li>';
  }).join('');

  var navRight = loggedIn
    ? '<div class="nav-right">' +
        '<div class="dnav-account">' +
          '<button class="btn btn-outline" onclick="window.location.href=\'venly-dashboard.html\'" style="font-size:13px;padding:7px 16px">My Profile</button>' +
          (isAdmin ? '<button class="btn btn-primary" onclick="window.location.href=\'venly-admin.html\'" style="font-size:13px;padding:7px 16px">Admin</button>' : '') +
          '<button class="btn btn-outline" onclick="signOut()" style="font-size:13px;padding:7px 16px">Log out</button>' +
        '</div>' +
      '</div>'
    : '<div class="nav-right">' +
        '<div class="dnav-account">' +
          '<button class="btn btn-outline" onclick="window.location.href=\'venly-auth.html\'">Login</button>' +
          '<button class="btn btn-primary" onclick="window.location.href=\'venly-auth.html?tab=signup\'">Sign Up</button>' +
        '</div>' +
      '</div>';

  // ---- Mobile hamburger + dropdown panel ----
  var mobileLinks = links.map(function(l) {
    var isActive = active === l.key;
    return '<a href="' + l.href + '" class="mnav-link"' + (isActive ? ' style="color:var(--red);font-weight:700"' : '') + '>' + l.label + '</a>';
  }).join('');

  var mobileAuth = loggedIn
    ? '<div class="mnav-auth">' +
        '<button class="btn btn-outline mnav-btn" onclick="window.location.href=\'venly-dashboard.html\'">My Profile</button>' +
        (isAdmin ? '<button class="btn btn-primary mnav-btn" onclick="window.location.href=\'venly-admin.html\'">Admin</button>' : '') +
        '<button class="btn btn-outline mnav-btn" onclick="signOut()">Log out</button>' +
      '</div>'
    : '<div class="mnav-auth">' +
        '<button class="btn btn-primary mnav-btn" onclick="window.location.href=\'venly-auth.html\'">Login</button>' +
        '<button class="btn btn-primary mnav-btn" onclick="window.location.href=\'venly-auth.html?tab=signup\'">Sign Up</button>' +
      '</div>';

  var mnavToggle =
    '<button class="mnav-toggle" id="mnav-toggle" aria-label="Menu" aria-expanded="false">' +
      '<span></span><span></span><span></span>' +
    '</button>';

  var mnavPanel =
    '<div class="mnav-panel" id="mnav-panel" style="position:fixed;top:56px;left:0;right:0;z-index:99999">' +
      '<div class="mnav-links">' + mobileLinks + '</div>' +
      mobileAuth +
    '</div>';

  // Insert the hamburger button just before nav-right's closing </div>
  navRight = navRight.replace(/<\/div>$/, mnavToggle + '</div>');

  var navHTML = '<nav role="navigation" aria-label="Main navigation">' +
    '<div style="display:flex;align-items:center">' +
      '<a class="logo" href="index.html" style="margin-right:48px">Venly.</a>' +
      '<div style="width:1px;height:18px;background:rgba(0,0,0,0.12);margin-right:48px;flex-shrink:0"></div>' +
      '<ul class="nav-links" style="display:flex;gap:32px;list-style:none;margin:0;padding:0">' + navLinks + '</ul>' +
    '</div>' +
    navRight +
    '</nav>';

  var el = document.getElementById('venly-nav');
  if (el) {
    el.outerHTML = navHTML;
  } else {
    document.body.insertAdjacentHTML('afterbegin', navHTML);
  }

  // Append the panel at the END of body so it paints LAST — this means
  // it renders on top of everything regardless of z-index stacking contexts
  // created by the hero section (backdrop-filter, position:relative, etc.)
  document.body.insertAdjacentHTML('beforeend', mnavPanel);

  injectMobileNavStyles();
  setupMobileNavToggle();

  // The Admin button above only shows if the caller explicitly passes
  // { admin: true } — which no page does, since nobody wires that up per
  // page. Instead, check the real logged-in user's actual profile role
  // and insert the button afterward if they genuinely are an Admin. Runs
  // after the nav is already on the page, so this never blocks the first
  // paint — the button just appears a moment later once we know for sure.
  if (loggedIn) _checkAndShowAdminButton();
}

async function _checkAndShowAdminButton() {
  if (!SUPABASE_READY) return;
  try {
    var user = await getCurrentUser();
    if (!user) return;
    var res = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (res.error || !res.data || res.data.role !== 'Admin') return;

    document.querySelectorAll('.dnav-account, .mnav-auth').forEach(function(container) {
      if (container.querySelector('.venly-admin-nav-btn')) return; // already added
      var dashboardBtn = Array.prototype.find.call(container.querySelectorAll('button'), function(b) {
        return b.textContent.trim() === 'My Profile';
      });
      if (!dashboardBtn) return;

      var isMobile = container.classList.contains('mnav-auth');
      var adminBtn = document.createElement('button');
      adminBtn.className = 'btn btn-primary venly-admin-nav-btn' + (isMobile ? ' mnav-btn' : '');
      if (!isMobile) adminBtn.style.cssText = 'font-size:13px;padding:7px 16px';
      adminBtn.textContent = 'Admin';
      adminBtn.onclick = function() { window.location.href = 'venly-admin.html'; };
      dashboardBtn.insertAdjacentElement('afterend', adminBtn);
    });
  } catch (e) {
    console.error('_checkAndShowAdminButton failed:', e);
  }
}

// ============================================================
// MOBILE NAV — styles + toggle behaviour, injected once so every
// page gets the hamburger menu without editing each file's <style>.
// ============================================================
function injectMobileNavStyles() {
  if (document.getElementById('mnav-styles')) return;
  var css = `
    .dnav-account { display: flex; align-items: center; gap: 12px; }
    .mnav-toggle { display: none; }
    .mnav-panel { display: none; }
    @media (max-width: 768px) {
      .mnav-panel { display: block; }
      .nav-right .dnav-account { display: none !important; }
      .nav-links { display: none !important; }

      /* While the dropdown is open, force the nav solid white so the
         logo + close icon match the panel below — otherwise on pages
         with a transparent-until-scrolled hero nav, the top of the
         menu would sit on the see-through hero image. */
      nav.mnav-open {
        background: #fff !important;
        border-bottom: 1px solid #fff !important;
        box-shadow: none !important;
      }
      nav.mnav-open .logo { color: var(--red, #e03a2f) !important; }
      nav.mnav-open .mnav-toggle span { background: var(--text, #1a1a1a) !important; }

      .nav-right .mnav-toggle,
      .nav-right button.mnav-toggle {
        display: flex !important; flex-direction: column; justify-content: center; gap: 4px;
        width: 36px; height: 36px; border: none !important; background: transparent !important;
        cursor: pointer; padding: 0 !important; margin-left: 8px; flex-shrink: 0;
      }
      .mnav-toggle span {
        display: block; width: 100%; height: 2px; background: var(--text, #1a1a1a);
        border-radius: 2px; transition: transform 0.2s ease, opacity 0.2s ease;
      }
      .mnav-toggle[aria-expanded="true"] span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
      .mnav-toggle[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
      .mnav-toggle[aria-expanded="true"] span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

      .mnav-panel {
        position: fixed; top: 56px; left: 0; right: 0;
        background: var(--white, #fff);
        border-bottom: none;
        box-shadow: none;
        max-height: 0; overflow: hidden;
        transition: max-height 0.25s ease;
        z-index: 99999;
      }
      .mnav-panel.is-open {
        max-height: 420px;
        border-bottom: 1px solid var(--border, #e8e8e8);
        box-shadow: 0 12px 24px rgba(0,0,0,0.08);
      }
      .mnav-links {
        display: flex; flex-direction: column;
        padding: 8px 20px;
        border-bottom: 1px solid var(--border, #e8e8e8);
      }
      .mnav-link {
        padding: 13px 4px; font-size: 15px; font-weight: 500;
        color: var(--text, #1a1a1a); text-decoration: none;
        border-bottom: 1px solid rgba(0,0,0,0.05);
      }
      .mnav-links .mnav-link:last-child { border-bottom: none; }
      .mnav-auth {
        display: flex; flex-direction: column; gap: 10px;
        padding: 16px 20px 20px;
      }
      .mnav-auth .mnav-link { padding: 4px; border-bottom: none; }
      .mnav-btn { width: 100%; justify-content: center; padding: 11px 0 !important; font-size: 14px !important; }
      .mnav-auth .btn-outline.mnav-btn { background: var(--red, #e03a2f) !important; color: #fff !important; border-color: var(--red, #e03a2f) !important; }
    }
  `;
  var style = document.createElement('style');
  style.id = 'mnav-styles';
  style.textContent = css;
  document.head.appendChild(style);
}

function setupMobileNavToggle() {
  var toggle = document.getElementById('mnav-toggle');
  var panel = document.getElementById('mnav-panel');
  var nav = document.querySelector('nav');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', function() {
    var isOpen = panel.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (nav) nav.classList.toggle('mnav-open', isOpen);
  });

  // Close the panel if the viewport grows back to desktop width
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (nav) nav.classList.remove('mnav-open');
    }
  });
}

// ============================================================
// FOOTER — edit once, updates everywhere
// ============================================================
function renderFooter() {
  var loggedIn = !!localStorage.getItem('venly_current_user');

  var footerHTML = `
<footer role="contentinfo" aria-label="Site footer" style="background:#111;color:#fff;font-family:Inter,sans-serif">

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
    </div>

    <!-- LIST A SPACE -->
    <div>
      <span class="vf-col-heading">List a Space</span>
      <a href="venly-listing-fees.html" class="vf-link">Pricing &amp; Plans</a>
      <a href="venly-how-it-works.html" class="vf-link">How It Works</a>
      <a href="venly-listing-fees.html" class="vf-link">List Your Space</a>
    </div>

    <!-- SUPPORT -->
    <div>
      <span class="vf-col-heading">Support</span>
      <a href="venly-dashboard.html" class="vf-link">Account</a>
      <a href="venly-contact.html" class="vf-link">Contact Us</a>
      <a href="venly-terms.html" class="vf-link">Terms &amp; Conditions</a>
    </div>

    <!-- QUICK SEARCH -->
    <div>
      <span class="vf-col-heading">Quick Search</span>
      <a href="venly-find-a-space.html?type=Event+space" class="vf-link">Event Spaces</a>
      <a href="venly-find-a-space.html?type=Meeting+space" class="vf-link">Meeting Spaces</a>
      <a href="venly-find-a-space.html?type=Shoot+Location" class="vf-link">Shoot Locations</a>
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
    window.location.href = 'venly-auth.html';
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
// ANALYTICS — real tracking, no dedup (every page load/reload counts)
// ============================================================
// Everything here is stored in localStorage, same as the rest of this
// pre-Supabase build — so it's real for this browser's own activity, but
// it's not a shared, cross-visitor count until this moves to a real
// database. Bucketed by calendar month ("2026-07") so the admin's Venue
// Analytics page can chart month-over-month trends.
function _venlyMonthKey(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

// Sitewide page view — call once from every public-facing page. Every
// load counts, including reloads, by design (no session dedup). Fire-
// and-forget: nothing on the page waits for this to finish, same as any
// analytics beacon.
function trackPageView() {
  if (SUPABASE_READY) {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    sb.rpc('track_page_view', { path_input: path });
    return;
  }
  var store = JSON.parse(localStorage.getItem('venly_analytics_pageviews') || '{"total":0,"monthly":{}}');
  store.total = (store.total || 0) + 1;
  var mk = _venlyMonthKey();
  store.monthly[mk] = (store.monthly[mk] || 0) + 1;
  localStorage.setItem('venly_analytics_pageviews', JSON.stringify(store));
}

// Favourites — current on/off state (drives the heart icon) is kept
// separate from the lifetime "times favourited" counter (drives the
// admin's Favourites stat), so unfavouriting doesn't erase history.
//
// NOTE: still localStorage-only, deliberately, even though a real
// per-user `favourites` table exists now. Making this genuinely real
// needs to know who's logged in (RLS requires a real user_id) and,
// because isVenueFavourited()/toggleVenueFavourite() are called
// synchronously all over already-migrated pages (index.html, venue
// detail page) to instantly paint the heart icon, switching to an async
// Supabase read here would mean reworking those pages' render logic too
// — a bigger, separate piece of work rather than something to fold into
// the admin's Analytics pass.
function isVenueFavourited(venueId) {
  var current = JSON.parse(localStorage.getItem('venly_favourites') || '{}');
  return !!current[venueId];
}

function toggleVenueFavourite(venueId) {
  var current = JSON.parse(localStorage.getItem('venly_favourites') || '{}');
  var nowFav = !current[venueId];
  if (nowFav) { current[venueId] = true; } else { delete current[venueId]; }
  localStorage.setItem('venly_favourites', JSON.stringify(current));

  // Save to Supabase (fire-and-forget — never block the UI on it)
  if (typeof sb !== 'undefined' && SUPABASE_READY) {
    (async function() {
      try {
        var userRes = await sb.auth.getUser();
        var user = userRes.data && userRes.data.user;
        if (!user) {
          console.warn('[Venly] Favourite not saved — no logged-in user. Sign in first.');
          return;
        }
        console.log('[Venly] Saving favourite:', { venueId: venueId, userId: user.id, action: nowFav ? 'add' : 'remove' });
        if (nowFav) {
          var insRes = await sb.from('favourites').insert({ user_id: user.id, venue_id: venueId });
          if (insRes.error && insRes.error.code === '23505') { console.log('[Venly] Already favourited'); }
          else if (insRes.error) console.error('[Venly] Favourite INSERT failed:', insRes.error);
          else console.log('[Venly] Favourite saved OK');
        } else {
          var delRes = await sb.from('favourites').delete().eq('user_id', user.id).eq('venue_id', venueId);
          if (delRes.error) console.error('[Venly] Favourite DELETE failed:', delRes.error);
          else console.log('[Venly] Favourite removed OK');
        }
      } catch (e) { console.error('[Venly] Favourite sync exception:', e); }
    })();
  }

  return nowFav;
}

function getVenueFavouriteCount(venueId) {
  var counts = JSON.parse(localStorage.getItem('venly_analytics_favourites') || '{}');
  return counts[venueId] || 0;
}

// Enquiries are real (the `enquiries` table, migrated with Messages) —
// this is only ever called from the admin, which already has every
// enquiry loaded via adminBootstrapMessages() (_adminMessagesCache), so
// counting from that cache avoids a second fetch. Falls back to reading
// venly_enquiries directly for demo mode / any page without that cache.
function getVenueEnquiryCount(venueId) {
  if (typeof _adminMessagesCache !== 'undefined' && _adminMessagesCache) {
    return _adminMessagesCache.filter(function(m) {
      return m.source === 'venue' && String(m.venueId) === String(venueId);
    }).length;
  }
  var enquiries = JSON.parse(localStorage.getItem('venly_enquiries') || '[]');
  return enquiries.filter(function(e) { return String(e.venueId) === String(venueId); }).length;
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

// Sync favourites from Supabase on every page load — runs as part of the
// bootstrap chain so it completes BEFORE any page renders venue cards.
// This ensures isVenueFavourited() reads correct data.
async function syncFavouritesFromSupabase() {
  if (!SUPABASE_READY) return;
  try {
    var userRes = await sb.auth.getUser();
    var user = userRes.data && userRes.data.user;
    if (!user) return;
    var res = await sb.from('favourites').select('venue_id').eq('user_id', user.id);
    if (res.data) {
      var favs = {};
      res.data.forEach(function(f) { favs[f.venue_id] = true; });
      localStorage.setItem('venly_favourites', JSON.stringify(favs));
    }
  } catch (e) { console.error('Failed to sync favourites:', e); }
}
