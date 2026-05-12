import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jaqplaqccfbppmwztqaq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphcXBsYXFjY2ZicHBtd3p0cWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTk1NTksImV4cCI6MjA5NDA3NTU1OX0.WHDO5n6ConCuYp1NEtuZwIogO3c9xu9NmpwlFAPC3BA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);