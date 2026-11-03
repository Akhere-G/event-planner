import { useState } from "react";
import { StateGate } from "../components";
import TemplateCard from "../features/templates/components/TemplateCard";
import { useGetTemplatesQuery } from "../features/templates/services/templatesApiSlice";

const LIMIT = 12;

export default function Templates() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isFetching, isError } = useGetTemplatesQuery({
    search,
    limit: LIMIT + offset,
    offset: 0,
  });
  const templates = data?.data.templates ?? [];

  return (
    <div className="container flex flex-col gap-6">
      <div className="card flex flex-col gap-3">
        <h2 className="title">Trip templates</h2>
        <p className="text-text-secondary">
          Start from a trip planned by someone else, then make it yours.
        </p>
        <form
          role="search"
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setOffset(0);
            setSearch(searchInput.trim());
          }}
        >
          <input
            type="search"
            aria-label="Search by destination"
            placeholder="Search by destination"
            className="grow rounded-lg border border-surface-border bg-surface px-3 py-2"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </div>
      <StateGate
        loadingStateProps={{ isLoading, message: "Loading templates..." }}
        errorStateProps={{ isError, message: "Failed to load templates." }}
        emptyStateProps={{
          isEmpty: templates.length === 0,
          message: search
            ? `No templates found for "${search}".`
            : "No templates have been published yet.",
        }}
      >
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.slug} template={template} />
          ))}
        </div>
        {data?.data.hasMore && (
          <button
            className="btn-secondary self-center"
            disabled={isFetching}
            onClick={() => setOffset((prev) => prev + LIMIT)}
          >
            {isFetching ? "Loading..." : "Load more"}
          </button>
        )}
      </StateGate>
    </div>
  );
}
