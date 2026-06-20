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

// ============================================================
// SHARED FILTERS — single source of truth for regions, districts,
// amenities, event types and blog categories.
//
// The admin's Filters page is where these are actually managed —
// it reads/writes the same 'venly_filters' localStorage key as this
// function. EVERY page that shows a region/district/event-type dropdown
// (homepage search, Find a Space, the venue editors, etc.) should call
// getVenlyFilters() rather than hardcoding its own option list, so a
// change made once in the admin shows up everywhere automatically.
// ============================================================
var VENLY_DEFAULT_FILTERS = {
  regions: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Bay of Plenty'],
  districtsByRegion: {
    'Auckland': ['Auckland City', 'North Shore', 'Waitakere', 'Manukau', 'Papakura'],
    'Wellington': ['Wellington City', 'Lower Hutt', 'Upper Hutt', 'Porirua'],
    'Christchurch': ['Christchurch Central', 'Riccarton', 'Sydenham'],
    'Hamilton': ['Hamilton Central', 'Chartwell', 'Rototuna'],
    'Bay of Plenty': ['Tauranga', 'Mount Maunganui', 'Rotorua', 'Whakatane'],
  },
  amenities: ['WiFi', 'Parking', 'AV Equipment', 'Catering', 'Wheelchair Access', 'Outdoor Space'],
  eventsByType: {
    event:   ['Wedding', '18th Party', '21st Party', 'Corporate Event', 'Private Party', 'Product Launch', 'Gala / Awards', 'Market / Expo', 'Live Performance'],
    meeting: ['Boardroom', 'Workshop', 'Training', 'Conference', 'Interview Room', 'Coworking'],
    shoot:   ['Film & TV', 'Photography', 'Commercial', 'Content Creation', 'Podcast / Recording'],
  },
  blogCategories: ['Hosting Tips', 'Event Space', 'Meeting Space', 'Shoot Location', 'Guide', 'Venly News'],
};

// Maps the admin Filters page's short keys (event/meeting/shoot) to the
// literal space-type labels used everywhere else on venues and listings.
var VENLY_SPACE_TYPE_KEY_MAP = {
  'Event space': 'event',
  'Meeting space': 'meeting',
  'Shoot Location': 'shoot',
};

function getVenlyFilters() {
  var stored = JSON.parse(localStorage.getItem('venly_filters') || 'null');
  var merged = stored
    ? Object.assign({}, VENLY_DEFAULT_FILTERS, stored, {
        eventsByType: Object.assign({}, VENLY_DEFAULT_FILTERS.eventsByType, stored.eventsByType || {}),
        districtsByRegion: Object.assign({}, VENLY_DEFAULT_FILTERS.districtsByRegion, stored.districtsByRegion || {})
      })
    : JSON.parse(JSON.stringify(VENLY_DEFAULT_FILTERS));

  // Derive eventsBySpaceType from eventsByType every time, rather than
  // storing it separately — this guarantees it can never go stale or
  // disagree with whatever the admin Filters page actually saved.
  merged.eventsBySpaceType = {};
  Object.keys(VENLY_SPACE_TYPE_KEY_MAP).forEach(function(label) {
    var key = VENLY_SPACE_TYPE_KEY_MAP[label];
    merged.eventsBySpaceType[label] = merged.eventsByType[key] || [];
  });

  return merged;
}

