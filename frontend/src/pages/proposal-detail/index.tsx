import { useParams } from '@tanstack/react-router'

export default function ProposalDetailPage() {
  const { id } = useParams({ from: '/propostas/$id' })

  return (
    <div>
      <h1>Proposta #{id}</h1>
      {/* TODO: issue #12 — implementar detalhe da proposta com botão de candidatura */}
    </div>
  )
}
