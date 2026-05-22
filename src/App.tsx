import { Routes, Route, Navigate } from 'react-router-dom'
import RequirePact from '@/components/RequirePact'
import FloatingHearts from '@/components/FloatingHearts'
import BuzzListener from '@/components/BuzzListener'

import Login from '@/routes/Login'
import Onboarding from '@/routes/Onboarding'
import NotifPermission from '@/routes/NotifPermission'

import PactNew from '@/routes/PactNew'
import PactReady from '@/routes/PactReady'
import PactJoining from '@/routes/PactJoining'
import PactEdit from '@/routes/PactEdit'
import PactArchive from '@/routes/PactArchive'
import PactArchived from '@/routes/PactArchived'
import PactDay50 from '@/routes/PactDay50'
import PactDay50Missed from '@/routes/PactDay50Missed'
import PactWrapped from '@/routes/PactWrapped'

import Dashboard from '@/routes/Dashboard'
import DashboardEmpty from '@/routes/DashboardEmpty'

import Habits from '@/routes/Habits'
import HabitsEmpty from '@/routes/HabitsEmpty'
import HabitsPeek from '@/routes/HabitsPeek'
import HabitsPast from '@/routes/HabitsPast'
import AddHabit from '@/routes/AddHabit'

import Boards from '@/routes/Boards'
import BoardsEmpty from '@/routes/BoardsEmpty'
import BoardNew from '@/routes/BoardNew'
import BoardDetail from '@/routes/BoardDetail'
import BoardEdit from '@/routes/BoardEdit'
import ItemDetail from '@/routes/ItemDetail'

import Buzzer from '@/routes/Buzzer'
import BuzzInbox from '@/routes/BuzzInbox'

import WeeklyReview from '@/routes/WeeklyReview'
import MilestoneScreen from '@/routes/MilestoneScreen'

import Settings from '@/routes/Settings'
import EditProfile from '@/routes/EditProfile'
import History from '@/routes/History'
import About from '@/routes/About'

export default function App() {
  return (
    <>
      <BuzzListener />
      <FloatingHearts />
      <Routes>
      {/* Auth + onboarding */}
      <Route path="/" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/notif-permission" element={<NotifPermission />} />

      {/* Pact lifecycle */}
      <Route path="/pact-new" element={<PactNew />} />
      <Route path="/pact-ready" element={<PactReady />} />
      <Route path="/pact-joining" element={<PactJoining />} />
      <Route path="/pact-edit" element={<PactEdit />} />
      <Route path="/pact-archive" element={<PactArchive />} />
      <Route path="/pact-archived/:id" element={<PactArchived />} />
      <Route path="/pact-day-50" element={<PactDay50 />} />
      <Route path="/pact-day-50-missed" element={<PactDay50Missed />} />
      <Route path="/pact-wrapped" element={<PactWrapped />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<RequirePact><Dashboard /></RequirePact>} />
      <Route path="/dashboard-empty" element={<DashboardEmpty />} />

      {/* Habits */}
      <Route path="/habits" element={<RequirePact><Habits /></RequirePact>} />
      <Route path="/habits-empty" element={<HabitsEmpty />} />
      <Route path="/habits-peek" element={<HabitsPeek />} />
      <Route path="/habits-past" element={<HabitsPast />} />
      <Route path="/add-habit" element={<RequirePact><AddHabit /></RequirePact>} />

      {/* Boards */}
      <Route path="/boards" element={<RequirePact><Boards /></RequirePact>} />
      <Route path="/boards-empty" element={<BoardsEmpty />} />
      <Route path="/board-new" element={<BoardNew />} />
      <Route path="/board/:id" element={<BoardDetail />} />
      <Route path="/board/:id/edit" element={<BoardEdit />} />
      <Route path="/item/:id" element={<ItemDetail />} />

      {/* Buzzer */}
      <Route path="/buzzer" element={<RequirePact><Buzzer /></RequirePact>} />
      <Route path="/buzz-inbox" element={<BuzzInbox />} />

      {/* Ceremonies */}
      <Route path="/weekly-review" element={<RequirePact><WeeklyReview /></RequirePact>} />
      <Route path="/milestone" element={<MilestoneScreen />} />

      {/* Settings */}
      <Route path="/settings" element={<RequirePact><Settings /></RequirePact>} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/history" element={<History />} />
      <Route path="/about" element={<About />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
