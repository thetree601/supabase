import MagazinesDetail from '@/components/magazines-detail';

interface TrippostDetailPageProps {
  params: {
    id: string;
  };
}

export default function TrippostDetailPage({ params }: TrippostDetailPageProps) {
  return (
    <div className="min-h-screen p-8">
      <MagazinesDetail id={params.id} />
    </div>
  );
}
