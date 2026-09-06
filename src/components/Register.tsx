import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  BookOpen,
  Hash,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  AtSign,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/appwrite/auth.service'
import { useAuth } from '../context/AuthContext'
import { DEPARTMENT_OPTIONS, SEMESTER_OPTIONS, type RegisterPayload } from '../types/database.types'

export default function Register() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const [formData, setFormData] = useState<RegisterPayload>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    rollNumber: '',
    phone: '',
    department: '',
    customDepartment: '',
    semester: '',
  })

  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (success) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
        return () => clearTimeout(timer)
      } else {
        navigate('/dashboard')
      }
    }
  }, [success, countdown, navigate])

  const updateField = (field: keyof RegisterPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic frontend validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in your Full Name, Email, and Password.')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password.')
      return
    }

    if (!formData.rollNumber.trim()) {
      setError('Student Roll Number is required.')
      return
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      setError('Please provide a valid contact number (at least 10 digits).')
      return
    }

    if (!formData.department) {
      setError('Please select your department.')
      return
    }

    if (formData.department === 'OTHER' && !formData.customDepartment?.trim()) {
      setError('Please specify your custom department name.')
      return
    }

    if (!formData.semester.trim()) {
      setError('Please select your current semester.')
      return
    }

    const semVal = parseInt(formData.semester, 10)
    if (isNaN(semVal) || semVal < 1 || semVal > 8) {
      setError('Semester must be between 1 and 8.')
      return
    }

    setIsSubmitting(true)

    try {
      // Execute registration via auth service layer
      const payloadToSend: RegisterPayload = {
        ...formData,
        customDepartment: formData.department === 'OTHER' ? formData.customDepartment?.trim() : undefined,
      }
      await authService.registerStudent(payloadToSend)
      await refreshUser()
      setSuccess(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Friendly mapping for duplicate rollNumber, email, or other unique constraints
        const msg = err.message
        if (msg.toLowerCase().includes('roll') || msg.toLowerCase().includes('idx_rollnumber')) {
          setError('A student with this Roll Number is already registered for Yantrotsav.')
        } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('user_already_exists')) {
          setError('An account with this email address already exists. Try signing in.')
        } else {
          setError(msg)
        }
      } else {
        setError('Registration could not be completed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 pb-20 pt-32 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        {/* Frame / Window */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden border border-white/10 bg-[#080A0F] p-7 shadow-[0_25px_60px_rgba(0,0,0,0.85)] sm:p-10"
        >
          {/* Cyber accents & corner brackets */}
          <div className="pointer-events-none absolute inset-0">
            <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-[#00E5FF]" />
            <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-[#FF6B00]" />
            <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-[#FF6B00]" />
            <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-[#00E5FF]" />
            <div className="h-0.5 w-full bg-gradient-to-r from-[#00E5FF] via-white/10 to-[#FF6B00]" />
          </div>

          {/* Header */}
          <div className="border-b border-white/10 pb-6 text-center">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#00E5FF]">
              [IDENTITY PROTOCOL // YANTROTSAV 2026]
            </span>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Student Registration
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Create your official participant profile to enroll in solo challenges and form teams.
            </p>
          </div>

          {success ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-950/20 text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">
                Registration Successful!
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Welcome, <strong className="text-white">{formData.fullName}</strong>. Your account has
                been provisioned in the YANTROTSAV registry with roll number{' '}
                <span className="font-mono text-[#00E5FF]">{formData.rollNumber}</span>.
              </p>

              {/* Automatic Redirect Notice */}
              <div className="mt-6 inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/30 px-4 py-2 font-mono text-xs text-emerald-300">
                <Loader2 size={14} className="animate-spin text-emerald-400" />
                <span>Entering your Dashboard in <strong className="text-white">{countdown}</strong> seconds...</span>
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center gap-2 border border-[#00E5FF] bg-[#00E5FF] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.15em] text-black transition-all hover:bg-transparent hover:text-[#00E5FF]"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="flex items-center justify-center gap-2 border border-white/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-slate-300 hover:text-white"
                >
                  <span>Explore Events</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="flex items-center gap-3 border border-red-500/50 bg-red-950/30 p-3.5 text-xs text-red-300">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name & Username */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Full Name *
                  </label>
                  <div className="relative mt-1">
                    <User size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full border border-white/10 bg-[#050816] py-3 pl-10 pr-3 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#00E5FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Username
                  </label>
                  <div className="relative mt-1">
                    <AtSign size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.username || ''}
                      onChange={(e) => updateField('username', e.target.value)}
                      placeholder="Choose a username"
                      className="w-full border border-white/10 bg-[#050816] py-3 pl-10 pr-3 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#00E5FF]"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  Official / Primary Email *
                </label>
                <div className="relative mt-1">
                  <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="enrno.dep@cujammu.ac.in"
                    className="w-full border border-white/10 bg-[#050816] py-3 pl-10 pr-3 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Password *
                  </label>
                  <div className="relative mt-1">
                    <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Enter your password"
                      className="w-full border border-white/10 bg-[#050816] py-3 pl-10 pr-10 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#00E5FF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-[#00E5FF] transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Confirm Password *
                  </label>
                  <div className="relative mt-1">
                    <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (error) setError(null)
                      }}
                      placeholder="Re-enter your password"
                      className="w-full border border-white/10 bg-[#050816] py-3 pl-10 pr-10 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#00E5FF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-[#00E5FF] transition-colors"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Roll Number & Phone */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Student Roll Number *
                  </label>
                  <div className="relative mt-1">
                    <Hash size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={formData.rollNumber}
                      onChange={(e) => updateField('rollNumber', e.target.value)}
                      placeholder="Enter student roll number"
                      className="w-full border border-white/10 bg-[#050816] py-3 pl-10 pr-3 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Phone / WhatsApp Number
                  </label>
                  <div className="relative mt-1">
                    <Phone size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="Enter contact number"
                      className="w-full border border-white/10 bg-[#050816] py-3 pl-10 pr-3 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
              </div>

              {/* Department & Semester */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Department / Branch *
                  </label>
                  <div className="relative mt-1">
                    <GraduationCap size={15} className="absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => {
                        updateField('department', e.target.value)
                        if (e.target.value !== 'OTHER') {
                          updateField('customDepartment', '')
                        }
                      }}
                      className="w-full border border-white/10 bg-[#050816] py-3 pl-10 pr-3 text-xs text-white outline-none transition-colors focus:border-[#00E5FF]"
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
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                    Current Semester * (Max 8)
                  </label>
                  <div className="relative mt-1">
                    <BookOpen size={15} className="absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
                    <select
                      required
                      value={formData.semester}
                      onChange={(e) => updateField('semester', e.target.value)}
                      className="w-full border border-white/10 bg-[#050816] py-3 pl-10 pr-3 text-xs text-white outline-none transition-colors focus:border-[#00E5FF]"
                    >
                      <option value="" disabled className="bg-[#080A0F] text-slate-500">
                        Select Semester (1 - 8)
                      </option>
                      {SEMESTER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#080A0F] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Custom Department (when OTHER is chosen) */}
              {formData.department === 'OTHER' && (
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[#00E5FF]">
                    Specify Custom Department * (Max 128 characters)
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      required
                      maxLength={128}
                      value={formData.customDepartment || ''}
                      onChange={(e) => updateField('customDepartment', e.target.value)}
                      placeholder="Enter your custom department name"
                      className="w-full border border-[#00E5FF]/50 bg-[#050816] py-3 px-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors focus:border-[#00E5FF]"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 border border-[#FF6B00] bg-[#FF6B00] py-3.5 font-mono text-xs font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-transparent hover:text-[#FF6B00] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="text-center font-mono text-[10px] text-slate-500">
                Already registered?{' '}
                <Link to="/events" className="text-[#00E5FF] hover:underline">
                  Sign in through the navigation bar
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </main>
  )
}
