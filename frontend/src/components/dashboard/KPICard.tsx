import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils"; // Utilitaire pour combiner les classes Tailwind (optionnel)

interface KPICardProps {
  title: string;
  value: string | number;
  loading: boolean;
  icon?: React.ReactNode; // Icône optionnelle (ex. : via lucide-react)
  className?: string; // Pour personnalisation externe
}

function KPICard({ title, value, loading, icon, className }: KPICardProps) {
  return (
    <div
      className={cn(
        "bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-full  text-gray-600">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </h3>
          {loading ? (
            <Skeleton className="h-10 w-24 mt-4 bg-gray-200 rounded-md animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 mt-4 tracking-tight">
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default KPICard;