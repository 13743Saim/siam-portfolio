"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, ArrowDown, ArrowUp, Check, ImagePlus, LogOut, Mail, Plus, Save, ShieldCheck, Trash2, Upload } from "lucide-react";
import worldMap from "@svg-maps/world";
import type { PortfolioContent, PortfolioProject, ProjectKind } from "../lib/portfolio-data";
import type { ContactSubmission, SiteView } from "../lib/supabase-server";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const analyticsColors = ["#57d6c7", "#f0b45d", "#e77f70", "#79afe3", "#b39be3", "#a9c86c"];
const world = worldMap as unknown as { viewBox: string; locations: { id: string; name: string; path: string }[] };

function countryName(code: string) {
  return code === "ZZ" ? "Unknown" : countryNames.of(code) ?? code;
}

const blankProject = (): PortfolioProject => ({
  id: `project-${crypto.randomUUID()}`,
  index: "",
  title: "",
  summary: "",
  tags: [],
  visual: "PROJECT PREVIEW",
  kind: "analysis",
  imageUrl: "",
  published: true,
});

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [inboxError, setInboxError] = useState("");
  const [siteViews, setSiteViews] = useState<SiteView[]>([]);
  const [analyticsError, setAnalyticsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loginUnavailable, setLoginUnavailable] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const loginRef = useRef<HTMLInputElement>(null);

  async function checkSetup() {
    try {
      const response = await fetch("/api/admin/status", { cache: "no-store" });
      const status = await response.json() as { adminConfigured?: boolean; storageConfigured?: boolean };
      setLoginUnavailable(!status.adminConfigured);
      setStorageUnavailable(!status.storageConfigured);
    } catch {
      setLoginUnavailable(true);
      setStorageUnavailable(true);
    }
  }

  async function loadContent() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/portfolio", { cache: "no-store" });
      const result = await response.json();
      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (response.status === 503) {
        setLoginUnavailable(true);
        setAuthenticated(false);
        return;
      }
      if (!response.ok) throw new Error(result.error || "Could not load portfolio.");
      const loadedContent = result as PortfolioContent;
      setContent(loadedContent);
      setSavedSnapshot(JSON.stringify(loadedContent));
      setAuthenticated(true);
      await loadMessages();
      await loadAnalytics();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load portfolio.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    setInboxError("");
    try {
      const response = await fetch("/api/admin/messages", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load contact messages.");
      setMessages(result as ContactSubmission[]);
    } catch (cause) {
      setInboxError(cause instanceof Error ? cause.message : "Could not load contact messages.");
    }
  }

  async function loadAnalytics() {
    setAnalyticsError("");
    try {
      const response = await fetch("/api/admin/analytics", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load visitor analytics.");
      setSiteViews(result as SiteView[]);
    } catch (cause) {
      setAnalyticsError(cause instanceof Error ? cause.message : "Could not load visitor analytics.");
    }
  }

  useEffect(() => {
    void (async () => {
      await checkSetup();
      await loadContent();
    })();
  }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setLoginUnavailable(false);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Login failed.");
      setPassword("");
      await checkSetup();
      await loadContent();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setContent(null);
    setNotice("");
    loginRef.current?.focus();
  }

  async function upload(file: File, kind: "profile" | "project", projectId?: string) {
    if (!content) return;
    if (file.size > 4 * 1024 * 1024) throw new Error("Choose an image smaller than 4 MB.");
    const body = new FormData();
    body.set("file", file);
    body.set("kind", kind);
    if (projectId) body.set("projectId", projectId);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Image upload failed.");
    setContent((current) => current && (kind === "profile"
      ? { ...current, profileImageUrl: result.url }
      : { ...current, projects: current.projects.map((project) => project.id === projectId ? { ...project, imageUrl: result.url } : project) }));
  }

  async function save() {
    if (!content) return;
    const snapshot = JSON.stringify(content);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: snapshot,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save changes.");
      setSavedSnapshot(snapshot);
      setNotice("Changes saved and published to your portfolio.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  function updateProject(id: string, changes: Partial<PortfolioProject>) {
    setContent((current) => current && ({
      ...current,
      projects: current.projects.map((project) => project.id === id ? { ...project, ...changes } : project),
    }));
  }

  function moveProject(id: string, offset: -1 | 1) {
    setContent((current) => {
      if (!current) return current;
      const projects = [...current.projects];
      const index = projects.findIndex((project) => project.id === id);
      const target = index + offset;
      if (index < 0 || target < 0 || target >= projects.length) return current;
      [projects[index], projects[target]] = [projects[target], projects[index]];
      return { ...current, projects: projects.map((project, position) => ({ ...project, index: String(position + 1).padStart(2, "0") })) };
    });
  }

  async function handleImage(file: File | undefined, kind: "profile" | "project", projectId?: string) {
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await upload(file, kind, projectId);
      setNotice(kind === "profile" ? "Profile photo uploaded. Save to publish it." : "Project image uploaded. Save to publish it.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image upload failed.");
    } finally {
      setBusy(false);
    }
  }

  function removeImage(kind: "profile" | "project", projectId?: string) {
    setContent((current) => current && (kind === "profile"
      ? { ...current, profileImageUrl: "" }
      : { ...current, projects: current.projects.map((project) => project.id === projectId ? { ...project, imageUrl: "" } : project) }));
    setNotice("");
  }

  function deleteProject(id: string, title: string) {
    if (!window.confirm(`Delete ${title || "this project"}? This change takes effect when you save.`)) return;
    setContent((current) => current && ({
      ...current,
      projects: current.projects.filter((project) => project.id !== id)
        .map((project, index) => ({ ...project, index: String(index + 1).padStart(2, "0") })),
    }));
    setNotice("");
  }

  const visitsByCountry = [...siteViews.reduce((counts, view) => counts.set(view.country_code, (counts.get(view.country_code) ?? 0) + 1), new Map<string, number>())]
    .map(([code, count]) => ({ code, count, name: countryName(code) }))
    .sort((first, second) => second.count - first.count);
  const topPieCountries = visitsByCountry.slice(0, 5);
  const pieCountries = [...topPieCountries];
  if (visitsByCountry.length > 5) pieCountries.push({ code: "OTHER", name: "Other", count: visitsByCountry.slice(5).reduce((total, place) => total + place.count, 0) });
  const totalPieVisits = pieCountries.reduce((total, place) => total + place.count, 0);
  let pieStart = 0;
  const pieStops = pieCountries.map((place, index) => {
    const end = pieStart + (totalPieVisits ? place.count / totalPieVisits * 100 : 0);
    const stop = `${analyticsColors[index % analyticsColors.length]} ${pieStart}% ${end}%`;
    pieStart = end;
    return stop;
  });

  if (loading) {
    return <main className="adminPage"><div className="adminLoading">Loading portfolio workspace...</div></main>;
  }

  if (!authenticated || !content) {
    return (
      <main className="adminPage">
        <form className="adminLogin" onSubmit={login}>
          <a className="adminBrand" href="/" aria-label="Siam portfolio home"><span className="brandMark"><ShieldCheck size={19} /></span><span>SIAM<span>.</span> ADMIN</span></a>
          <span className="adminKicker">PRIVATE WORKSPACE</span>
          <h1>Sign in to<br />your portfolio.</h1>
          <p>Manage your profile photo, project details, and public work samples.</p>
          {loginUnavailable && <div className="adminSetupNote">Admin sign-in is not configured. Add <code>ADMIN_PASSWORD</code> and a 32-character <code>ADMIN_SESSION_SECRET</code> to your server environment, then reload this page.</div>}
          {!loginUnavailable && storageUnavailable && <div className="adminSetupNote">Portfolio storage is not configured. Add <code>SUPABASE_URL</code> and <code>SUPABASE_SECRET_KEY</code> to your server environment, then reload this page.</div>}
          <label htmlFor="admin-password">Admin password</label>
          <input ref={loginRef} id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="adminError" role="alert">{error}</p>}
          <button className="adminPrimary" type="submit" disabled={busy || loginUnavailable || storageUnavailable}>{busy ? "Signing in..." : "Sign in"}</button>
          <a className="adminBack" href="/">Back to portfolio</a>
        </form>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <a className="adminBrand" href="/" aria-label="Siam portfolio home"><span className="brandMark"><ShieldCheck size={19} /></span><span>SIAM<span>.</span> ADMIN</span></a>
        <div className="adminHeaderActions"><a href="/" target="_blank" rel="noreferrer">View portfolio</a><button className="adminIconButton" type="button" aria-label="Sign out" title="Sign out" onClick={logout}><LogOut size={17} /></button></div>
      </header>

      <div className="adminShell">
        <div className="adminTitleRow"><div><span className="adminKicker">CONTENT MANAGEMENT</span><h1>Portfolio workspace</h1><p>Edit what visitors see on your public portfolio.</p></div><div className="adminSaveActions"><span className={`adminSaveStatus${JSON.stringify(content) !== savedSnapshot ? " isDirty" : ""}`}>{JSON.stringify(content) !== savedSnapshot ? "Unsaved changes" : "All changes saved"}</span><button className="adminPrimary adminSave" type="button" onClick={save} disabled={busy || JSON.stringify(content) === savedSnapshot}><Save size={17} />{busy ? "Saving..." : "Save & publish"}</button></div></div>
        {(error || notice) && <div className={`adminNotice${error ? " isError" : ""}`} role={error ? "alert" : "status"}>{error || <><Check size={16} />{notice}</>}</div>}

        <section className="adminSection" aria-labelledby="admin-analytics-title">
          <div className="adminSectionHeading"><div><span className="adminKicker">AUDIENCE</span><h2 id="admin-analytics-title">Visitor analytics</h2></div><p>Country-level visits over the last 30 days. No IP addresses are stored.</p></div>
          {analyticsError ? <p className="adminInboxEmpty isError" role="alert">{analyticsError}</p> : <>
            <div className="adminAnalyticsSummary"><div><strong>{siteViews.length}</strong><span>Visits</span></div><div><strong>{visitsByCountry.length}</strong><span>Countries</span></div><div><strong>{visitsByCountry[0]?.name ?? "-"}</strong><span>Top location</span></div></div>
            {siteViews.length === 0 ? <p className="adminInboxEmpty">No visitor data yet.</p> : <div className="adminAnalyticsGrid">
              <div className="adminAnalyticsBlock"><h3>Visitors around the world</h3><div className="adminWorldMap"><svg viewBox={world.viewBox} role="img" aria-label="World map shaded by visitor count per country">{world.locations.map((location) => { const code = location.id.toUpperCase(); const count = visitsByCountry.find((place) => place.code === code)?.count ?? 0; const intensity = count ? 0.2 + (count / visitsByCountry[0].count) * 0.72 : 0.08; return <path key={location.id} d={location.path} fill={`rgba(87, 214, 199, ${intensity})`}><title>{`${location.name}: ${count} ${count === 1 ? "visit" : "visits"}`}</title></path>; })}</svg></div><div className="adminMapLegend"><span>0</span><i /><span>More visits</span><span className="adminMapUnknown">Unknown: {visitsByCountry.find((place) => place.code === "ZZ")?.count ?? 0}</span></div><p className="adminMapAttribution">Map data by <a href="https://github.com/VictorCazanave/svg-maps/tree/master/packages/world" target="_blank" rel="noreferrer">Victor Cazanave</a>, licensed under CC BY 4.0.</p></div>
              <div className="adminAnalyticsBlock"><h3>Visits by country</h3><div className="adminPieChartRow"><div className="adminPieChart" role="img" aria-label={`Visit share: ${pieCountries.map((place) => `${place.name} ${Math.round(place.count / totalPieVisits * 100)}%`).join(", ")}`} style={{ background: `conic-gradient(${pieStops.join(", ")})` }} /><ul className="adminPieLegend">{pieCountries.map((place, index) => <li key={place.code}><i style={{ background: analyticsColors[index % analyticsColors.length] }} /><span>{place.name}</span><strong>{place.count}</strong></li>)}</ul></div></div>
            </div>}
          </>}
          <button className="adminInboxRefresh" type="button" onClick={() => void loadAnalytics()}><Activity size={15} />Refresh analytics</button>
        </section>

        <section className="adminSection" aria-labelledby="admin-inbox-title">
          <div className="adminSectionHeading"><div><span className="adminKicker">CONTACT</span><h2 id="admin-inbox-title">Inbox <span className="adminCount">{messages.length}</span></h2></div><p>Messages submitted through your portfolio contact form.</p></div>
          {inboxError ? <p className="adminInboxEmpty isError" role="alert">{inboxError}</p> : messages.length === 0 ? <p className="adminInboxEmpty">No messages yet.</p> : <div className="adminInboxTableWrap"><table className="adminInboxTable"><thead><tr><th scope="col">Received</th><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Message</th><th scope="col">Reply</th></tr></thead><tbody>{messages.map((message) => <tr key={message.id}><td><time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString()}</time></td><th scope="row">{message.name}</th><td><a href={`mailto:${encodeURIComponent(message.email)}`}>{message.email}</a></td><td className="adminInboxMessageText">{message.message}</td><td><a href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: Portfolio contact from ${message.name}`)}`}>Reply</a></td></tr>)}</tbody></table></div>}
          <button className="adminInboxRefresh" type="button" onClick={() => void loadMessages()}><Mail size={15} />Refresh inbox</button>
        </section>

        <section className="adminSection">
          <div className="adminSectionHeading"><div><span className="adminKicker">IDENTITY</span><h2>Profile photo</h2></div><p>Shown in the circular portrait frame on the homepage.</p></div>
          <div className="adminProfilePanel">
            <div className="adminProfilePreview">{content.profileImageUrl ? <img src={content.profileImageUrl} alt="Profile photo preview" /> : <span className="adminInitials">S</span>}</div>
            <div className="adminProfileDetails"><strong>{content.profileImageUrl ? "Profile photo ready" : "No profile photo yet"}</strong><span>JPG, PNG, WebP or AVIF · up to 4 MB</span><div className="adminImageActions"><label className="adminUploadButton"><Upload size={16} />{content.profileImageUrl ? "Replace photo" : "Upload photo"}<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(event) => { void handleImage(event.currentTarget.files?.[0], "profile"); event.currentTarget.value = ""; }} /></label>{content.profileImageUrl && <button className="adminImageRemove" type="button" onClick={() => removeImage("profile")}>Remove photo</button>}</div></div>
          </div>
        </section>

        <section className="adminSection adminProjectsSection">
          <div className="adminSectionHeading"><div><span className="adminKicker">PUBLIC PORTFOLIO</span><h2>Projects <span className="adminCount">{content.projects.length}</span></h2></div><p>Only published projects appear on your homepage.</p></div>
          <div className="adminProjectList" aria-live="polite">
            {content.projects.length === 0 && <p className="adminEmptyProjects">No projects yet. Add a project to start building your public work list.</p>}
            {content.projects.map((project, position) => (
              <article className="adminProject" key={project.id}>
                <div className="adminProjectTop"><span className="adminProjectIndex">{project.index}</span><div className="adminProjectControls"><button type="button" className="adminIconButton" aria-label={`Move ${project.title || "project"} up`} title="Move up" onClick={() => moveProject(project.id, -1)} disabled={position === 0}><ArrowUp size={15} /></button><button type="button" className="adminIconButton" aria-label={`Move ${project.title || "project"} down`} title="Move down" onClick={() => moveProject(project.id, 1)} disabled={position === content.projects.length - 1}><ArrowDown size={15} /></button><label className="adminPublished"><input type="checkbox" checked={project.published} onChange={(event) => updateProject(project.id, { published: event.target.checked })} />Published</label><button type="button" className="adminIconButton dangerButton" aria-label={`Delete ${project.title || "project"}`} title="Delete project" onClick={() => deleteProject(project.id, project.title)}><Trash2 size={15} /></button></div></div>
                <div className="adminProjectGrid">
                  <div className="adminProjectImage">{project.imageUrl ? <img src={project.imageUrl} alt={`${project.title} project`} /> : <div><ImagePlus size={24} /><span>PROJECT IMAGE</span></div>}<div className="adminProjectImageActions"><label className="adminUploadButton"><Upload size={15} />{project.imageUrl ? "Replace image" : "Upload image"}<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(event) => { void handleImage(event.currentTarget.files?.[0], "project", project.id); event.currentTarget.value = ""; }} /></label>{project.imageUrl && <button className="adminImageRemove" type="button" onClick={() => removeImage("project", project.id)}>Remove</button>}</div></div>
                  <div className="adminFields"><label>Project title<input maxLength={100} value={project.title} onChange={(event) => updateProject(project.id, { title: event.target.value })} /></label><label>Project summary<textarea rows={3} maxLength={2000} value={project.summary} onChange={(event) => updateProject(project.id, { summary: event.target.value })} /></label><div className="adminFieldRow"><label>Category label<input maxLength={40} value={project.visual} onChange={(event) => updateProject(project.id, { visual: event.target.value.toUpperCase() })} /></label><label>Preview style<select value={project.kind} onChange={(event) => updateProject(project.id, { kind: event.target.value as ProjectKind })}><option value="market">Market line chart</option><option value="analysis">Data heatmap</option><option value="network">Big Data network</option><option value="football">Player analysis</option></select></label></div><label>Tags, separated by commas<input value={project.tags.join(", ")} onChange={(event) => updateProject(project.id, { tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 12) })} /></label></div>
                </div>
              </article>
            ))}
          </div>
          <button className="adminAddProject" type="button" disabled={content.projects.length >= 30} onClick={() => setContent((current) => current && (current.projects.length < 30 ? { ...current, projects: [...current.projects, { ...blankProject(), index: String(current.projects.length + 1).padStart(2, "0") }] } : current))}><Plus size={17} />{content.projects.length >= 30 ? "Project limit reached" : "Add project"}</button>
        </section>
        <footer className="adminFooter"><span>Changes are public after saving.</span><a href="/">Return to portfolio</a></footer>
      </div>
    </main>
  );
}