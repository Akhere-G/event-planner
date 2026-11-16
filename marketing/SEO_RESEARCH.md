# TripTrack travel content research and implementation report

Research date: 16 November 2026

## Product marketing article cluster: research and delivery

This section records the product-market research and implementation completed on
16 November 2026. It supplements the destination-content research below.

### TripTrack feature and pricing audit

The marketing site, React client and Flask services were checked before writing.
The published articles only rely on features that have matching implementation:

- Trip creation supports manual entry, templates and prompt-based generation.
- Activities can be added, edited and arranged in day, list and calendar views.
- Google Maps libraries provide place search, place details, pins, directions and
  route modes inside the itinerary.
- AI services generate trips, suggest ways to fill time and produce reviewable
  change proposals. The UI previews changes before applying them.
- Invitations, Admin/Editor/Viewer roles and realtime trip updates support group
  planning.
- Google Calendar has account connection, per-trip enable/disable, bootstrap jobs,
  webhook handling and changes in both directions. TripTrack also exports `.ics`.
- Flights can be searched by route or flight number, saved, edited and displayed on
  the relevant days. No implementation of real-time disruption alerts was verified,
  so the articles say “flight search and saved flight details”, not “live tracking”.
- Accommodation, packing lists, shared expenses, balances and settlements are
  implemented. Word itinerary export is also present.
- Anonymous trip creation exists in the application, but there is no public pricing
  page, subscription price or formal free-tier contract. The new articles therefore
  do not call TripTrack free.
- No native mobile application or verified offline itinerary mode was found.

### Google Trends findings

Google Trends Explore was checked directly for the UK, US and worldwide markets over
the past five years and past 12 months. The comparison used `travel planner`,
`travel planning app`, `itinerary planner`, `AI travel planner` and
`Wanderlog alternative` as search terms.

The figures below are rounded averages of the weekly relative-interest index within
each five-term comparison. They are not search volumes, cannot be compared as absolute
market sizes between rows and should not be treated as keyword-difficulty scores.

| Market and period | travel planner | travel planning app | itinerary planner | AI travel planner | Wanderlog alternative |
| --- | ---: | ---: | ---: | ---: | ---: |
| UK, five years | 59 | 1 | 3 | <1 | <1 |
| UK, 12 months | 63 | 3 | 5 | 1 | <1 |
| US, five years | 32 | 3 | 6 | 2 | <1 |
| US, 12 months | 50 | 9 | 7 | 5 | <1 |
| Worldwide, five years | 45 | 4 | 7 | 3 | <1 |
| Worldwide, 12 months | 71 | 12 | 10 | 8 | <1 |

Useful related-query signals:

- In the UK five-year view, `notion travel planner`, `wanderlog` and
  `travel ai planner` were breakout related queries for `travel planner`; `trip
  planner ai` was up 3,950%.
- UK five-year related queries for `itinerary planner` included breakout AI variants,
  `wanderlog` and `google sheets` (+350%).
- In the UK 12-month view, `best travel apps for planning` was a breakout related
  query. `ai itinerary planner` was up 110%, while `travel itinerary planner`,
  `itinerary planner app` and `travel planner` were each up 60% as related queries.
- US five-year related queries also showed breakout growth for AI trip-planning
  variants.
- `Wanderlog alternative` did not have enough UK data for a related-query report and
  remained below one in the compared Trends series. It is retained as a commercially
  relevant comparison cluster, not presented as a high-volume keyword.

Google Keyword Planner was not available without an authenticated advertising
account. No Keyword Planner volume or competition figures are claimed.

### Competitors investigated

Official product, help and pricing pages were checked for:

- **Wanderlog:** free itinerary/map/collaboration workflow; Pro from US$39.99/year
  or US$16.99/month, with offline access, route optimisation, Gmail scanning and
  unlimited AI. Official help confirms view/edit collaboration permissions.
- **TripIt:** free itinerary organiser and US$49/year Pro plan. Email-confirmation
  import is the core workflow. Pro adds real-time flight alerts and related travel-day
  tools. Its calendar feed is read-only; trip sharing can grant edit permissions.
- **Google Maps:** saved and shared place lists, discovery and navigation. It is a
  component of a planning workflow rather than a full booking itinerary.
- **Google Sheets and Docs:** no-cost real-time collaboration and version history;
  highly flexible, but without native travel-specific map, flight or itinerary logic.
- **Notion:** free individual plan and US$10/member/month Plus price on the page
  checked; strong custom databases and collaboration, with setup required for a
  travel workflow.
- **Roadtrippers:** road-trip specialist. Free plan is one saved trip with three
  stops; paid plans start at US$35.99/year. Higher tiers add more stops, collaboration,
  navigation, traffic, offline maps and RV tools.
- **Polarsteps:** planning, tracking, sharing and travel memories remain free; the
  optional Plus subscription adds enhanced maps, statistics and Travel Book benefits.
