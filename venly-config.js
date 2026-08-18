// ============================================================
// VENLY — GLOBAL CONFIG
// This is the ONLY file you need to edit when going live.
// ============================================================

const VENLY_CONFIG = {

  // ----------------------------------------------------------
  // SUPABASE — get these from supabase.com
  // Your project → Settings → API
  // ----------------------------------------------------------
  supabaseUrl:  'https://fauptwawvjsnsswumiyk.supabase.co',
  supabaseKey:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdXB0d2F3dmpzbnNzd3VtaXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTE3NjAsImV4cCI6MjA5Njg2Nzc2MH0.wEuNw75JhWFHDdvYLCzhg2K466U45BsLPappxMgJdCw',

  // ----------------------------------------------------------
  // STRIPE — get these from dashboard.stripe.com
  // Developers → API keys → Publishable key
  // ----------------------------------------------------------
  stripeKey: 'pk_live_51Il070LEXONgPwvxk8r0BgEMXXCZb2oXB4hDip6nsIj1viAi7Y3o6HgfMh5R67dTxQU7YxySlqHPhsKIjjVHs5LN00H3LdGUPY',

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
      Basic:    { price: '$39',  strikethrough: null, monthly: 39,  stripePriceId: 'price_1TsE7FLEXONgPwvxattWCpXN' },
      Standard: { price: '$59',  strikethrough: null, monthly: 59,  stripePriceId: 'price_1TsEBcLEXONgPwvxzyWTtpB2' },
      Premium:  { price: '$89',  strikethrough: null, monthly: 89,  stripePriceId: 'price_1TsECmLEXONgPwvx2ZhWHDtP' },
    },
    meeting: {
      Basic:    { price: '$29',  strikethrough: null, monthly: 29,  stripePriceId: 'price_1TsEFuLEXONgPwvxkSsTrcrH' },
      Standard: { price: '$49',  strikethrough: null, monthly: 49,  stripePriceId: 'price_1TsEHzLEXONgPwvxQiOdN1ea' },
      Premium:  { price: '$69',  strikethrough: null, monthly: 69,  stripePriceId: 'price_1TsEIYLEXONgPwvxw41xKvh6' },
    },
    shoot: {
      Basic:    { price: '$19',  strikethrough: null, monthly: 19,  stripePriceId: 'price_1TsEJCLEXONgPwvxK5ckM9Yk' },
      Standard: { price: '$29',  strikethrough: null, monthly: 29,  stripePriceId: 'price_1TsEJzLEXONgPwvxKlPODRmS' },
      Premium:  { price: '$49',  strikethrough: null, monthly: 49,  stripePriceId: 'price_1TsEKVLEXONgPwvxVTsAlREW' },
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
  const { data } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!data || data.role !== 'Admin') { window.location.href = 'venly-dashboard.html'; return false; }
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

  // Quick-filter chips shown in the homepage's "Trending Spaces" marquee.
  // Each chip is a label + a filterType/value pair rather than a raw URL,
  // so every chip always points at a real, valid find-a-space filter —
  // see buildTrendingChipHref() below for how the link gets built.
  trendingChips: [
    { label: 'Wedding venues',  filterType: 'event',  value: 'Wedding' },
    { label: 'Auckland spaces', filterType: 'region', value: 'Auckland' },
    { label: 'Meeting space',   filterType: 'type',   value: 'Meeting space' },
    { label: 'Shoot locations', filterType: 'type',   value: 'Shoot Location' },
  ],
};

// Builds the venly-find-a-space.html link for a trending chip, given its
// filterType ('event' | 'region' | 'type') and value. Kept in one place so
// the admin's Filters page and the homepage marquee never disagree on how
// a chip's link is constructed.
function buildTrendingChipHref(chip) {
  var paramByType = { event: 'event', region: 'region', type: 'type' };
  var param = paramByType[chip.filterType] || 'type';
  return 'venly-find-a-space.html?' + param + '=' + encodeURIComponent(chip.value);
}

