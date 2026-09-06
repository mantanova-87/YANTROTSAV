import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  AtSign,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { DEPARTMENT_OPTIONS } from '../../types/database.types'

export default function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal, login, registerStudent } =
    useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [branch, setBranch] = useState('')
  const [customDepartment, setCustomDepartment] = useState('')
  const [semester, setSemester] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)
  const [countdown, setCountdown] = useState(2)

  useEffect(() => {
    if (regSuccess) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
        return () => clearTimeout(timer)
      } else {
        setRegSuccess(false)
        closeAuthModal()
      }
    }
  }, [regSuccess, countdown, closeAuthModal])

  if (!authModalOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (authModalMode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.')
        }
        await login(email.trim(), password)
      } else {
        if (!name.trim() || !email.trim() || !password) {
          throw new Error('Name, email, and password are required.')
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.')
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please verify your confirm password.')
        }
        if (!rollNo.trim()) {
          throw new Error('Student Roll Number is required.')
        }
        if (branch === 'OTHER' && !customDepartment.trim()) {
          throw new Error('Please specify your custom department name.')
        }
        await registerStudent({
          fullName: name.trim(),
          username: username.trim() || undefined,
          email: email.trim(),
          password,
          phone: phone.trim(),
          rollNumber: rollNo.trim(),
          department: branch.trim(),
          customDepartment: branch === 'OTHER' ? customDepartment.trim() : undefined,
          semester: semester.trim(),
        })
        setPassword('')
        setConfirmPassword('')
        setCountdown(2)
        setRegSuccess(true)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message
        if (msg.toLowerCase().includes('roll') || msg.toLowerCase().includes('idx_rollnumber')) {
          setError('A student with this Roll Number is already registered.')
        } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('user_already_exists')) {
          setError('An account with this email address already exists.')
        } else {
          setError(msg)
        }
      } else {
        setError('Authentication failed. Please check credentials.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md overflow-hidden border border-white/10 bg-[#080A0F] shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
        >
          {/* Cyber accents */}
          <div className="pointer-events-none absolute inset-0">
            <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#00E5FF]" />
            <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#FF6B00]" />
            <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#FF6B00]" />
            <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#00E5FF]" />
            <div className="h-0.5 w-full bg-gradient-to-r from-[#00E5FF] via-white/20 to-[#FF6B00]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#00E5FF]">
                [AUTH // PROTOCOL]
              </span>
              <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-white">
                {authModalMode === 'login' ? 'Student Sign In' : 'Create Identity Pass'}
              </h2>
            </div>

            <button
              onClick={closeAuthModal}
              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab switch */}
          <div className="grid grid-cols-2 border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.18em]">
            <button
              type="button"
              onClick={() => {
                openAuthModal('login')
                setError(null)
              }}
              className={`py-3 text-center transition-colors ${
                authModalMode === 'login'
                  ? 'border-b-2 border-[#00E5FF] bg-white/[0.03] font-bold text-[#00E5FF]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                openAuthModal('register')
                setError(null)
              }}
              className={`py-3 text-center transition-colors ${
                authModalMode === 'register'
                  ? 'border-b-2 border-[#FF6B00] bg-white/[0.03] font-bold text-[#FF6B00]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <div className="max-h-[75vh] overflow-y-auto p-6">
            {regSuccess ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-950/20 text-emerald-400">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="mt-4 text-xl font-black uppercase tracking-tight text-white">
                  Registration Successful!
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Welcome, <strong className="text-white">{name || email}</strong>. Your account has been registered.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/30 px-4 py-2 font-mono text-xs text-emerald-300">
                  <Loader2 size={13} className="animate-spin text-emerald-400" />
                  <span>Entering portal in <strong className="text-white">{countdown}</strong>s...</span>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setRegSuccess(false)
                      closeAuthModal()
                    }}
                    className="flex w-full items-center justify-center gap-2 border border-[#00E5FF] bg-[#00E5FF] py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-black transition-all hover:bg-transparent hover:text-[#00E5FF]"
                  >
                    <span>Continue to Portal</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 flex items-center gap-3 border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-400">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
              {authModalMode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                        Full Name *
                      </label>
                      <div className="relative mt-1">
                        <User size={15} className="absolute left-3.5 top-3 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full border border-white/10 bg-[#050816] py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#00E5FF]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                        Username
                      </label>
                      <div className="relative mt-1">
                        <AtSign size={15} className="absolute left-3.5 top-3 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Choose a username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full border border-white/10 bg-[#050816] py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#00E5FF]"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  Email Address *
                </label>
                <div className="relative mt-1">
                  <Mail size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="enrno.dep@cujammu.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-white/10 bg-[#050816] py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  Password *
                </label>
                <div className="relative mt-1">
                  <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-white/10 bg-[#050816] py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#00E5FF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-[#00E5FF] transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {authModalMode === 'register' && (
                <>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                      Confirm Password *
                    </label>
                    <div className="relative mt-1">
                      <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          if (error) setError(null)
                        }}
                        className="w-full border border-white/10 bg-[#050816] py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#00E5FF]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-[#00E5FF] transition-colors"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter student roll number"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#FF6B00]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                        Phone / WhatsApp
                      </label>
                      <div className="relative mt-1">
                        <Phone size={14} className="absolute left-3 top-3 text-slate-500" />
                        <input
                          type="tel"
                          placeholder="Enter contact number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full border border-white/10 bg-[#050816] py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                        Department / Branch *
                      </label>
                      <select
                        required
                        value={branch}
                        onChange={(e) => {
                          setBranch(e.target.value)
                          if (e.target.value !== 'OTHER') {
                            setCustomDepartment('')
                          }
                        }}
                        className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2.5 text-xs text-white outline-none transition-colors focus:border-[#00E5FF]"
                      >
                        <option value="" disabled className="bg-[#080A0F] text-slate-500">
                          Select Department
                        </option>
                        {DEPARTMENT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#080A0F] text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                        Current Semester
                      </label>
                      <input
                        type="text"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        placeholder="Enter your semester"
                        className="mt-1 w-full border border-white/10 bg-[#050816] px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>

                  {branch === 'OTHER' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[#00E5FF]">
                        Specify Custom Department * (Max 128 characters)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={128}
                        value={customDepartment}
                        onChange={(e) => setCustomDepartment(e.target.value)}
                        placeholder="Enter your department name"
                        className="mt-1 w-full border border-[#00E5FF]/50 bg-[#050816] px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#00E5FF]"
                      />
                    </motion.div>
                  )}
                </>
              )}
            </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 border border-[#FF6B00] bg-[#FF6B00] py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-transparent hover:text-[#FF6B00] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : authModalMode === 'login' ? (
                  'Access Portal'
                ) : (
                  'Generate Identity Pass'
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
)
}
