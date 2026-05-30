'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthorPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/author/articles'); }, [router]);
  return null;
}