// Maps the admin Filters page's short keys (event/meeting/shoot) to the
// literal space-type labels used everywhere else on venues and listings.
var VENLY_SPACE_TYPE_KEY_MAP = {
  'Event space': 'event',
  'Meeting space': 'meeting',
  'Shoot Location': 'shoot',
};

function getVenlyFilters() {
  var merged;
  if (SUPABASE_READY) {
    // Never fall back to demo defaults once live — an empty-but-valid
    // shape instead, so callers can safely read .regions etc. without
    // crashing, but never see fake placeholder options.
    merged = _venlyCache.filters || { regions: [], districtsByRegion: {}, amenities: [], eventsByType: {}, blogCategories: [], trendingChips: [] };
  } else {
    var stored = JSON.parse(localStorage.getItem('venly_filters') || 'null');
    merged = stored
      ? Object.assign({}, VENLY_DEFAULT_FILTERS, stored, {
          eventsByType: Object.assign({}, VENLY_DEFAULT_FILTERS.eventsByType, stored.eventsByType || {}),
          districtsByRegion: Object.assign({}, VENLY_DEFAULT_FILTERS.districtsByRegion, stored.districtsByRegion || {})
        })
      : JSON.parse(JSON.stringify(VENLY_DEFAULT_FILTERS));
  }

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
  { id: 'v-seed-0', name: 'Brads – Shoot Location', type: 'Shoot Location', region: 'Auckland', district: 'Auckland City', address: '', capacity: '1–100', website: '', priceFrom: '', priceTo: '', plan: 'Premium', hits: 8, hostUserId: 1, hostEmail: 'braedyn@venly.co.nz', hostName: 'Braedyn Veysi', hostPhone: '027 425 4550', enquiryEmail: '', effectiveEnquiryEmail: 'braedyn@venly.co.nz', description: 'A bright, flexible shoot location in the heart of Auckland.', isLive: false, subscriptionStatus: 'none', createdBy: 'host', photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80'], features: ['WiFi', 'Natural Light', 'Parking Available'], eventTypes: ['Photography', 'Commercial'], featuredHome: true, featuredOccasion: true, discountPercent: 0, discountCode: '' },
  { id: 'v-seed-1', name: 'Brads – Meeting Space', type: 'Meeting space', region: 'Auckland', district: 'Auckland City', address: '', capacity: '1–100', website: '', priceFrom: '', priceTo: '', plan: 'Premium', hits: 6, hostUserId: 1, hostEmail: 'braedyn@venly.co.nz', hostName: 'Braedyn Veysi', hostPhone: '027 425 4550', enquiryEmail: '', effectiveEnquiryEmail: 'braedyn@venly.co.nz', description: 'A modern, well-equipped meeting space for teams of any size.', isLive: true, subscriptionStatus: 'active', createdBy: 'host', photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=80'], features: ['WiFi', 'AV Equipment', 'Air Conditioning'], eventTypes: ['Boardroom', 'Conference'], featuredHome: true, featuredOccasion: true, discountPercent: 0, discountCode: '' },
  { id: 'v-seed-2', name: 'Brads Warehouse', type: 'Event space', region: 'Auckland', district: 'Auckland City', address: '', capacity: '20–506', website: '', priceFrom: '150', priceTo: '500', plan: 'Standard', hits: 10, hostUserId: 1, hostEmail: 'braedyn@venly.co.nz', hostName: 'Braedyn Veysi', hostPhone: '027 425 4550', enquiryEmail: '', effectiveEnquiryEmail: 'braedyn@venly.co.nz', description: 'A striking industrial warehouse, perfect for large events.', isLive: true, subscriptionStatus: 'active', createdBy: 'host', photos: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80'], features: ['Bar / Drinks', 'Stage / Performance Area', 'Loading Dock'], eventTypes: ['Wedding', 'Corporate Event', 'Product Launch'], featuredHome: true, featuredOccasion: true, discountPercent: 0, discountCode: '' },
  { id: 'v-seed-3', name: 'Okahu – Meeting Space', type: 'Meeting space', region: 'Auckland', district: 'Auckland City', address: '', capacity: '1–100', website: '', priceFrom: '', priceTo: '', plan: 'Premium', hits: 10, hostUserId: 1, hostEmail: 'braedyn@venly.co.nz', hostName: 'Braedyn Veysi', hostPhone: '027 425 4550', enquiryEmail: '', effectiveEnquiryEmail: 'braedyn@venly.co.nz', description: 'A premium meeting space with harbour views.', isLive: true, subscriptionStatus: 'active', createdBy: 'host', photos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80'], features: ['WiFi', 'Natural Light', 'Catering'], eventTypes: ['Boardroom', 'Training'], featuredHome: true, featuredOccasion: true, discountPercent: 0, discountCode: '' },
  { id: 'v-seed-4', name: 'Okahu – Shoot Location', type: 'Shoot Location', region: 'Auckland', district: 'Auckland City', address: '', capacity: '1–100', website: '', priceFrom: '', priceTo: '', plan: 'Premium', hits: 6, hostUserId: 1, hostEmail: 'braedyn@venly.co.nz', hostName: 'Braedyn Veysi', hostPhone: '027 425 4550', enquiryEmail: '', effectiveEnquiryEmail: 'braedyn@venly.co.nz', description: 'A versatile shoot location with natural light all day.', isLive: false, subscriptionStatus: 'none', createdBy: 'host', photos: ['https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=900&q=80'], features: ['Natural Light', 'Private Entrance'], eventTypes: ['Film & TV', 'Content Creation'], featuredHome: true, featuredOccasion: true, discountPercent: 0, discountCode: '' },
  { id: 'v-seed-5', name: 'Okahu', type: 'Event space', region: 'Auckland', district: 'Auckland City', address: '', capacity: '1–350', website: '', priceFrom: '300', priceTo: '300', plan: 'Basic', hits: 4, hostUserId: 1, hostEmail: 'braedyn@venly.co.nz', hostName: 'Braedyn Veysi', hostPhone: '027 425 4550', enquiryEmail: '', effectiveEnquiryEmail: 'braedyn@venly.co.nz', description: 'A flexible event space with views over the water.', isLive: true, subscriptionStatus: 'active', createdBy: 'host', photos: ['https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=900&q=80'], features: ['Outdoor Space', 'Catering'], eventTypes: ['Wedding', 'Private Party'], featuredHome: true, featuredOccasion: true, discountPercent: 0, discountCode: '' },
  { id: 'v-seed-6', name: 'North Shore Event Space', type: 'Event space', region: 'Auckland', district: 'North Shore', address: '', capacity: '40–500', website: '', priceFrom: '', priceTo: '', plan: 'Standard', hits: 22, hostUserId: 2, hostEmail: 'alex@northshore.co.nz', hostName: 'Alex Turner', hostPhone: '021 345 6789', enquiryEmail: '', effectiveEnquiryEmail: 'alex@northshore.co.nz', description: 'A spacious North Shore venue for events of every size.', isLive: true, subscriptionStatus: 'active', createdBy: 'host', photos: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80'], features: ['Parking Available', 'AV Equipment'], eventTypes: ['Corporate Event', 'Gala / Awards'], featuredHome: true, featuredOccasion: true, discountPercent: 0, discountCode: '' },
  { id: 'v-seed-7', name: 'City Meeting Room', type: 'Meeting space', region: 'Auckland', district: 'Auckland City', address: '', capacity: '2–20', website: '', priceFrom: '', priceTo: '', plan: 'Basic', hits: 3, hostUserId: 3, hostEmail: 'maria@studio.co.nz', hostName: 'Maria Chen', hostPhone: '021 987 6543', enquiryEmail: '', effectiveEnquiryEmail: 'maria@studio.co.nz', description: 'A compact, professional meeting room in the CBD.', isLive: false, subscriptionStatus: 'none', createdBy: 'host', photos: ['https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=900&q=80'], features: ['WiFi', 'Furniture Included'], eventTypes: ['Interview Room', 'Coworking'], featuredHome: true, featuredOccasion: true, discountPercent: 0, discountCode: '' },
];

// Caps for the two homepage venue selections managed from the admin's
// venue editor ("Homepage placement" card) — shared so the admin and the
// homepage never disagree on how many slots exist.
var VENLY_MAX_TRENDING_HOME_VENUES = 8;  // total slots in the "Trending Spaces" grid
var VENLY_MAX_OCCASION_PER_TYPE = 4;     // slots per space type in "For all occasions"

// ============================================================
// LIVE DATA CACHE — bridges "Supabase queries are async" with
// "every page in this site calls getAllVenues()/getVenlyFilters()
// synchronously, dozens of times, without awaiting anything".
//
// Rather than rewriting every call site to be async (huge, risky, and
// would need to happen everywhere at once), pages that are ready to go
// live call `await venlyBootstrap()` ONCE at the top of their init code.
// That fetches real data from Supabase into this cache. getAllVenues()/
// getVenlyFilters() then read from the cache instead of localStorage —
// but ONLY once it's actually populated.
//
// IMPORTANT: a page that never calls venlyBootstrap() behaves exactly as
// it always has (falls through to the localStorage/seed-data path below),
// even now that SUPABASE_READY is true. This is deliberate — it means
// migrating pages to Supabase one at a time can't ever break a page we
// haven't gotten to yet.
// ============================================================
var _venlyCache = { venues: null, filters: null, blog: null, venuesError: false, filtersError: false, blogError: false };

// Shows a persistent, visible banner when live data genuinely failed to
// load (Supabase connected, but the fetch itself errored — network issue,
// RLS misconfiguration, Supabase downtime, etc). Deliberately NOT used in
// demo mode, where showing placeholder content is the expected, correct
// behaviour, not an error. Safe to call more than once — only ever shows
// one banner at a time.
function venlyShowLoadError(message) {
  if (document.getElementById('venly-load-error-banner')) return;
  var banner = document.createElement('div');
  banner.id = 'venly-load-error-banner';
  banner.setAttribute('role', 'alert');
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#fdf0ef;color:#c2332a;border-bottom:1px solid #f5c4c0;padding:12px 20px;text-align:center;font-size:14px;font-family:Inter,sans-serif;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.08)';
  banner.textContent = message || "Something didn't load correctly — please refresh the page, or try again shortly.";
  document.body.insertBefore(banner, document.body.firstChild);
}

function _mapVenueFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    region: row.region,
    district: row.district,
    address: row.address,
    capacity: row.capacity,
    website: row.website,
    priceFrom: row.price_from,
    priceTo: row.price_to,
    plan: row.plan,
    hits: row.hits,
    hostUserId: row.host_user_id,
    hostEmail: row.host_email,
    hostName: row.host_name,
    hostPhone: row.host_phone,
    enquiryEmail: row.enquiry_email,
    effectiveEnquiryEmail: row.enquiry_email || row.host_email,
    description: row.description,
    isLive: row.is_live,
    subscriptionStatus: row.subscription_status,
    createdBy: row.created_by,
    photos: row.photos || [],
    features: row.features || [],
    eventTypes: row.event_types || [],
    featuredHome: row.featured_home,
    featuredOccasion: row.featured_occasion,
    discountPercent: row.discount_percent,
    discountCode: row.discount_code,
    lat: row.lat,
    lng: row.lng,
    createdAt: row.created_at,
  };
}

function _mapFiltersFromDb(row) {
  if (!row) return null;
  return {
    regions: row.regions || [],
    districtsByRegion: row.districts_by_region || {},
    amenities: row.amenities || [],
    eventsByType: row.events_by_type || {},
    blogCategories: row.blog_categories || [],
    trendingChips: row.trending_chips || [],
  };
}

// Call once, at the top of a page's init code, before anything that
// reads venues. Safe to call multiple times (re-fetches fresh data each
// time — used after every write, so the cache never goes stale) and safe
// to call in demo mode (does nothing).
async function venlyBootstrapVenues() {
  if (!SUPABASE_READY) return;
  try {
    var venuesRes = await sb.from('venues').select('*').order('created_at', { ascending: false });
    if (venuesRes.error) throw venuesRes.error;
    _venlyCache.venues = venuesRes.data.map(_mapVenueFromDb);
    _venlyCache.venuesError = false;
  } catch (e) {
    console.error('venlyBootstrapVenues failed:', e);
    _venlyCache.venuesError = true;
  }
}

async function venlyBootstrapFilters() {
  if (!SUPABASE_READY) return;
  try {
    // maybeSingle(), not single() — if the site_filters row hasn't been
    // seeded yet, this should mean "no filters configured", not "the
    // fetch failed". single() throws on zero rows; maybeSingle() just
    // returns null, which getVenlyFilters() already handles gracefully.
    var filtersRes = await sb.from('site_filters').select('*').eq('id', 1).maybeSingle();
    if (filtersRes.error) throw filtersRes.error;
    _venlyCache.filters = _mapFiltersFromDb(filtersRes.data);
    _venlyCache.filtersError = false;
  } catch (e) {
    console.error('venlyBootstrapFilters failed:', e);
    _venlyCache.filtersError = true;
  }
}

// Public-facing blog data — separate from the admin's own _adminBlogCache
// (defined locally in venly-admin.html, which includes drafts). RLS
// already restricts anon/logged-out sessions to published=true rows, so
// no extra filtering is needed here — whatever comes back is safe to show.
function _mapBlogPostFromDbPublic(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    createdAt: row.created_at,
    views: row.views || 0,
    featured: row.featured,
    img: row.cover_image || '',
    excerpt: row.excerpt || '',
    readTime: row.read_time || '4 min read',
    blocks: row.blocks || [],
  };
}

async function venlyBootstrapBlog() {
  if (!SUPABASE_READY) return;
  try {
    var res = await sb.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (res.error) throw res.error;
    _venlyCache.blog = res.data.map(_mapBlogPostFromDbPublic);
    _venlyCache.blogError = false;
  } catch (e) {
    console.error('venlyBootstrapBlog failed:', e);
    _venlyCache.blogError = true;
  }
}

// Checks whether a live fetch genuinely failed (as opposed to demo mode,
// where there's nothing to "fail" — placeholder content is expected).
// Call this after venlyReady resolves; pages use it to decide whether to
// show venlyShowLoadError() instead of rendering anything.
function venlyFetchFailed(resource) {
  return SUPABASE_READY && !!_venlyCache[resource + 'Error'];
}

// Returns real posts once bootstrapped. Returns null ONLY in demo mode,
// which is the signal callers (venly-blog.html, venly-blog-post.html,
// index.html) use to fall back to their own local demo posts array. Once
// live, this always returns an array — possibly empty, if the fetch
// failed — callers should check venlyFetchFailed('blog') to tell "genuinely
// no posts yet" apart from "the fetch errored", rather than silently
// showing demo content either way.
function getVenlyBlogPosts() {
  if (SUPABASE_READY) return _venlyCache.blog || [];
  return null;
}

// Convenience wrapper for pages that are fully migrated (read-only pages
// so far: index.html, venly-find-a-space.html, venly-venue.html) — fetches
// both in parallel. Pages migrating just one piece at a time (e.g. the
// admin, currently venues-only) should call the specific one they need
// instead, so an unmigrated feature's cache stays untouched.
async function venlyBootstrap() {
  await Promise.all([venlyBootstrapVenues(), venlyBootstrapFilters()]);
  // Sync favourites in parallel — don't block page rendering on it
  if (typeof syncFavouritesFromSupabase === 'function') {
    syncFavouritesFromSupabase(); // no await — runs in background
  }
}

// Maps a saved-venue-form object (camelCase, as used throughout the admin
// and host dashboard) to a real venues table row (snake_case). host_user_id
// is passed through as-is — the admin looks up the real profile UUID by
// matching host email before calling this, now that Users is migrated;
// callers that don't set hostUserId (e.g. anything not yet doing that
// lookup) safely fall back to null, same "will link once they sign up"
// pattern the app always intended.
function _venueToDbRow(v) {
  return {
    name: v.name,
    type: v.type,
    region: v.region,
    district: v.district,
    address: v.address,
    capacity: v.capacity,
    website: v.website,
    price_from: (v.priceFrom !== '' && v.priceFrom != null) ? Number(v.priceFrom) : null,
    price_to: (v.priceTo !== '' && v.priceTo != null) ? Number(v.priceTo) : null,
    plan: v.plan,
    host_user_id: v.hostUserId || null,
    host_email: v.hostEmail,
    host_name: v.hostName,
    host_phone: v.hostPhone,
    enquiry_email: v.enquiryEmail,
    description: v.description,
    is_live: v.isLive,
    subscription_status: v.subscriptionStatus,
    photos: v.photos || [],
    features: v.features || [],
    event_types: v.eventTypes || [],
    featured_home: !!v.featuredHome,
    featured_occasion: !!v.featuredOccasion,
    discount_percent: v.discountPercent || 0,
    discount_code: v.discountCode || '',
    lat: (v.lat !== '' && v.lat != null) ? Number(v.lat) : null,
    lng: (v.lng !== '' && v.lng != null) ? Number(v.lng) : null,
  };
}

function getAllVenues() {
  if (SUPABASE_READY) return _venlyCache.venues || []; // never fall back to demo data once live — an empty result + venuesError flag instead
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

var VENLY_PLAN_CATEGORY_BY_TYPE = { 'Event space': 'event', 'Meeting space': 'meeting', 'Shoot Location': 'shoot' };

// What Venly is actually charging this venue's host per month, right now —
// the LISTING/subscription fee (VENLY_CONFIG.plans), not the venue's own
// hourly booking rate (priceFrom/priceTo), and NOT counted at all unless
// the subscription is currently active. Accounts for any discount applied
// to this specific listing (venue.discountPercent) so a discount code
// doesn't quietly inflate revenue totals anywhere they're shown.
//
// This is the single source of truth for "monthly revenue" math — the
// admin's Overview stat, Accounts page, and anywhere else that needs this
// number should call this rather than re-deriving it, so a discount is
// never missed in one place and applied in another.
function getVenueMonthlyRevenue(venue) {
  if (!venue || venue.subscriptionStatus !== 'active') return 0;
  var catKey = VENLY_PLAN_CATEGORY_BY_TYPE[venue.type] || 'event';
  var planInfo = VENLY_CONFIG.plans[catKey] && VENLY_CONFIG.plans[catKey][venue.plan];
  var base = planInfo ? planInfo.monthly : 0;
  var discountPercent = Math.min(100, Math.max(0, Number(venue.discountPercent) || 0));
  return Math.round(base * (1 - discountPercent / 100) * 100) / 100;
}

// Bumps a venue's page view count by 1. Called once per successful page
// load of venly-venue.html for a real venue — including reloads, since
// each reload is treated as a genuine new view, same as any other page
// view counter would.
//
// LIVE MODE calls the increment_page_hits Postgres function (see
// venly-database-setup.sql) via an RPC call rather than doing a normal
// read-then-write update. That matters: if two people load the same
// venue page at almost the same moment, a plain "read the count, add 1,
// write it back" can lose one of the views (both read the same starting
// number before either write finishes). The database function increments
// the row atomically in a single step, so concurrent views are never lost.
async function incrementVenueViews(venueId) {
  if (!venueId) return;

  if (typeof SUPABASE_READY !== 'undefined' && SUPABASE_READY) {
    try {
      await sb.rpc('increment_venue_hits', { venue_id_input: venueId });
    } catch (e) {
      console.error('incrementVenueViews (live) failed:', e);
    }
    return;
  }

  // DEMO MODE: localStorage doesn't have the same concurrency risk since
  // each browser tab is its own isolated copy, so a simple read/write is fine.
  var venues = getAllVenues();
  var venue = venues.find(function(v) { return String(v.id) === String(venueId); });
  if (!venue) return;
  venue.hits = (venue.hits || 0) + 1;
  saveAllVenues(venues);

  // Also bump a month-bucketed aggregate (total venue views across ALL
  // venues, this calendar month) purely for the admin's monthly chart —
  // venue.hits above remains the source of truth for lifetime totals.
  var monthly = JSON.parse(localStorage.getItem('venly_analytics_venueviews_monthly') || '{}');
  var mk = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
  monthly[mk] = (monthly[mk] || 0) + 1;
  localStorage.setItem('venly_analytics_venueviews_monthly', JSON.stringify(monthly));
}
