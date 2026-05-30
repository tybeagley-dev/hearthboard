import webpush from 'web-push'

const keys = webpush.generateVAPIDKeys()
console.log(`
VAPID keys generated — add these to your Railway API env vars and api/.env:

VAPID_PUBLIC_KEY=${keys.publicKey}
VAPID_PRIVATE_KEY=${keys.privateKey}

Also add the public key to the dashboard's Railway env vars and apps/dashboard/.env:

VITE_VAPID_PUBLIC_KEY=${keys.publicKey}
`)
