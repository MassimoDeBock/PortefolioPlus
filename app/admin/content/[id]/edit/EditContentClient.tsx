'use client';

import { useState } from 'react';
import {
  ContentForm,
  formValuesToApiBody,
  type ContentFormValues,
} from '@/components/content/ContentForm';

interface Props {
  id: string;
  initialValues: ContentFormValues;
}

export function EditContentClient({ id, initialValues }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(values: ContentFormValues) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValuesToApiBody(values)),
      });
      if (!res.ok) throw new Error(await res.text());
      window.location.href = '/admin/content';
    } catch (e) {
      setError(String(e));
      setSaving(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}
      <ContentForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isLoading={saving}
        submitLabel="Update"
      />
    </div>
  );
}
