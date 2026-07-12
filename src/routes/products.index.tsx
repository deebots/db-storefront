import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '#/server/departments'

export const Route = createFileRoute('/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts({ data: {} }),
  })

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black px-6 py-12">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">All Products</h1>
      </section>

      <section className="px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-black">
          {products?.map((product) => (
            <Link
              key={product.id}
              to="/products/$slug"
              params={{ slug: product.slug }}
              className="bg-white p-6 hover:bg-[#F9F9F9] transition-colors block border border-black"
            >
              <h3 className="text-lg font-bold uppercase tracking-tight">{product.name}</h3>
              <p className="mt-2 text-sm font-light line-clamp-2">{product.description}</p>
              <p className="mt-4 text-sm font-mono">${(product.priceCents / 100).toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
