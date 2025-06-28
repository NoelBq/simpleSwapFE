"use client";

import { useState } from "react";
import { Search, Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  useUserVerificationStatus,
  useAllVerificationRecords,
} from "@/hooks/useUserVerification";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function VerificationChecker() {
  const [searchAuthor, setSearchAuthor] = useState("");
  const [shouldSearch, setShouldSearch] = useState(false);

  // Get all verification records
  const {
    records,
    isLoading: isLoadingRecords,
    error: recordsError,
    refetch: refetchRecords,
  } = useAllVerificationRecords();

  // Search for specific user (only when shouldSearch is true)
  const {
    isVerified,
    index,
    author,
    isLoading: isSearching,
    error: searchError,
  } = useUserVerificationStatus(shouldSearch ? searchAuthor : "", 100);

  const handleSearch = () => {
    if (searchAuthor.trim()) {
      setShouldSearch(true);
      // The hook will automatically trigger when shouldSearch becomes true
    }
  };

  const handleClearSearch = () => {
    setShouldSearch(false);
    setSearchAuthor("");
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Verification Checker
        </h2>
        <p className="text-gray-600 mt-1">
          Check if users have verified the contract with the verifier
        </p>
      </div>

      {/* Search Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search for Specific User
        </h3>
        
        <div className="flex gap-3">
          <Input
            value={searchAuthor}
            onChange={(e) => setSearchAuthor(e.target.value)}
            placeholder="Enter author name to search..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={!searchAuthor.trim() || isSearching}>
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </Button>
          {shouldSearch && (
            <Button variant="outline" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </div>

        {/* Search Results */}
        {shouldSearch && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            {isSearching ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching for &ldquo;{searchAuthor}&rdquo;...
              </div>
            ) : searchError ? (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-4 h-4" />
                Error: {searchError}
              </div>
            ) : isVerified ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Verification Found!
                </div>
                <div className="text-sm text-gray-700">
                  <p><strong>Author:</strong> {author}</p>
                  <p><strong>Record Index:</strong> {index}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-4 h-4" />
                No verification found for &ldquo;{searchAuthor}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>

      {/* All Records Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            All Verification Records
          </h3>
          <Button
            variant="outline"
            onClick={refetchRecords}
            disabled={isLoadingRecords}
            size="sm"
          >
            {isLoadingRecords ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>

        {isLoadingRecords ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading verification records...
            </div>
          </div>
        ) : recordsError ? (
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-4 h-4" />
              Error loading records: {recordsError}
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
            No verification records found
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {records.map(({ index, author }) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {index}
                  </div>
                  <span className="font-medium text-gray-900">{author}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Verified</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {records.length > 0 && (
          <div className="text-sm text-gray-600 text-center">
            Total verified users: {records.length}
          </div>
        )}
      </div>
    </div>
  );
}
