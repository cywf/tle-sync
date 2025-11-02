import { useState, useEffect } from 'react';
import FilterBar from './FilterBar';

interface TLEEntry {
  path: string;
  name: string;
  size: number;
  epoch?: string;
  line1?: string;
  line2?: string;
  type?: 'LEO' | 'GEO' | null;
}

export default function TLEDataExplorer() {
  const [data, setData] = useState<TLEEntry[]>([]);
  const [filteredData, setFilteredData] = useState<TLEEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const base = import.meta.env.BASE_URL || '/tle-sync';

  useEffect(() => {
    fetch(`${base}/data/tle_catalog.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load TLE catalog');
        return res.json();
      })
      .then((catalog) => {
        setData(catalog);
        setFilteredData(catalog);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleFilterChange = ({
    search,
    orbitType,
    sortBy,
  }: {
    search: string;
    orbitType: string;
    sortBy: string;
  }) => {
    let filtered = [...data];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.name.toLowerCase().includes(searchLower) ||
          entry.path.toLowerCase().includes(searchLower)
      );
    }

    // Apply orbit type filter
    if (orbitType !== 'all') {
      filtered = filtered.filter((entry) => entry.type === orbitType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'filename':
          return a.name.localeCompare(b.name);
        case 'epoch':
          if (!a.epoch && !b.epoch) return 0;
          if (!a.epoch) return 1;
          if (!b.epoch) return -1;
          return new Date(b.epoch).getTime() - new Date(a.epoch).getTime();
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

    setFilteredData(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error loading TLE data: {error}</span>
      </div>
    );
  }

  return (
    <div>
      <FilterBar onFilterChange={handleFilterChange} />

      <div className="mb-4 text-sm opacity-70">
        Showing {filteredData.length} of {data.length} TLE files
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((entry) => (
          <div key={entry.path} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-sm font-mono break-all">
                {entry.name}
              </h3>

              {entry.type && (
                <div className="badge badge-primary badge-sm">{entry.type}</div>
              )}

              {entry.epoch && (
                <div className="text-xs opacity-70">
                  Epoch: {new Date(entry.epoch).toLocaleString()}
                </div>
              )}

              <div className="text-xs opacity-70">Size: {entry.size} bytes</div>

              {entry.line1 && entry.line2 && (
                <div className="bg-base-300 p-2 rounded text-xs font-mono overflow-x-auto mt-2">
                  <div className="opacity-50">TLE Preview:</div>
                  <div className="whitespace-nowrap">{entry.line1.substring(0, 90)}</div>
                  <div className="whitespace-nowrap">{entry.line2.substring(0, 90)}</div>
                </div>
              )}

              <div className="card-actions justify-end mt-2">
                <a
                  href={`${base}${entry.path}`}
                  download
                  className="btn btn-primary btn-sm"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="alert">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>No TLE files match your filters.</span>
        </div>
      )}
    </div>
  );
}
