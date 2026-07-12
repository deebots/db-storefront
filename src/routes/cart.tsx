import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getCart, updateCartItem, removeCartItem } from '#/server/cart'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const { data: cart, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: () => getCart(),
  })

  const handleUpdate = async (id: number, qty: number) => {
    await updateCartItem({ data: { id, quantity: qty } })
    refetch()
  }

  const handleRemove = async (id: number) => {
    await removeCartItem({ data: { id } })
    refetch()
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black px-6 py-12">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">Cart</h1>
      </section>

      <section className="px-6 py-8">
        {cart?.items.length === 0 ? (
          <div className="border border-black p-8">
            <p className="text-lg font-light">Nothing in the cart. Yet.</p>
            <Link to="/products" className="mt-4 inline-block underline font-mono text-sm">
              Browse products.
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cart?.items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-black p-4 items-center">
                <div>
                  <p className="font-bold uppercase tracking-tight">{item.variant?.sku}</p>
                  <p className="text-sm font-mono text-gray-500">
                    {Object.entries(item.variant?.optionValues ?? {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity - 1)}
                    className="px-3 py-1 border border-black font-mono hover:bg-black hover:text-white"
                  >
                    -
                  </button>
                  <span className="font-mono px-2">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity + 1)}
                    className="px-3 py-1 border border-black font-mono hover:bg-black hover:text-white"
                  >
                    +
                  </button>
                </div>
                <p className="font-mono">${((item.variant?.priceCents ?? 0) * item.quantity / 100).toFixed(2)}</p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-sm underline font-mono text-left md:text-right hover:no-underline"
                >
                  Remove.
                </button>
              </div>
            ))}

            <div className="border-t border-black pt-4 flex items-center justify-between">
              <p className="text-sm font-mono">Subtotal</p>
              <p className="text-2xl font-bold font-mono">${(cart?.totalCents ?? 0 / 100).toFixed(2)}</p>
            </div>

            <Link
              to="/checkout"
              className="block w-full px-6 py-4 text-center bg-black text-white font-bold uppercase tracking-tight border border-black hover:bg-white hover:text-black transition-colors"
            >
              Checkout.
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
