import { useParams } from 'react-router-dom'
import StubScreen from '@/components/StubScreen'

export default function ItemDetail() {
  const { id } = useParams()
  return <StubScreen eyebrow="pin" title="Item detail" back="/boards" note={`Item id: ${id ?? 'none'}`} />
}
