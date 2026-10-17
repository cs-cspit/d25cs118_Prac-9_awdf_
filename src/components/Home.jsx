import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'

function Home() {
  const { user } = useAuth()

  return (
    <section className="section section-hero">
      <div className="hero-copy">
        <p className="eyebrow">Welcome to Practical 8</p>
        <h1>
          Lazy Loading &amp; <span className="gradient-text">Code Splitting</span>
        </h1>
        <p className="section-intro">
          The Task Manager from Practicals 6–7, optimized with route-based code
          splitting using React.lazy() and Suspense.
        </p>
        <p className="hero-note">
          Only this Home page ships in the main bundle. Tasks, Contact, Login and
          Register are separate chunks that download the first time you visit them,
          and the chart library behind <em>Show statistics</em> loads only when you
          open it. Open DevTools → Network, throttle to Slow 3G and click around to
          watch each chunk arrive.
        </p>
        <p className="hero-note">
          {user ? (
            <>Logged in as <strong>{user.name}</strong>. <Link to="/tasks">Go to your tasks →</Link></>
          ) : (
            <><Link to="/login">Log in</Link> or <Link to="/register">register</Link> to manage your tasks.</>
          )}
        </p>
        <div className="feature-list">
          <p>✨ Key Features:</p>
          <ul>
            <li>React.lazy() + dynamic import() for 4 route components</li>
            <li>One Suspense boundary around the Routes block (navbar stays visible)</li>
            <li>Skeleton fallback shown only after 300ms — no flicker on fast networks</li>
            <li>Error boundary with Retry if a chunk fails to download</li>
            <li>recharts statistics lazy-loaded on demand (381 kB chunk kept out of first load)</li>
            <li>React.memo + useCallback remove needless TaskList re-renders while typing</li>
            <li>Initial JS: 632.8 kB → 238.2 kB (−62%)</li>
            <li>Still includes JWT auth from Practical 7</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Home
