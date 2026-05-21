import { useParams } from 'react-router-dom'
import StubScreen from '@/components/StubScreen'

export default function BoardEdit() {
  const { id } = useParams()
  return <StubScreen eyebrow="edit" title="Board settings" back={id ? `/board/${id}` : '/boards'} />
}
