function ConfirmModal({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmClassName = "bg-blue-600 hover:bg-blue-700",
    loading = false,
    children,
    onCancel,
    onConfirm,
}) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                <h2
                    id="confirm-modal-title"
                    className="text-xl font-bold text-slate-900"
                >
                    {title}
                </h2>

                {description && (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        {description}
                    </p>
                )}

                {children && (
                    <div className="mt-5">
                        {children}
                    </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-xl px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClassName}`}
                    >
                        {loading ? "Please wait..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
