import { NewCvClient } from './NewCvClient';

export default function NewCvPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Generate CV</h1>
      <NewCvClient />
    </div>
  );
}
