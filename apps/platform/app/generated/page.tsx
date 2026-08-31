"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { ApplicationBlueprint } from "@/types/application";

const navItems = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Clients", icon: "◉" },
  { name: "Workouts", icon: "▣" },
  { name: "Sessions", icon: "◷" },
  { name: "Messages", icon: "✉" },
  { name: "Progress", icon: "↗" },
];

const clients = [
  {
    name: "Sarah Johnson",
    goal: "Strength & conditioning",
    progress: 82,
    next: "Today, 4:00 PM",
  },
  {
    name: "Michael Chen",
    goal: "Weight loss",
    progress: 68,
    next: "Tomorrow, 10:00 AM",
  },
  {
    name: "Emma Williams",
    goal: "Build muscle",
    progress: 74,
    next: "Thu, 6:30 PM",
  },
  {
    name: "David Brown",
    goal: "General fitness",
    progress: 91,
    next: "Fri, 8:00 AM",
  },
];

const workouts = [
  {
    name: "Upper Body Strength",
    client: "Sarah Johnson",
    exercises: 8,
    duration: "48 min",
  },
  {
    name: "Full Body Conditioning",
    client: "Michael Chen",
    exercises: 10,
    duration: "52 min",
  },
  {
    name: "Hypertrophy — Chest & Back",
    client: "Emma Williams",
    exercises: 9,
    duration: "55 min",
  },
];
type AppData = {
  clients: typeof clients;
  workouts: typeof workouts;
  sessions: any[];
  messages: any[];
  progress: any[];
};

type AppDataProps = {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  
};
export default function GeneratedApp() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [application, setApplication] =
    useState<ApplicationBlueprint | null>(null);


const generatedNavItems =
  application?.pages.map((page, index) => ({
    name: page.name,
    icon: index === 0 ? "⌂" : "□",
  })) ?? [];
  const [appData, setAppData] = useState<AppData>({
    clients,
    workouts,
    sessions: [],
    messages: [],
    progress: [],
  });

function getEntityRecords(
  entity: string,
  appData: AppData
) {
  const normalizedEntity = entity
    .toLowerCase()
    .trim()
    .replace(/[-\s]/g, "");

  const entityMap: Record<string, unknown[]> = {
    client: appData.clients,
    clients: appData.clients,

    workout: appData.workouts,
    workouts: appData.workouts,

    session: appData.sessions,
    sessions: appData.sessions,

    message: appData.messages,
    messages: appData.messages,

    progress: appData.progress,
    progresses: appData.progress,
  };

  return entityMap[normalizedEntity] ?? [];
}




function renderGeneratedComponent(
  component: ApplicationBlueprint["pages"][number]["components"][number],
  appData: AppData
) {
  const { name, type, entity, purpose } = component;
  const records = getEntityRecords(entity, appData);

  switch (type) {
    case "stats":
      return (
        <section
          key={name}
          className="generated-component generated-stats"
        >
          <div className="generated-component-header">
            <strong>{name}</strong>
            <span className="badge">{entity}</span>
          </div>

          <div className="generated-stat-value">
           {records.length}
          </div>

          <p>{purpose}</p>
        </section>
      );

    case "table":
      return (
        <section
          key={name}
          className="generated-component"
        >
          <div className="generated-component-header">
            <strong>{name}</strong>
            <span className="badge">{entity}</span>
          </div>

          <div className="generated-table-empty">
            No {entity} records yet.
          </div>

          <p>{purpose}</p>
        </section>
      );

    case "list":
      return (
        <section
          key={name}
          className="generated-component"
        >
          <div className="generated-component-header">
            <strong>{name}</strong>
            <span className="badge">{entity}</span>
          </div>

          <div className="generated-list-empty">
            No {entity} records yet.
          </div>

          <p>{purpose}</p>
        </section>
      );

  case "form": {
  const databaseEntity = application?.database.find(
    (item) =>
      item.name.toLowerCase() === entity.toLowerCase()
  );

  const fields = databaseEntity?.fields ?? [];

  return (
    <section
      key={name}
      className="generated-component"
    >
      <div className="generated-component-header">
        <strong>{name}</strong>
        <span className="badge">{entity}</span>
      </div>

      <div className="generated-form">
        {fields.length === 0 ? (
          <input
            className="form-input"
            placeholder={`${entity} name`}
          />
        ) : (
          fields.map((field) => (
            <div
              key={field.name}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                style={{
                  fontSize: 10,
                  color: "#8d8e98",
                }}
              >
                {field.name}
                {field.required ? " *" : ""}
              </label>

              <input
                className="form-input"
                placeholder={`Enter ${field.name}`}
                required={field.required}
              />
            </div>
          ))
        )}

        <button
          type="button"
          className="new-button"
        >
          Save
        </button>
      </div>

      <p>{purpose}</p>
    </section>
  );
}
    case "detail":
      return (
        <section
          key={name}
          className="generated-component"
        >
          <div className="generated-component-header">
            <strong>{name}</strong>
            <span className="badge">{entity}</span>
          </div>

          <div className="generated-detail-empty">
            Select a {entity} to view details.
          </div>

          <p>{purpose}</p>
        </section>
      );

    case "calendar":
      return (
        <section
          key={name}
          className="generated-component"
        >
          <div className="generated-component-header">
            <strong>{name}</strong>
            <span className="badge">{entity}</span>
          </div>

          <div className="generated-calendar">
            No {entity} scheduled.
          </div>

          <p>{purpose}</p>
        </section>
      );

    case "chart":
      return (
        <section
          key={name}
          className="generated-component"
        >
          <div className="generated-component-header">
            <strong>{name}</strong>
            <span className="badge">{entity}</span>
          </div>

          <div className="generated-chart">
            No {entity} data available yet.
          </div>

          <p>{purpose}</p>
        </section>
      );

    case "text":
    default:
      return (
        <section
          key={name}
          className="generated-component"
        >
          <div className="generated-component-header">
            <strong>{name}</strong>
          </div>

          <p>{purpose}</p>
        </section>
      );
  }
}

  useEffect(() => {
    const storedApplication = sessionStorage.getItem(
      "abiora-generated-application"
    );

    if (!storedApplication) {
      return;
    }

    try {
      const parsed =
        JSON.parse(storedApplication) as ApplicationBlueprint;

      setApplication(parsed);

      if (parsed.pages.length > 0) {
        setActivePage(parsed.pages[0].name);
      }
    } catch (error) {
      console.error(
        "Could not load generated application:",
        error
      );
    }
  }, []);
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
<div className="brand-name">
  {application?.projectName || "ABIORA"}
