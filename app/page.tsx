import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f9f3eb]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4a9d94] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#1a1a1a]">CB HealthTracker</h1>
          </div>
          <Link
            href="/user"
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-6 leading-tight">
            Care Made Simple<br />for Seniors and Families
          </h2>
          <p className="text-lg text-[#6b6b6b] mb-8">
            Simplify life and bring peace of mind to families and seniors — all in one secure app.
            Keep medications on schedule, stay on top of check-ins, and keep family connected -
            safe, private, and built for you.
          </p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <Link
              href="/demo"
              className="bg-[#4a9d94] text-white px-6 py-4 rounded-xl font-medium text-lg hover:bg-[#3d8880] transition-colors text-center"
            >
              Try Demo
            </Link>
            <Link
              href="/user"
              className="bg-[#4a9d94] text-white px-6 py-4 rounded-xl font-medium text-lg hover:bg-[#3d8880] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#1a1a1a]">
          Everything Seniors Need
        </h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
            title="Family Peace of Mind"
            description="Share health updates effortlessly with loved ones — everyone stays connected and reassured."
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
            title="Medication Reminders"
            description="Smart reminders that never miss a dose — with simple tracking and easy logging."
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title="Daily Check-ins"
            description="One tap to let family know you're okay. Build streaks and stay connected."
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            title="Private & Secure"
            description="Your health data stays on your device. No accounts required, no data sold."
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            title="Works Offline"
            description="No internet? No problem. Your health data is always accessible on your device."
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title="Activity History"
            description="Track medications taken, check-ins completed, and see your health journey."
          />
        </div>
      </section>

      {/* Why Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <svg className="w-8 h-8 text-[#4a9d94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-2xl md:text-3xl font-bold text-[#1a1a1a]">
              Why I Built This
            </h3>
          </div>
          <div className="space-y-4 text-[#6b6b6b] text-lg leading-relaxed">
            <p>
              CB HealthTracker was born from love and from worry. Like millions of families, I found myself in that delicate and often painful place. I wanted to protect my father, who raised me, while also honoring his independence. How can I care for my father while juggling my own life while constantly wondering if he is okay? Did he remember to take his meds? What if something happens and no one knows?
            </p>
            <p>
              That kind of worry doesn&apos;t go away. It sits with you in quiet moments, during meetings, and late at night. It&apos;s the kind of invisible weight that only those who&apos;ve been there truly understand. So, I created CB HealthTracker. Not just as another piece of technology, but as the answer I was searching for. A way to care for the people we love without taking away their dignity, a way to stay connected without hovering, and a way to know. Not just hope, but know that they&apos;re safe, well, and supported.
            </p>
            <p>
              CB HealthTracker is a way of turning that ache into action. It&apos;s the peace of mind we all longed for when we couldn&apos;t be there in person. It is the reassurance we wanted at 2 a.m. when the phone didn&apos;t ring but could have. It is the gentle bridge between independence and care, between freedom and safety.
            </p>
            <p>
              For me, this isn&apos;t just a product. It&apos;s personal. It always has been. I created it for every family feeling the same things I did: love, fear, hope, and the constant quiet wish to do right by the people who once cared for us.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-[#4a9d94] rounded-2xl p-8 md:p-12 text-white text-center max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Start Today.</h3>
          <p className="text-lg mb-8 opacity-90">
            No credit card, no account required. Just simpler care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link
              href="/demo"
              className="flex-1 bg-white text-[#4a9d94] px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              Try Demo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/user"
              className="flex-1 bg-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[#9a9a9a] max-w-5xl mx-auto">
          <p>&copy; 2025 CB HealthTracker. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-[#6b6b6b] cursor-pointer">Privacy</span>
            <span className="hover:text-[#6b6b6b] cursor-pointer">Terms</span>
            <span className="hover:text-[#6b6b6b] cursor-pointer">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="text-[#4a9d94] mb-4">
        {icon}
      </div>
      <h4 className="text-lg font-semibold mb-2 text-[#1a1a1a]">{title}</h4>
      <p className="text-[#6b6b6b]">{description}</p>
    </div>
  );
}
