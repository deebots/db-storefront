import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { adminListOrders, adminGetSalesMetrics } from '#/server/admin'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminListOrders({ data: {} }),
  })
  const { data: metrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => adminGetSalesMetrics(),
  })

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black px-6 py-12">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">Admin</h1>
      </section>

      <section className="px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-black p-6">
          <p className="text-sm font-mono">Revenue</p>
          <p className="text-2xl font-bold font-mono">${((metrics?.totalRevenueCents ?? 0) / 100).toFixed(2)}</p>
        </div>
        <div className="border border-black p-6">
          <p className="text-sm font-mono">Orders</p>
          <p className="text-2xl font-bold font-mono">{metrics?.totalOrders ?? 0}</p>
        </div>
        <div className="border border-black p-6">
          <p className="text-sm font-mono">AOV</p>
          <p className="text-2xl font-bold font-mono">${((metrics?.averageOrderCents ?? 0) / 100).toFixed(2)}</p>
        </div>
      </section>

      <section className="px-6 py-8">
        <h2 className="text-xl font-bold uppercase tracking-tight mb-4">Recent Orders</h2>
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
