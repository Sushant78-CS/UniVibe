export default function SearchSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-3
            dark:border-neutral-800
            dark:bg-[#171717]
          "
        >
          <div
            className="
              h-12
              w-12
              shrink-0
              animate-pulse
              rounded-full
              bg-slate-200
              dark:bg-neutral-800
            "
          />

          <div className="min-w-0 flex-1">
            <div
              className="
                h-3.5
                w-32
                animate-pulse
                rounded
                bg-slate-200
                dark:bg-neutral-800
              "
            />

            <div
              className="
                mt-2
                h-2.5
                w-20
                animate-pulse
                rounded
                bg-slate-100
                dark:bg-neutral-900
              "
            />
          </div>
        </div>
      ))}
    </div>
  );
}
