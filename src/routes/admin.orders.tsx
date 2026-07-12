import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { adminListOrders } from '#/server/admin'

export const Route = createFileRoute('/admin/orders')({
  component: AdminOrdersPage,
})

function AdminOrdersPage() {
  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminListOrders({ data: {} }),
  })

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black px-6 py-12">
        <Link to="/admin" className="text-sm font-mono underline">Back to admin.</Link>
        <h1 className="text-4xl font-extrabold uppercase tracking-tight mt-4">All Orders</h1>
      </section>

      <section className="px-6 py-8">
        <div className="space-y-2">
          {orders?.map((order) => (
            <div key={order.id} className="border border-black p-4 flex justify-between items-center">
              <p className="font-mono text-sm">Order #{order.id}</p>
              <p className="text-xs font-mono uppercase">{order.status}</p>
              <p className="font-bold font-mono">${(order.totalCents / 100).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
