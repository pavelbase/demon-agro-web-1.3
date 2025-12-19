export default function PozemekDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Detail pozemku {params.id}</h1>
    </div>
  )
}
