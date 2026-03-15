import { useState } from 'react'
import { Loader2, Github, Mail } from 'lucide-react'

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string, name: string) => Promise<void>
  onGithub: () => Promise<void>
  onGoogle: () => Promise<void>
  onResetPassword: (email: string) => Promise<void>
}

export function AuthPage({ onSignIn, onSignUp, onGithub, onGoogle, onResetPassword }: Props) {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'reset') {
        await onResetPassword(email)
        setSuccess('Password reset email sent. Check your inbox.')
      } else if (mode === 'register') {
        await onSignUp(email, password, name)
        setSuccess('Account created! Check your email to confirm.')
      } else {
        await onSignIn(email, password)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'github' | 'google') => {
    setError(null)
    try {
      if (provider === 'github') await onGithub()
      else await onGoogle()
    } catch (err: any) {
      setError(err.message || 'OAuth failed')
    }
  }

  return (
    <div className="h-screen w-screen bg-[#0d1117] flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[#007acc] to-[#0e639c] rounded-xl flex items-center justify-center shadow-lg shadow-[#007acc]/20">
            <span className="text-2xl font-bold text-white">V</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">VibeDraft.Dev</h1>
          <p className="text-[#8b949e] text-sm mt-1">AI-powered code editor</p>
        </div>

        {/* OAuth buttons */}
        {mode !== 'reset' && (
          <div className="space-y-2 mb-5">
            <button
              onClick={() => handleOAuth('github')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white text-sm font-medium rounded-lg border border-[#30363d] transition-colors"
            >
              <Github size={16} />
              Continue with GitHub
            </button>
            <button
              onClick={() => handleOAuth('google')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white text-sm font-medium rounded-lg border border-[#30363d] transition-colors"
            >
              <Mail size={16} />
              Continue with Google
            </button>
          </div>
        )}

        {mode !== 'reset' && (
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#30363d]" />
            <span className="text-[#484f58] text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#30363d]" />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              className="w-full bg-[#0d1117] text-white text-sm px-3 py-2.5 rounded-lg border border-[#30363d] focus:border-[#007acc] outline-none placeholder-[#484f58] transition-colors"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full bg-[#0d1117] text-white text-sm px-3 py-2.5 rounded-lg border border-[#30363d] focus:border-[#007acc] outline-none placeholder-[#484f58] transition-colors"
          />
          {mode !== 'reset' && (
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full bg-[#0d1117] text-white text-sm px-3 py-2.5 rounded-lg border border-[#30363d] focus:border-[#007acc] outline-none placeholder-[#484f58] transition-colors"
            />
          )}

          {error && (
            <div className="text-[#f85149] text-xs bg-[#f8514910] px-3 py-2 rounded-lg border border-[#f8514930]">
              {error}
            </div>
          )}
          {success && (
            <div className="text-[#3fb950] text-xs bg-[#3fb95010] px-3 py-2 rounded-lg border border-[#3fb95030]">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#007acc] hover:bg-[#1a8ad4] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === 'reset' ? 'Send Reset Link' : mode === 'register' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-5 text-center space-y-2">
          {mode === 'login' && (
            <>
              <button
                onClick={() => { setMode('reset'); setError(null); setSuccess(null) }}
                className="text-[#007acc] hover:text-[#1a8ad4] text-xs transition-colors"
              >
                Forgot password?
              </button>
              <p className="text-[#8b949e] text-xs">
                Don't have an account?{' '}
                <button
                  onClick={() => { setMode('register'); setError(null); setSuccess(null) }}
                  className="text-[#007acc] hover:text-[#1a8ad4] transition-colors"
                >
                  Sign up
                </button>
              </p>
            </>
          )}
          {mode === 'register' && (
            <p className="text-[#8b949e] text-xs">
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
                className="text-[#007acc] hover:text-[#1a8ad4] transition-colors"
              >
                Sign in
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <button
              onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
              className="text-[#007acc] hover:text-[#1a8ad4] text-xs transition-colors"
            >
              Back to sign in
            </button>
          )}
        </div>

        <p className="text-[#30363d] text-[10px] text-center mt-8">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  )
}