</div>

<div className="brand-subtitle">
  GENERATED APPLICATION
</div>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="nav">
         {generatedNavItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="coach-card">
            <div className="avatar">JD</div>
            <div>
              <strong>Jordan Davis</strong>
              <span>Coach</span>
            </div>
          </div>

          <button className="settings-button">⚙ Settings</button>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <div className="eyebrow">
  {application?.projectName || "ABIORA"}
</div>

<h1>{activePage}</h1>
          </div>

          <div className="topbar-actions">
            <button className="notification">◌</button>
            <button className="new-button">+ New</button>
          </div>
        </header>

{activePage === "Clients" && (
  <Clients
    appData={appData}
    setAppData={setAppData}
    application={application}
  />
)}

{activePage === "Workouts" && (
  <Workouts
    appData={appData}
    setAppData={setAppData}
  />
)}

{activePage === "Sessions" && (
  <Sessions
    appData={appData}
    setAppData={setAppData}
  />
)}

{activePage === "Messages" && (
  <Messages
    appData={appData}
    setAppData={setAppData}
  />
)}

{activePage === "Progress" && (
  <Progress
    appData={appData}
    setAppData={setAppData}
  />
)}
{application?.pages &&
![
  "Dashboard",
  "Coach Dashboard",
  "Client Dashboard",

  "Clients",
  "Coach Clients",

  "Workouts",
  "Coach Workout Plans",
  "Client Workouts",

  "Sessions",
  "Coach Sessions",

  "Messages",
  "Coach Messages",

  "Progress",
  "Client Progress",
].includes(activePage) && (
    <section className="generated-page-placeholder">
      <h2>{activePage}</h2>

      <p>
        {application.pages.find(
          (page) => page.name === activePage
        )?.purpose || "Generated application page"}
      </p>

<div className="generated-components">
  {application.pages
    .find((page) => page.name === activePage)
    ?.components.map((component) =>
     renderGeneratedComponent(component, appData)
    )}
</div>
    </section>
  )}

      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .app-shell {
          min-height: 100vh;
          display: flex;
          background: #070709;
          color: #f5f5f7;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        .sidebar {
          width: 250px;
          min-height: 100vh;
          border-right: 1px solid #222228;
          background: #0b0b0f;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 8px 30px;
        }

        .brand-mark {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          background: #7c83ff;
          color: white;
          font-weight: 800;
          font-size: 18px;
        }

        .brand-name {
          font-size: 16px;
          font-weight: 750;
        }

        .brand-subtitle {
          margin-top: 3px;
          color: #777783;
          font-size: 9px;
          letter-spacing: 1.8px;
        }

        .workspace-label {
          color: #5f606a;
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 700;
          padding: 0 12px 10px;
        }

        .nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          border: 0;
          width: 100%;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 12px;
          border-radius: 9px;
          color: #8e8e98;
          background: transparent;
          cursor: pointer;
          font-size: 13px;
        }

        .nav-item:hover {
          background: #15151b;
          color: white;
        }

        .nav-item.active {
          background: #181821;
          color: white;
        }

        .nav-icon {
          width: 18px;
          text-align: center;
          color: #888cff;
          font-size: 15px;
        }

        .sidebar-bottom {
          margin-top: auto;
        }

        .coach-card {
          border-top: 1px solid #202027;
          padding: 18px 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #25252d;
          display: grid;
          place-items: center;
          color: #b7b9ff;
          font-size: 11px;
          font-weight: 700;
        }

        .coach-card strong {
          display: block;
          font-size: 12px;
        }

        .coach-card span {
          display: block;
          margin-top: 3px;
          color: #707079;
          font-size: 10px;
        }

        .settings-button {
          width: 100%;
          border: 0;
          background: transparent;
          color: #777780;
          text-align: left;
          padding: 10px 8px;
          cursor: pointer;
          font-size: 12px;
        }

        .content {
          flex: 1;
          min-width: 0;
          padding: 34px 42px 60px;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 34px;
        }

        .eyebrow {
          color: #7c83ff;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2.5px;
          margin-bottom: 7px;
        }

        h1 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -1px;
        }

        .topbar-actions {
          display: flex;
          gap: 10px;
        }

        .notification,
        .new-button {
          border: 1px solid #292930;
          border-radius: 9px;
          background: #101015;
          color: #dddde3;
          padding: 10px 14px;
          cursor: pointer;
        }

        .new-button {
          background: #7c83ff;
          border-color: #7c83ff;
          color: white;
          font-weight: 700;
        }

        .welcome {
          margin-bottom: 25px;
        }

        .welcome h2 {
          margin: 0 0 6px;
          font-size: 20px;
        }

        .welcome p {
          margin: 0;
          color: #777781;
          font-size: 13px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .stat-card,
        .panel {
          border: 1px solid #24242b;
          background: #0d0d12;
          border-radius: 14px;
        }

        .stat-card {
          padding: 19px;
        }

        .stat-label {
          color: #777780;
          font-size: 11px;
        }

        .stat-value {
          font-size: 27px;
          font-weight: 750;
          margin-top: 10px;
        }

        .stat-change {
          margin-top: 7px;
          color: #777dff;
          font-size: 10px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 18px;
        }

        .panel {
          padding: 20px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 15px;
        }

        .panel-header button {
          border: 0;
          background: transparent;
          color: #8389ff;
          cursor: pointer;
          font-size: 11px;
        }

        .client-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 0;
          border-top: 1px solid #1e1e24;
        }

        .client-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #191921;
          display: grid;
          place-items: center;
          color: #9da2ff;
          font-size: 10px;
          font-weight: 700;
        }

        .client-info {
          flex: 1;
        }

        .client-info strong {
          display: block;
          font-size: 12px;
        }

        .client-info span {
          display: block;
          color: #6f7079;
          font-size: 10px;
          margin-top: 3px;
        }

        .progress-wrap {
          width: 100px;
        }

        .progress-bar {
          height: 5px;
          border-radius: 10px;
          background: #25252c;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #7c83ff;
          border-radius: inherit;
        }

        .progress-number {
          display: block;
          margin-top: 5px;
          color: #7d7e88;
          font-size: 9px;
          text-align: right;
        }

        .session {
          padding: 15px 0;
          border-top: 1px solid #1e1e24;
        }

        .session:first-of-type {
          border-top: 0;
        }

        .session-time {
          color: #858aff;
          font-size: 10px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .session strong {
          font-size: 12px;
        }

        .session p {
          margin: 4px 0 0;
          color: #707079;
          font-size: 10px;
        }

        .page-panel {
          max-width: 1100px;
        }

        .page-panel .panel {
          margin-bottom: 16px;
        }

        .page-description {
          color: #777781;
          font-size: 13px;
          margin: -20px 0 24px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1.3fr 1.2fr 100px 150px;
          gap: 15px;
          align-items: center;
          padding: 15px 0;
          border-top: 1px solid #1e1e24;
          font-size: 12px;
        }

        .table-row.header {
          border-top: 0;
          color: #60616b;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .muted {
          color: #707079;
        }

        .badge {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 6px;
          background: #191921;
          color: #a3a7ff;
          font-size: 9px;
        }

        .workout-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #1e1e24;
          padding: 18px 0;
        }

        .workout-card strong {
          display: block;
          font-size: 13px;
        }

        .workout-card span {
          color: #707079;
          font-size: 10px;
          margin-right: 12px;
        }

        .message {
          display: flex;
          gap: 13px;
          padding: 17px 0;
          border-top: 1px solid #1e1e24;
        }

        .message-content {
          flex: 1;
        }

        .message-content strong {
          font-size: 12px;
        }

        .message-content p {
          color: #777780;
          margin: 5px 0 0;
          font-size: 11px;
          line-height: 1.5;
        }

        .chart {
          height: 250px;
          display: flex;
          align-items: flex-end;
          gap: 14px;
          padding: 25px 10px 10px;
        }

        .bar {
          flex: 1;
          background: #25252e;
          border-radius: 6px 6px 2px 2px;
          position: relative;
          min-height: 30px;
        }

        .bar.active {
          background: #7c83ff;
        }

        .bar span {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          color: #666771;
          font-size: 9px;
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 190px;
          }

          .content {
            padding: 28px 22px;
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .sidebar {
            display: none;
          }

          .content {
            padding: 22px 16px;
          }

          .stats {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}
    </style>
    </main>
 );
}
  
