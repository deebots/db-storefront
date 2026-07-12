import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getDepartmentBySlug, getDepartmentProducts } from '#/server/departments'

export const Route = createFileRoute('/departments/$slug')({
  component: DepartmentPage,
  loader: async ({ params }) => {
    const { department, categories } = await getDepartmentBySlug({ data: { slug: params.slug } })
    return { department, categories }
  },
})

function DepartmentPage() {
  const { department, categories } = Route.useLoaderData()
  const slug = Route.useParams().slug

  const { data: products } = useQuery({
    queryKey: ['department-products', slug],
    queryFn: () => getDepartmentProducts({ data: { slug } }),
  })

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black px-6 py-12">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">{department.name}</h1>
        <p className="mt-4 text-lg font-light max-w-2xl">{department.description}</p>
      </section>

      <section className="px-6 py-8">
        <div className="flex flex-wrap gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to="/departments/$slug"
              params={{ slug }}
              search={{ category: cat.slug }}
              className="px-4 py-2 border border-black text-sm font-bold uppercase tracking-tight hover:bg-black hover:text-white transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 py-8 border-t border-black">
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
