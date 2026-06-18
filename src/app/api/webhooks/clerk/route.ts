import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClerkClient } from '@clerk/backend'
import { isDisposableEmail } from '@/lib/email-security'
import { fetchMutation } from 'convex/nextjs'
import { api } from '../../../../../convex/_generated/api'

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, primary_email_address_id } = evt.data
    
    // Find the primary email
    const primaryEmailObj = email_addresses.find(e => e.id === primary_email_address_id)
    const email = primaryEmailObj ? primaryEmailObj.email_address : (email_addresses[0]?.email_address || "")
    
    if (email && isDisposableEmail(email)) {
      console.log(`Disposable email detected: ${email}. Deleting user ${id}.`);
      
      const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      
      try {
        // Log the security event in Convex
        await fetchMutation(api.security.logSecurityEvent, {
          userId: id,
          email: email,
          eventType: "Disposable Email Attempt",
          severity: "High",
          ipAddress: headerPayload.get("x-forwarded-for") || undefined,
        });

        // Delete the user from Clerk
        await clerkClient.users.deleteUser(id);
        
        return new Response('User deleted due to disposable email', { status: 200 })
      } catch (error) {
        console.error('Failed to process disposable email deletion:', error);
        return new Response('Failed to delete user', { status: 500 })
      }
    } else {
      // If not disposable, log Account Created event
      try {
        await fetchMutation(api.analytics.logEvent, {
          clerkId: id,
          eventType: "Account Created",
        });
      } catch (error) {
        console.error('Failed to process user.created event:', error);
      }
    }
  }

  return new Response('', { status: 200 })
}
