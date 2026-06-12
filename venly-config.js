// ============================================================
// VENLY — GLOBAL CONFIG
// This is the ONLY file you need to edit when going live.
// ============================================================

const VENLY_CONFIG = {

  // ----------------------------------------------------------
  // SUPABASE — get these from supabase.com
  // Your project → Settings → API
  // ----------------------------------------------------------
  supabaseUrl:  'YOUR_SUPABASE_URL',
  supabaseKey:  'YOUR_SUPABASE_ANON_KEY',

  // ----------------------------------------------------------
  // STRIPE — get these from dashboard.stripe.com
  // Developers → API keys → Publishable key
  // ----------------------------------------------------------
  stripeKey: 'YOUR_STRIPE_PUBLISHABLE_KEY',

  // ----------------------------------------------------------
  // SITE SETTINGS
  // ----------------------------------------------------------
  siteName:    'Venly',
  siteUrl:     'https://venly.co.nz',
  supportEmail:'info@venly.co.nz',
  supportPhone:'027 425 4550',
  address:     '2/110 Symonds Street, Auckland CBD',

  // ----------------------------------------------------------
  // PRICING — edit here and it updates the listing fees page
  // ----------------------------------------------------------
  plans: {
    event: {
      Basic:    { price: 'Free*', strikethrough: '$39', monthly: 0 },
      Standard: { price: '$59',   strikethrough: null,  monthly: 59 },
      Premium:  { price: '$79',   strikethrough: null,  monthly: 79 },
    },
    meeting: {
      Basic:    { price: 'Free*', strikethrough: '$29', monthly: 0 },
      Standard: { price: '$39',   strikethrough: null,  monthly: 39 },
      Premium:  { price: '$59',   strikethrough: null,  monthly: 59 },
    },
    shoot: {
      Basic:    { price: 'Free*', strikethrough: '$29', monthly: 0 },
      Standard: { price: '$49',   strikethrough: null,  monthly: 49 },
      Premium:  { price: '$69',   strikethrough: null,  monthly: 69 },
    },
  },

  // ----------------------------------------------------------
  // PLAN CAPS — edit here and it updates the listing creator
  // ----------------------------------------------------------
  planCaps: {
    Basic:    { photos: 4,  features: 6,  eventTypes: 4  },
    Standard: { photos: 8,  features: 10, eventTypes: 6  },
    Premium:  { photos: 12, features: 12, eventTypes: 10 },
  },

  // ----------------------------------------------------------
  // SOCIAL LINKS
  // ----------------------------------------------------------
  social: {
    instagram: 'https://instagram.com/venly.co.nz',
    facebook:  'https://facebook.com/venly.co.nz',
    linkedin:  'https://linkedin.com/company/venly',
  },

};

// ============================================================
// SUPABASE CLIENT — auto-initialises when keys are set
// ============================================================
const SUPABASE_READY = VENLY_CONFIG.supabaseUrl !== 'YOUR_SUPABASE_URL';
const sb = SUPABASE_READY
  ? window.supabase.createClient(VENLY_CONFIG.supabaseUrl, VENLY_CONFIG.supabaseKey)
  : null;

// ============================================================
// STRIPE CLIENT — auto-initialises when key is set
// ============================================================
const STRIPE_READY = VENLY_CONFIG.stripeKey !== 'YOUR_STRIPE_PUBLISHABLE_KEY';

// ============================================================
// AUTH HELPERS — available on every page
// ============================================================
async function getCurrentUser() {
  if (!SUPABASE_READY) {
    return JSON.parse(localStorage.getItem('venly_current_user') || 'null');
  }
  const { data: { session } } = await sb.auth.getSession();
  return session ? session.user : null;
}

async function requireAuth(redirectTo) {
  const user = await getCurrentUser();
  if (!user) window.location.href = redirectTo || 'venly-auth.html';
  return user;
}

async function requireAdmin() {
  if (!SUPABASE_READY) return true;
  const user = await getCurrentUser();
  if (!user) { window.location.href = 'venly-auth.html'; return false; }
  const { data } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (!data || data.role !== 'admin') { window.location.href = 'venly-dashboard.html'; return false; }
  return true;
}

async function signOut() {
  if (SUPABASE_READY) await sb.auth.signOut();
  localStorage.removeItem('venly_current_user');
  window.location.href = 'venly-auth.html';
}

// ============================================================
// TOAST — available on every page
// ============================================================
function showToast(msg, duration) {
  var t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:500;opacity:0;transform:translateY(8px);transition:all 0.25s;pointer-events:none;z-index:9999;font-family:Inter,sans-serif';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateY(0)';
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(function() {
    t.style.opacity = '0';
    t.style.transform = 'translateY(8px)';
  }, duration || 3000);
}
