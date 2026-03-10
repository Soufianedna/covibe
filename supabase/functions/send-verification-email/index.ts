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
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)
    
    await supabase.from('verification_tokens').insert({
      user_id: userId,
      token: token,
      expires_at: expiresAt.toISOString()
    })

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
        subject: '✓ Vérifiez votre profil CoVibe / Verify your CoVibe profile',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://fancezjfhskefiljhdsz.supabase.co/storage/v1/object/public/assets/logo-email.svg" width="40" height="40" style="vertical-align:middle; margin-right:8px;">
              <span style="color: #7c3aed; font-size: 28px; font-weight: 900; vertical-align: middle;">CoVibe</span>
            </div>
            <h2 style="color: #1e1b4b; text-align: center;">Salut ${name} ! 👋</h2>
            <div style="background: #f8f7ff; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px 0; color: #374151; line-height: 1.6;">
                <strong>🇫🇷</strong> Clique sur le bouton ci-dessous pour vérifier ton profil et obtenir le badge vérifié ✓
              </p>
              <p style="margin: 0; color: #374151; line-height: 1.6;">
                <strong>🇬🇧</strong> Click the button below to verify your profile and get the verified badge ✓
              </p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(to right, #7c3aed, #4f46e5); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">✓ Vérifier mon profil / Verify my profile</a>
            </div>
            <p style="color: #94a3b8; text-align: center; font-size: 14px;">
              🇫🇷 Ce lien expire dans 24 heures. Si tu n'as pas demandé cette vérification, ignore cet email.<br><br>
              🇬🇧 This link expires in 24 hours. If you didn't request this verification, ignore this email.
            </p>
            <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e9d5ff;">
              <p style="color: #7c3aed; margin: 0; font-weight: bold;">— The CoVibe Team / L'équipe CoVibe</p>
            </div>
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
