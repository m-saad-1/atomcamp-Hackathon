const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://akutoptczoqtnyalyqxb.supabase.co',
  'sb_publishable_MkqBwd3BBVaNkFsJTuS3SA_he974SwH'
);

async function main() {
  const { data: users } = await supabase.from('users').select('*');
  console.log('Users:', users?.length);
  console.log(users);

  const { data: sessions } = await supabase.from('sessions').select('*');
  console.log('Sessions:', sessions?.length);

  const { data: emails } = await supabase.from('emails').select('*');
  console.log('Emails:', emails?.length);
  if (emails && emails.length > 0) {
    console.log(emails[0]);
  }
}

main().catch(console.error);
