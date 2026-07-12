import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { register, getCurrentUser } from '#/server/auth'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => getCurrentUser(),
  })

  if (user) {
    navigate({ to: '/' })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register({ data: { email, password, firstName, lastName } })
      navigate({ to: '/' })
    } catch (err: any) {
      setError(err.message || 'Registration failed.')
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="border-b border-black px-6 py-12">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">Register</h1>
      </section>

      <section className="px-6 py-8 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            required
            type="email"
            placeholder="Email"
            className="w-full border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Password (min 8 chars)"
            className="w-full border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            placeholder="First name"
            className="w-full border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            placeholder="Last name"
            className="w-full border-b border-black py-2 bg-transparent focus:outline-none font-mono text-sm"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {error && <p className="text-sm font-mono text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full px-6 py-4 bg-black text-white font-bold uppercase tracking-tight border border-black hover:bg-white hover:text-black transition-colors"
          >
            Create account.
          </button>
        </form>

        <p className="mt-8 text-sm font-mono">
          Already have an account?{' '}
          <Link to="/login" className="underline">
            Log in.
          </Link>
        </p>
      </section>
    </div>
  )
}
