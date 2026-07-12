import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCart } from '#/server/cart'
import { createOrderFromCart } from '#/server/orders'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

function CheckoutPage() {
  const navigate = useNavigate()
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => getCart(),
  })

  const [shipping, setShipping] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })
  const [billing, setBilling] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [loading, setLoading] = useState(false)

  if (cart?.items.length === 0) {
    return (
      <div className="min-h-screen bg-white text-black px-6 py-12">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">Checkout</h1>
        <p className="mt-4 text-lg font-light">Nothing to checkout. Cart is empty.</p>
        <Link to="/products" className="mt-4 inline-block underline font-mono text-sm">
          Browse products.
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const billingAddr = sameAsShipping ? shipping : billing
      await createOrderFromCart({
        data: {
          shippingAddress: shipping,
          billingAddress: billingAddr,
        },
      })
      // Stripe.js integration would happen here with result.clientSecret
      // For now, we redirect to orders
      navigate({ to: '/orders' })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black px-6 py-12">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">Checkout</h1>
      </section>

      <section className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-tight">Order Summary</h2>
          {cart?.items.map((item) => (
            <div key={item.id} className="border border-black p-4 flex justify-between items-center">
              <div>
                <p className="font-bold uppercase tracking-tight">{item.variant?.sku}</p>
                <p className="text-sm font-mono">Qty: {item.quantity}</p>
              </div>
              <p className="font-mono">${((item.variant?.priceCents ?? 0) * item.quantity / 100).toFixed(2)}</p>
            </div>
          ))}
          <div className="border-t border-black pt-4 flex justify-between">
            <p className="font-bold uppercase tracking-tight">Total</p>
            <p className="text-2xl font-bold font-mono">${(cart?.totalCents ?? 0 / 100).toFixed(2)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-tight">Shipping</h2>
          <div className="grid grid-cols-1 gap-4">
            <input
              required
              placeholder="Address line 1"
              className="border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
              value={shipping.line1}
              onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
            />
            <input
              placeholder="Address line 2"
              className="border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
              value={shipping.line2}
              onChange={(e) => setShipping({ ...shipping, line2: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="City"
                className="border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
              />
              <input
                required
                placeholder="State"
                className="border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
                value={shipping.state}
                onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="ZIP"
                className="border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
                value={shipping.zip}
                onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
              />
              <input
                required
                placeholder="Country"
                className="border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
                value={shipping.country}
                onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-mono">
            <input
              type="checkbox"
              checked={sameAsShipping}
              onChange={(e) => setSameAsShipping(e.target.checked)}
              className="border border-black"
            />
            Billing same as shipping.
          </label>

          {!sameAsShipping && (
            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-sm font-bold uppercase tracking-tight">Billing Address</h3>
              <input
                required
                placeholder="Address line 1"
                className="border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
                value={billing.line1}
                onChange={(e) => setBilling({ ...billing, line1: e.target.value })}
              />
              <input
                placeholder="Address line 2"
                className="border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
                value={billing.line2}
                onChange={(e) => setBilling({ ...billing, line2: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  placeholder="City"
                  className="border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
                  value={billing.city}
                  onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                />
                <input
                  required
                  placeholder="State"
                  className="border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
                  value={billing.state}
                  onChange={(e) => setBilling({ ...billing, state: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  placeholder="ZIP"
                  className="border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
                  value={billing.zip}
                  onChange={(e) => setBilling({ ...billing, zip: e.target.value })}
                />
                <input
                  required
                  placeholder="Country"
                  className="border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
                  value={billing.country}
                  onChange={(e) => setBilling({ ...billing, country: e.target.value })}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-black text-white font-bold uppercase tracking-tight border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Place order.'}
          </button>
        </form>
      </section>
    </div>
  )
}
