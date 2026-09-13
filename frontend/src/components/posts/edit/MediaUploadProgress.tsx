interface MediaUploadProgressProps {
  progress: number;
}

const MediaUploadProgress = ({ progress }: MediaUploadProgressProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Uploading media
        </span>

        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-violet-600 transition-[width] duration-150 dark:bg-violet-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
        Please don't close this page while media is uploading.
      </p>
    </div>
  );
};

export default MediaUploadProgress;
