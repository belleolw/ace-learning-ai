const FALLBACK_API_URL = "https://ace-learning-backend.vercel.app"

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || FALLBACK_API_URL
).replace(/\/$/, "")

