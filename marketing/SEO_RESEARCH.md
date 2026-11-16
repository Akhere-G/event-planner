# TripTrack travel content research and implementation report

Research date: 16 November 2026

## Subsequent additions

The collection now includes six articles. Bangkok vs Hanoi was added at the user's
request, targeting the destination-decision query `Bangkok vs Hanoi` at
`/articles/bangkok-vs-hanoi`. It compares cost, food, attractions, transport,
accommodation, nightlife, weather and suggested trip length, with contextual links
to both destination guides and both four-day templates. Its factual research uses
the Tourism Authority of Thailand, Vietnam Tourism, BTS and Chao Phraya Express
Boat; the exact links are included with the article. Its priority reflects the
explicit editorial request and existing guide coverage, not verified keyword volume.

All six articles now contain two additional body photographs each, sourced from
Pexels. Twelve distinct local assets use responsive Next Image rendering, lazy
loading, descriptive alt text and visible photographer credits. The two newest
images show Wat Arun and Hoan Kiem Lake. Full source links and photographer names
are recorded in `public/articles/CREDITS.md`; the original Unsplash heroes remain.

The original five-article delivery report follows below as a record of that initial
research and implementation.

## Method and limitations

The existing marketing application, all 13 `DestinationGuide` records, their
itinerary-template links, metadata, structured data, robots rules and sitemap were
reviewed before selecting topics.

Google Trends Explore was attempted with the requested five-year UK comparison for
`travel itinerary`, `trip planner`, `travel guide`, `holiday planning` and `travel
planning`. The service returned HTTP 429 (Too Many Requests) in both the text research
tool and a live browser. Therefore, this report does **not** claim to have observed
five-year or 12-month Google Trends scores, rising queries, regional comparisons or
seasonality from the Explore interface. No relative-interest scores, search volumes or
keyword-difficulty figures have been invented.

The fallback evidence uses public Google search-trend publications, Google Year in
Search methodology, Expedia first-party search data, a UK search-sector report and
official tourism/transport sources. It supports a conservative first collection, not
a claim that these five keywords have the largest absolute search volumes.

## Demand findings used

- Google says price and comparison terms such as “cheap”, “best”, “compare” and
  “review” are common modifiers in travel-planning searches. The same UK analysis
  reports a 30% uplift in interest for “solo travel” and says consumers spend 74% of
  the travel journey planning, booking and daydreaming, versus 26% travelling.
- Google’s 2025 US Year in Search placed Tokyo, New York and Prague among the ten
  fastest-growing destination modifiers in its “Travel Itinerary” list. The list
  measures year-on-year growth, not total search volume.
- Expedia’s Q1 2026 first-party search data ranked Paris second and Amsterdam fifth
  for EMEA travellers; Tokyo ranked first and Seoul third for APAC travellers. Its Q2
  2026 data kept Tokyo first and moved Seoul to second for APAC travellers. This is
  destination demand evidence, not keyword volume for the exact comparison phrases.
- Kinesso’s UK travel-sector report found generic holiday searches to be the largest
  search category in its September 2023–August 2024 dataset, at 3.4 million searches
  per month. It reported peaks in January and again in July/August. That supports
  evergreen planning content and seasonal editorial refreshes.
- The comparison topics also align directly with six established TripTrack guides and
  six usable itinerary templates, giving each article a strong next step without
  creating a duplicate destination landing page.

## Published article roadmap

| Priority | Article | Primary keyword | Intent | Why it was selected |
| --- | --- | --- | --- | --- |
| 1 | How to Create a Travel Itinerary That Actually Works | how to create a travel itinerary | Informational, task completion | Direct match for TripTrack’s core use case and Google’s itinerary-growth evidence; distinct from any destination guide. |
| 2 | Paris vs Amsterdam: Which Is Better for a City Break? | Paris vs Amsterdam | Destination decision | Both cities ranked strongly in Expedia’s EMEA data and already have complete TripTrack guides/templates. |
| 3 | Tokyo vs Seoul: Which Is Better for Your Holiday? | Tokyo vs Seoul | Destination decision | Tokyo and Seoul led Expedia’s APAC searches, while Tokyo appeared in Google’s trending itinerary list. |
| 4 | Travel Planning Checklist: Everything to Do Before You Go | travel planning checklist | Informational, task completion | Evergreen planning need with natural links to TripTrack’s flights, itinerary, map, sharing and calendar features. |
| 5 | Prague vs Budapest: Which City Should You Visit? | Prague vs Budapest | Destination decision | Prague appeared in Google’s trending itinerary list; both cities have closely comparable three-day TripTrack templates. |

