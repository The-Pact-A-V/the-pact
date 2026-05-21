import { useParams } from 'react-router-dom'
import StubScreen from '@/components/StubScreen'

export default function BoardDetail() {
  const { id } = useParams()
  return <StubScreen eyebrow="board" title="Board detail" back="/boards" note={`Board id: ${id ?? 'none'}`} />
}
