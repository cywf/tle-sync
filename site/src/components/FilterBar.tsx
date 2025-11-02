import { useState } from 'react';

interface FilterBarProps {
  onFilterChange: (filters: {
    search: string;
    orbitType: string;
    sortBy: string;
  }) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [search, setSearch] = useState('');
  const [orbitType, setOrbitType] = useState('all');
  const [sortBy, setSortBy] = useState('filename');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value, orbitType, sortBy });
  };

  const handleOrbitChange = (value: string) => {
    setOrbitType(value);
    onFilterChange({ search, orbitType: value, sortBy });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onFilterChange({ search, orbitType, sortBy: value });
  };

  return (
    <div className="card bg-base-200 shadow-xl mb-6">
      <div className="card-body">
        <h3 className="card-title text-lg">Filters & Sorting</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Search</span>
            </label>
            <input
              type="text"
              placeholder="Filename, NORAD CATID..."
              className="input input-bordered"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Orbit Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Orbit Type</span>
            </label>
            <select
              className="select select-bordered"
              value={orbitType}
              onChange={(e) => handleOrbitChange(e.target.value)}
            >
              <option value="all">All Orbits</option>
              <option value="LEO">LEO Only</option>
              <option value="GEO">GEO Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Sort By</span>
            </label>
            <select
              className="select select-bordered"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="filename">Filename</option>
              <option value="epoch">Epoch</option>
              <option value="size">Size</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
