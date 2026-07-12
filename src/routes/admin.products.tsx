import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '#/server/departments'
import { adminCreateProduct } from '#/server/admin'
import { useState } from 'react'

export const Route = createFileRoute('/admin/products')({
  component: AdminProductsPage,
})

function AdminProductsPage() {
  const { data: products, refetch } = useQuery({
    queryKey: ['products', { limit: 100 }],
    queryFn: () => getProducts({ data: { limit: 100 } }),
  })

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState('')
  const [deptId, setDeptId] = useState('1')

  const handleCreate = async () => {
    await adminCreateProduct({
      data: {
        departmentId: Number(deptId),
        slug,
        name,
        priceCents: Number(price) * 100,
        status: 'draft',
      }
    })
    setName('')
    setSlug('')
    setPrice('')
    refetch()
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black px-6 py-12">
        <Link to="/admin" className="text-sm font-mono underline">Back to admin.</Link>
        <h1 className="text-4xl font-extrabold uppercase tracking-tight mt-4">Products</h1>
      </section>

      <section className="px-6 py-8 space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-tight">Create Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input placeholder="Name" className="border-b border-black py-2 font-mono text-sm" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Slug" className="border-b border-black py-2 font-mono text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <input placeholder="Price (USD)" type="number" className="border-b border-black py-2 font-mono text-sm" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input placeholder="Dept ID" type="number" className="border-b border-black py-2 font-mono text-sm" value={deptId} onChange={(e) => setDeptId(e.target.value)} />
        </div>
        <button onClick={handleCreate} className="px-6 py-3 bg-black text-white font-bold uppercase tracking-tight border border-black hover:bg-white hover:text-black transition-colors">
          Create.
        </button>
      </section>

      <section className="px-6 py-8 border-t border-black">
        <div className="space-y-2">
          {products?.map((product) => (
            <div key={product.id} className="border border-black p-4 flex justify-between items-center">
              <p className="font-bold uppercase tracking-tight">{product.name}</p>
              <p className="text-sm font-mono">{product.status}</p>
              <p className="font-mono">${(product.priceCents / 100).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
