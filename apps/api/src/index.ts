import { buildServer } from './server.js'

const app = await buildServer()
const port = parseInt(process.env.PORT ?? '4000', 10)

app.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
