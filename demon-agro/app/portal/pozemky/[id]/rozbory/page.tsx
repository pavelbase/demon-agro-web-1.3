export default function RozboryPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Rozbory půdy - Pozemek {params.id}</h1>
    </div>
  )
}
