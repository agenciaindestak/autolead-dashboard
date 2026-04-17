'use client';

export default function StatsCard({ title, value, icon: Icon, bg, color, sub, loading }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 my-1">
          {loading ? (
            <span className="inline-block w-12 h-6 bg-gray-100 animate-pulse rounded"></span>
          ) : (
            value
          )}
        </p>
        <p className="text-[11px] text-gray-400">{sub}</p>
      </div>
      <div 
        className="p-3 rounded-full" 
        style={{ backgroundColor: bg }}
      >
        <Icon size={22} color={color} />
      </div>
    </div>
  );
}
