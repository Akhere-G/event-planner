# TripTrack

Travel planning, simplified. TripTrack replaces messy spreadsheets and endless browser tabs with a single unified platform to plan routes, collaborate with friends, and let AI handle the logistical heavy lifting.

**🔗 [Live Deployment](https://tripapp-752853711822.europe-west2.run.app/)**

---

## Why Use TripTrack?

* **AI Trip Generator:** Plan a whole trip from a single sentence.
* **AI Trip Editing:** Change your plan by just asking. Review every AI change before it's applied.
* **Smart Planning:** Fills empty time, fixes timing clashes and drafts packing lists. You approve every change.
* **Realtime Collaboration:** Invite your group and everyone sees changes the moment they happen, on every device. No more chasing the latest version in a group chat.
* **Google Calendar Sync:** Keep each trip in step with Google Calendar. Changes made on either side show up on the other, so the whole group always has the right plan.
* **Flight Search:** Search flights for your trip and keep them alongside your itinerary, so travel plans stay in one place.
* **Map & Calendar View:** See your schedule and your map on one clean screen. No more switching between apps to work out where you need to be.
* **Budget & Expenses:** Track what everyone spends, split costs and settle up in a few clicks, without the awkward maths.
* **Trip Templates:** Start from premade destination templates and make them your own in seconds.
* **Google Event Search:** Find restaurants, museums and hidden landmarks and add them to your trip with a single click.
* **Admin & Viewer Roles:** Stay in control. Give co-planners full editing rights, or let others follow the itinerary without changing it.
* **Calendar & Word Export:** Take your plans anywhere. Export to your calendar app as an .ics file, or download the whole trip as a Word document.

---

## Technical Architecture

TripTrack is engineered as a decoupled, modern full-stack web application optimised for rapid geodata rendering and real-time client state synchronisation.

### Frontend Client

The presentation layer operates as a highly responsive single-page application built around structured validation and strict type safety.

* **Core Framework:** React with TypeScript
* **State Management:** Redux (Global trip and itinerary syncing)
* **Data Validation:** Yup (Client-side schema validation prior to API transmission)
* **Mapping Integration:** Google Maps API (Spatial visualisations and path planning)

### Backend Services

The backend API handles core business logic, strict relational database mapping, and conversational AI prompt parsing.

* **Language & Framework:** Python with Flask (Application Factory Pattern)
* **Database ORM:** SQLAlchemy (Modern relational schemas)
* **Serialization/Parsing:** Marshmallow (Strict data type marshalling and clean API contracts)
* **AI Engine:** Gemini AI (Powering day planning, itinerary optimization, and travel tips)

---

## Technology Matrix

| Layer | Component | Primary Objective |
| :--- | :--- | :--- |
| **Frontend** | React / TypeScript | Component layout architecture and type safety |
| **State & Validation** | Redux / Yup | Real-time state synchronization and form validation |
| **Backend API** | Python / Flask | Scalable RESTful endpoint orchestration |
| **Database ORM** | SQLAlchemy | Relational state structure and transaction mapping |
| **Serialization** | Marshmallow | API input validation and JSON formatting schemas |
| **Integrations** | Google Maps / Gemini / Google Calendar | Interactive geo-tracking, automated AI intelligence and two-way calendar sync |
