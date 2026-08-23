import { useEffect, useState } from "react";
import { Check, UserRound, X } from "lucide-react";
import { useNavigate } from "react-router";
import {
  useConnectionApi,
  type ConnectionRequest,
} from "../../api/connectionApi";
import { ArrowLeft } from "lucide-react";

const ConnectionRequests = () => {
  const navigate = useNavigate();

  const { getRequests, updateConnection } = useConnectionApi();

  const [requests, setRequests] = useState<ConnectionRequest[]>([]);

  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const data = await getRequests();

      setRequests(data);
    } catch (error) {
      console.error("Failed to load connection requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (id: number, action: "ACCEPT" | "REJECT") => {
    try {
      await updateConnection(id, action);

      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (error) {
      console.error("Failed to update connection:", error);
    }
  };

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        pb-28
        text-slate-900
        dark:bg-slate-950
        dark:text-white
      "
    >
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/home")}
              aria-label="Back to home"
              className="
            flex h-9 w-9 shrink-0 items-center justify-center
        rounded-xl
        border border-slate-200
        bg-white
        text-slate-600
        transition
        hover:bg-slate-100
        hover:text-slate-900
        dark:border-slate-800
        dark:bg-slate-900
        dark:text-slate-300
        dark:hover:bg-slate-800
        dark:hover:text-white
      "
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                CONNECTIONS
              </p>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Connection Requests
              </h1>
            </div>
          </div>

          <p className="mt-2 pl-12 text-sm text-slate-500 dark:text-slate-400">
            People who want to connect with you.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  h-20
                  animate-pulse
                  rounded-2xl
                  bg-slate-200
                  dark:bg-slate-800
                "
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && requests.length === 0 && (
          <div
            className="
              mt-8
              rounded-3xl
              border
              border-dashed
              border-slate-300
              bg-white
              p-10
              text-center
              dark:border-slate-700
              dark:bg-slate-900
            "
          >
            <UserRound
              size={30}
              className="
                mx-auto
                text-slate-400
              "
            />

            <h2 className="mt-4 font-semibold">No connection requests</h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              New requests will appear here.
            </p>
          </div>
        )}

        {/* Requests */}
        {!loading && requests.length > 0 && (
          <div className="mt-6 space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-3
                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >
                {/* Avatar */}
                {request.profileImage ? (
                  <img
                    src={request.profileImage}
                    alt={request.fullName}
                    className="
                      h-11
                      w-11
                      shrink-0
                      rounded-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-violet-100
                      text-violet-600
                      dark:bg-violet-500/10
                      dark:text-violet-400
                    "
                  >
                    <UserRound size={20} />
                  </div>
                )}

                {/* User */}
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${request.profileId}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-semibold">
                    {request.fullName}
                  </p>

                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    @{request.username}
                  </p>
                </button>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction(request.id, "REJECT")}
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-slate-100
                      text-slate-600
                      transition
                      hover:bg-red-50
                      hover:text-red-600
                      dark:bg-slate-800
                      dark:text-slate-300
                      dark:hover:bg-red-500/10
                      dark:hover:text-red-400
                    "
                  >
                    <X size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction(request.id, "ACCEPT")}
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-violet-600
                      text-white
                      transition
                      hover:bg-violet-700
                    "
                  >
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ConnectionRequests;
