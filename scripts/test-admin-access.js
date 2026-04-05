import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

const email = 'naravaajay@gmail.com'
const password = '9849178649Kk' // Caution: Normally we shouldn't use passwords in plain text

console.log('--- STARTING ADMIN ACCESS TEST ---')
console.log(`Connecting to: ${supabaseUrl}`)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAdmin() {
  console.log(`\n1. Attempting login as: ${email}...`)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    console.error('❌ Login Failed:', authError.message)
    return
  }

  const user = authData.user
  console.log('✅ Login Successful!')
  console.log(`   User ID: ${user.id}`)

  console.log(`\n2. Checking 'user_roles' table for 'admin' role...`)
  const { data: rolesData, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (rolesError) {
    console.error('❌ Error querying user_roles:', rolesError.message)
    return
  }

  if (rolesData) {
    console.log('✅ ADMIN ACCESS CONFIRMED in Database!')
    console.log(`   Role: ${rolesData.role}`)
  } else {
    console.log('❌ ADMIN ROLE NOT FOUND in Database.')
    console.log('   Note: Please run the SQL command provided to grant admin rights.')
  }

  console.log('\n--- TEST COMPLETE ---')
}

testAdmin()
