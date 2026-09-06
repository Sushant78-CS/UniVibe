import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface GiphyGif {
  id: string;
  title: string;
  images: {
    fixed_width: {
      url: string;
      width: string;
      height: string;
    };
  };
}

interface VibeGifPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (gifUrl: string) => void;
}

const API_KEY = import.meta.env.VITE_GIPHY_API_KEY;

const VibeGifPicker = ({ open, onClose, onSelect }: VibeGifPickerProps) => {
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGifs = useCallback(async (query = "") => {
    if (!API_KEY) {
      console.error("VITE_GIPHY_API_KEY is not configured.");
      setGifs([]);
      return;
    }

    try {
      setLoading(true);

      const trimmedQuery = query.trim();

      const endpoint = trimmedQuery
        ? `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(
            trimmedQuery,
          )}&limit=24&rating=pg-13`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=24&rating=pg-13`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Failed to load GIFs.");
      }

      const data = await response.json();

      setGifs(data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch GIFs:", error);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSearch("");
    fetchGifs();
  }, [open, fetchGifs]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    fetchGifs(search);
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-end justify-center
        bg-black/60
        sm:items-center sm:px-4
      "
      onClick={onClose}
    >
      <div
        className="
          flex h-[82vh] w-full flex-col overflow-hidden
          rounded-t-3xl
          border border-neutral-200
          bg-white
          shadow-2xl
          dark:border-neutral-800
          dark:bg-neutral-950
          sm:h-[680px]
          sm:max-w-xl
          sm:rounded-3xl
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div
          className="
            flex shrink-0 items-center justify-between
            border-b border-neutral-200
            px-4 py-3
            dark:border-neutral-800
          "
        >
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Choose a GIF
            </h2>

            <p className="mt-0.5 text-[11px] text-neutral-400">
              Search GIPHY or browse trending GIFs
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close GIF picker"
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-full
              text-neutral-500
              transition
              hover:bg-neutral-100
              hover:text-neutral-900
              active:scale-95
              dark:hover:bg-neutral-900
              dark:hover:text-white
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="shrink-0 px-3 py-3">
          <div
            className="
              flex h-11 min-w-0 items-center gap-2
              rounded-xl
              border border-neutral-200
              bg-neutral-100
              px-3
              dark:border-neutral-800
              dark:bg-neutral-900
            "
          >
            <Search size={17} className="shrink-0 text-neutral-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search GIFs..."
              className="
                min-w-0 flex-1
                border-0
                bg-transparent
                text-sm
                text-neutral-900
                outline-none
                placeholder:text-neutral-400
                focus:ring-0
                dark:text-white
              "
            />

            <button
              type="submit"
              className="
                shrink-0
                rounded-lg
                bg-purple-600
                px-3
                py-1.5
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-purple-500
                active:scale-95
              "
            >
              Search
            </button>
          </div>
        </form>

        {/* GIF Grid */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-xs text-neutral-400">Loading GIFs...</div>
            </div>
          ) : gifs.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-xs text-neutral-400">No GIFs found.</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => {
                    onSelect(gif.images.fixed_width.url);
                    onClose();
                  }}
                  className="
                    group
                    aspect-square
                    overflow-hidden
                    rounded-xl
                    bg-neutral-100
                    dark:bg-neutral-900
                  "
                >
                  <img
                    src={gif.images.fixed_width.url}
                    alt={gif.title || "GIF"}
                    loading="lazy"
                    className="
                      h-full
                      w-full
                      object-cover
                      transition
                      duration-200
                      group-hover:scale-105
                    "
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GIPHY Attribution */}
        <div
          className="
            shrink-0
            border-t
            border-neutral-200
            px-3
            py-2
            text-center
            text-[9px]
            text-neutral-400
            dark:border-neutral-800
          "
        >
          Powered By GIPHY
        </div>
      </div>
    </div>
  );
};

export default VibeGifPicker;
