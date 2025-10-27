interface TrippostDetailPageProps {
  params: {
    id: string;
  };
}

export default function TrippostDetailPage({ params }: TrippostDetailPageProps) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          여행 포스트 상세
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-4">
            포스트 ID: {params.id}
          </p>
          <p className="text-gray-600">
            여행 포스트 상세 페이지입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
