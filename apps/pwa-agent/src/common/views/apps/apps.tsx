// @ts-ignore 
import { CockPit } from "@components/layout/cockpit";
import * as services from '@features/apps';

export const Apps = () => {
    return (
        <CockPit>
            {Object.keys(services).map(key => {
                const Component = services[key as keyof typeof services]
                return <Component key={`app_${key}`} />
            })}
        </CockPit>
    )
}