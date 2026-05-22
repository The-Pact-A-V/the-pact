import { Navigate } from 'react-router-dom'

// Legacy route — the peek experience now lives inline on /habits via a ?peek=true param.
export default function HabitsPeek() {
  return <Navigate to="/habits?peek=true" replace />
}
