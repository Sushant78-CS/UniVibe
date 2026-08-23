interface ClubInfoProps {
  description?: string;
}

const ClubInfo = ({ description }: ClubInfoProps) => {
  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
        About
      </h2>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          {description || "No description available for this club yet."}
        </p>
      </div>
    </section>
  );
};

export default ClubInfo;
