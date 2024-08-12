const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://cqhlafryyzzodifbdmia.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxaGxhZnJ5eXp6b2RpZmJkbWlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTYxMDA5MSwiZXhwIjoyMDM3MTg2MDkxfQ.XScCWnhDi-lXqIgAJuAFTWaNJpz13jejpyPBXD67TS8";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = {
  supabase,
  SUPABASE_URL,
};