function Dashboard({
  appData,
  setActivePage,
}: AppDataProps & {
  setActivePage: (page: string) => void;
}) {
  return (
    <>
      <div className="welcome">
        <h2>Good afternoon, Jordan.</h2>
        <p>
          Here&apos;s what&apos;s happening with your coaching business.
        </p>
      </div>

      <div className="stats">
        <Stat
          label="Active Clients"
          value={String(appData.clients.length)}
          change="Current roster"
        />

        <Stat
          label="Sessions This Week"
          value={String(appData.sessions.length)}
          change="Scheduled sessions"
        />

        <Stat
  label="Unread Messages"
  value={String(
    appData.messages.filter((message) => !message.read).length
  )}
  change="Unread"
/>

        <Stat
          label="Monthly Revenue"
          value="$4,820"
          change="+8.4% this month"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Client Progress</h3>
            <button type="button">View all →</button>
          </div>

          {appData.clients.length === 0 ? (
            <div
              style={{
                padding: "35px 0",
                textAlign: "center",
                color: "#707079",
                fontSize: 12,
              }}
            >
              No clients yet.
            </div>
          ) : (
            appData.clients.map((client) => (
              <div
                className="client-row"
                key={client.name}
              >
                <div className="client-avatar">
                  {initials(client.name)}
                </div>

                <div className="client-info">
                  <strong>{client.name}</strong>
                  <span>{client.goal}</span>
                </div>

                <div className="progress-wrap">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${client.progress}%`,
                      }}
                    />
                  </div>

                  <span className="progress-number">
                    {client.progress}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Upcoming Sessions</h3>
            <button type="button">Calendar →</button>
          </div>

          {appData.sessions.length === 0 ? (
            <div
              style={{
                padding: "35px 0",
                textAlign: "center",
                color: "#707079",
                fontSize: 12,
              }}
            >
              No sessions scheduled.
            </div>
          ) : (
            appData.sessions.map((session) => (
              <div
                className="session"
                key={session.id}
              >
                <div className="session-time">
                  {session.time}
                </div>

                <strong>{session.client}</strong>

                <p>
                  {session.type} · {session.duration}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function Clients({
  appData,
  setAppData,
  application,
}: AppDataProps & {
  application: ApplicationBlueprint | null;
}) {

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [selectedClient, setSelectedClient] = useState<
    (typeof appData.clients)[number] | null
  >(null);

  const [formData, setFormData] = useState<Record<string, string>>({});

  /*
   * Find the Client database entity from the generated application.
   */
  const clientEntity = application?.database.find(
    (entity) =>
      entity.name.toLowerCase() === "client" ||
      entity.name.toLowerCase() === "clients"
  );

  const fields = clientEntity?.fields ?? [];

  /*
   * Only show fields that make sense in the creation form.
   *
   * We don't want generated system fields such as:
   * id, createdAt, updatedAt, etc.
   */
  const formFields = fields.filter(
    (field) =>
      ![
        "id",
        "createdAt",
        "updatedAt",
        "lastSignedInAt",
      ].includes(field.name)
  );

  /*
   * Search dynamically across all client values.
   */
  const filteredClients = appData.clients.filter((client) =>
    Object.values(client)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function updateField(fieldName: string, value: string) {
    setFormData((current) => ({
      ...current,
      [fieldName]: value,
    }));
  }

  function addClient() {
    /*
     * Check required generated fields.
     */
    const missingRequiredField = formFields.some(
      (field) =>
        field.required &&
        !String(formData[field.name] ?? "").trim()
    );

    if (missingRequiredField) {
      return;
    }

    /*
     * Build the client dynamically from the generated schema.
     */
    const newClient = {
      ...formData,
      progress: 0,
      next: "Not scheduled",
    };

    setAppData((current) => ({
      ...current,
      clients: [
        ...current.clients,
        newClient as (typeof current.clients)[number],
      ],
    }));

    setFormData({});
    setShowForm(false);
  }

  function deleteClient(client: (typeof appData.clients)[number]) {
    const clientName =
      String(client.name ?? "this client");

    const confirmed = window.confirm(
      `Delete ${clientName}?\n\nThis will also delete all workouts, sessions, messages, and progress records connected to this client.\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    setAppData((current) => ({
      ...current,

      clients: current.clients.filter(
        (item) => item !== client
      ),

      workouts: current.workouts.filter(
        (workout) => workout.client !== clientName
      ),

      sessions: current.sessions.filter(
        (session) => session.client !== clientName
      ),

      messages: current.messages.filter(
        (message) => message.client !== clientName
      ),

      progress: current.progress.filter(
        (entry) => entry.client !== clientName
      ),
    }));

    if (selectedClient === client) {
      setSelectedClient(null);
    }
  }

  /*
   * No generated Client entity exists.
   */
  if (!clientEntity) {
    return (
      <div className="panel">
        <p className="muted">
          No Client entity was generated for this application.
        </p>
      </div>
    );
  }

  return (
    <div className="page-panel">

      {/* PAGE INTRO */}
      <div className="page-intro">
        <div>
          <h2>Manage your clients.</h2>

          <p>
            Add clients, view their information, and manage
            your client records.
          </p>
        </div>

        <button
          type="button"
          className="new-button"
          onClick={() => setShowForm((current) => !current)}
        >
          + Add Client
        </button>
      </div>

      {/* DYNAMIC CREATE FORM */}
      {showForm && (
        <div
          className="panel"
          style={{ marginBottom: 18 }}
        >
          <div className="panel-header">
            <div>
              <h3>Create Client</h3>

              <p className="muted">
                Add a new client to your workspace.
              </p>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={() => {
                setShowForm(false);
                setFormData({});
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            {formFields.map((field) => (
              <div key={field.name}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 7,
                    fontSize: 11,
                    color: "#8d8e98",
                  }}
                >
                  {field.name}
                  {field.required ? " *" : ""}
                </label>

                <input
                  className="form-input"
                  value={formData[field.name] ?? ""}
                  onChange={(event) =>
                    updateField(
                      field.name,
                      event.target.value
                    )
                  }
                  placeholder={`Enter ${field.name}`}
                  type={
                    field.type.toLowerCase().includes("email")
                      ? "email"
                      : field.type
                          .toLowerCase()
                          .includes("number")
                      ? "number"
                      : "text"
                  }
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              className="new-button"
              onClick={addClient}
            >
              Create Client
            </button>
          </div>
        </div>
      )}

      {/* CLIENT TABLE */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Clients</h3>

            <p className="muted">
              {appData.clients.length} client
              {appData.clients.length === 1 ? "" : "s"}{" "}
              in your workspace.
            </p>
          </div>

          <input
            className="form-input"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search clients..."
            style={{
              width: 220,
            }}
          />
        </div>

        {/* DYNAMIC COLUMN HEADERS */}
        <div
          className="table-row header"
          style={{
            gridTemplateColumns: `repeat(
              ${Math.min(formFields.length + 1, 5)},
              minmax(0, 1fr)
            )`,
          }}
        >
          {formFields
            .slice(0, 4)
            .map((field) => (
              <div key={field.name}>
                {field.name}
              </div>
            ))}

          <div>Actions</div>
        </div>

        {/* CLIENT RECORDS */}
        {filteredClients.length === 0 ? (
          <div
            style={{
              padding: "35px 0",
              textAlign: "center",
              color: "#707079",
              fontSize: 12,
            }}
          >
            {search
              ? "No clients match your search."
              : "No clients found."}
          </div>
        ) : (
          filteredClients.map((client, index) => (
            <div
              className="table-row"
            key={`${String(client.name ?? "client")}-${index}`}
              style={{
                gridTemplateColumns: `repeat(
                  ${Math.min(formFields.length + 1, 5)},
                  minmax(0, 1fr)
                )`,
              }}
            >
              {formFields
                .slice(0, 4)
                .map((field) => (
                  <div
                    key={field.name}
                    className={
                      field.name === "name"
                        ? ""
                        : "muted"
                    }
                  >
                    {String(
                      client[field.name as keyof typeof client] ??
                        "—"
                    )}
                  </div>
                ))}

              <div
                style={{
                  display: "flex",
                  gap: 7,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedClient(client)
                  }
                  style={{
                    border: "1px solid #292930",
                    background: "#111116",
                    color: "#d7d7df",
                    borderRadius: 7,
                    padding: "6px 9px",
                    cursor: "pointer",
                    fontSize: 10,
                  }}
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={() =>
                    deleteClient(client)
                  }
                  style={{
                    border: "1px solid #35252a",
                    background: "#171013",
                    color: "#d98b96",
                    borderRadius: 7,
                    padding: "6px 9px",
                    cursor: "pointer",
                    fontSize: 10,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DYNAMIC CLIENT DETAILS */}
      {selectedClient && (
        <div
          className="panel"
          style={{
            marginTop: 18,
          }}
        >
          <div className="panel-header">
            <div>
              <h3>
                {String(
                  selectedClient.name ??
                    "Client Details"
                )}
              </h3>

              <p className="muted">
                Client details
              </p>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={() =>
                setSelectedClient(null)
              }
            >
              ×
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {formFields.map((field) => (
              <div
                className="stat-card"
                key={field.name}
              >
                <span className="muted">
                  {field.name}
                </span>

                <strong>
                  {String(
                    selectedClient[
                      field.name as keyof typeof selectedClient
                    ] ?? "—"
                  )}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );


return(
    <>
      <div className="page-intro">
        <div>
          <h2>Manage your clients.</h2>

          <p>
            Add clients, view their goals, track progress, and manage
            your coaching roster.
          </p>
        </div>

        <button
          type="button"
          className="new-button"
          onClick={() => setShowForm((current) => !current)}
        >
          + Add Client
        </button>
      </div>

      {showForm && (
        <div className="panel" style={{ marginBottom: 18 }}>
          <div className="panel-header">
            <div>
              <h3>Add Client</h3>

              <p className="muted">
                Add a new client to your shared CoachFlow data.
              </p>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 7,
                  fontSize: 11,
                  color: "#8d8e98",
                }}
              >
                CLIENT NAME
              </label>

              <input
                className="form-input"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="e.g. Alex Morgan"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 7,
                  fontSize: 11,
                  color: "#8d8e98",
                }}
              >
                GOAL
              </label>

              <input
                className="form-input"
                value={newGoal}
                onChange={(event) => setNewGoal(event.target.value)}
                placeholder="e.g. Build strength"
              />
            </div>

            <button
              type="button"
              className="approve-build"
              onClick={addClient}
              disabled={!newName.trim() || !newGoal.trim()}
            >
              Add Client
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Clients</h3>

            <p className="muted">
              {appData.clients.length} client
              {appData.clients.length === 1 ? "" : "s"} in your workspace.
            </p>
          </div>

          <input
            className="form-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clients..."
            style={{
              width: 220,
            }}
          />
        </div>

        <div className="table-row header">
          <div>Client</div>
          <div>Goal</div>
          <div>Progress</div>
          <div>Next Session</div>
          <div>Actions</div>
        </div>

        {filteredClients.length === 0 ? (
          <div
            style={{
              padding: "35px 0",
              textAlign: "center",
              color: "#707079",
              fontSize: 12,
            }}
          >
            {search
              ? "No clients match your search."
              : "No clients found."}
          </div>
        ) : (
          filteredClients.map((client) => (
            <div className="table-row" key={client.name}>
              <div>
                <strong>{client.name}</strong>
              </div>

              <div className="muted">
                {client.goal}
              </div>

              <div>
                <span className="badge">
                  {client.progress}%
                </span>
              </div>

              <div className="muted">
                {client.next}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 7,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedClient(client)}
                  style={{
                    border: "1px solid #292930",
                    background: "#111116",
                    color: "#d7d7df",
                    borderRadius: 7,
                    padding: "6px 9px",
                    cursor: "pointer",
                    fontSize: 10,
                  }}
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={() => deleteClient(client)}
                  style={{
                    border: "1px solid #35252a",
                    background: "#171013",
                    color: "#d98b96",
                    borderRadius: 7,
                    padding: "6px 9px",
                    cursor: "pointer",
                    fontSize: 10,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </>
  );
}

function Workouts({ appData, setAppData }: AppDataProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<
  (typeof appData.workouts)[number] | null
>(null);

  const [newName, setNewName] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newExercises, setNewExercises] = useState("5");
  const [newDuration, setNewDuration] = useState("30 min");

  function addWorkout() {
    if (!newName.trim() || !newClient.trim()) return;

    const newWorkout = {
      name: newName.trim(),
      client: newClient.trim(),
      exercises: Number(newExercises) || 0,
      duration: newDuration.trim() || "30 min",
    };

    setAppData((current) => ({
      ...current,
      workouts: [...current.workouts, newWorkout],
    }));

    setNewName("");
    setNewClient("");
    setNewExercises("5");
    setNewDuration("30 min");
    setShowForm(false);
  }

  function deleteWorkout(name: string) {
    setAppData((current) => ({
      ...current,
      workouts: current.workouts.filter(
        (workout) => workout.name !== name
      ),
    }));

    setSelectedWorkout(null);
  }

  if (selectedWorkout) {
    return (
      <div className="page-panel">
        <button
          type="button"
          onClick={() => setSelectedWorkout(null)}
          style={{
            border: 0,
            background: "transparent",
            color: "#858aff",
            cursor: "pointer",
            padding: 0,
            marginBottom: 22,
            fontSize: 12,
          }}
        >
          ← Back to Workouts
        </button>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 style={{ margin: 0, fontSize: 21 }}>
                {selectedWorkout.name}
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#777781",
                  fontSize: 12,
                }}
              >
                Assigned to {selectedWorkout.client}
              </p>
            </div>

            <span className="badge">Active</span>
          </div>

          <div className="stats">
            <div className="stat-card">
              <div className="stat-label">Exercises</div>

              <div className="stat-value">
                {selectedWorkout.exercises}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Duration</div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginTop: 12,
                }}
              >
                {selectedWorkout.duration}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 25 }}>
            <h3 style={{ fontSize: 14 }}>
              Workout Overview
            </h3>

            <p
              style={{
                color: "#777781",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              This workout contains{" "}
              <strong style={{ color: "#ddd" }}>
                {selectedWorkout.exercises} exercises
              </strong>{" "}
              and is assigned to{" "}
              <strong style={{ color: "#ddd" }}>
                {selectedWorkout.client}
              </strong>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              deleteWorkout(selectedWorkout.name)
            }
            style={{
              marginTop: 20,
              border: "1px solid #3a2528",
              background: "#171012",
              color: "#ff8b95",
              borderRadius: 8,
              padding: "9px 13px",
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            Delete Workout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          marginBottom: 22,
        }}
      >
        <p
          className="page-description"
          style={{ margin: 0 }}
        >
          Create and manage workout plans for your clients.
        </p>

        <button
          type="button"
          className="new-button"
          onClick={() => setShowForm(true)}
        >
          + New Workout
        </button>
      </div>

      {showForm && (
        <div
          className="panel"
          style={{ marginBottom: 16 }}
        >
          <div className="panel-header">
            <h3>Create Workout</h3>

            <button
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1.4fr 1fr 120px 120px auto",
              gap: 10,
            }}
          >
            <input
              value={newName}
              onChange={(event) =>
                setNewName(event.target.value)
              }
              placeholder="Workout name"
              className="form-input"
            />

            <select
              value={newClient}
              onChange={(event) =>
                setNewClient(event.target.value)
              }
              className="form-input"
            >
              <option value="">
                Select client
              </option>

              {appData.clients.map((client) => (
                <option
                  key={client.name}
                  value={client.name}
                >
                  {client.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={newExercises}
              onChange={(event) =>
                setNewExercises(event.target.value)
              }
              placeholder="Exercises"
              className="form-input"
            />

            <input
              value={newDuration}
              onChange={(event) =>
                setNewDuration(event.target.value)
              }
              placeholder="Duration"
              className="form-input"
            />

            <button
              type="button"
              className="new-button"
              onClick={addWorkout}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        {appData.workouts.length === 0 ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "#707079",
              fontSize: 12,
            }}
          >
            No workouts yet. Create your first workout
            above.
          </div>
        ) : (
          appData.workouts.map((workout) => (
            <button
              type="button"
              key={workout.name}
              onClick={() =>
                setSelectedWorkout(workout)
              }
              style={{
                width: "100%",
                border: 0,
                background: "transparent",
                color: "inherit",
                textAlign: "left",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div className="workout-card">
                <div>
                  <strong>{workout.name}</strong>

                  <div style={{ marginTop: 7 }}>
                    <span>{workout.client}</span>

                    <span>
                      {workout.exercises} exercises
                    </span>

                    <span>
                      {workout.duration}
                    </span>
                  </div>
                </div>

                <span className="badge">
                  Active
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
//////////////////////
function Sessions({ appData, setAppData }: AppDataProps) {
  const [showForm, setShowForm] = useState(false);

  const [selectedSession, setSelectedSession] = useState<
    (typeof appData.sessions)[number] | null
  >(null);

  const [newClient, setNewClient] = useState("");
  const [newType, setNewType] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDuration, setNewDuration] = useState("60 min");

  function addSession() {
  if (!newClient.trim() || !newType.trim() || !newTime.trim()) {
      return;
    }

    const newSession = {
      id: Date.now(),
      time: newTime.trim(),
      client: newClient,
      type: newType.trim(),
      duration: newDuration.trim() || "60 min",
    };

    setAppData((current) => ({
      ...current,
      sessions: [...current.sessions, newSession],
    }));

    setNewClient("");
    setNewType("");
    setNewTime("");
    setNewDuration("60 min");
    setShowForm(false);
  }

  function deleteSession(id: number) {
    setAppData((current) => ({
      ...current,
      sessions: current.sessions.filter(
        (session) => session.id !== id
      ),
    }));

    setSelectedSession(null);
  }

  if (selectedSession) {
    return (
      <div className="page-panel">
        <button
          type="button"
          onClick={() => setSelectedSession(null)}
          style={{
            border: 0,
            background: "transparent",
            color: "#858aff",
            cursor: "pointer",
            padding: 0,
            marginBottom: 22,
            fontSize: 12,
          }}
        >
          ← Back to Sessions
        </button>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 style={{ margin: 0, fontSize: 21 }}>
                {selectedSession.type}
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#777781",
                  fontSize: 12,
                }}
              >
                {selectedSession.client}
              </p>
            </div>

            <span className="badge">Scheduled</span>
          </div>

          <div className="stats">
            <div className="stat-card">
              <div className="stat-label">Date & Time</div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginTop: 12,
                }}
              >
                {selectedSession.time}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Duration</div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginTop: 12,
                }}
              >
                {selectedSession.duration}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 25 }}>
            <h3 style={{ fontSize: 14 }}>
              Session Overview
            </h3>

            <p
              style={{
                color: "#777781",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              This{" "}
              <strong style={{ color: "#ddd" }}>
                {selectedSession.type}
              </strong>{" "}
              session is scheduled with{" "}
              <strong style={{ color: "#ddd" }}>
                {selectedSession.client}
              </strong>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              deleteSession(selectedSession.id)
            }
            style={{
              marginTop: 20,
              border: "1px solid #3a2528",
              background: "#171012",
              color: "#ff8b95",
              borderRadius: 8,
              padding: "9px 13px",
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            Delete Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          marginBottom: 22,
        }}
      >
        <p
          className="page-description"
          style={{ margin: 0 }}
        >
          Keep track of upcoming and completed training sessions.
        </p>

        <button
          type="button"
          className="new-button"
          onClick={() => setShowForm(true)}
        >
          + New Session
        </button>
      </div>

      {showForm && (
        <div
          className="panel"
          style={{ marginBottom: 16 }}
        >
          <div className="panel-header">
            <h3>Schedule Session</h3>

            <button
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr 1.2fr 120px auto",
              gap: 10,
            }}
          >
            <select
              value={newClient}
              onChange={(event) =>
                setNewClient(event.target.value)
              }
              className="form-input"
            >
              <option value="">
                Select client
              </option>

              {appData.clients.map((client) => (
                <option
                  key={client.name}
                  value={client.name}
                >
                  {client.name}
                </option>
              ))}
            </select>

            <input
              value={newType}
              onChange={(event) =>
                setNewType(event.target.value)
              }
              placeholder="Session type"
              className="form-input"
            />

            <input
              value={newTime}
              onChange={(event) =>
                setNewTime(event.target.value)
              }
              placeholder="Date & time"
              className="form-input"
            />

            <input
              value={newDuration}
              onChange={(event) =>
                setNewDuration(event.target.value)
              }
              placeholder="Duration"
              className="form-input"
            />

            <button
              type="button"
              className="new-button"
              onClick={addSession}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        {appData.sessions.length === 0 ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "#707079",
              fontSize: 12,
            }}
          >
            No sessions scheduled.
          </div>
        ) : (
          appData.sessions.map((session) => (
            <button
              type="button"
              key={session.id}
              onClick={() =>
                setSelectedSession(session)
              }
              style={{
                width: "100%",
                border: 0,
                background: "transparent",
                color: "inherit",
                textAlign: "left",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div className="session">
                <div className="session-time">
                  {session.time}
                </div>

                <strong>{session.client}</strong>

                <p>
                  {session.type} · {session.duration}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function Messages({ appData, setAppData }: AppDataProps) {
  const messageList = appData.messages;

  const [showForm, setShowForm] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState<
    (typeof messageList)[number] | null
  >(null);

  const [newClient, setNewClient] = useState("");
  const [newMessage, setNewMessage] = useState("");

  function sendMessage() {
    if (!newClient.trim() || !newMessage.trim()) return;

  const message = {
  id: Date.now(),
  client: newClient.trim(),
  name: newClient.trim(),
  message: newMessage.trim(),
  time: "Just now",
  read: false,
};

    setAppData((current) => ({
      ...current,
      messages: [message, ...current.messages],
    }));

    setNewClient("");
    setNewMessage("");
    setShowForm(false);
  }

  function deleteMessage(id: number) {
    setAppData((current) => ({
      ...current,
      messages: current.messages.filter(
        (message) => message.id !== id
      ),
    }));

    setSelectedMessage(null);
  }

  if (selectedMessage) {
    return (
      <div className="page-panel">
        <button
          type="button"
          onClick={() => setSelectedMessage(null)}
          style={{
            border: 0,
            background: "transparent",
            color: "#858aff",
            cursor: "pointer",
            padding: 0,
            marginBottom: 22,
            fontSize: 12,
          }}
        >
          ← Back to Messages
        </button>

        <div className="panel">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 25,
            }}
          >
            <div
              className="client-avatar"
              style={{
                width: 48,
                height: 48,
                fontSize: 12,
              }}
            >
              {initials(selectedMessage.name)}
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                }}
              >
                {selectedMessage.name}
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#777781",
                  fontSize: 11,
                }}
              >
                Client conversation
              </p>
            </div>
          </div>

          <div
            style={{
              background: "#15151c",
              border: "1px solid #25252d",
              borderRadius: 12,
              padding: 18,
            }}
          >
            <div
              style={{
                color: "#777781",
                fontSize: 10,
                marginBottom: 8,
              }}
            >
              {selectedMessage.time}
            </div>

            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {selectedMessage.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              deleteMessage(selectedMessage.id)
            }
            style={{
              marginTop: 20,
              border: "1px solid #3a2528",
              background: "#171012",
              color: "#ff8b95",
              borderRadius: 8,
              padding: "9px 13px",
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            Delete Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          marginBottom: 22,
        }}
      >
        <p
          className="page-description"
          style={{ margin: 0 }}
        >
          Communicate directly with your clients.
        </p>

        <button
          type="button"
          className="new-button"
          onClick={() => setShowForm(true)}
        >
          + New Message
        </button>
      </div>

      {showForm && (
        <div
          className="panel"
          style={{ marginBottom: 16 }}
        >
          <div className="panel-header">
            <h3>New Message</h3>

            <button
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr auto",
              gap: 10,
            }}
          >
            <select
              value={newClient}
              onChange={(event) =>
                setNewClient(event.target.value)
              }
              className="form-input"
            >
              <option value="">
                Select client
              </option>

              {appData.clients.map((client) => (
                <option
                  key={client.name}
                  value={client.name}
                >
                  {client.name}
                </option>
              ))}
            </select>

            <input
              value={newMessage}
              onChange={(event) =>
                setNewMessage(event.target.value)
              }
              placeholder="Write your message..."
              className="form-input"
            />

            <button
              type="button"
              className="new-button"
              onClick={sendMessage}
              disabled={
                !newClient.trim() ||
                !newMessage.trim()
              }
            >
              Send
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        {messageList.length === 0 ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "#707079",
              fontSize: 12,
            }}
          >
            No messages yet.
          </div>
        ) : (
          messageList.map((message) => (
            <button
              type="button"
              key={message.id}
              onClick={() => {
  setAppData((current) => ({
    ...current,
    messages: current.messages.map((item) =>
      item.id === message.id
        ? { ...item, read: true }
        : item
    ),
  }));

  setSelectedMessage({
    ...message,
    read: true,
  });
}}
              style={{
                width: "100%",
                border: 0,
                background: "transparent",
                color: "inherit",
                textAlign: "left",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div className="message">
                <div className="client-avatar">
                  {initials(message.name)}
                </div>

                <div className="message-content">
                  <strong>{message.name}</strong>

                  <p>{message.message}</p>

                  <span
                    style={{
                      display: "block",
                      color: "#555660",
                      fontSize: 9,
                      marginTop: 6,
                    }}
                  >
                    {message.time}
                  </span>
                </div>

               {!message.read && (
  <span className="badge">
    New
  </span>
)}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function Progress({ appData, setAppData }: AppDataProps) {
  const entries = appData.progress;

  const [showForm, setShowForm] = useState(false);

  const [selectedEntry, setSelectedEntry] = useState<
    (typeof entries)[number] | null
  >(null);

  const [newClient, setNewClient] = useState("");
  const [newMetric, setNewMetric] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newDate, setNewDate] = useState("");

  function addEntry() {
    if (
      !newClient.trim() ||
      !newMetric.trim() ||
      !newValue.trim()
    ) {
      return;
    }

    const entry = {
      id: Date.now(),
      client: newClient.trim(),
      metric: newMetric.trim(),
      value: newValue.trim(),
      date: newDate.trim() || "Today",
    };

    setAppData((current) => ({
      ...current,
      progress: [...current.progress, entry],
    }));

    setNewClient("");
    setNewMetric("");
    setNewValue("");
    setNewDate("");
    setShowForm(false);
  }

  function deleteEntry(id: number) {
    setAppData((current) => ({
      ...current,
      progress: current.progress.filter(
        (entry) => entry.id !== id
      ),
    }));

    setSelectedEntry(null);
  }

  const chartValues = entries
    .map((entry) => {
      const number = parseFloat(entry.value);
      return Number.isFinite(number) ? number : 0;
    })
    .slice(-8);

  if (selectedEntry) {
    return (
      <div className="page-panel">
        <button
          type="button"
          onClick={() => setSelectedEntry(null)}
          style={{
            border: 0,
            background: "transparent",
            color: "#858aff",
            cursor: "pointer",
            padding: 0,
            marginBottom: 22,
            fontSize: 12,
          }}
        >
          ← Back to Progress
        </button>

        <div className="panel">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 25,
            }}
          >
            <div
              className="client-avatar"
              style={{
                width: 48,
                height: 48,
                fontSize: 12,
              }}
            >
              {initials(selectedEntry.client)}
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                }}
              >
                {selectedEntry.client}
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#777781",
                  fontSize: 11,
                }}
              >
                Progress entry
              </p>
            </div>
          </div>

          <div className="stats">
            <div className="stat-card">
              <div className="stat-label">Metric</div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginTop: 12,
                }}
              >
                {selectedEntry.metric}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Value</div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 750,
                  marginTop: 10,
                }}
              >
                {selectedEntry.value}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 25 }}>
            <h3 style={{ fontSize: 14 }}>
              Recorded
            </h3>

            <p
              style={{
                color: "#777781",
                fontSize: 12,
              }}
            >
              This progress entry was recorded{" "}
              <strong style={{ color: "#ddd" }}>
                {selectedEntry.date}
              </strong>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              deleteEntry(selectedEntry.id)
            }
            style={{
              marginTop: 20,
              border: "1px solid #3a2528",
              background: "#171012",
              color: "#ff8b95",
              borderRadius: 8,
              padding: "9px 13px",
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            Delete Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          marginBottom: 22,
        }}
      >
        <p
          className="page-description"
          style={{ margin: 0 }}
        >
          Track overall client progress and coaching outcomes.
        </p>

        <button
          type="button"
          className="new-button"
          onClick={() => setShowForm(true)}
        >
          + Add Progress
        </button>
      </div>

      {showForm && (
        <div
          className="panel"
          style={{ marginBottom: 16 }}
        >
          <div className="panel-header">
            <h3>Add Progress Entry</h3>

            <button
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr 140px 140px auto",
              gap: 10,
            }}
          >
            <select
              value={newClient}
              onChange={(event) =>
                setNewClient(event.target.value)
              }
              className="form-input"
            >
              <option value="">
                Select client
              </option>

              {appData.clients.map((client) => (
                <option
                  key={client.name}
                  value={client.name}
                >
                  {client.name}
                </option>
              ))}
            </select>

            <input
              value={newMetric}
              onChange={(event) =>
                setNewMetric(event.target.value)
              }
              placeholder="Metric"
              className="form-input"
            />

            <input
              value={newValue}
              onChange={(event) =>
                setNewValue(event.target.value)
              }
              placeholder="Value"
              className="form-input"
            />

            <input
              value={newDate}
              onChange={(event) =>
                setNewDate(event.target.value)
              }
              placeholder="Date"
              className="form-input"
            />

            <button
              type="button"
              className="new-button"
              onClick={addEntry}
              disabled={
                !newClient.trim() ||
                !newMetric.trim() ||
                !newValue.trim()
              }
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h3>Client Progress Trend</h3>

          <span className="badge">
            {entries.length} entries
          </span>
        </div>

        <div className="chart">
          {chartValues.length === 0 ? (
            <div
              style={{
                width: "100%",
                textAlign: "center",
                color: "#707079",
                fontSize: 12,
                paddingTop: 100,
              }}
            >
              Add a progress entry to see the trend.
            </div>
          ) : (
            chartValues.map((value, index) => {
              const height = Math.min(
                Math.max(value, 15),
                100
              );

              return (
                <div
                  className={`bar ${
                    index === chartValues.length - 1
                      ? "active"
                      : ""
                  }`}
                  style={{
                    height: `${height}%`,
                  }}
                  key={`${value}-${index}`}
                >
                  <span>#{index + 1}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div
        className="panel"
        style={{ marginTop: 16 }}
      >
        <div className="panel-header">
          <h3>Recent Progress</h3>
        </div>

        {entries.length === 0 ? (
          <div
            style={{
              padding: "35px 0",
              textAlign: "center",
              color: "#707079",
              fontSize: 12,
            }}
          >
            No progress entries yet.
          </div>
        ) : (
          entries
            .slice()
            .reverse()
            .map((entry) => (
              <button
                type="button"
                key={entry.id}
                onClick={() =>
                  setSelectedEntry(entry)
                }
                style={{
                  width: "100%",
                  border: 0,
                  background: "transparent",
                  color: "inherit",
                  textAlign: "left",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <div className="message">
                  <div className="client-avatar">
                    {initials(entry.client)}
                  </div>

                  <div className="message-content">
                    <strong>{entry.client}</strong>

                    <p>
                      {entry.metric}: {entry.value}
                    </p>

                    <span
                      style={{
                        display: "block",
                        color: "#555660",
                        fontSize: 9,
                        marginTop: 6,
                      }}
                    >
                      {entry.date}
                    </span>
                  </div>

                  <span className="badge">
                    View
                  </span>
                </div>
              </button>
            ))
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-change">{change}</div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}