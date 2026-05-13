import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const teams = [
  { name: "Alpha Squad", password: "alpha123" },
  { name: "Beta Division", password: "beta456" },
  { name: "Gamma Unit", password: "gamma789" },
  { name: "Delta Force", password: "delta000" },
  { name: "Epsilon Group", password: "epsilon111" }
];

async function seed() {
  console.log("Seeding 5 test teams...");
  
  for (const team of teams) {
    const hashedPassword = bcrypt.hashSync(team.password, 10);
    const { data, error } = await supabase.from('teams').insert([
      { 
        name: team.name, 
        password: hashedPassword, 
        role: 'detective', 
        score: 0, 
        is_disabled: false 
      }
    ]).select();

    if (error) {
      console.error(`Failed to create ${team.name}:`, error.message);
    } else {
      console.log(`Created team: ${team.name} (Password: ${team.password})`);
    }
  }
  
  console.log("Seeding complete.");
}

seed();
