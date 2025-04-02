// components/EmptyState.tsx
export const EmptyState = ({ icon, title, description, action }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  );