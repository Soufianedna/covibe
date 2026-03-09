import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, email, name } = await req.json()
    
    // Créer le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Générer un token unique
    const token = crypto.randomUUID()
    
    // Enregistrer le token (expire dans 24h)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)
    
    await supabase.from('verification_tokens').insert({
      user_id: userId,
      token: token,
      expires_at: expiresAt.toISOString()
    })

    // Envoyer l'email via Resend
    const verificationUrl = `${Deno.env.get('APP_URL') || 'http://localhost:3000'}/verify?token=${token}`
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
      },
      body: JSON.stringify({
        from: 'CoVibe <noreply@covibe.ca>',
        to: [email],
        subject: '✓ Vérifiez votre profil CoVibe',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ec4899;">🏠 CoVibe</h1>
            <h2>Salut ${name} !</h2>
            <p>Clique sur le bouton ci-dessous pour vérifier ton profil et obtenir le badge vérifié ✓</p>
            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(to right, #ec4899, #a855f7); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0;">
              ✓ Vérifier mon profil
            </a>
cat > supabase/functions/send-verification-email/index.ts << 'EOF'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, email, name } = await req.json()
    
    // Créer le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Générer un token unique
    const token = crypto.randomUUID()
    
    // Enregistrer le token (expire dans 24h)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)
    
    await supabase.from('verification_tokens').insert({
      user_id: userId,
      token: token,
      expires_at: expiresAt.toISOString()
    })

    // Envoyer l'email via Resend
    const verificationUrl = `${Deno.env.get('APP_URL') || 'http://localhost:3000'}/verify?token=${token}`
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
      },
      body: JSON.stringify({
        from: 'CoVibe <noreply@covibe.ca>',
        to: [email],
        subject: '✓ Vérifiez votre profil CoVibe',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ec4899;">🏠 CoVibe</h1>
            <h2>Salut ${name} !</h2>
            <p>Clique sur le bouton ci-dessous pour vérifier ton profil et obtenir le badge vérifié ✓</p>
            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(to right, #ec4899, #a855f7); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0;">
              ✓ Vérifier mon profil
            </a>
            <p style="color: #666; font-size: 14px;">Ce lien expire dans 24 heures.</p>
            <p style="color: #666; font-size: 12px;">Si tu n'as pas demandé cette vérification, ignore cet email.</p>
          </div>
        `
      })
    })

    const data = await res.json()

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
