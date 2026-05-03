import Link from 'next/link';

interface ErrorPageProps {
  statusCode: number;
  title: string;
  message?: string;
}

export default function ErrorPage({ statusCode, title, message }: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-8xl font-bold text-gray-200 mb-4">{statusCode}</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h2>
      {message && (
        <p className="text-gray-500 mb-8 text-center max-w-md">{message}</p>
      )}
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
