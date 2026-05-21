import { useParams } from 'react-router-dom'
import StubScreen from '@/components/StubScreen'

export default function PactArchived() {
  const { id } = useParams()
  return <StubScreen eyebrow="archived" title="A finished pact" back="/pact-archive" note={`Pact id: ${id ?? 'none'}`} />
}
