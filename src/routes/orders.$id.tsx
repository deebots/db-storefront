import { createFileRoute, Link } from '@tanstack/react-router'
// import { useQuery } from '@tanstack/react-query'
import { getOrderById } from '#/server/orders'

export const Route = createFileRoute('/orders/$id')({
  component: OrderDetailPage,
  loader: async ({ params }) => {
    const order = await getOrderById({ data: { id: Number(params.id) } })
    return { order }
  },
})

function OrderDetailPage() {
  const { order } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black px-6 py-12">
        <Link to="/orders" className="text-sm font-mono underline">Back to orders.</Link>
        <h1 className="text-4xl font-extrabold uppercase tracking-tight mt-4">Order #{order.id}</h1>
        <p className="text-sm font-mono uppercase mt-2">{order.status}</p>
      </section>

      <section className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-tight">Items</h2>
          {order.items.map((item) => (
            <div key={item.id} className="border border-black p-4 flex justify-between items-center">
              <div>
                <p className="font-bold uppercase tracking-tight">{item.variant?.sku}</p>
                <p className="text-sm font-mono">Qty: {item.quantity}</p>
              </div>
              <p className="font-mono">${((item.priceCents ?? 0) * item.quantity / 100).toFixed(2)}</p>
            </div>
          ))}
          <div className="border-t border-black pt-4 flex justify-between">
            <p className="font-bold uppercase tracking-tight">Total</p>
            <p className="text-2xl font-bold font-mono">${(order.totalCents / 100).toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-tight">Shipping</h2>
          <div className="border border-black p-4 font-mono text-sm space-y-1">
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
