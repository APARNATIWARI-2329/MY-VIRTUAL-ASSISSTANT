import { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Robot3D from '../components/Robot3D'
import { userDataContext } from '../context/userDataContext'

// ─── Decorative Right Panel ───────────────────────────────────────────────────
function RightPanel() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center h-full px-12 text-white relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-amber-400/20 rounded-full blur-[60px]" />

      {/* Decorative craft icons */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="flex gap-6">
          {['🪡', '🎨', '🪢', '✂️', '🧶'].map((emoji, i) => (
            <motion.div
              key={i}
              className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/20 shadow-lg"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-4">
          <motion.h2
            className="text-5xl font-black tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Kalakriti
          </motion.h2>
          <motion.p
            className="text-xl font-light mt-2 text-orange-100 tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Handcrafted with Love
          </motion.p>
          <motion.div
            className="w-24 h-1 bg-amber-300 mx-auto mt-4 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8 }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 text-center">
          {[
            { label: 'Artisans', value: '2,400+' },
            { label: 'Products', value: '18,000+' },
            { label: 'States', value: '28' },
            { label: 'Happy Buyers', value: '1.2L+' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/15"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + i * 0.1 }}
            >
              <div className="text-2xl font-bold text-amber-300">{stat.value}</div>
              <div className="text-sm text-orange-100 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          {['🏺', '🪔', '🎭', '🧵', '🪴', '🎪'].map((emoji, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Auth Page ───────────────────────────────────────────────────────────
export default function AuthPage() {
  const [userType, setUserType] = useState('customer') // 'customer' | 'vendor'
  const [tab, setTab] = useState('signin')             // 'signin' | 'signup'
  const [showPassword, setShowPassword] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  // ── API integration point ──────────────────────────────────────────────────
  // Pull serverUrl + setUserData from your existing context
  const { serverUrl, setUserData } = useContext(userDataContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (tab === 'signin') {
        // ── SIGN IN API CALL ─────────────────────────────────────────────────
        const res = await axios.post(
          `${serverUrl}/api/auth/login`,
          { email, password },
          { withCredentials: true }
        )
        setUserData(res.data)
        navigate('/')
      } else {
        // ── SIGN UP API CALL ─────────────────────────────────────────────────
        const res = await axios.post(
          `${serverUrl}/api/auth/signup`,
          { name, email, password },
          { withCredentials: true }
        )
        setUserData(res.data)
        navigate('/customize')
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isSignup = tab === 'signup'

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[52%] flex flex-col items-center justify-center px-6 py-10 bg-white relative">

        {/* top logo */}
        <div className="absolute top-6 left-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-sm">K</div>
          <span className="font-bold text-gray-800 text-lg">Kalakriti</span>
        </div>

        <div className="w-full max-w-md">

          {/* Customer / Vendor toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8 w-fit mx-auto">
            {['customer', 'vendor'].map((type) => (
              <motion.button
                key={type}
                onClick={() => setUserType(type)}
                className={`relative px-8 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors duration-200 ${
                  userType === type ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {userType === type && (
                  <motion.div
                    layoutId="toggleBg"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{type}</span>
              </motion.button>
            ))}
          </div>

          {/* 3D Robot */}
          <div className="w-full h-52 mb-2">
            <Robot3D isPasswordFocused={isPasswordFocused} isSignup={isSignup} />
          </div>

          {/* Sign In / Sign Up tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setError('') }}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
                  tab === key ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {label}
                {tab === key && (
                  <motion.div
                    layoutId="tabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: isSignup ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignup ? -20 : 20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Name field — signup only */}
              {isSignup && (
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  />
                </div>
              )}

              {/* Email */}
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  minLength={6}
                  required
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Error message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm font-medium text-center"
                >
                  ⚠ {error}
                </motion.p>
              )}

              {/* Forgot password — signin only */}
              {!isSignup && (
                <div className="text-right">
                  <button type="button" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-shadow disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Please wait...
                  </span>
                ) : (
                  isSignup ? 'Create Account' : 'Sign In'
                )}
              </motion.button>

              {/* Switch tab link */}
              <p className="text-center text-sm text-gray-500 mt-2">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => { setTab(isSignup ? 'signin' : 'signup'); setError('') }}
                  className="ml-1 text-orange-500 hover:text-orange-600 font-semibold"
                >
                  {isSignup ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </motion.form>
          </AnimatePresence>

          {/* User type context note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Signing in as <span className="text-orange-500 font-semibold capitalize">{userType}</span>
            {userType === 'vendor' && ' · Vendor dashboard access'}
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:block lg:w-[48%] bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 relative">
        <RightPanel />
      </div>
    </div>
  )
}
