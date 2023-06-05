import sparksfoundation from '../assets/covers/sparksfoundation.png'
import { Button, Card, H5, P } from "sparks-ui"
// @ts-ignore
import { connect } from "@features/channels"
import { useUser } from "@stores/user"
import { useState } from "react"

export const SparksFoundation = () => {
    const { user } = useUser(state => ({ user: state.user }))
    const [connected, setConnected] = useState(false)
    async function launch() {
        const channel = await connect({
            url: import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://sparks.foundation',
            keyPairs: user?.getKeys()
        })
        if (channel && !!user?.name) {
            setConnected(true)
            channel.on('disconnect', () => {
                console.log('what')
                setConnected(false)
            })
            channel.message({
                name: user.name
            })
        }
    }

    return (
        <Card className="p-0 max-w-sm" shade='light'>
            <img src={sparksfoundation} />
            <div className="p-4">
                <H5 className="text-center mb-2">SPARKS Foundation</H5>
                <P className="text-sm text-justify mb-4">Provides an example of personalized content experience based on your information, no login or server side data required.</P>
                <Button onClick={launch} fullWidth disabled={connected}>
                    {connected ? 'connected' : 'launch'}
                </Button>
            </div>
        </Card>
    )
}