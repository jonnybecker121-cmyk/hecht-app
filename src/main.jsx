import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  Bell,
  Blocks,
  Bot,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Clock3,
  Code2,
  Command,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  Globe,
  Home,
  LayoutGrid,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import "./style.css";

function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}
const initialProjects = [
  {
    id: 1,
    name: "Website Relaunch",
    description: "Ein neuer Auftritt. Von der Idee bis zum Launch.",
    category: "Entwicklung",
    color: "mint",
    icon: "code",
    branch: "main",
    time: "Vor 12 Minuten",
    progress: 68,
  },
  {
    id: 2,
    name: "Content Studio",
    description: "Ideen sammeln. Geschichten erzählen.",
    category: "Kreativ",
    color: "lavender",
    icon: "content",
    branch: "main",
    time: "Vor 1 Stunde",
    progress: 42,
  },
];
const navItems = [
  ["Übersicht", Home],
  ["Projekte", FolderOpen],
  ["Chats", MessageSquare],
  ["Agenten", Bot],
  ["Workflows", Workflow],
  ["Integrationen", Blocks],
];
const initialMessages = [
  {
    role: "assistant",
    text: "Hey Jonny! 👋\nBereit, etwas Großartiges zu bauen? Ich helfe dir bei deinen Projekten, Ideen und allem dazwischen.",
  },
];
function Mark({ small = false }) {
  return (
    <div className={"mark " + (small ? "small" : "")}>
      <span />
      <span />
      <span />
    </div>
  );
}
function App() {
  const [page, setPage] = useState("Übersicht");
  const [projects, setProjects] = useStored("hecht-projects", initialProjects);
  const [messages, setMessages] = useStored("hecht-messages", initialMessages);
  const [input, setInput] = useState("");
  const [modal, setModal] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Alle Projekte");
  const [toast, setToast] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [selected, setSelected] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectColor, setProjectColor] = useState("mint");
  const [model, setModel] = useStored("hecht-model", "Claude Sonnet");
  const [modelMenu, setModelMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const [automations, setAutomations] = useStored("hecht-workflows", [
    true,
    false,
  ]);
  const [profile, setProfile] = useStored("hecht-name", "Jonny");
  const [assistantOpen, setAssistantOpen] = useState(true);
  const chatEnd = useRef(null);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setModal("search");
      }
      if (e.key === "Escape") {
        setModal(null);
        setNotifications(false);
        setModelMenu(false);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement;
    const dialog = document.querySelector('[role="dialog"]');
    const focusables = () =>
      Array.from(
        dialog?.querySelectorAll(
          'button:not(:disabled), input, textarea, [tabindex="0"]',
        ) || [],
      );
    const first = dialog?.querySelector("input, textarea") || focusables()[0];
    first?.focus();
    const trap = (e) => {
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0],
        last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [modal]);
  const openProject = (p) => {
    setSelected(p);
    setPage("Projekt");
  };
  const notify = (t) => setToast(t);
  const send = (text = input) => {
    if (!text.trim() || busy) return;
    setMessages((m) => [...m, { role: "user", text: text.trim() }]);
    setInput("");
    setBusy(true);
    setTimeout(() => {
      let reply = text.toLowerCase().includes("projekt")
        ? `Du hast aktuell ${projects.length} Projekte in deinem Workspace. ${projects[0] ? `Bei „${projects[0].name}“ kannst du als Nächstes die offenen Aufgaben priorisieren und einen Meilenstein festlegen.` : "Lege über „Neues Projekt“ dein erstes Projekt an."}\n\nWomit möchtest du anfangen?`
        : text.toLowerCase().includes("idee")
          ? "Lass uns deine Idee greifbar machen. Beschreibe kurz, für wen du etwas bauen möchtest und welches Problem du lösen willst. Daraus können wir gemeinsam einen Projektplan entwickeln."
          : text.toLowerCase().includes("zusammen")
            ? `Dein Workspace auf einen Blick: ${projects.length} Projekte, ${automations.filter(Boolean).length} aktiver Workflow und viel Platz für deine nächste Idee. Mein Vorschlag: Konzentriere dich heute auf einen kleinen, klaren Meilenstein.`
            : "Ein guter Start! Halte zuerst dein Ziel und die nächsten drei Schritte fest. Du kannst dafür ein Projekt anlegen und deine Notizen direkt dort speichern.\n\nDies ist eine lokale Demo-Antwort. Eine echte KI-Anbindung kannst du später in den Einstellungen ergänzen.";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
      setBusy(false);
    }, 850);
  };
  const createProject = (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    const p = {
      id: Date.now(),
      name: projectName.trim(),
      description: projectDescription.trim() || "Dein nächstes großes Projekt.",
      category: projectColor === "mint" ? "Entwicklung" : "Kreativ",
      color: projectColor,
      icon: projectColor === "mint" ? "code" : "content",
      branch: "main",
      time: "Gerade eben",
      progress: 0,
    };
    setProjects((v) => [p, ...v]);
    setModal(null);
    setProjectName("");
    setProjectDescription("");
    notify("Dein Projekt wurde erstellt.");
  };
  const filtered = projects.filter(
    (p) =>
      (filter === "Alle Projekte" || p.category === filter) &&
      p.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="desktop-shell">
      <div className="titlebar">
        <div className="window-controls">
          <i />
          <i />
          <i />
        </div>
        <div className="titlebar-label">
          <Mark small />
          <span>hecht workspace</span>
        </div>
        <div className="titlebar-right">
          <ShieldCheck size={12} />
          <span>Dein Raum. Deine Daten.</span>
        </div>
      </div>
      <div className="app-layout">
        <aside className="sidebar">
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage("Übersicht");
            }}
          >
            <Mark />
            <span>
              hecht<span className="brand-dot">.</span>
            </span>
            <span className="beta">BETA</span>
          </a>
          <button
            className="workspace-switch"
            onClick={() => setModal("workspace")}
          >
            <span className="workspace-avatar">J</span>
            <span>
              <strong>Mein Workspace</strong>
              <small>Persönlicher Bereich</small>
            </span>
            <ChevronsUpDown size={14} />
          </button>
          <button
            className="search-button"
            onClick={() => {
              setQuery("");
              setModal("search");
            }}
          >
            <Search size={16} />
            <span>Suchen</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="nav-label">WORKSPACE</div>
          <nav>
            {navItems.map(([label, Icon]) => (
              <button
                key={label}
                aria-label={label}
                onClick={() => {
                  setPage(label);
                  setQuery("");
                  setSelected(null);
                }}
                className={
                  "nav-item " +
                  (page === label ||
                  (page === "Projekt" && label === "Projekte")
                    ? "active"
                    : "")
                }
              >
                <Icon size={18} />
                <span>{label}</span>
                {label === "Projekte" ? (
                  <span className="nav-count">{projects.length}</span>
                ) : label === "Agenten" ? (
                  <span className="new-label">NEU</span>
                ) : null}
              </button>
            ))}
          </nav>
          <div className="sidebar-project-label">
            <span>DEINE PROJEKTE</span>
            <button
              className="icon-button"
              title="Projekt hinzufügen"
              onClick={() => setModal("project")}
            >
              <Plus size={15} />
            </button>
          </div>
          <div className="project-shortcuts">
            {projects.slice(0, 4).map((p) => (
              <button key={p.id} onClick={() => openProject(p)}>
                <span className={"project-dot " + p.color} />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
          <div className="sidebar-bottom">
            <div className="local-card">
              <span className="local-icon">
                <ShieldCheck size={18} />
              </span>
              <strong>Zuhause auf deinem Gerät.</strong>
              <p>Deine Ideen bleiben deine Ideen.</p>
              <span>
                <i /> Lokal gespeichert
              </span>
            </div>
            <button
              className={
                "nav-item " + (page === "Einstellungen" ? "active" : "")
              }
              onClick={() => setPage("Einstellungen")}
            >
              <Settings size={17} />
              <span>Einstellungen</span>
            </button>
            <button
              className="profile"
              onClick={() => setPage("Einstellungen")}
            >
              <span className="avatar">JB</span>
              <span>
                <strong>{profile} Becker</strong>
                <small>Personal Workspace</small>
              </span>
              <MoreHorizontal size={18} />
            </button>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              <PanelLeftClose size={17} />
              <span className="divider" />
              <span>Mein Workspace</span>
              <ChevronRight size={13} />
              <strong>{page === "Projekt" ? selected?.name : page}</strong>
            </div>
            <div className="topbar-actions">
              <button
                className="icon-button"
                title="Assistent öffnen"
                onClick={() => {
                  setAssistantOpen(true);
                  if (window.innerWidth <= 800) setPage("Chats");
                }}
              >
                <Sparkles size={17} />
              </button>
              <span className="local-status">
                <i /> Lokal gespeichert
              </span>
              <button
                title="Benachrichtigungen"
                className="icon-button notification-button"
                onClick={() => setNotifications(!notifications)}
              >
                <Bell size={18} />
                <b />
              </button>
              <button
                className="top-avatar"
                onClick={() => setPage("Einstellungen")}
              >
                JB
              </button>
            </div>
            {notifications && (
              <div className="notification-popover">
                <h3>
                  Du bist auf dem Laufenden <CheckCheck size={17} />
                </h3>
                <p>Alle Änderungen sind auf diesem Gerät gespeichert.</p>
                <small>Keine neuen Benachrichtigungen</small>
              </div>
            )}
          </header>
          <div
            className={
              "content-layout " + (!assistantOpen ? "without-assistant" : "")
            }
          >
            <main className="main-content">
              {(page === "Übersicht" || page === "Projekte") && (
                <>
                  <section className="page-heading">
                    <div className="eyebrow">
                      DEIN PERSÖNLICHER WORKSPACE <span>✦</span>
                    </div>
                    <div className="heading-row">
                      <div>
                        <h1>
                          {page === "Übersicht"
                            ? `Gute Ideen fangen hier an${profile === "Jonny" ? "" : `, ${profile}`}.`
                            : "Platz für deine nächsten Ideen."}
                        </h1>
                        <p>
                          {page === "Übersicht"
                            ? "Schön, dass du da bist, " +
                              profile +
                              ". Was möchtest du heute erschaffen?"
                            : "Alle deine Projekte. Alles an einem Ort."}
                        </p>
                      </div>
                      <span className="today-date">
                        {new Intl.DateTimeFormat("de-DE", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        }).format(new Date())}
                      </span>
                    </div>
                  </section>
                  {page === "Übersicht" && (
                    <section className="quick-actions">
                      <button onClick={() => setModal("project")}>
                        <span className="action-icon mint">
                          <Plus size={22} />
                        </span>
                        <div>
                          <strong>Neues Projekt</strong>
                          <small>Mach aus einer Idee etwas.</small>
                        </div>
                        <ArrowUpRight size={17} />
                      </button>
                      <button
                        onClick={() => {
                          setPage("Chats");
                          setAssistantOpen(true);
                        }}
                      >
                        <span className="action-icon lavender">
                          <Sparkles size={20} />
                        </span>
                        <div>
                          <strong>Mit KI starten</strong>
                          <small>Ein guter Gedanke reicht.</small>
                        </div>
                        <ArrowUpRight size={17} />
                      </button>
                      <button onClick={() => setPage("Workflows")}>
                        <span className="action-icon peach">
                          <Workflow size={20} />
                        </span>
                        <div>
                          <strong>Workflow erstellen</strong>
                          <small>Weniger Routine. Mehr Flow.</small>
                        </div>
                        <ArrowUpRight size={17} />
                      </button>
                    </section>
                  )}
                  <section className="projects-section">
                    <div className="section-heading">
                      <h2>
                        Deine Projekte <span>{projects.length}</span>
                      </h2>
                      <button
                        className="text-button"
                        onClick={() =>
                          page === "Übersicht"
                            ? setPage("Projekte")
                            : setModal("project")
                        }
                      >
                        {page === "Übersicht"
                          ? "Alle Projekte"
                          : "Projekt hinzufügen"}
                        <ArrowRight size={15} />
                      </button>
                    </div>
                    <div className="project-toolbar">
                      <div className="filter-tabs">
                        {["Alle Projekte", "Entwicklung", "Kreativ"].map(
                          (f) => (
                            <button
                              className={filter === f ? "selected" : ""}
                              onClick={() => setFilter(f)}
                              key={f}
                            >
                              {f}
                            </button>
                          ),
                        )}
                      </div>
                      <div className="view-switch">
                        <LayoutGrid size={15} />
                        <span />
                        <button
                          className="icon-button"
                          title="Neues Projekt"
                          onClick={() => setModal("project")}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="project-grid">
                      {filtered.map((p) => (
                        <button
                          key={p.id}
                          className={"project-card " + p.color}
                          onClick={() => openProject(p)}
                        >
                          <div className="project-card-top">
                            <span className="project-icon">
                              {p.icon === "code" ? (
                                <Code2 size={23} />
                              ) : (
                                <FileText size={23} />
                              )}
                            </span>
                            <span className="project-category">
                              {p.category}
                            </span>
                            <MoreHorizontal size={19} />
                          </div>
                          <h3>{p.name}</h3>
                          <p>{p.description}</p>
                          <div className="project-preview">
                            {p.icon === "code" ? (
                              <>
                                <div className="mini-browser">
                                  <i />
                                  <i />
                                  <i />
                                  <span>website / home</span>
                                </div>
                                <div className="code-preview">
                                  <span>01</span>
                                  <div>
                                    <b>const</b> nextBigThing = () <em>⇒</em>{" "}
                                    {"{"}
                                    <br />
                                    &nbsp; <b>return</b> <em>your.ideas</em>
                                    .comeToLife();
                                    <br />
                                    {"}"};
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="content-preview">
                                  <span className="preview-paper">
                                    <i />
                                    <i />
                                    <i />
                                    <b />
                                  </span>
                                  <div>
                                    <strong>
                                      Make something
                                      <br />
                                      worth sharing<span>✳</span>
                                    </strong>
                                    <small>IDEEN · INSPIRATION · CONTENT</small>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="project-footer">
                            <span>
                              <GitBranch size={13} />
                              {p.branch}
                            </span>
                            <span>
                              <i />
                              {p.time}
                            </span>
                            <ArrowUpRight size={15} />
                          </div>
                        </button>
                      ))}
                      <button
                        className="new-project-card"
                        onClick={() => setModal("project")}
                      >
                        <span>
                          <Plus size={23} />
                        </span>
                        <strong>Raum für deine nächste Idee</strong>
                        <small>
                          Neues Projekt erstellen <ArrowRight size={13} />
                        </small>
                      </button>
                    </div>
                  </section>
                  {page === "Übersicht" && (
                    <>
                      <section className="activity-section">
                        <div className="section-heading">
                          <h2>Zuletzt passiert</h2>
                          <span className="subtle">
                            Dein Workspace in Bewegung
                          </span>
                        </div>
                        <div className="activity-list">
                          {[
                            {
                              icon: MessageSquare,
                              color: "lavender",
                              title: "Die ersten Ideen für die neue Website",
                              project: "Website Relaunch",
                              type: "Chat",
                              time: "Vor 12 Min.",
                            },
                            {
                              icon: FileText,
                              color: "peach",
                              title: "Content-Plan für November",
                              project: "Content Studio",
                              type: "Dokument",
                              time: "Vor 1 Std.",
                            },
                            {
                              icon: GitBranch,
                              color: "mint",
                              title: "Projektstruktur angelegt",
                              project: "Website Relaunch",
                              type: "Aktivität",
                              time: "Vor 2 Std.",
                            },
                          ].map((a, i) => (
                            <button
                              className="activity-row"
                              key={a.title}
                              onClick={() => {
                                if (i === 0) {
                                  setPage("Chats");
                                  setAssistantOpen(true);
                                } else {
                                  const p = projects.find(
                                    (p) => p.name === a.project,
                                  );
                                  p
                                    ? openProject(p)
                                    : notify(
                                        "Dieses Beispielprojekt wurde entfernt.",
                                      );
                                }
                              }}
                            >
                              <span className={"activity-icon " + a.color}>
                                <a.icon size={17} />
                              </span>
                              <div>
                                <strong>{a.title}</strong>
                                <small>
                                  <span
                                    className={
                                      "project-dot " +
                                      (i === 1 ? "lavender" : "mint")
                                    }
                                  />
                                  {a.project}
                                </small>
                              </div>
                              <span className="activity-type">{a.type}</span>
                              <time>{a.time}</time>
                              <ChevronRight size={14} />
                            </button>
                          ))}
                        </div>
                      </section>
                      <div className="bottom-tip">
                        <span>
                          <Command size={14} /> Ein kleiner Shortcut für große
                          Ideen.
                        </span>
                        <span>
                          Mit <kbd>⌘</kbd> <kbd>K</kbd> findest du alles in
                          deinem Workspace.
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
              {page === "Projekt" && selected && (
                <ProjectDetail
                  key={selected.id}
                  project={
                    projects.find((p) => p.id === selected.id) || selected
                  }
                  onBack={() => setPage("Projekte")}
                  onUpdate={(p) =>
                    setProjects((ps) => ps.map((v) => (v.id === p.id ? p : v)))
                  }
                  onDelete={() => {
                    setProjects((ps) => ps.filter((p) => p.id !== selected.id));
                    setPage("Projekte");
                    notify("Projekt gelöscht.");
                  }}
                />
              )}
              {page === "Chats" && (
                <>
                  <PageTitle
                    eyebrow="GEDANKEN WERDEN MÖGLICHKEITEN"
                    title="Ein Gespräch. Viele Ideen."
                    description="Dein persönlicher Assistent denkt mit."
                  />
                  <div className="chat-landing">
                    <div className="large-spark">
                      <Sparkles size={34} />
                    </div>
                    <h2>Was geht dir durch den Kopf?</h2>
                    <p>
                      Ein Projekt planen, eine Idee weiterdenken oder einfach
                      loslegen.
                    </p>
                    <div className="chat-starters">
                      {[
                        "Fasse meine Projekte zusammen",
                        "Hilf mir bei einer neuen Idee",
                        "Was ist mein nächster Schritt?",
                      ].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setAssistantOpen(true);
                            send(s);
                          }}
                        >
                          {s}
                          <ArrowUpRight size={16} />
                        </button>
                      ))}
                    </div>
                    <button
                      className="text-button"
                      onClick={() => {
                        setMessages(initialMessages);
                        notify("Ein neues Gespräch wurde gestartet.");
                      }}
                    >
                      <Plus size={16} /> Neues Gespräch
                    </button>
                  </div>
                </>
              )}
              {page === "Agenten" && (
                <>
                  <PageTitle
                    eyebrow="DEIN PERSÖNLICHES TEAM"
                    title="Gute Arbeit braucht gute Partner."
                    description="Spezialisierte Assistenten für das, was du vorhast."
                  />
                  <div className="feature-grid">
                    {[
                      {
                        name: "Der Entwickler",
                        icon: Code2,
                        color: "mint",
                        desc: "Von der ersten Codezeile bis zur nächsten großen Idee.",
                        prompt: "Hilf mir, mein Entwicklungsprojekt zu planen.",
                      },
                      {
                        name: "Die Kreative",
                        icon: Sparkles,
                        color: "lavender",
                        desc: "Neue Perspektiven, frische Inhalte und gute Geschichten.",
                        prompt:
                          "Hilf mir, eine kreative Content-Idee zu entwickeln.",
                      },
                      {
                        name: "Der Planer",
                        icon: Workflow,
                        color: "peach",
                        desc: "Bringt Struktur in deine Ideen und Klarheit in dein Projekt.",
                        prompt:
                          "Hilf mir, mein Projekt in konkrete Schritte aufzuteilen.",
                      },
                    ].map((a) => (
                      <div className="feature-card" key={a.name}>
                        <span className={"action-icon " + a.color}>
                          <a.icon size={25} />
                        </span>
                        <h3>{a.name}</h3>
                        <p>{a.desc}</p>
                        <button
                          className="text-button"
                          onClick={() => {
                            setAssistantOpen(true);
                            if (window.innerWidth <= 800) setPage("Chats");
                            send(a.prompt);
                          }}
                        >
                          Gespräch starten <ArrowRight size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="info-note">
                    <ShieldCheck size={18} /> Agenten verwenden aktuell den
                    lokalen Demomodus.
                  </div>
                </>
              )}
              {page === "Workflows" && (
                <>
                  <PageTitle
                    eyebrow="WENIGER ROUTINE. MEHR FLOW."
                    title="Dein Alltag, etwas leichter."
                    description="Organisiere wiederkehrende Abläufe in deinem Workspace."
                  />
                  <div className="workflow-list">
                    {[
                      {
                        name: "Dein täglicher Überblick",
                        desc: "Projekte zusammenfassen und die nächsten Schritte planen.",
                        icon: Home,
                      },
                      {
                        name: "Der kreative Wochenstart",
                        desc: "Neue Content-Ideen sammeln und für die Woche sortieren.",
                        icon: Sparkles,
                      },
                    ].map((w, i) => (
                      <div className="workflow-card" key={w.name}>
                        <span
                          className={"action-icon " + (i ? "lavender" : "mint")}
                        >
                          <w.icon size={23} />
                        </span>
                        <div>
                          <h3>{w.name}</h3>
                          <p>{w.desc}</p>
                          <small>
                            {automations[i]
                              ? "Als Vorlage aktiviert"
                              : "Vorlage pausiert"}{" "}
                            · Manuell ausführen
                          </small>
                        </div>
                        <button
                          className="text-button"
                          onClick={() => {
                            setAssistantOpen(true);
                            if (window.innerWidth <= 800) setPage("Chats");
                            send(
                              i
                                ? "Sammle kreative Ideen für meine Projekte."
                                : "Fasse meine Projekte zusammen.",
                            );
                          }}
                        >
                          Ausführen <ArrowRight size={15} />
                        </button>
                        <button
                          aria-label={w.name + " umschalten"}
                          aria-pressed={automations[i]}
                          className={"toggle " + (automations[i] ? "on" : "")}
                          onClick={() =>
                            setAutomations((a) =>
                              a.map((v, j) => (j === i ? !v : v)),
                            )
                          }
                        >
                          <span />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="info-note">
                    <Clock3 size={18} /> Vorlagen werden lokal gespeichert.
                    Zeitgesteuerte Ausführungen sind noch nicht verbunden.
                  </div>
                </>
              )}
              {page === "Integrationen" && (
                <>
                  <PageTitle
                    eyebrow="ALLES AN EINEM ORT"
                    title="Deine liebsten Werkzeuge."
                    description="Der Platz für die Verbindungen zu deinem Stack."
                  />
                  <div className="feature-grid">
                    {[
                      {
                        name: "GitHub",
                        icon: GitBranch,
                        desc: "Repositories, Branches und deine nächsten Commits.",
                      },
                      {
                        name: "Dein Browser",
                        icon: Globe,
                        desc: "Recherche und Inspiration direkt in deinem Workflow.",
                      },
                      {
                        name: "Terminal",
                        icon: Terminal,
                        desc: "Der direkte Weg zu deinen lokalen Werkzeugen.",
                      },
                    ].map((a) => (
                      <div className="feature-card" key={a.name}>
                        <span className="action-icon neutral">
                          <a.icon size={25} />
                        </span>
                        <h3>{a.name}</h3>
                        <p>{a.desc}</p>
                        <span className="coming-soon">In Vorbereitung</span>
                      </div>
                    ))}
                  </div>
                  <div className="info-note">
                    <Blocks size={18} /> Externe Integrationen benötigen eine
                    native Desktop-Anbindung.
                  </div>
                </>
              )}
              {page === "Einstellungen" && (
                <>
                  <PageTitle
                    eyebrow="DEIN WORKSPACE. DEINE REGELN."
                    title="Ganz nach deinem Geschmack."
                    description="Mach hecht zu deinem persönlichen Raum."
                  />
                  <section className="settings-card">
                    <h3>Dein Profil</h3>
                    <label>
                      Vorname
                      <input
                        value={profile}
                        onChange={(e) => setProfile(e.target.value)}
                        maxLength={30}
                      />
                    </label>
                    <div className="setting-row">
                      <div>
                        <strong>Lokale Speicherung</strong>
                        <p>Projekte und Chats bleiben in diesem Browser.</p>
                      </div>
                      <span className="status-pill">
                        <i /> Aktiv
                      </span>
                    </div>
                    <div className="setting-row">
                      <div>
                        <strong>KI-Assistent</strong>
                        <p>
                          Lokaler Demomodus mit Beispielantworten. Kein Modell
                          verbunden.
                        </p>
                      </div>
                      <span className="coming-soon">Demo</span>
                    </div>
                    <button
                      className="text-button danger"
                      onClick={() => setModal("clear")}
                    >
                      Chatverlauf zurücksetzen <Trash2 size={14} />
                    </button>
                  </section>
                </>
              )}
              <footer className="main-footer">
                <span>
                  <Mark small /> Ein Workspace. Alle Möglichkeiten.
                </span>
                <span>
                  Mit Fokus gemacht. Für dich.{" "}
                  <span className="tiny-star">✳</span>
                </span>
              </footer>
            </main>
            {assistantOpen && (
              <aside className="assistant-panel">
                <div className="assistant-header">
                  <span className="assistant-symbol">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <strong>Dein Assistent</strong>
                    <small>
                      <i /> Lokaler Demomodus
                    </small>
                  </div>
                  <button
                    className="icon-button"
                    title="Neues Gespräch"
                    onClick={() => setMessages(initialMessages)}
                  >
                    <Plus size={17} />
                  </button>
                  <button
                    className="icon-button close-assistant"
                    title="Assistent schließen"
                    onClick={() => setAssistantOpen(false)}
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="assistant-body">
                  <div className="assistant-date">
                    DEIN KREATIVER SPARRINGSPARTNER
                  </div>
                  {messages.map((m, i) => (
                    <div className={"message " + m.role} key={i}>
                      {m.role === "assistant" && (
                        <span className="message-icon">
                          <Sparkles size={13} />
                        </span>
                      )}
                      <div>
                        {m.text.split("\n").map((s, j) => (
                          <React.Fragment key={j}>
                            {s}
                            {j < m.text.split("\n").length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                  {busy && (
                    <div className="thinking">
                      <i />
                      <i />
                      <i />
                    </div>
                  )}
                  {messages.length === 1 && (
                    <div className="assistant-suggestions">
                      <span>Ein paar Ideen für dich</span>
                      {[
                        {
                          icon: FolderOpen,
                          text: "Meine Projekte zusammenfassen",
                        },
                        { icon: Sparkles, text: "Eine neue Idee entwickeln" },
                        {
                          icon: Workflow,
                          text: "Meinen nächsten Schritt planen",
                        },
                      ].map((s) => (
                        <button key={s.text} onClick={() => send(s.text)}>
                          <s.icon size={15} />
                          {s.text}
                          <ArrowUpRight size={13} />
                        </button>
                      ))}
                    </div>
                  )}
                  <div ref={chatEnd} />
                </div>
                <div className="assistant-bottom">
                  <div className="context-note">
                    <span>
                      <Folder size={13} /> Workspace-Kontext
                    </span>
                    <span className="context-enabled">Aktiv</span>
                  </div>
                  <form
                    className="composer"
                    onSubmit={(e) => {
                      e.preventDefault();
                      send();
                    }}
                  >
                    <textarea
                      aria-label="Nachricht an deinen Assistenten"
                      placeholder="Frag etwas. Oder denk laut."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                    />
                    <div className="composer-actions">
                      <button
                        type="button"
                        className="icon-button"
                        title="Projektkontext auswählen"
                        onClick={() => setModal("context")}
                      >
                        <Plus size={17} />
                      </button>
                      <div className="model-picker">
                        <button
                          type="button"
                          onClick={() => setModelMenu(!modelMenu)}
                        >
                          <span className="model-star">✳</span>
                          {model}
                          <ChevronDown size={12} />
                        </button>
                        {modelMenu && (
                          <div className="model-menu">
                            {["Claude Sonnet", "GPT-4.1", "Lokales Modell"].map(
                              (m) => (
                                <button
                                  type="button"
                                  key={m}
                                  onClick={() => {
                                    setModel(m);
                                    setModelMenu(false);
                                  }}
                                >
                                  {m}
                                  {model === m && <Check size={13} />}
                                </button>
                              ),
                            )}
                            <small>Modellauswahl · Demomodus</small>
                          </div>
                        )}
                      </div>
                      <button
                        className="send-button"
                        type="submit"
                        title="Nachricht senden"
                        disabled={!input.trim() || busy}
                      >
                        <ArrowUp size={17} />
                      </button>
                    </div>
                  </form>
                  <div className="assistant-privacy">
                    <ShieldCheck size={11} /> Privat. Lokal gespeichert. Ganz
                    bei dir.
                  </div>
                </div>
              </aside>
            )}
            {!assistantOpen && (
              <button
                className="assistant-fab"
                onClick={() => setAssistantOpen(true)}
              >
                <Sparkles size={20} /> Assistent
              </button>
            )}
          </div>
        </div>
      </div>
      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <section
            className={"modal " + (modal === "search" ? "search-modal" : "")}
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "project" ? "Neues Projekt" : "Workspace Dialog"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              title="Schließen"
              onClick={() => setModal(null)}
            >
              <X size={19} />
            </button>
            {modal === "project" ? (
              <>
                <span className="action-icon mint">
                  <FolderOpen size={24} />
                </span>
                <h2>Eine Idee braucht einen Anfang.</h2>
                <p>Gib deinem neuen Projekt ein Zuhause.</p>
                <form onSubmit={createProject}>
                  <label>
                    Projektname
                    <input
                      required
                      autoFocus
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Deine nächste große Idee"
                      maxLength={60}
                    />
                  </label>
                  <label>
                    Beschreibung
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Was hast du vor?"
                      maxLength={180}
                    />
                  </label>
                  <label>Projektbereich</label>
                  <div className="color-options">
                    {["mint", "lavender"].map((c) => (
                      <button
                        type="button"
                        key={c}
                        className={projectColor === c ? "chosen" : ""}
                        onClick={() => setProjectColor(c)}
                      >
                        <span className={"project-dot " + c} />
                        {c === "mint" ? "Entwicklung" : "Kreativ"}
                        {projectColor === c && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                  <button className="primary-button" type="submit">
                    Projekt erstellen <ArrowRight size={16} />
                  </button>
                </form>
              </>
            ) : modal === "search" ? (
              <>
                <div className="search-input">
                  <Search size={21} />
                  <input
                    aria-label="Workspace durchsuchen"
                    autoFocus
                    placeholder="Deinen Workspace durchsuchen …"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <kbd>ESC</kbd>
                </div>
                <div className="search-results">
                  <span>PROJEKTE & SEITEN</span>
                  {projects
                    .filter((p) =>
                      p.name.toLowerCase().includes(query.toLowerCase()),
                    )
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          openProject(p);
                          setModal(null);
                          setQuery("");
                        }}
                      >
                        <Folder size={17} />
                        {p.name}
                        <ArrowUpRight size={15} />
                      </button>
                    ))}
                  {navItems
                    .filter(([n]) =>
                      n.toLowerCase().includes(query.toLowerCase()),
                    )
                    .map(([n, I]) => (
                      <button
                        key={n}
                        onClick={() => {
                          setPage(n);
                          setModal(null);
                          setQuery("");
                        }}
                      >
                        <I size={17} />
                        {n}
                        <ArrowRight size={15} />
                      </button>
                    ))}
                  {query &&
                    !projects.some((p) =>
                      p.name.toLowerCase().includes(query.toLowerCase()),
                    ) &&
                    !navItems.some(([n]) =>
                      n.toLowerCase().includes(query.toLowerCase()),
                    ) && <p>Keine Ergebnisse für „{query}“.</p>}
                </div>
              </>
            ) : modal === "clear" ? (
              <>
                <h2>Neu anfangen?</h2>
                <p>Dein Chatverlauf auf diesem Gerät wird gelöscht.</p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setMessages(initialMessages);
                    setModal(null);
                    notify("Chatverlauf zurückgesetzt.");
                  }}
                >
                  Chatverlauf zurücksetzen
                </button>
              </>
            ) : modal === "context" ? (
              <>
                <h2>Dein Workspace-Kontext</h2>
                <p>
                  Diese Projekte stehen dem Demo-Assistenten als Kontext zur
                  Verfügung.
                </p>
                {projects.map((p) => (
                  <div className="context-project" key={p.id}>
                    <Folder size={17} />
                    {p.name}
                    <Check size={16} />
                  </div>
                ))}
              </>
            ) : (
              <>
                <span className="workspace-avatar large">J</span>
                <h2>Dein persönlicher Workspace</h2>
                <p>
                  Hier kommen deine Projekte, Gedanken und Werkzeuge zusammen.
                </p>
                <div className="workspace-summary">
                  <span>{projects.length} Projekte</span>
                  <span>
                    {messages.filter((m) => m.role === "user").length}{" "}
                    Nachrichten
                  </span>
                  <span>Lokal gespeichert</span>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    setPage("Einstellungen");
                    setModal(null);
                  }}
                >
                  Workspace anpassen <ArrowRight size={16} />
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
function PageTitle({ eyebrow, title, description }) {
  return (
    <section className="page-heading">
      <div className="eyebrow">
        {eyebrow} <span>✦</span>
      </div>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
function ProjectDetail({ project, onBack, onUpdate, onDelete }) {
  const [tab, setTab] = useState("Übersicht");
  const [note, setNote] = useState(project.notes || "");
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  return (
    <>
      <button className="text-button back" onClick={onBack}>
        ← Alle Projekte
      </button>
      <div className="project-detail-heading">
        <span className={"action-icon " + project.color}>
          {project.icon === "code" ? (
            <Code2 size={27} />
          ) : (
            <FileText size={27} />
          )}
        </span>
        <h1>{project.name}</h1>
        <p>{project.description}</p>
      </div>
      <div className="filter-tabs detail-tabs">
        {["Übersicht", "Notizen", "Dateien"].map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Übersicht" ? (
        <section className="settings-card">
          <h3>Dein Projekt auf einen Blick</h3>
          <div className="setting-row">
            <span>Bereich</span>
            <strong>{project.category}</strong>
          </div>
          <div className="setting-row">
            <span>Branch</span>
            <strong>
              <GitBranch size={14} /> {project.branch}
            </strong>
          </div>
          <label>
            Fortschritt · {project.progress}%
            <input
              type="range"
              min="0"
              max="100"
              value={project.progress}
              onChange={(e) =>
                onUpdate({ ...project, progress: Number(e.target.value) })
              }
            />
          </label>
          <div className="progress-track">
            <span style={{ width: project.progress + "%" }} />
          </div>
          {deleting ? (
            <div className="delete-confirm">
              <span>Projekt wirklich löschen?</span>
              <button className="text-button danger" onClick={onDelete}>
                Ja, löschen
              </button>
              <button
                className="text-button"
                onClick={() => setDeleting(false)}
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              className="text-button danger"
              onClick={() => setDeleting(true)}
            >
              <Trash2 size={14} /> Projekt löschen
            </button>
          )}
        </section>
      ) : tab === "Notizen" ? (
        <section className="settings-card">
          <h3>Platz für deine Gedanken</h3>
          <textarea
            className="notes-editor"
            aria-label="Projektnotizen"
            placeholder="Ideen, Links, nächste Schritte …"
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setSaved(false);
            }}
          />
          <button
            className="primary-button"
            onClick={() => {
              onUpdate({ ...project, notes: note });
              setSaved(true);
            }}
          >
            {saved ? "Gespeichert" : "Notizen speichern"}
            <Check size={16} />
          </button>
        </section>
      ) : (
        <div className="empty-state">
          <FolderOpen size={40} />
          <h3>Alles beginnt mit einer Idee.</h3>
          <p>
            Dateiverwaltung wird mit der nativen Desktop-Anbindung verfügbar.
          </p>
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
