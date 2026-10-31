const { createClient } = require('@supabase/supabase-js');
const ApiError = require('../utils/ApiError');

let supabase;

// This client is used only to validate the access token supplied by Supabase
// after Google OAuth. It does not persist a server-side browser session.
const getSupabase = () => {
  if (supabase) return supabase;

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new ApiError(
      500,
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY on the server.'
    );
  }

  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return supabase;
};

module.exports = getSupabase;
