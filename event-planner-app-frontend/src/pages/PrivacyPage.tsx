export default function PrivacyPage() {
  return (
    <div className="container flex flex-col gap-6">
      <div className="card">
        <h1 className="title">Privacy Policy</h1>
        <p className="text-text-secondary text-sm mt-2">
          Last updated: 11 August 2026
        </p>
      </div>

      <article className="card flex flex-col gap-4">
        <p>
          This Privacy Policy explains how TripTrack ("TripTrack", "we", "us",
          or "our") collects, uses, stores and shares personal information when
          you use the TripTrack application and website.
        </p>

        <p>
          TripTrack is currently operated by an individual and has not been
          incorporated as a company. For the purposes of data protection law,
          the individual operating TripTrack is the data controller responsible
          for your personal information.
        </p>

        <p>
          If you have any questions about this Privacy Policy or how your
          information is handled, please contact:
        </p>

        <p>
          <strong>Email:</strong>
          <a
            href="mailto:akhereaihoeghinlan@gmail.com"
            className="text-brand-primary underline"
          >
            akhereaihoeghinlan@gmail.com
          </a>
        </p>

        <h2>1. Information We Collect</h2>

        <h3>1.1 Account information</h3>

        <p>When you create a TripTrack account, we collect:</p>

        <ul>
          <li>Username</li>
          <li>Email address</li>
          <li>Password</li>
        </ul>

        <p>
          Your password is stored securely in a form that is not intended to
          allow us to retrieve your original password.
        </p>

        <h3>1.2 Trip information</h3>

        <p>When you create or use a trip, we may collect:</p>

        <ul>
          <li>Trip name</li>
          <li>Destination</li>
          <li>Activity names and details</li>
          <li>Activity start and end times</li>
          <li>Addresses</li>
          <li>Latitude and longitude coordinates</li>
          <li>Notes and other information you enter into your trip</li>
        </ul>

        <p>
          This information is necessary to provide TripTrack's core
          functionality, including creating, organising and displaying your
          travel plans.
        </p>

        <h3>1.3 Information about other users</h3>

        <p>
          TripTrack allows you to invite other users to collaborate on trips.
        </p>

        <p>
          When you join a shared trip, other users who have access to that trip
          may be able to see:
        </p>

        <ul>
          <li>Your TripTrack username</li>
          <li>Your email address</li>
          <li>The trip information contained within that shared trip</li>
        </ul>

        <p>
          Similarly, you may be able to see the usernames and email addresses of
          other users who have access to the same trip, as well as the trip
          information they contribute.
        </p>

        <p>You should therefore only share a trip with people you trust.</p>

        <h3>1.4 Information we currently do not collect</h3>

        <p>
          TripTrack currently does not allow users to upload files, photographs,
          passports, tickets or other documents.
        </p>

        <p>
          We also do not currently collect additional technical information such
          as IP addresses, browser information or device identifiers for
          analytics purposes.
        </p>

        <p>
          We may introduce additional technical or analytics data collection in
          the future. If we do, we will update this Privacy Policy before or
          when the relevant processing begins, as appropriate.
        </p>

        <h2>2. How We Use Your Information</h2>

        <p>We use your personal information to:</p>

        <ul>
          <li>Create and manage your TripTrack account.</li>
          <li>Authenticate you when you sign in.</li>
          <li>Create, store and display your trips.</li>
          <li>Allow you to create and manage activities within trips.</li>
          <li>Allow you to collaborate with other users.</li>
          <li>
            Display trip locations and activities using mapping functionality.
          </li>
          <li>Provide TripTrack's AI features.</li>
          <li>Maintain, secure and improve TripTrack.</li>
          <li>Detect, investigate and resolve technical problems.</li>
          <li>Respond to requests and enquiries.</li>
          <li>Comply with applicable legal obligations.</li>
        </ul>

        <p>
          We do not currently sell your personal information to advertisers or
          other third parties.
        </p>

        <h2>3. Legal Bases for Processing</h2>

        <p>
          Where UK data protection law applies, we process personal information
          using appropriate lawful bases under the UK GDPR.
        </p>

        <h3>Contract</h3>

        <p>
          We process information where it is necessary to provide TripTrack's
          services to you, including creating your account and providing
          trip-planning and collaboration functionality.
        </p>

        <h3>Legitimate interests</h3>

        <p>
          We may process information where this is necessary for our legitimate
          interests, such as maintaining, securing and improving TripTrack,
          provided that those interests are not overridden by your rights and
          freedoms.
        </p>

        <h3>Legal obligations</h3>

        <p>
          We may process information where necessary to comply with a legal
          obligation.
        </p>

        <h2>4. AI Features</h2>

        <p>TripTrack provides AI-powered features including:</p>

        <ul>
          <li>AI Plan Day</li>
          <li>AI Optimise Day</li>
        </ul>

        <p>
          To provide these features, information from your trip may be sent to
          third-party AI service providers.
        </p>

        <p>Depending on the feature, TripTrack may use:</p>

        <ul>
          <li>Google Gemini</li>
          <li>
            Groq, including the <code>llama-3.1-8b-instant</code> model
          </li>
        </ul>

        <p>
          Information sent to AI services may include information necessary to
          generate or optimise your itinerary, such as destinations, activities,
          locations, dates, times and notes.
        </p>

        <p>
          You should avoid entering sensitive personal information into
          TripTrack, particularly information that is not necessary for planning
          your trip.
        </p>

        <p>
          AI-generated results may be inaccurate or incomplete. TripTrack does
          not guarantee that AI-generated travel recommendations, itineraries or
          optimisations are accurate.
        </p>

        <p>
          TripTrack does not use your trip information to train its own AI
          models.
        </p>

        <h2>5. Third-Party Services</h2>

        <p>
          TripTrack uses third-party services to operate and improve the
          application.
        </p>

        <h3>Google Cloud</h3>

        <p>
          TripTrack is hosted using Google Cloud, including Google Cloud Run.
          Your TripTrack account and trip data are stored using infrastructure
          provided by Google Cloud.
        </p>

        <h3>Google Maps Platform</h3>

        <p>
          TripTrack uses Google Maps APIs to provide mapping and location
          functionality.
        </p>

        <p>
          When you use mapping features, information such as locations or
          addresses may be processed through Google Maps services.
        </p>

        <h3>Sentry</h3>

        <p>
          TripTrack intends to use Sentry for error reporting and application
          monitoring. Sentry may receive technical information associated with
          application errors so that we can identify, investigate and resolve
          problems.
        </p>

        <h3>PostHog</h3>

        <p>
          TripTrack intends to use PostHog for application monitoring and
          analytics. If analytics are enabled, PostHog may process information
          about how users interact with TripTrack in order to help us understand
          application usage and improve the service.
        </p>

        <h2>6. Sharing Your Information With Other TripTrack Users</h2>

        <p>TripTrack is designed to support collaborative trip planning.</p>

        <p>
          If you invite another user to a trip, that user may have access to
          information associated with that trip, including:
        </p>

        <ul>
          <li>Your username</li>
          <li>Your email address</li>
          <li>Trip name</li>
          <li>Destination</li>
          <li>Activities</li>
          <li>Activity locations</li>
          <li>Addresses</li>
          <li>Latitude and longitude coordinates</li>
          <li>Dates and times</li>
          <li>Notes</li>
          <li>Other information contained within the shared trip</li>
        </ul>

        <p>
          Other users with access to a trip may therefore be able to view
          information that you have added to that trip.
        </p>

        <p>
          You are responsible for considering who you invite to your trips and
          what information you enter into shared trips.
        </p>

        <h2>7. Data Retention</h2>

        <p>
          We currently retain account and trip information for as long as your
          account remains active.
        </p>

        <p>
          At present, TripTrack does not automatically delete inactive accounts
          or old trips after a defined period.
        </p>

        <p>
          If you delete your account or request deletion of your personal
          information, we will take reasonable steps to delete the relevant
          information, subject to any information that we are legally required
          or permitted to retain.
        </p>

        <p>
          We may retain limited information where necessary to comply with legal
          obligations, resolve disputes, prevent fraud or abuse, or otherwise
          protect our legitimate interests.
        </p>

        <h2>8. Data Security</h2>

        <p>
          We take reasonable technical and organisational measures to protect
          personal information against unauthorised access, loss, misuse,
          alteration or disclosure.
        </p>

        <p>
          However, no internet-based service can guarantee absolute security.
        </p>

        <p>
          You are responsible for keeping your TripTrack password confidential
          and should not share it with other people.
        </p>

        <h2>9. International Data Transfers</h2>

        <p>
          Some of the third-party services used by TripTrack may process
          personal information outside the United Kingdom.
        </p>

        <p>
          Where personal information is transferred internationally, we will
          take appropriate steps to ensure that the transfer is carried out in
          accordance with applicable data protection law.
        </p>

        <h2>10. Your Data Protection Rights</h2>

        <p>
          Depending on the circumstances and applicable law, you may have rights
          relating to your personal information, including the right to:
        </p>

        <ul>
          <li>Request access to the personal information we hold about you.</li>
          <li>Request correction of inaccurate or incomplete information.</li>
          <li>Request deletion of your personal information.</li>
          <li>Request restriction of processing.</li>
          <li>Object to certain processing.</li>
          <li>
            Request transfer of certain personal information to you or another
            organisation.
          </li>
          <li>Withdraw consent where processing is based on consent.</li>
        </ul>

        <p>
          These rights are subject to certain legal conditions and exceptions.
        </p>

        <p>To exercise any of these rights, contact:</p>

        <p>
          <a
            href="mailto:akhereaihoeghinlan@gmail.com"
            className="text-brand-primary underline"
          >
            akhereaihoeghinlan@gmail.com
          </a>
        </p>

        <h2>11. Children's Privacy</h2>

        <p>TripTrack is not specifically designed for children.</p>

        <p>
          You must be old enough to lawfully use TripTrack in your jurisdiction
          and enter into the applicable agreement with us.
        </p>

        <h2>12. Cookies and Similar Technologies</h2>

        <p>
          TripTrack may use cookies or similar technologies that are necessary
          for the operation and security of the service.
        </p>

        <p>
          If we introduce analytics, advertising or other non-essential cookies
          or similar technologies, we will provide appropriate information and,
          where required, obtain consent before using them.
        </p>

        <h2>13. Changes to This Privacy Policy</h2>

        <p>We may update this Privacy Policy from time to time.</p>

        <p>
          When we make changes, we will update the "Last updated" date at the
          top of this policy.
        </p>

        <p>
          If we make material changes to the way we process personal
          information, we will take reasonable steps to notify affected users
          where required.
        </p>

        <h2>14. Contact Us</h2>

        <p>
          If you have questions about this Privacy Policy, want to exercise your
          data protection rights, or have concerns about how your information is
          being handled, please contact:
        </p>

        <p>
          <strong>Email:</strong>
          <a
            href="mailto:akhereaihoeghinlan@gmail.com"
            className="text-brand-primary underline"
          >
            akhereaihoeghinlan@gmail.com
          </a>
        </p>

        <p>
          <strong>TripTrack operator:</strong> Individual operator of TripTrack
        </p>

        <h2>15. Complaints</h2>

        <p>
          If you are unhappy with how we have handled your personal information,
          please contact us first so that we have an opportunity to address your
          concern.
        </p>

        <p>
          You also have the right to complain to the UK's data protection
          regulator, the Information Commissioner's Office (ICO).
        </p>

        <p>Information about making a complaint is available from the ICO.</p>
      </article>
    </div>
  );
}
