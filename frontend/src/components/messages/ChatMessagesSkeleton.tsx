const ChatMessagesSkeleton = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className={`
            h-10
            animate-pulse
            rounded-2xl
            bg-slate-200
            dark:bg-slate-800
            ${item % 2 === 0 ? "ml-auto w-52" : "w-40"}
          `}
        />
      ))}
    </div>
  );
};

export default ChatMessagesSkeleton;
