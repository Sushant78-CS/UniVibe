const AuthLogo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-bold text-violet-600 shadow-lg">
        U
      </div>

      <div>
        <h1 className="text-xl font-bold text-white">UniVibe</h1>

        <p className="text-sm text-white/70">Your campus. Your people.</p>
      </div>
    </div>
  );
};

export default AuthLogo;
