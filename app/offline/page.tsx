export default function OfflinePage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">You’re offline</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Pages and data you opened earlier are available. New data will sync when you’re back online.
      </p>
    </div>
  );
}