interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

function StatCard({
  label,
  value,
  unit,
}: StatCardProps) {
  return (
    <div className="dashboard-card">
      <span className="dashboard-card-label">
        {label}
      </span>

      <strong className="dashboard-card-value">
        {value}
      </strong>

      {unit && (
        <span className="dashboard-card-unit">
          {unit}
        </span>
      )}
    </div>
  );
}

export default StatCard;