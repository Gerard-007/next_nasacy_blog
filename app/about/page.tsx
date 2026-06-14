import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="relative z-10 max-w-container-max mx-auto px-gutter text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md mb-8">
            Our Mission
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-balance mb-6 max-w-4xl mx-auto">
            Nasacy: Empowering the thinkers who{" "}
            <span className="text-primary">define tomorrow.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            A platform built for depth, where precision-crafted content meets a
            community of curious minds.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-content-max mx-auto px-gutter">
          <h2 className="font-headline-md text-headline-md mb-8 text-center">
            Our Story
          </h2>
          <div className="space-y-6 text-on-surface-variant">
            <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
              Nasacy began with a simple observation: the digital landscape
              was becoming increasingly fragmented, favoring rapid consumption
              over meaningful engagement. We envisioned a sanctuary—a space where
              the noise of the modern world could be silenced in favor of deep,
              intellectual exploration.
            </p>
            <p className="font-body-md text-body-md leading-relaxed">
              Founded by a collective of journalists, technologists, and
              researchers, we sought to return the focus to the written word. We
              believe that true insight requires time, patience, and a commitment
              to nuance. Our platform is not just a hosting service; it is a
              meticulously designed environment tailored for the high-end
              blogging experience.
            </p>

            {/* Story Image */}
            <div className="py-12">
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-outline-variant/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  alt="A bright, minimalist office space with floor-to-ceiling windows overlooking a serene garden"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBosGsYDSy_YV7UU6Mt_No1YvTyfXYQ-qRUC7KD0iFcvUVhIE6n9ECzIRJGHHYeNS0G5lm12UL1tJfoQPfC4yHwv6_mf__I2yihqQrNrhmObyRmXFoN2xK1YaNLNnajOTHD4sqIUTWu4thEzppuyLGhoYOPg8xlZbuE1gN97QwG22oMVLBWs_kZLJOP8DXcmEk-MQHELNb9f8y94Djb7HpdFdNGateENPpG2P1MTqwvlMgcuK5jU860Cw"
                />
              </div>
            </div>

            <p className="font-body-md text-body-md leading-relaxed">
              Today, Nasacy serves as the premier destination for thought
              leaders and industry experts. We provide the tools for creators to
              tell their stories without compromise, and for readers to discover
              ideas that genuinely matter.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-24 bg-surface">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-headline-md">Our Values</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              The principles that guide every decision we make.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="p-8 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">
                  verified
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-4">
                Quality over Quantity
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                We prioritize substantial, well-researched pieces that offer
                lasting value over fleeting viral trends.
              </p>
            </div>
            {/* Value 2 */}
            <div className="p-8 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 rounded-lg bg-secondary-container/10 flex items-center justify-center text-secondary mb-6">
                <span className="material-symbols-outlined text-3xl">
                  record_voice_over
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-4">
                Authentic Voices
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                We champion diverse perspectives and original thought, providing
                a stage for those with unique expertise.
              </p>
            </div>
            {/* Value 3 */}
            <div className="p-8 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 rounded-lg bg-tertiary-container/10 flex items-center justify-center text-tertiary mb-6">
                <span className="material-symbols-outlined text-3xl">
                  explore
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-4">
                Deep Exploration
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                We encourage rigorous inquiry and the courage to tackle complex
                subjects that require deep attention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-container-max mx-auto px-gutter text-center">
          <h2 className="font-headline-md text-headline-md mb-16">
            Meet the Team
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Member 1 */}
            <div className="group">
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-4 border-surface shadow-md mb-6 transition-transform group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  alt="Chinasa Chukwuemeka"
                  src="https://media.licdn.com/dms/image/v2/D4D03AQHaiw3aapzq5g/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1709928279483?e=2147483647&v=beta&t=_oKpaWR-zEycG5JGGwDfyIb1rpDj86tpja1pT2WkT8c"
                />
              </div>
              <h4 className="font-headline-sm text-headline-sm">
                Chinasa Chukwuemeka
              </h4>
              <p className="font-label-md text-label-md text-primary mt-1">
                Founder, Writer, Educator, Digital Marketer, Data Analyst
              </p>
            </div>
            {/* Member 2 */}
            <div className="group">
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-4 border-surface shadow-md mb-6 transition-transform group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  alt="Gerard Nwazuruoke"
                  src="https://media.licdn.com/dms/image/v2/D4D03AQG_y_JNjIFvUQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1673693661615?e=1782950400&v=beta&t=_xN72MQkIcabpXS59v32Kf8qK5EhwjLfWcaqJP3W6xo"
                />
              </div>
              <h4 className="font-headline-sm text-headline-sm">
                Gerard Nwazuruoke
              </h4>
              <p className="font-label-md text-label-md text-primary mt-1">
                Software | AI/ML | Cloud Automation Engineer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA Section */}
      <section className="py-24 bg-primary text-on-primary">
        <div className="max-w-container-max mx-auto px-gutter text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg mb-6">
              Ready to join the conversation?
            </h2>
            <p className="font-body-lg text-body-lg mb-10 max-w-2xl mx-auto opacity-90">
              Whether you&apos;re a writer with a story to tell or a reader
              seeking deeper understanding, there&apos;s a place for you in our
              community.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="bg-surface text-primary px-8 py-4 rounded-full font-label-md text-label-md hover:bg-surface-dim transition-all active:scale-95 shadow-xl"
              >
                Write To Us
              </Link>
              <Link
                href="/categories"
                className="border-2 border-surface text-on-primary px-8 py-4 rounded-full font-label-md text-label-md hover:bg-on-primary hover:text-primary transition-all active:scale-95"
              >
                Explore Our Topics
              </Link>
            </div>
          </div>
          {/* Background decorative element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </section>
    </div>
  );
}
