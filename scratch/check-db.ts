import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://akutoptczoqtnyalyqxb.supabase.co',
  'sb_publishable_MkqBwd3BBVaNkFsJTuS3SA_he974SwH' // Service role key from env
);

async function main() {
  const { data: users } = await supabase.from('users').select('*');
  console.log('Users:', users);

  const { data: sessions } = await supabase.from('sessions').select('*');
  console.log('Sessions:', sessions);

  const { data: emails } = await supabase.from('emails').select('*');
  console.log('Emails:', emails);
}

main().catch(console.error);