Published URLs:

- `/articles/how-to-create-travel-itinerary`
- `/articles/travel-planning-checklist`
- `/articles/paris-vs-amsterdam`
- `/articles/tokyo-vs-seoul`
- `/articles/prague-vs-budapest`

Category URLs:

- `/articles/category/travel-planning`
- `/articles/category/destination-comparisons`

## Sources used

Demand and strategy:

- [Google: key search trends influencing UK travel](https://business.google.com/uk/think/consumer-insights/uk-travel-search-trends/)
- [Google Year in Search 2025, US](https://trends.withgoogle.com/year-in-search/2025/us/?hl=en-US)
- [Google Year in Search methodology](https://trends.withgoogle.com/year-in-search/data-methodology/)
- [Expedia Group Q2 2026 travel trends](https://partner.expediagroup.com/en-us/resources/blog/q2-2026-travel-trends-insights)
- [Expedia Group Q3 2026 travel trends](https://partner.expediagroup.com/en-us/resources/blog/q3-2026-travel-trends-insights)
- [Kinesso UK Travel and Tourism Sector Report](https://www.kinesso.co.uk/wp-content/uploads/2024/10/Travel-Tourism-Sector-Report.pdf)

Factual article checks:

- Paris je t’aime official tourism guidance and neighbourhood directory
- I amsterdam official neighbourhood and public-transport guidance
- GO TOKYO official transport, season and itinerary guidance
- Visit Seoul official district, transport and first-visit itinerary guidance
- Prague City Tourism and Prague Public Transit Company visitor guidance
- Budapest’s official visitor site and BKK public-transport guidance
- UK government foreign travel checklist and destination advice
- NHS Fit for Travel

The exact source links relevant to each article are rendered at the end of that article.

## Images

The implementation reuses the marketing application’s locally optimised Unsplash
assets and existing verified credits. Each new article has a different hero image:

- Paris vs Amsterdam: Paris by Chris Karidis
- Tokyo vs Seoul: Tokyo by Timo Volz
- Prague vs Budapest: Prague by William Zhang
- How to Create a Travel Itinerary: Barcelona by Logan Armstrong
- Travel Planning Checklist: Bangkok by Anantachai Saothong

Every image has descriptive alt text, fixed dimensions, responsive `sizes`, a 16:9
crop and an on-page Unsplash credit. Reusing the existing local assets avoids a new
remote image dependency while preserving the current Next Image optimisation path.

## Internal linking and conversion

- Every comparison links to both corresponding destination guides and both itinerary
  templates in the body and in a related planning block.
- The itinerary article links contextually to the Barcelona guide and four-day
  template; the checklist links to the Bangkok guide and four-day template.
- Related-article cards connect articles with the same search intent.
- Category pages expose both content clusters.
- Contextual TripTrack references explain saved places, day planning, maps, flights,
  Google Calendar and sharing. Each article has one restrained final CTA rather than
  repeated promotional banners.

## SEO implementation

Each article has a unique title, description, clean slug, canonical path, Open Graph
metadata, Twitter card metadata, initial-HTML metadata, descriptive image alt text,
`BlogPosting` JSON-LD and `BreadcrumbList` JSON-LD. The article index, category pages,
all five articles and all related guide pages are present in the generated sitemap.
All article and category routes are statically generated.

## Topics deliberately not published

- Restaurant listicles and “hidden gems” pages were deferred. They require a larger
  venue-by-venue verification pass for current opening status, booking rules and
  pricing, and would overlap heavily with the existing guide sections.
- “Best places to visit in 2027” and other year-led round-ups were deferred because
  the inaccessible Trends interface prevented the requested emerging-demand check,
  and publishing before that research would encourage speculative recommendations.
- Exact-duration destination articles such as “3 days in Paris” were deferred where
  an existing TripTrack itinerary template already serves that intent. A future
  article should add materially richer editorial guidance rather than duplicate a
  template.
- Budget-destination rankings were deferred because a defensible comparison requires
  a dated, consistent cost dataset across all destinations.
- Solo-travel and nightlife rankings were deferred despite promising demand signals;
  they need safety, late-transport and neighbourhood research across the full city
  set before publication.

## Verification

- `npm run lint` passes.
- `next build --webpack` passes and statically generates all five article pages, both
  category pages, the article index, the 13 destination guides, robots and sitemap.
- The default Turbopack build cannot run in the managed execution environment because
  its CSS worker is denied permission to bind a local port. This is an environment
  restriction rather than a TypeScript or application compilation failure; the
  webpack production build completes successfully.
