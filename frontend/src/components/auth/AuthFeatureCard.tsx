interface AuthFeatureCardProps {
  icon: string;
  title: string;
}

const AuthFeatureCard = ({ icon, title }: AuthFeatureCardProps) => {
  return (
    <div
      className="
        group
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-white/15
        bg-white/10
        px-5
        py-4
        shadow-sm
        backdrop-blur-md
        transition-all
        duration-300
        hover:-translate-y-1
        hover:bg-white/15
        hover:shadow-lg

        dark:border-white/10
        dark:bg-white/[0.07]
        dark:hover:bg-white/[0.12]
      "
    >
      {/* Icon */}
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-white/15
          text-xl
          transition-transform
          duration-300
          group-hover:scale-110
          dark:bg-white/10
        "
      >
        <span>{icon}</span>
      </div>

      {/* Title */}
      <span
        className="
          text-sm
          font-semibold
          text-white
        "
      >
        {title}
      </span>
    </div>
  );
};

export default AuthFeatureCard;
