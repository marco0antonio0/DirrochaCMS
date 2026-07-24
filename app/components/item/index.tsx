import { ArrowRight, FileText, Trash2 } from "lucide-react";

export function Item({text="",onClick,onDelete}:{text:any,onClick: any,onDelete?: any}){
  return (
    <div
      role="button"
      tabIndex={0}
      className="group flex min-h-16 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      onClick={() => onClick()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onClick();
      }}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700">
          <FileText className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {text || "Sem titulo"}
          </span>
          <span className="block text-xs text-slate-500">Abrir registro</span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {onDelete ? (
          <button
            type="button"
            aria-label="Excluir registro"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
        <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-700" />
      </span>
    </div>
  );
}
