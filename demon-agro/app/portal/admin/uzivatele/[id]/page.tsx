export default function AdminUzivatelDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Admin - Detail uživatele {params.id}</h1>
    </div>
  )
}
