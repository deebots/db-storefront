import { HeadContent, Scripts, createRootRoute, Link } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useQuery } from '@tanstack/react-query'

import appCss from '../styles.css?url'
import { getCurrentUser, logout } from '#/server/auth'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Down Low General Store',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-white text-black">
        <Nav />
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function Nav() {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => getCurrentUser(),
  })

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-black px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-extrabold uppercase tracking-tight">
        DL
      </Link>
      <div className="flex items-center gap-6 text-sm font-mono">
        <Link to="/products" className="hover:underline">Products</Link>
        <Link to="/cart" className="hover:underline">Cart</Link>
        {user ? (
          <>
            <Link to="/orders" className="hover:underline">Orders</Link>
            <button
              onClick={async () => { await logout(); window.location.reload() }}
              className="hover:underline"
            >
              Log out.
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Log in</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}
