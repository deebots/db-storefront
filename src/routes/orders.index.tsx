import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getOrders } from '#/server/orders'

export const Route = createFileRoute('/orders/')({
  component: OrdersPage,
})

function OrdersPage() {
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders(),
  })

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black px-6 py-12">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">Orders</h1>
      </section>

      <section className="px-6 py-8">
        {orders?.length === 0 ? (
          <div className="border border-black p-8">
            <p className="text-lg font-light">No orders yet.</p>
            <Link to="/products" className="mt-4 inline-block underline font-mono text-sm">
              Browse products.
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.map((order) => (
              <Link
                key={order.id}
                to="/orders/$id"
                params={{ id: String(order.id) }}
                className="block border border-black p-6 hover:bg-[#F9F9F9] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono">Order #{order.id}</p>
                    <p className="text-xs font-mono uppercase mt-1">{order.status}</p>
                  </div>
                  <p className="text-xl font-bold font-mono">${(order.totalCents / 100).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
