import { useState } from "react";
import { Plus, Trash, Image as ImageIcon, X, Check } from "lucide-react";

type Props = {
  title: string;
  records: any[];
  onAddClick: () => void;
  onDeleteRecord: (recordId: number | number[]) => void;
};

export default function RecordMealGroup({ title, records, onAddClick, onDeleteRecord }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAdd = () => {
    onAddClick();
    setIsOpen(false);
  };

  const handleOpenDeleteModal = () => {
    setIsOpen(false);
    if (records.length === 0) {
      alert("삭제할 기록이 없습니다.");
      return;
    }
    setIsDeleteModalOpen(true);
    setSelectedRecordIds([]); // 초기화
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRecordIds([]);
  };

  const toggleRecordSelection = (recordId: number) => {
    setSelectedRecordIds(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId);
      } else {
        return [...prev, recordId];
      }
    });
  };

  const handleConfirmDelete = () => {
    if (selectedRecordIds.length === 0) {
      alert("선택된 식단이 없습니다.");
      return;
    }

    if (confirm(`선택한 ${selectedRecordIds.length}개의 식단을 삭제하시겠습니까?`)) {
      onDeleteRecord(selectedRecordIds);
      handleCloseDeleteModal();
    }
  };

  return (
    <div className="bg-white/80 rounded-2xl p-3 shadow relative transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 h-8">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          {title}
        </h3>

        {/* Menu Buttons Container */}
        <div className="relative">
          {/* Expanded Menu Options - Horizontal Left */}
          <div className={`absolute right-full top-1/2 -translate-y-1/2 mr-2 flex flex-row gap-2 transition-all duration-200 ${isOpen ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-2 pointer-events-none'}`}>
            {/* Add Option */}
            <button
              onClick={handleAdd}
              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 shadow-md flex items-center justify-center hover:bg-blue-200 transition-colors"
              title="추가하기"
            >
              <ImageIcon size={16} />
            </button>
            {/* Delete Option - Opens Modal */}
            <button
              onClick={handleOpenDeleteModal}
              className="w-8 h-8 rounded-full bg-red-100 text-red-600 shadow-md flex items-center justify-center hover:bg-red-200 transition-colors"
              title="삭제하기"
            >
              <Trash size={16} />
            </button>
          </div>

          {/* Main Toggle Button */}
          <button
            onClick={toggleMenu}
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 z-10 
                    bg-purple-600 text-white hover:bg-purple-700
                    ${isOpen ? 'rotate-45' : ''}
                `}
            aria-label={`${title} 메뉴`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Content (Main List) */}
      {records.length === 0 ? (
        <div className="text-xs text-slate-500 py-6 text-center">
          기록 없음
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r, idx) => {
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

      {/* Delete Selection Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">삭제할 식단을 선택하세요</h3>
              <button onClick={handleCloseDeleteModal} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - List of records */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {records.map((r, idx) => {
                const key = r.record_id ?? idx;
                const isSelected = selectedRecordIds.includes(r.record_id);

                return (
                  <div
                    key={key}
                    onClick={() => r.record_id && toggleRecordSelection(r.record_id)}
                    className={`flex gap-3 items-center p-2 rounded-lg border transition-all cursor-pointer select-none
                                    ${isSelected ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}
                                `}
                  >
                    {/* Checkbox-like indicator */}
                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
                                      ${isSelected ? 'bg-red-500 border-red-500' : 'bg-white border-slate-300'}
                                  `}>
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>

                    {/* Image */}
                    <div className="w-10 h-10 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                      {r.image_url && (
                        <img src={r.image_url} alt="thumbnail" className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Name */}
                    <div className="text-sm font-medium text-slate-700 truncate flex-1">
                      {r.food_name ?? r.predicted_food_name ?? "음식"}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-slate-50 flex gap-2">
              <button
                onClick={handleCloseDeleteModal}
                className="flex-1 py-3 px-4 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={selectedRecordIds.length === 0}
                className="flex-1 py-3 px-4 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
