"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Linkedin,
  Menu,
  Mail,
  Network,
  Sparkles,
  UserRound,
  X,
  Workflow,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { defaultPortfolioContent, type PortfolioContent, type PortfolioProject } from "../lib/portfolio-data";

const capabilities = [
  [Network, "Business Development", "Identify growth opportunities and build strong commercial relationships around them."],
  [BrainCircuit, "Market Analysis", "Understand market trends, customer needs, and competitive landscapes to guide decisions."],
  [Code2, "Data Analysis", "Turn data into clear findings that support practical business decisions."],
  [Sparkles, "Animation & Visual Storytelling", "A personal interest in animation and the ways visuals bring ideas to life."],
];

const experience = [
  ["Business Development Lead", "Growth Strategy & Partnerships", "Developing commercial opportunities and relationships that support sustainable business growth."],
  ["Head of Market Analysis", "Market & Competitive Intelligence", "Leading market analysis to track industry trends, understand customer needs, and identify opportunities."],
  ["Data + Creative", "Data Analysis & Animation", "Using data analysis to surface useful patterns, with a personal interest in animation and visual storytelling."],
];

const marketPathA = "M0,640 L120,600 L260,580 L390,620 L500,500 L640,420 L820,450 L980,370 L1110,310 L1250,340 L1400,260 L1600,180";
const marketPathB = "M0,700 L170,650 L350,560 L520,610 L650,540 L780,580 L930,500 L1080,470 L1220,430 L1360,360 L1600,280";
const marketPathC = "M0,760 L150,720 L260,680 L400,700 L560,640 L720,660 L860,610 L1040,570 L1180,520 L1340,460 L1600,380";
const marketCompanies = [
  { name: "NVIDIA", ticker: "NVDA", price: "$118.42", change: "+2.4%", direction: "up", path: "M2 21 L12 17 L22 19 L32 10 L42 13 L54 3" },
  { name: "Microsoft", ticker: "MSFT", price: "$421.11", change: "+0.8%", direction: "up", path: "M2 18 L12 20 L22 12 L32 15 L42 8 L54 5" },
  { name: "Apple", ticker: "AAPL", price: "$213.07", change: "−0.6%", direction: "down", path: "M2 7 L12 11 L22 8 L32 16 L42 13 L54 22" },
  { name: "Tesla", ticker: "TSLA", price: "$315.35", change: "−1.3%", direction: "down", path: "M2 5 L12 8 L22 6 L32 15 L42 12 L54 21" },
];
const contactEmail = "siam.appalux@gmail.com";

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function WorkCard({ project, position }: { project: PortfolioProject; position: number }) {
  return (
    <Reveal delay={position * 0.08}>
      <motion.article className="projectCard" whileHover={{ y: -7 }} transition={{ duration: 0.25 }}>
        <div className="projectTop"><span>{project.index} / {project.published ? "FEATURED PROJECT" : "DRAFT PROJECT"}</span><ArrowUpRight size={20} /></div>
        <div className={`projectArt art${position + 1}`}>
          <div className="projectVisualCanvas" aria-hidden="true">
            <div className="projectVisualHeader"><span>{project.visual}</span><span>OVERVIEW</span></div>
            {project.imageUrl ? <img className="projectCoverImage" src={project.imageUrl} alt="" /> : project.kind === "market" && (
              <svg className="trendVisual" viewBox="0 0 320 150" preserveAspectRatio="none">
                <path className="trendArea" d="M0 119 C28 105 39 115 61 92 S103 99 127 73 S165 88 191 55 S228 68 251 37 S293 47 320 13 V150 H0 Z" />
                <path className="trendLine" d="M0 119 C28 105 39 115 61 92 S103 99 127 73 S165 88 191 55 S228 68 251 37 S293 47 320 13" />
                <circle cx="251" cy="37" r="4" />
              </svg>
            )}
            {!project.imageUrl && project.kind === "analysis" && (
              <div className="analysisVisual">
                <div className="analysisSummary"><strong>Data patterns</strong><span>Segment comparison</span></div>
                <div className="heatmapVisual">{Array.from({ length: 36 }, (_, cell) => <span className={`heatCell heatCell${cell % 6 + 1}`} key={cell} />)}</div>
                <div className="heatmapLegend"><span>LOW</span><i /><i /><i /><i /><span>HIGH</span></div>
              </div>
            )}
            {!project.imageUrl && project.kind === "network" && (
              <svg className="networkVisual" viewBox="0 0 320 150">
                <path d="M51 89 103 49 151 93 211 39 269 75M103 49 124 126 211 39 226 120 269 75M51 89 124 126 151 93 226 120" />
                <circle cx="51" cy="89" r="6" /><circle cx="103" cy="49" r="8" /><circle cx="151" cy="93" r="5" />
                <circle cx="211" cy="39" r="7" /><circle cx="269" cy="75" r="9" /><circle cx="124" cy="126" r="6" /><circle cx="226" cy="120" r="5" />
              </svg>
            )}
            {!project.imageUrl && project.kind === "football" && (
              <motion.div
                className="playerVisual"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="playerOverall"><span>DEMO PLAYER</span><strong>84</strong><small>OVERALL</small></div>
                <div className="playerStats">
                  {[["PAC", 82], ["SHO", 76], ["PAS", 88], ["DRI", 85], ["DEF", 64], ["PHY", 72]].map(([label, value]) => (
                    <div className="playerStat" key={label}>
                      <span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            <span className="visualAxis">SIGNALS <i /> INSIGHTS <i /> DECISIONS</span>
          </div>
        </div>
        <p className="projectCategory">{project.visual}</p>
        <h3>{project.title}</h3>
        <p className="projectSummary">{project.summary}</p>
        <div className="tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </motion.article>
    </Reveal>
  );
}

export default function Portfolio({ content = defaultPortfolioContent }: { content?: PortfolioContent }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 24, mass: 0.25 });
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 160]);
  const [mouse, setMouse] = useState({ x: 50, y: 20 });
  const [contactState, setContactState] = useState<"idle" | "sending" | "sent" | "saved" | "fallback">("idle");
  const [fallbackEmailHref, setFallbackEmailHref] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pageViewRecorded = useRef(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouse({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useEffect(() => {
    if (pageViewRecorded.current) return;
    pageViewRecorded.current = true;
    void fetch("/api/analytics/visit", { method: "POST", keepalive: true }).catch(() => {});
  }, []);

  async function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactState("sending");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });

      if (!response.ok) throw new Error("Message could not be saved");
      const result = await response.json() as { emailSent?: boolean };
      form.reset();
      setContactState(result.emailSent ? "sent" : "saved");
    } catch {
      const name = String(formData.get("name") ?? "");
      const email = String(formData.get("email") ?? "");
      const message = String(formData.get("message") ?? "");
      setFallbackEmailHref(
        `mailto:${contactEmail}?subject=${encodeURIComponent(`Portfolio contact from ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`,
      );
      setContactState("fallback");
    }
  }

  return (
    <main>
      <motion.div className="progress" style={{ scaleX: progress }} />
      <div
        className="spotlight"
        style={{ background: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, rgba(223,101,73,.12), transparent 30%)` }}
      />
      <div
        className="marketBackdrop"
        aria-hidden="true"
        style={{
          transform: `translate(${(mouse.x - 50) * 0.45}px, ${(mouse.y - 50) * 0.2}px)`,
        }}
      >
        <div className="marketMeta">
          <span className="marketLabel marketLabelPrimary">TECH MARKET</span>
          <span className="marketLabel">AI AUTOMATION</span>
          <span className="marketLabel">AGENTS</span>
        </div>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="lineGlowA" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#3ef2ff" />
              <stop offset="50%" stopColor="#6c9cff" />
              <stop offset="100%" stopColor="#ff4fb8" />
            </linearGradient>
            <linearGradient id="lineGlowB" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#2ee6d6" />
              <stop offset="100%" stopColor="#a24dff" />
            </linearGradient>
            <linearGradient id="lineGlowC" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#ff5db1" />
              <stop offset="100%" stopColor="#ffb870" />
            </linearGradient>
          </defs>

          <path d={marketPathA} className="marketLine lineA" />
          <path d={marketPathB} className="marketLine lineB" />
          <path d={marketPathC} className="marketLine lineC" />
        </svg>
      </div>

      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="Home">
          <span className="brandMark"><Activity size={19} strokeWidth={2.2} /></span>
          <span className="brandName">SIAM<span>.</span></span>
        </a>
        <div className={`navlinks${mobileMenuOpen ? " isOpen" : ""}`} id="site-navigation">
          <a href="#work" onClick={() => setMobileMenuOpen(false)}>Work</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
        </div>
        <div className="navActions">
          <a className="navcta" href="#contact">Let&apos;s talk <ArrowUpRight size={15} /></a>
          <button
            className="menuToggle"
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="site-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>

      <section id="top" className="hero shell">
        <motion.div className="heroCopy" style={{ y: heroY }}>
          <motion.div
            className="eyebrow"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="liveDot" /> BUSINESS DEVELOPMENT · MARKET ANALYSIS · DATA INSIGHTS
          </motion.div>

          <div className="heroTitleWrap">
            {['SPOT THE', 'SIGNAL.', 'FIND THE'].map((line, i) => (
              <div className="titleClip" key={line}>
                <motion.h1
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.85, delay: 0.12 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line}
                </motion.h1>
              </div>
            ))}
            <div className="titleClip accentLine">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.85, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <span>OPENING.</span>
              </motion.h1>
            </div>
          </div>

          <motion.div
            className="heroBottom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.7 }}
          >
            <p>
              I&apos;m <strong>Siam</strong> — a business development lead and head of market analysis. I use market
              research and data analysis to uncover opportunities, and I have a personal interest in animation.
            </p>
            <a className="circleButton" href="#work" aria-label="See selected work">
              <ArrowDownRight size={28} />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="heroVisual"
          initial={{ opacity: 0, scale: 0.94, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="orb orbA" />
          <div className="orb orbB" />
          <motion.div className="portraitModule" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.7 }}>
            <div className="portraitCircle" role="img" aria-label="Portrait of Siam">
              {content.profileImageUrl ? <img src={content.profileImageUrl} alt="Siam" /> : <UserRound size={48} strokeWidth={1.1} />}
            </div>
            <span className="portraitStatus">SIAM · MARKET INTELLIGENCE</span>
          </motion.div>
          <motion.div
            className="glassCard cardMain"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="cardTop">
              <span><Sparkles size={16} /> MARKET PULSE</span>
              <span className="sampleTag">SAMPLE</span>
            </div>
            <div className="marketCardTitle">
              <strong>Global tech</strong>
              <span>Selected leaders</span>
            </div>
            <div className="marketRows">
              {marketCompanies.map((company) => {
                const ChangeIcon = company.direction === "up" ? ArrowUpRight : ArrowDownRight;
                return (
                  <div className={`marketRow ${company.direction}`} key={company.ticker}>
                    <div className="marketCompany">
                      <span className="companyMark">{company.ticker.slice(0, 1)}</span>
                      <span className="companyName"><strong>{company.name}</strong><small>{company.ticker}</small></span>
                    </div>
                    <svg className="marketSparkline" viewBox="0 0 56 26" aria-hidden="true">
                      <path d={company.path} />
                    </svg>
                    <div className="marketQuote">
                      <strong>{company.price}</strong>
                      <span><ChangeIcon size={12} />{company.change}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="cardFooter">Illustrative snapshot · USD, not live data</div>
          </motion.div>
        </motion.div>
      </section>

      <section className="marqueeWrap" aria-hidden="true">
        <div className="marquee">
          <span>MARKET RESEARCH ✦ BUSINESS DEVELOPMENT ✦ DATA ANALYSIS ✦ GROWTH STRATEGY ✦ ANIMATION ✦ </span>
          <span>MARKET RESEARCH ✦ BUSINESS DEVELOPMENT ✦ DATA ANALYSIS ✦ GROWTH STRATEGY ✦ ANIMATION ✦ </span>
        </div>
      </section>

      <section id="work" className="section shell">
        <Reveal>
          <div className="sectionHead">
            <div><span className="kicker">DATA & MARKET INTELLIGENCE</span><h2>Make data<br/>mean something.</h2></div>
            <p>Selected work across market research, data analysis, Big Data, and football analytics. Each preview is an example of the analysis and storytelling behind the work.</p>
          </div>
        </Reveal>

        <div className="projectGrid">
          {content.projects.filter((project) => project.published).map((project, i) => <WorkCard project={project} position={i} key={project.id} />)}
        </div>
      </section>

      <section id="about" className="section shell splitSection">
        <Reveal>
          <span className="kicker">STRENGTHS & INTERESTS</span>
          <h2 className="displayMedium">Find the signal.<br/>Build the opportunity.</h2>
        </Reveal>
        <div className="capabilities">
          {capabilities.map(([Icon, title, body], i) => {
            const IconComponent = Icon as typeof BrainCircuit;
            return (
              <Reveal delay={i * .06} key={String(title)}>
                <div className="capability">
                  <div className="iconBox"><IconComponent size={22}/></div>
                  <div><h3>{String(title)}</h3><p>{String(body)}</p></div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="section shell">
        <Reveal>
          <div className="experiencePanel">
            <div className="experienceIntro">
              <span className="kicker">EXPERIENCE</span>
              <h2>Market-aware.<br/>Growth-focused.</h2>
              <p>I connect market insight and data analysis to business development, helping teams understand where the next opportunity lies.</p>
            </div>
            <div className="experienceRows">
              {experience.map(([meta, title, body]) => (
                <div className="experienceRow" key={title}>
                  <div className="experienceMeta">{meta}</div>
                  <div><h3>{title}</h3><p>{body}</p></div>
                  <CheckCircle2 size={20}/>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section id="contact" className="contact shell">
        <Reveal>
          <div className="contactInner">
            <span className="kicker">START A CONVERSATION</span>
            <h2>See an opportunity?<br/><span>Let&apos;s grow it.</span></h2>
            <p>Let&apos;s talk about business development, market analysis, data insights, or a new growth opportunity.</p>
            <form className="contactForm" onSubmit={handleContactSubmit}>
              <div className="contactFields">
                <label>Name<input name="name" autoComplete="name" maxLength={100} required /></label>
                <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
              </div>
              <label>Message<textarea name="message" rows={5} maxLength={5000} required /></label>
              <label className="honeypot" aria-hidden="true">
                Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              <div className="contactActions">
                <button className="primaryBtn" type="submit" disabled={contactState === "sending"}>
                  <Mail size={18} /> {contactState === "sending" ? "Sending..." : "Send message"} <ArrowUpRight size={17} />
                </button>
                <a className="iconBtn" href="https://www.linkedin.com/in/abdur-rahman-siam-52315021a/" target="_blank" rel="noreferrer" aria-label="Open Siam's LinkedIn profile" title="LinkedIn profile">
                  <Linkedin size={19} />
                </a>
                <a className="emailLink" href={`mailto:${contactEmail}`}>Email me</a>
              </div>
              <p className="formStatus" role="status" aria-live="polite">
                {contactState === "sent" && "Thanks, your message has been sent."}
                {contactState === "saved" && "Thanks, your message is saved in Siam's admin inbox."}
                {contactState === "fallback" && <>Server email is unavailable. <a href={fallbackEmailHref}>Open a prefilled email to Siam</a>.</>}
              </p>
            </form>
          </div>
        </Reveal>
      </section>

      <footer className="footer shell">
        <span>© 2026 SIAM</span>
        <span>DHAKA · AVAILABLE GLOBALLY</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
