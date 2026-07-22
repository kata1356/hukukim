export default function Modal({ baslik, onKapat, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full animate-[modal-in_0.2s_ease-out] overflow-y-auto rounded-t-2xl border border-white/10 bg-gece-yuzey p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-white">{baslik}</h2>
          <button
            onClick={onKapat}
            aria-label="Kapat"
            className="shrink-0 rounded-full p-1 text-white/50 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
