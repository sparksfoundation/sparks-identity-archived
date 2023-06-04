import { Channel } from './channel'

export async function connect({ url, keyPairs }) {
    return new Promise((resolve, reject) => {
        const origin = new URL(url).origin
        const target = window.open(url, origin)
        const interval = setInterval(() => {
            target.postMessage({
                type: 'connect',
                publicKeys: {
                    signing: keyPairs.signing.publicKey,
                    encryption: keyPairs.encryption.publicKey,
                }
            }, origin)
        }, 1000)

        const handler = (event) => {
            if (event.origin !== origin) return
            if (event.data.type !== 'connected') return
            if (!event.data.publicKeys) return 
            clearInterval(interval)
            window.removeEventListener('message', handler)
            resolve(new Channel({
                target,
                origin,
                keyPairs,
                publicKeys: event.data.publicKeys,
            }))
        }
        window.addEventListener('message', handler)
    })
}

export async function accept({ url, keyPairs }) {
    return new Promise((resolve, reject) => {
        const origin = new URL(url).origin

        const handler = (event) => {
            if (event.data.type !== 'connect') return
            if (event.origin !== origin) return
            if (!event.data.publicKeys) return 
            event.source.postMessage({
                type: 'connected',
                publicKeys: {
                    signing: keyPairs.signing.publicKey,
                    encryption: keyPairs.encryption.publicKey,
                }
            }, event.origin)
            resolve(new Channel({
                target: window.opener,
                origin: event.origin,
                keyPairs,
                publicKeys: event.data.publicKeys,
            }))
            window.removeEventListener('message', handler)
        }
        window.addEventListener('message', handler)
    })
}