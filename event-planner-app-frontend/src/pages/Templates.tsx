import { useState } from "react";
import { StateGate } from "../components";
import RegionToggles from "../features/templates/components/RegionToggles";
import TemplateCard from "../features/templates/components/TemplateCard";
import TemplatePinsMap from "../features/templates/components/TemplatePinsMap";
import {
  TEMPLATE_REGIONS,
  TEMPLATES_PAGE_SIZE,
  type TemplateRegion,
} from "../features/templates/constants";
import {
  useGetTemplatePinsQuery,
  useGetTemplatesQuery,
} from "../features/templates/services/templatesApiSlice";
import type { TemplatePin } from "../features/templates/types";
import { toggleRegion } from "../features/templates/utils";

function countByRegion(pins: TemplatePin[]) {
  const counts: Partial<Record<TemplateRegion, number>> = {};
  for (const pin of pins) {
    counts[pin.region] = (counts[pin.region] ?? 0) + 1;
  }
  return counts;
}

export default function Templates() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [regions, setRegions] = useState<TemplateRegion[]>([]);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isFetching, isError } = useGetTemplatesQuery({
    search,
    regions,
    limit: TEMPLATES_PAGE_SIZE,
    offset,
  });
  const { data: pinData } = useGetTemplatePinsQuery({ search, regions: [] });

  const templates = data?.data.templates ?? [];
  const searchPins = pinData?.data ?? [];
  const counts = countByRegion(searchPins);
  const availableRegions = TEMPLATE_REGIONS.filter((region) => counts[region]);
  const mapPins =
    regions.length === 0
      ? searchPins
      : searchPins.filter((pin) => regions.includes(pin.region));

  function handleToggle(region: TemplateRegion) {
    setRegions(toggleRegion(regions, region));
    setOffset(0);
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="order-first md:order-last h-72 md:h-[93.5vh] 2xl:h-[96vh] md:w-1/2 md:sticky md:top-0">
        <TemplatePinsMap pins={mapPins} />
      </div>
      <div className="md:w-1/2 min-w-0 md:shadow-[20px_0_30px_-10px_rgba(0,0,0,0.3)] z-1">
        <div className="container flex flex-col gap-6">
          <div className="card flex flex-col gap-3">
            <h2 className="title">Trip templates</h2>
            <p className="text-text-secondary">
              Start from a trip someone has already planned, then make it yours.
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
                className="form-input grow"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn-primary">
                Search
              </button>
            </form>
            <RegionToggles
              regions={availableRegions}
              selected={regions}
              counts={counts}
              onToggle={handleToggle}
            />
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
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
              {templates.map((template) => (
                <TemplateCard key={template.slug} template={template} />
              ))}
            </div>
            {data?.data.hasMore && (
              <button
                className="btn-secondary self-center"
                disabled={isFetching}
                onClick={() => setOffset(offset + TEMPLATES_PAGE_SIZE)}
              >
                {isFetching ? "Loading..." : "Load more"}
              </button>
            )}
          </StateGate>
        </div>
      </div>
    </div>
  );
}
