import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import { BiLogoGmail } from 'react-icons/bi'; 
import { z } from 'zod'
import { showToast } from '../utils/toast'

const querySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name is too long'),

  email: z
    .string()
    .trim()
    .email('Enter a valid email address'),

  phone: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' ||
        /^[6-9]\d{9}$/.test(value),
      'Enter a valid 10-digit Indian mobile number',
    ),

  queryType: z
    .string()
    .min(1, 'Please select a query type'),

  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message is too long'),
})

type FormData = z.infer<typeof querySchema>

type FormErrors = Partial<Record<keyof FormData, string>>

const initialForm: FormData = {
  name: '',
  email: '',
  phone: '',
  queryType: '',
  message: '',
}

const queryTypes = [
  'General Query',
  'Event Information',
  'Registration',
  'Sponsorship',
  'Technical Issue',
  'Other',
]

export default function Contact() {
  const reducedMotion = useReducedMotion()

  const [form, setForm] = useState<FormData>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSending, setIsSending] = useState(false)

  const updateField = (
    field: keyof FormData,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))

    // Remove the error as soon as the user starts correcting it.
    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }))
    }
  }

  const validateForm = () => {
    const result = querySchema.safeParse(form)

    if (result.success) {
      setErrors({})
      return true
    }

    const fieldErrors: FormErrors = {}

    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof FormData

      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message
      }
    })

    setErrors(fieldErrors)
    return false
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Validate with Zod before sending anything.
    if (!validateForm()) {
      showToast.warning('Please correct the highlighted fields before submitting.')
      return
    }

    setIsSending(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const contentType = response.headers.get('content-type') || ''
      let data: any = {}
      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        throw new Error(
          response.status === 404
            ? 'Contact API endpoint is not available. Please restart the dev server or contact support.'
            : `Server returned HTTP ${response.status}`,
        )
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send query.')
      }

      showToast.success('Your query has been submitted successfully! The team will get back to you soon.')
      setForm(initialForm)
      setErrors({})
    } catch (error: any) {
      console.error('Contact form error:', error)
      showToast.error(error?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSending(false)
    }
  }



  const inputClass = (field: keyof FormData) =>
    `mt-2 w-full border bg-[#080A0F] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-700 ${errors[field]
      ? 'border-red-500/70 focus:border-red-500'
      : 'border-white/10 focus:border-[#00E5FF]/70'
    }`

  return (
    <main className="min-h-screen bg-[#050816] text-[#F8FAFC]">
      {/* Page Header */}
      <section className="mx-auto max-w-[1400px] px-5 pb-12 pt-28 md:px-8 md:pb-16 md:pt-36">
        <motion.div
          initial={
            reducedMotion
              ? { opacity: 1 }
              : { opacity: 0, y: 30 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="border-b border-white/10 pb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#00E5FF]" />

            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
              01 / Contact
            </span>

            <span className="h-px w-8 bg-[#FF6B00]" />
          </div>

          <h1 className="mt-4 text-4xl font-black uppercase tracking-tight md:text-6xl">
            Have A Query?
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-slate-500 md:text-sm">
            Send us your question and the Yantrotsav team will get back
            to you.
          </p>
        </motion.div>
      </section>

      {/* Contact Content */}
      <section className="mx-auto grid max-w-[1200px] gap-10 px-5 pb-24 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Information */}
        <motion.div
          initial={
            reducedMotion
              ? { opacity: 1 }
              : { opacity: 0, x: -35 }
          }
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="relative border border-white/10 bg-[#080A0F] p-6 md:p-8">
            {/* Corner brackets */}
            <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[#00E5FF]" />
            <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-[#FF6B00]" />
            <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-[#00E5FF]" />
            <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-[#FF6B00]" />

            <div className="mb-8">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#00E5FF]">
                Communication Channel
              </span>

              <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-white">
                Let's Connect
              </h2>

              <p className="mt-3 text-xs leading-6 text-slate-500">
                Whether you need information about an event, registration,
                sponsorship or anything else, drop us a message.
              </p>
            </div>

            <div className="space-y-3">
              <div className="group border border-white/10 p-4 transition-colors duration-300 hover:border-[#00E5FF]/40">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 text-[#00E5FF]">
                    <BiLogoGmail/>
                  </div>

                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-slate-600">
                      Email
                    </p>

                    <p className="mt-1 text-xs text-slate-300">
                      yantrotsav2026@gmail.com
                    </p>
                  </div>
                </div>
              </div>

              <div className="group border border-white/10 p-4 transition-colors duration-300 hover:border-[#FF6B00]/40">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 text-[#FF6B00]">
                    <FaMapMarkerAlt/>
                  </div>

                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-slate-600">
                      Location
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      Department of Computer Science and Engineering
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      Yantrotsav 2026
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mt-8 border-t border-white/10 pt-5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping bg-[#FF6B00] opacity-50" />
                  <span className="relative h-2 w-2 bg-[#FF6B00]" />
                </span>

                <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-500">
                  Registration Opens Soon
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={
            reducedMotion
              ? { opacity: 1 }
              : { opacity: 0, x: 35 }
          }
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.7,
            delay: reducedMotion ? 0 : 0.1,
          }}
          className="relative"
        >
          <div className="relative border border-white/10 bg-[#080A0F] p-6 md:p-8">
            <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[#00E5FF]" />
            <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-[#FF6B00]" />

            <div className="mb-6 flex items-end justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
                  Transmission / 01
                </span>

                <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white">
                  Send Your Query
                </h2>
              </div>

              <span className="font-mono text-[9px] text-slate-700">
                FORM_01
              </span>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >
              {/* Name + Email */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500"
                  >
                    Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField('name', event.target.value)
                    }
                    placeholder="Your name"
                    className={inputClass('name')}
                  />

                  {errors.name && (
                    <p className="mt-1.5 text-[9px] text-red-400">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500"
                  >
                    Email *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField('email', event.target.value)
                    }
                    placeholder="you@example.com"
                    className={inputClass('email')}
                  />

                  {errors.email && (
                    <p className="mt-1.5 text-[9px] text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone + Query */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500"
                  >
                    Phone / WhatsApp
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        'phone',
                        event.target.value.replace(/\D/g, ''),
                      )
                    }
                    placeholder="Enter your phone number"
                    className={inputClass('phone')}
                  />

                  {errors.phone && (
                    <p className="mt-1.5 text-[9px] text-red-400">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="queryType"
                    className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500"
                  >
                    Query Type *
                  </label>

                  <select
                    id="queryType"
                    name="queryType"
                    value={form.queryType}
                    onChange={(event) =>
                      updateField('queryType', event.target.value)
                    }
                    className={`${inputClass(
                      'queryType',
                    )} appearance-none`}
                  >
                    <option value="" className="bg-[#080A0F]">
                      Select query type
                    </option>

                    {queryTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                        className="bg-[#080A0F]"
                      >
                        {type}
                      </option>
                    ))}
                  </select>

                  {errors.queryType && (
                    <p className="mt-1.5 text-[9px] text-red-400">
                      {errors.queryType}
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="message"
                    className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500"
                  >
                    Message *
                  </label>

                  <span className="font-mono text-[8px] text-slate-700">
                    {form.message.length}/1000
                  </span>
                </div>

                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  maxLength={1000}
                  value={form.message}
                  onChange={(event) =>
                    updateField('message', event.target.value)
                  }
                  placeholder="Write your query here..."
                  className={`${inputClass(
                    'message',
                  )} resize-none`}
                />

                {errors.message && (
                  <p className="mt-1.5 text-[9px] text-red-400">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSending}
                className="group relative flex w-full items-center justify-between overflow-hidden border border-[#FF6B00]/60 bg-[#FF6B00] px-5 py-3.5 text-[#050816] transition-all duration-300 hover:border-[#00E5FF] hover:bg-[#00E5FF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                  {isSending ? 'Transmitting...' : 'Send Query'}
                </span>

                <FaPaperPlane/>
              </button>
            </form>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
