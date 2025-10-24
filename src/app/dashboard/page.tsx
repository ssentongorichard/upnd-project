import { Suspense } from 'react';
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AuthenticatedLayout />
    </Suspense>
  );
}
