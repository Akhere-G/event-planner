import { Link } from "react-router";

const Footer = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-surface-border mt-auto pt-12 pb-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-2xl font-black text-brand tracking-tight">
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="font-bold"
              >
                <span className="text-text-primary">Trip</span>

                <span className="text-brand-primary">Track</span>
              </Link>
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Plan your trips and collaborate with friends
            </p>
          </div>

          <div className="pt-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4">
              Plan
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  to="/"
                  className="text-text-secondary hover:text-brand-primary transition-colors"
                >
                  Trips
                </Link>
              </li>
              {isAuthenticated && (
                <>
                  <li>
                    <Link
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      to="/invites"
                      className="text-text-secondary hover:text-brand-primary transition-colors"
                    >
                      Invites
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      to="/addtrip"
                      className="text-text-secondary hover:text-brand-primary transition-colors"
                    >
                      New trip
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="pt-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4">
              Account
            </h3>
            <ul className="space-y-2 text-sm">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      to="/settings"
                      className="text-text-secondary hover:text-brand-primary transition-colors"
                    >
                      User Settings
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      to="/login"
                      className="text-text-secondary hover:text-brand-primary transition-colors"
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      to="/register"
                      className="text-text-secondary hover:text-brand-primary transition-colors"
                    >
                      Create Account
                    </Link>
                  </li>
                  {/* <li>
                    <Link
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      to="/login/request-password-reset"
                      className="text-text-secondary hover:text-brand-primary transition-colors"
                    >
                      Reset Password
                    </Link>
                  </li> */}
                </>
              )}
            </ul>
          </div>

          <div className="pt-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4">
              Connect
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  to="/about"
                  className="text-text-secondary hover:text-brand-primary transition-colors"
                >
                  About Project
                </Link>
              </li>
              {/* <li>
                <Link
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  to="/contact"
                  className="text-text-secondary hover:text-brand-primary transition-colors"
                >
                  Get in Touch
                </Link>
              </li> */}
              <li className="pt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-muted text-text-secondary border border-surface-border">
                  v2.0.26
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-border  pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-secondary">
            &copy; {year} Task Manager. Built for focused minds.
          </p>
          <div className="flex gap-6 text-xs text-text-secondary">
            <Link
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              to="/privacy"
              className="hover:text-brand-primary underline decoration-brand/30"
            >
              Privacy
            </Link>
            <Link
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              to="/terms"
              className="hover:text-brand-primary underline decoration-brand/30"
            >
              Terms
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-brand-primary font-bold transition-colors"
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
