import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
// import { useQuery } from '@tanstack/react-query'
import { getProductBySlug } from '#/server/departments'
import { addCartItem } from '#/server/cart'

export const Route = createFileRoute('/products/$slug')({
  component: ProductDetailPage,
  loader: async ({ params }) => {
    const product = await getProductBySlug({ data: { slug: params.slug } })
    return { product }
  },
})

function ProductDetailPage() {
  const { product } = Route.useLoaderData()
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    product.variants[0]?.id ?? null
  )
  const [added, setAdded] = useState(false)

  const handleAdd = async () => {
    if (!selectedVariantId) return
    await addCartItem({ data: { productVariantId: selectedVariantId, quantity: 1 } })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black px-6 py-12">
        <Link to="/products" className="text-sm font-mono underline">
          All Products
        </Link>
        <h1 className="text-4xl font-extrabold uppercase tracking-tight mt-4">
          {product.name}
        </h1>
      </section>

      <section className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-black p-8 bg-[#F9F9F9]">
          <p className="text-sm font-mono text-gray-500">{product.sku}</p>
          <p className="mt-4 text-lg font-light">{product.description}</p>
          <p className="mt-8 text-2xl font-bold font-mono">
            ${(product.priceCents / 100).toFixed(2)}
          </p>
        </div>

        <div className="space-y-6">
          {product.variants.length > 1 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight mb-4">Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`px-4 py-2 border border-black text-sm font-mono uppercase ${
                      selectedVariantId === variant.id
                        ? 'bg-black text-white'
                        : 'bg-white hover:bg-[#F9F9F9]'
                    }`}
                  >
                    {Object.entries(variant.optionValues).map(([k, v]) => `${k}: ${v}`).join(', ') || variant.sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!selectedVariantId}
            className="w-full px-6 py-4 bg-black text-white font-bold uppercase tracking-tight border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            {added ? 'Added to cart.' : 'Add to cart.'}
          </button>

          <Link
            to="/cart"
            className="block w-full px-6 py-4 text-center border border-black font-bold uppercase tracking-tight hover:bg-black hover:text-white transition-colors"
          >
            View cart.
          </Link>
        </div>
      </section>
    </div>
  )
}
