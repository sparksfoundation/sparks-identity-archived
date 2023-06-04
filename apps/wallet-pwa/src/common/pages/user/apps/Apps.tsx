import * as services from '@features/user/apps';

export const Apps = () => {
  return (
    <div>
      {Object.keys(services).map(key => {
        const Component = services[key as keyof typeof services]
        return <Component key={`app_${key}`} />
      })}
    </div>
  )
}