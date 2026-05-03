import ErrorPage from '@/components/ErrorPage';

export default function NotFoundPage() {
  return (
    <ErrorPage
      statusCode={404}
      title="Page Not Found"
      message="The page you are looking for does not exist or you do not have access to it."
    />
  );
}
