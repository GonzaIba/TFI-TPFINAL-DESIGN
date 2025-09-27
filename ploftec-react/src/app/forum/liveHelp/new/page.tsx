"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CreateHelpRequestForm from '@/components/liveHelp/createHelpRequestForm/createHelpRequestForm';
import { Button, Loading } from '@/components';
import ArrowBack from '@mui/icons-material/ArrowBack';

export default function NewHelpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    setLoading(true);
    setTimeout(() => router.push('/forum/liveHelp'), 700);
  };

  return (
    <main style={{ padding: '3.1rem 16px 24px' }}>
      <Loading show={loading} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <Button
          onClick={goBack}
          icon={<ArrowBack />}
          text="Volver"
          transparent
          ariaLabel="Volver"
        />
      </div>

      <CreateHelpRequestForm onCancel={goBack} onCreated={goBack} />
    </main>
  );
}
