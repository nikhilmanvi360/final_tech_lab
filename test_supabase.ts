import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing connection to:", supabaseUrl);
  const { data, error } = await supabase.from('teams').select('count');
  if (error) {
    console.error("Connection failed:", error.message);
  } else {
    console.log("Connection successful! Teams count:", data);
  }
}

test();
