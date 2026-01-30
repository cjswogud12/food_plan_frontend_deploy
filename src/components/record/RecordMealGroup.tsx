"use client";

type Props = {
  title: string;
  records: any[];
  onAddClick: () => void;
};

export default function RecordMealGroup({ title, records, onAddClick }: Props) {
  return (
    <div className="bg-white/80 rounded-2xl p-3 shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <button
          onClick={onAddClick}
          className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center"
          aria-label={`${title} 추가`}
        >
          +
        </button>
      </div>

      {/* Content */}
      {records.length === 0 ? (
        <div className="text-xs text-slate-500 py-6 text-center">
          기록 없음
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r, idx) => {
            /**
             * ✅ React key 안정화
             * 우선순위:
             * 1. record_id (Record 테이블)
             * 2. far_id (FoodAnalysisResult 테이블)
             * 3. image_url (파일 경로는 사실상 유니크)
             * 4. 최후 fallback: title + idx
             */
            const key =
              r.record_id ??
              r.far_id ??
              (typeof r.image_url === "string" ? r.image_url : null) ??
              `${title}-${idx}`;

            return (
              <div key={key} className="flex gap-2 items-center">
                {/* Image */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  {r.image_url && (
                    <img
                      src={r.image_url}
                      alt={r.food_name ?? r.predicted_food_name ?? "food"}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-800 truncate">
                    {r.food_name ?? r.predicted_food_name ?? "음식"}
                  </div>

                  <div className="text-xs text-slate-500">
                    {/* Record / FoodAnalysisResult 모두 대응 */}
                    {typeof r.food_calories === "number"
                      ? `${r.food_calories} kcal`
                      : typeof r.estimated_calories_kcal === "number"
                      ? `${r.estimated_calories_kcal} kcal`
                      : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}