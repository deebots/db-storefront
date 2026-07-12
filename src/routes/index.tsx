import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black px-6 py-16">
        <h1 className="text-5xl font-extrabold uppercase tracking-tight leading-none">
          DOWN LOW GENERAL STORE
        </h1>
        <p className="mt-4 text-lg font-light max-w-xl">
          High design, low fuss. Monochromatic essentials for cool families.
        </p>
      </section>

      <section className="px-6 py-12">
        <h2 className="text-2xl font-bold uppercase tracking-tight mb-8">
          Departments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black">
          <Link
            to="/departments/$slug"
            params={{ slug: 'apparel' }}
            className="bg-white p-8 hover:bg-[#F9F9F9] transition-colors block border border-black"
          >
            <h3 className="text-xl font-bold uppercase tracking-tight">Apparel</h3>
            <p className="mt-2 text-sm font-light">Unstructured hats, heavyweight ribbed socks, and cotton essentials.</p>
          </Link>
          <Link
            to="/departments/$slug"
            params={{ slug: 'paper-goods' }}
            className="bg-white p-8 hover:bg-[#F9F9F9] transition-colors block border border-black"
          >
            <h3 className="text-xl font-bold uppercase tracking-tight">Paper Goods</h3>
            <p className="mt-2 text-sm font-light">Thick matte covers, heavy linework, and utilitarian stationery.</p>
          </Link>
          <Link
            to="/departments/$slug"
            params={{ slug: 'celebrations' }}
            className="bg-white p-8 hover:bg-[#F9F9F9] transition-colors block border border-black"
          >
            <h3 className="text-xl font-bold uppercase tracking-tight">Celebrations</h3>
            <p className="mt-2 text-sm font-light">Loot bags, bold stickers, and curated gifts for cool families.</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