- **Stippl:** AI itinerary, route, budget, packing, documents, journal and group
  planning across web and mobile. Official pages describe the core planner as free
  and list a €5/month Pro plan on the itinerary page checked.

App Store listings and recent user reviews were used as qualitative checks, not as a
substitute for official feature documentation. Wanderlog users commonly praise its
map, organisation and family-group workflow; some recent long-trip feedback reports
lag or complexity. TripIt reviews emphasise having reservation details in one place.
Roadtrippers reviews praise stop ordering and route planning but request deeper
expense tracking. Polarsteps reviews praise travel sharing and memories while some
users request stronger collaboration.

### Published priorities

| Priority | Article and URL | Primary keyword | Secondary keywords | Intent and reason |
| --- | --- | --- | --- | --- |
| 1 | **Best Travel Planning Apps: 8 Tools Compared Honestly** — `/articles/best-travel-planning-apps` | best travel planning apps | best apps for planning travel; travel itinerary planner; trip planning software | Broad commercial investigation. It matches the strongest general Trends theme and the rising UK “best travel apps for planning” query while using explicit inclusion criteria rather than claiming a popularity ranking. |
| 2 | **Wanderlog vs TripTrack: Which Travel Planner Fits Your Trip?** — `/articles/wanderlog-vs-triptrack` | Wanderlog vs TripTrack | Wanderlog alternative; TripTrack travel planner; Wanderlog comparison | High product relevance. Wanderlog appears repeatedly in rising related queries, but the article does not overstate the sparse exact-alternative demand. |
| 3 | **TripTrack vs TripIt: Planning App or Booking Organiser?** — `/articles/triptrack-vs-tripit` | TripTrack vs TripIt | TripIt alternative; TripIt comparison; travel itinerary organiser | High commercial intent and a genuinely useful distinction between pre-booking planning and post-booking organisation. |

The three pages form a deliberate initial cluster: a broad comparison sends readers
to two direct alternatives, and all three link back to the product, destination guides,
templates and one another. This avoids publishing overlapping “best free”, “most
popular” and “best websites” listicles before there is enough evidence to distinguish
their search intent.

### Images, internal links and conversion

- Every article uses an existing locally stored Unsplash hero with verified credit.
- The comparison pages add genuine TripTrack screenshots of the calendar/map,
  Google-powered map, roles, flights and shared budget. No competitor interface was
  fabricated or reproduced from an unverified source.
- Screenshots use responsive Next Image rendering, explicit dimensions, lazy loading,
  borders and descriptive alt text.
- Each article includes a restrained final CTA to the TripTrack app, direct links to
  a relevant destination guide and itinerary template, source links and cards for the
  other comparison articles.
- The copy lets readers evaluate the product without claiming that registration,
  pricing or a permanent free tier works in a way that has not been verified.

### SEO implementation

- A new `product-comparisons` category is statically generated and linked from the
  article index.
- Every article has a unique title, description, slug, canonical URL, Open Graph and
  Twitter metadata in the initial static HTML.
- `TravelArticle` now stores researched secondary keywords. BlogPosting JSON-LD
  includes the primary and secondary keyword set.
- Each page renders BlogPosting and BreadcrumbList structured data.
- The generated sitemap automatically includes the new category and all three pages.
- Headings follow one H1 with descriptive H2/H3 sections; comparison criteria are
  rendered as accessible tables.

### Verification and outstanding issues

- `npm run lint` passes.
- `npm run build -- --webpack` passes and statically generates all three new article
  pages, the new category, existing articles, guides, robots and sitemap.
- The broad comparison page was rendered in the local browser. The canonical URL,
  metadata description, H1, JSON-LD and responsive layout were verified.
- Prices are dated snapshots in USD or EUR and need editorial review before future
  updates. Polarsteps did not expose a stable public Plus price in the official pages
  reviewed, so no amount is quoted.
- Google Trends is relative and sampled. Re-run it before a major roadmap refresh.
- Keyword Planner, Search Console conversion data and live SERP rankings were not
  available. These should inform the next publishing batch.
- TripTrack should publish a clear pricing/plan page before targeting “free travel
  planner” terms. Until then, avoid free-plan claims in metadata and body copy.
- Competitor screenshots were deliberately deferred. Add them only from current,
  permission-safe product captures with dates and alt text.

### Files changed for this cluster

- `app/articles/types.ts`
- `app/articles/index.ts`
- `app/articles/[slug]/page.tsx`
- `app/articles/components/ArticleElements.tsx`
- `app/articles/content/best-travel-planning-apps.tsx`
- `app/articles/content/wanderlog-vs-triptrack.tsx`
- `app/articles/content/triptrack-vs-tripit.tsx`
- Six existing article records updated with secondary-keyword metadata
- `SEO_RESEARCH.md`

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
