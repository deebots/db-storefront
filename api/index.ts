import type { IncomingMessage, ServerResponse } from 'node:http'
import { Readable } from 'node:stream'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import serverModule from '../dist/server/server.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const { default: server } = serverModule as { default: { fetch: (request: Request) => Promise<Response> } }

  const url = new URL(req.url || '/', `https://${req.headers.host}`)
  const request = new Request(url, {
    method: req.method,
    headers: new Headers(req.headers as any),
    body: req.method !== 'GET' && req.method !== 'HEAD' ? Readable.toWeb(req) as any : undefined,
  })

  const response = await server.fetch(request)

  res.statusCode = response.status
  res.statusMessage = response.statusText
  response.headers.forEach((value: string, key: string) => {
    res.setHeader(key, value)
  })

  const body = await response.arrayBuffer()
  res.end(Buffer.from(body))
}
