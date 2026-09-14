export default function PrivacyPage() {
  return (
    <div className="container flex flex-col gap-6">
      <div className="card">
        <h1 className="title">Privacy Policy</h1>
        <p className="text-text-secondary text-sm mt-2">
          Last updated: 9 September 2026
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
          <strong>Email:</strong>{" "}
          <a
            href="mailto:101akhere5@gmail.com"
            className="text-brand-primary underline"
          >
            101akhere5@gmail.com
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

        <h3>1.4 Analytics and technical information</h3>

        <p>
          We use analytics tools to understand how users interact with TripTrack
          and to improve the application. These tools may collect information
          about your use of the service, including:
        </p>

        <ul>
          <li>Pages and features you use</li>
          <li>Actions you take within TripTrack</li>
          <li>Information about trips and features you interact with</li>
          <li>Whether certain features, including AI features, are used</li>
          <li>Application environment, such as development or production</li>
          <li>
            Technical information associated with the operation of the
            application
          </li>
        </ul>

        <p>
          For example, we may record events such as creating a trip, adding an
          activity, sending or accepting an invitation, using an AI feature,
          viewing a feature, or changing certain application preferences.
        </p>

        <p>
          We aim to collect only the information necessary for understanding
          product usage and improving TripTrack. We do not intentionally send
          passwords, authentication tokens, payment information, or the contents
          of private AI prompts or AI responses to our product analytics
          provider.
        </p>

        <h3>1.5 Information we currently do not collect</h3>

        <p>
          TripTrack currently does not allow users to upload files, photographs,
          passports, tickets or other documents.
        </p>

        <p>
          We may introduce additional types of information collection in the
          future. If we do, we will update this Privacy Policy as appropriate
          before or when the relevant processing begins.
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
          <li>Understand how users use TripTrack and improve the service.</li>
          <li>Measure the use and effectiveness of TripTrack features.</li>
          <li>Maintain and secure TripTrack.</li>
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
          understanding product usage, monitoring application performance and
          developing new features, provided that those interests are not
          overridden by your rights and freedoms.
        </p>

        <h3>Legal obligations</h3>

        <p>
          We may process information where necessary to comply with a legal
          obligation.
        </p>

        <h3>Consent</h3>

        <p>
          Where consent is required by applicable law, we will obtain your
          consent before carrying out the relevant processing. You may withdraw
          consent where processing is based on consent.
        </p>

        <h2>4. AI Features</h2>

        <p>TripTrack provides AI-powered features including:</p>

        <ul>
          <li>AI Plan Day</li>
          <li>AI Optimise Day</li>
          <li>AI event suggestions</li>
          <li>AI features that help populate trip days</li>
          <li>AI-generated trip insights</li>
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
          TripTrack may also collect analytics information about the use of its
          AI features. For example, we may record that an AI feature was used,
          whether an AI result was generated or accepted, and which type of AI
          feature was used. Product analytics information is used to understand
          feature usage and improve TripTrack.
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
          TripTrack uses third-party services to operate, secure, monitor and
          improve the application. These providers may process personal
          information on our behalf or as otherwise described in their own
          privacy policies.
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
          TripTrack uses Sentry for error reporting and application monitoring.
          Sentry may receive technical information associated with application
          errors so that we can identify, investigate and resolve problems.
        </p>

        <h3>PostHog</h3>

        <p>
          TripTrack uses PostHog for product analytics and application
          monitoring. PostHog helps us understand how users interact with
          TripTrack, measure feature usage, identify problems and improve the
          service.
        </p>

        <p>
          Depending on how you use TripTrack, PostHog may receive information
          such as your TripTrack user identifier and, where configured, account
          information such as your email address and username. It may also
          receive analytics events describing actions you take within TripTrack,
          such as creating or deleting a trip, creating an activity, sending or
          responding to an invitation, using an AI feature, viewing certain
          features or changing application preferences.
        </p>

        <p>
          Analytics events may contain limited contextual information needed to
          understand product usage, such as a trip identifier, destination, trip
          duration, feature type or user role. We do not intentionally send
          passwords, authentication tokens, payment information, or the contents
          of private AI prompts or AI responses to PostHog.
        </p>

        <p>
          PostHog may use cookies, local storage or similar technologies to
          provide analytics functionality and associate activity with a user or
          device. Where applicable law requires consent for these technologies,
          we will obtain the appropriate consent before using them.
        </p>

        <p>
          PostHog may process information outside the United Kingdom. Where
          personal information is transferred internationally, we will take
          appropriate steps to ensure that the transfer is carried out in
          accordance with applicable data protection law.
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
          Analytics information may be retained by our analytics providers for
          as long as necessary for legitimate business, security and analytical
          purposes, subject to applicable retention requirements and the
          providers' policies.
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
            href="mailto:101akhere5@gmail.com"
            className="text-brand-primary underline"
          >
            101akhere5@gmail.com
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
          TripTrack may also use analytics technologies, including technologies
          provided by PostHog, to understand how users interact with the
          application.
        </p>

        <p>
          Where applicable law requires consent before using non-essential
          cookies or similar technologies, we will provide appropriate
          information and obtain consent before using them.
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
          <strong>Email:</strong>{" "}
          <a
            href="mailto:101akhere5@gmail.com"
            className="text-brand-primary underline"
          >
            101akhere5@gmail.com
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