// ============================================================
// SHARED VENUES — single source of truth for venue records.
//
// Both the admin (creating/editing any venue) and the host dashboard
// (creating/editing your own venue) read and write through these same
// two functions, against the same 'venly_venues' localStorage key. This
// is also what venly-venue.html reads from to show a specific venue's
// real content instead of static placeholder text.
// ============================================================
var VENLY_SEED_VENUES = [
  { id: 'v-seed-0', name: 'Brads – Shoot Location', type: 'Shoot Location', region: 'Auckland', district: 'Auckland City', address: '', capacity: '1–100', website: '', priceFrom: '', priceTo: '', plan: 'Premium', hits: 8, hostUserId: 1, hostEmail: 'braedyn@venly.co.nz', hostName: 'Braedyn Veysi', hostPhone: '027 425 4550', enquiryEmail: '', effectiveEnquiryEmail: 'braedyn@venly.co.nz', description: 'A bright, flexible shoot location in the heart of Auckland.', isLive: false, subscriptionStatus: 'none', createdBy: 'host', photos: [], features: ['WiFi', 'Natural Light', 'Parking Available'], eventTypes: ['Photography', 'Commercial'] },
  { id: 'v-seed-1', name: 'Brads – Meeting Space', type: 'Meeting space', region: 'Auckland', district: 'Auckland City', address: '', capacity: '1–100', website: '', priceFrom: '', priceTo: '', plan: 'Premium', hits: 6, hostUserId: 1, hostEmail: 'braedyn@venly.co.nz', hostName: 'Braedyn Veysi', hostPhone: '027 425 4550', enquiryEmail: '', effectiveEnquiryEmail: 'braedyn@venly.co.nz', description: 'A modern, well-equipped meeting space for teams of any size.', isLive: true, subscriptionStatus: 'active', createdBy: 'host', photos: [], features: ['WiFi', 'AV Equipment', 'Air Conditioning'], eventTypes: ['Boardroom', 'Conference'] },
  { id: 'v-seed-2', name: 'Brads Warehouse', type: 'Event space', region: 'Auckland', district: 'Auckland City', address: '', capacity: '20–506', website: '', priceFrom: '150', priceTo: '500', plan: 'Standard', hits: 10, hostUserId: 1, hostEmail: 'braedyn@venly.co.nz', hostName: 'Braedyn Veysi', hostPhone: '027 425 4550', enquiryEmail: '', effectiveEnquiryEmail: 'braedyn@venly.co.nz', description: 'A striking industrial warehouse, perfect for large events.', isLive: true, subscriptionStatus: 'active', createdBy: 'host', photos: [], features: ['Bar / Drinks', 'Stage / Performance Area', 'Loading Dock'], eventTypes: ['Wedding', 'Corporate Event', 'Product Launch'] },
  { id: 'v-seed-3', name: 'Okahu – Meeting Space', type: 'Meeting space', region: 'Auckland', district: 'Auckland City', address: '', capacity: '1–100', website: '', priceFrom: '', priceTo: '', plan: 'Premium', hits: 10, hostUserId: 1, hostEmail: 'braedyn@venly.co.nz', hostName: 'Braedyn Veysi', hostPhone: '027 425 4550', enquiryEmail: '', effectiveEnquiryEmail: 'braedyn@venly.co.nz', description: 'A premium meeting space with harbour views.', isLive: true, subscriptionStatus: 'active', createdBy: 'host', photos: [], features: ['WiFi', 'Natural Light', 'Catering'], eventTypes: ['Boardroom', 'Training'] },
  { id: 'v-seed-4', name: 'Okahu – Shoot Location', type: 'Shoot Location', region: 'Auckland', district: 'Auckland City', address: '', capacity: '1–100', website: '', priceFrom: '', priceTo: '', plan: 'Premium', hits: 6, hostUserId: 1, hostEmail: 'braedyn@venly.co.nz', hostName: 'Braedyn Veysi', hostPhone: '027 425 4550', enquiryEmail: '', effectiveEnquiryEmail: 'braedyn@venly.co.nz', description: 'A versatile shoot location with natural light all day.', isLive: false, subscriptionStatus: 'none', createdBy: 'host', photos: [], features: ['Natural Light', 'Private Entrance'], eventTypes: ['Film & TV', 'Content Creation'] },
  { id: 'v-seed-5', name: 'Okahu', type: 'Event space', region: 'Auckland', district: 'Auckland City', address: '', capacity: '1–350', website: '', priceFrom: '300', priceTo: '300', plan: 'Basic', hits: 4, hostUserId: 1, hostEmail: 'braedyn@venly.co.nz', hostName: 'Braedyn Veysi', hostPhone: '027 425 4550', enquiryEmail: '', effectiveEnquiryEmail: 'braedyn@venly.co.nz', description: 'A flexible event space with views over the water.', isLive: true, subscriptionStatus: 'active', createdBy: 'host', photos: [], features: ['Outdoor Space', 'Catering'], eventTypes: ['Wedding', 'Private Party'] },
  { id: 'v-seed-6', name: 'North Shore Event Space', type: 'Event space', region: 'Auckland', district: 'North Shore', address: '', capacity: '40–500', website: '', priceFrom: '', priceTo: '', plan: 'Standard', hits: 22, hostUserId: 2, hostEmail: 'alex@northshore.co.nz', hostName: 'Alex Turner', hostPhone: '021 345 6789', enquiryEmail: '', effectiveEnquiryEmail: 'alex@northshore.co.nz', description: 'A spacious North Shore venue for events of every size.', isLive: true, subscriptionStatus: 'active', createdBy: 'host', photos: [], features: ['Parking Available', 'AV Equipment'], eventTypes: ['Corporate Event', 'Gala / Awards'] },
  { id: 'v-seed-7', name: 'City Meeting Room', type: 'Meeting space', region: 'Auckland', district: 'Auckland City', address: '', capacity: '2–20', website: '', priceFrom: '', priceTo: '', plan: 'Basic', hits: 3, hostUserId: 3, hostEmail: 'maria@studio.co.nz', hostName: 'Maria Chen', hostPhone: '021 987 6543', enquiryEmail: '', effectiveEnquiryEmail: 'maria@studio.co.nz', description: 'A compact, professional meeting room in the CBD.', isLive: false, subscriptionStatus: 'none', createdBy: 'host', photos: [], features: ['WiFi', 'Furniture Included'], eventTypes: ['Interview Room', 'Coworking'] },
];

function getAllVenues() {
  var fromStorage = JSON.parse(localStorage.getItem('venly_venues') || 'null');
  return fromStorage || VENLY_SEED_VENUES;
}

function saveAllVenues(venues) {
  try {
    localStorage.setItem('venly_venues', JSON.stringify(venues));
    return true;
  } catch (e) {
    if (typeof showToast === 'function') showToast('Could not save — storage is full');
    return false;
  }
}
