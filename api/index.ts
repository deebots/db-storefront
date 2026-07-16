import type { IncomingMessage, ServerResponse } from 'node:http'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const { default: server } = await import('../dist/server/server.js')

  const url = new URL(req.url || '/', `https://${req.headers.host}`)
  const request = new Request(url, {
    method: req.method,
    headers: new Headers(req.headers as any),
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
  })

  const response = await server.fetch(request)

  res.statusCode = response.status
  res.statusMessage = response.statusText
  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })

  const body = await response.arrayBuffer()
  res.end(Buffer.from(body))
}
