import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// verify_jwt: true sur cette fonction fait déjà valider la signature du JWT
// par la passerelle Supabase avant que ce code s'exécute — si on est ici, le
// token est authentique. On décode donc juste son payload pour en extraire
// le "sub" (user_id), sans refaire d'appel réseau à Supabase Auth.
const getUserIdFromJwt = (jwt) => {
  const payload = jwt.split('.')[1]
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
  const claims = JSON.parse(atob(padded))
  if (!claims.sub) throw new Error('JWT payload missing sub claim')
  return claims.sub
}

const sendOneSignalPush = async (externalId, title, body, data) => {
  await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${Deno.env.get('ONESIGNAL_API_KEY')}`,
    },
    body: JSON.stringify({
      app_id: Deno.env.get('ONESIGNAL_APP_ID'),
      target_channel: 'push',
      include_aliases: { external_id: [externalId] },
      headings: title,
      contents: body,
      ...(data ? { data } : {}),
    }),
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, swipeId, messageId } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    const callerId = getUserIdFromJwt(authHeader.replace('Bearer ', ''))

    // Client admin : relit les vraies lignes en base pour dériver destinataire
    // et contenu. Le client n'envoie jamais que l'ID de la ligne qu'il vient
    // de créer — impossible de spoofer une notif vers quelqu'un d'autre.
    const admin = createClient(supabaseUrl, serviceRoleKey)

    let recipientId, title, body, pushData

    if (type === 'match' || type === 'like') {
      if (!swipeId) throw new Error('swipeId required')
      const { data: swipe, error } = await admin
        .from('swipes')
        .select('id, user_id, swiped_user_id, is_like')
        .eq('id', swipeId)
        .single()
      if (error || !swipe || !swipe.is_like) throw new Error('Invalid swipe')

      if (type === 'match') {
        // swipeId = le like que l'AUTRE m'a fait ; je dois être le swiped_user_id.
        if (swipe.swiped_user_id !== callerId) throw new Error('Not your match event')
        const { data: reciprocal } = await admin
          .from('swipes')
          .select('id')
          .eq('user_id', callerId)
          .eq('swiped_user_id', swipe.user_id)
          .eq('is_like', true)
          .maybeSingle()
        if (!reciprocal) throw new Error('Not a mutual match')

        const { data: me } = await admin.from('profiles').select('name').eq('user_id', callerId).single()
        const firstName = me?.name?.split(' ')[0] || 'Quelqu\'un'

        recipientId = swipe.user_id
        title = { fr: '🤝 Nouvelle Vibe !', en: '🤝 New Vibe!' }
        body = { fr: `${firstName} et toi avez matché`, en: `You and ${firstName} matched` }
        pushData = { type: 'match', otherUserId: callerId }
      } else {
        // swipeId = MON like ; je dois en être l'auteur.
        if (swipe.user_id !== callerId) throw new Error('Not your swipe')
        recipientId = swipe.swiped_user_id
        // Volontairement anonyme : révéler le prénom gâcherait la surprise du match.
        title = { fr: '💜 Nouveau like', en: '💜 New like' }
        body = { fr: 'Quelqu\'un vient de liker ton profil', en: 'Someone just liked your profile' }
        pushData = { type: 'like' }
      }
    } else if (type === 'message') {
      if (!messageId) throw new Error('messageId required')
      const { data: message, error } = await admin
        .from('messages')
        .select('id, sender_id, conversation_id, content')
        .eq('id', messageId)
        .single()
      if (error || !message) throw new Error('Invalid message')
      if (message.sender_id !== callerId) throw new Error('Not your message')

      const { data: conversation } = await admin
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('id', message.conversation_id)
        .single()
      if (!conversation) throw new Error('Conversation not found')
      recipientId = conversation.user1_id === callerId ? conversation.user2_id : conversation.user1_id

      const { data: sender } = await admin.from('profiles').select('name').eq('user_id', callerId).single()
      const firstName = sender?.name?.split(' ')[0] || 'Quelqu\'un'
      const preview = message.content.length > 80 ? message.content.slice(0, 80) + '…' : message.content

      title = { fr: firstName, en: firstName }
      body = { fr: preview, en: preview }
      pushData = { type: 'message', otherUserId: callerId, conversationId: message.conversation_id }
    } else {
      throw new Error('Unknown type')
    }

    if (recipientId === callerId) {
      return new Response(JSON.stringify({ success: true, skipped: 'self' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    await sendOneSignalPush(recipientId, title, body, pushData)

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('send-push error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
