export default function PlanHnojeniPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Plán hnojení - Pozemek {params.id}</h1>
    </div>
  )
}
