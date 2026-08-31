"use client";

import { useEffect, useMemo, useState } from "react";
import type { ApplicationBlueprint } from "@/types/application";

type Entity = ApplicationBlueprint["database"][number];
type Field = Entity["fields"][number];
type Value = string | number | boolean | null | undefined;
type RecordItem = { __id: string; [key: string]: Value };
type Records = Record<string, RecordItem[]>;

const storageKey = "abiora-generated-application";
const internal = /(^|[_\s-])(id|uuid|createdat|updatedat|deletedat|password|passwordhash|hash|token|secret|apikey|salt)($|[_\s-])/i;
const clean = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const singular = (value: string) => { const v = clean(value); return v.endsWith("ies") ? `${v.slice(0, -3)}y` : v.endsWith("s") ? v.slice(0, -1) : v; };
const label = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());
const display = (value: Value) => value === null || value === undefined || value === "" ? "—" : typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
const fields = (entity?: Entity) => entity?.fields.filter((field) => !internal.test(clean(field.name))) ?? [];
const bool = (field: Field) => /bool/i.test(field.type) || /^(is|has|can|should|enabled|active|archived)/i.test(field.name);
const numeric = (field: Field) => /number|integer|decimal|float|double|currency|amount/i.test(field.type);
const longText = (field: Field) => /text|description|notes|message|comment|content/i.test(`${field.type} ${field.name}`);
function inputType(field: Field) {
  const schemaType = clean(field.type);
  const fieldName = clean(field.name);

  // Prefer the declared schema type. Datetime must be checked before time.
  if (/datetime|timestamp/.test(schemaType)) return "datetime-local";
  if (/time/.test(schemaType)) return "time";
  if (/date/.test(schemaType)) return "date";

  // Fall back to a conservative field-name convention when the schema is broad
  // (for example, a generated "string" field named startTime).
  if (/datetime|timestamp$/.test(fieldName)) return "datetime-local";
  if (fieldName === "time" || fieldName.endsWith("time")) return "time";
  if (/(date|due|scheduled|start|end|expires)$/.test(fieldName)) return "date";
  if (numeric(field)) return "number";
  return "text";
}
const relation = (field: Field, entities: Entity[]) => entities.find((entity) => singular(entity.name) === singular(field.name.replace(/_?id$/i, "")));
const recordLabel = (record: RecordItem, entity: Entity) => { const preferred = fields(entity).find((field) => /name|title|subject|email|label/i.test(field.name)) ?? fields(entity).find((field) => record[field.name]); return display(preferred ? record[preferred.name] : undefined); };
function readBlueprint() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    const blueprint = raw ? JSON.parse(raw) as ApplicationBlueprint : null;
    return blueprint?.projectName && Array.isArray(blueprint.pages) && Array.isArray(blueprint.database) ? blueprint : null;
  } catch (error) {
    console.error("Could not load generated application:", error);
    return null;
  }
}

export default function GeneratedApp() {
  const [application, setApplication] = useState<ApplicationBlueprint | null>(null);
  const [hasLoadedBlueprint, setHasLoadedBlueprint] = useState(false);
  const [activePage, setActivePage] = useState("");
  const [records, setRecords] = useState<Records>({});
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ entity: string; record?: RecordItem } | null>(null);
  const [values, setValues] = useState<Record<string, Value>>({});
  const [selected, setSelected] = useState<{ entity: string; record: RecordItem } | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const blueprint = readBlueprint();
      if (blueprint) {
        setApplication(blueprint);
        setActivePage(blueprint.pages[0]?.name ?? "");
        setRecords(Object.fromEntries(blueprint.database.map((entity) => [entity.name, []])));
      }
      setHasLoadedBlueprint(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const entityMap = useMemo(() => new Map(application?.database.map((entity) => [entity.name, entity]) ?? []), [application]);
  const page = application?.pages.find((item) => item.name === activePage) ?? application?.pages[0];
  const open = (entityName: string, record?: RecordItem) => { const entity = entityMap.get(entityName); if (!entity) return; setEditing({ entity: entityName, record }); setValues(record ? { ...record } : Object.fromEntries(fields(entity).map((field) => [field.name, bool(field) ? false : ""]))); };
  const save = () => {
    if (!editing) return;
    const entity = entityMap.get(editing.entity); if (!entity) return;
    const required = fields(entity).find((field) => field.required && !bool(field) && !String(values[field.name] ?? "").trim());
    if (required) { window.alert(`${label(required.name)} is required.`); return; }
    setRecords((current) => { const item = { ...values, __id: editing.record?.__id ?? crypto.randomUUID() } as RecordItem; const group = current[editing.entity] ?? []; return { ...current, [editing.entity]: editing.record ? group.map((record) => record.__id === item.__id ? item : record) : [item, ...group] }; });
    setEditing(null);
  };
  const remove = (entityName: string, id: string) => {
    const entity = entityMap.get(entityName); if (!entity || !confirm(`Delete this ${label(entity.name)}? Related records will also be deleted.`)) return;
    const deleted: Record<string, Set<string>> = { [entityName]: new Set([id]) }; let changed = true;
    while (changed) { changed = false; application?.database.forEach((child) => (records[child.name] ?? []).forEach((record) => fields(child).forEach((field) => { const parent = relation(field, application.database); if (parent && deleted[parent.name]?.has(String(record[field.name])) && !deleted[child.name]?.has(record.__id)) { (deleted[child.name] ??= new Set()).add(record.__id); changed = true; } }))); }
    setRecords((current) => Object.fromEntries(Object.entries(current).map(([name, group]) => [name, group.filter((record) => !deleted[name]?.has(record.__id))])));
    if (selected?.record.__id === id) setSelected(null);
  };

  if (!hasLoadedBlueprint) return <main className="app"><section className="empty"><p>Generated application</p><h1>Loading your application…</h1><span>Preparing the generated workspace.</span></section><Styles /></main>;
  if (!application) return <main className="app"><section className="empty"><p>Generated application</p><h1>No application is ready yet.</h1><span>Generate an application from the builder to preview it here.</span></section><Styles /></main>;
  return <main className="app"><aside><strong>✦ {application.projectName}</strong><nav>{application.pages.map((item, index) => <button className={page?.name === item.name ? "active" : ""} key={`${item.path}-${item.name}`} onClick={() => { setActivePage(item.name); setQuery(""); }}><i>{index + 1}</i>{item.name}</button>)}</nav><small>{application.database.length} data entities<br />Generated by Abiora</small></aside><section className="main"><header><div><p>{application.projectName}</p><h1>{page?.name}</h1></div>{application.database[0] && <button className="primary" onClick={() => open(application.database[0].name)}>+ New record</button>}</header><article><p className="purpose">{page?.purpose || application.description}</p>{page?.components.map((component, index) => <Component key={`${component.name}-${index}`} component={component} application={application} records={records} query={query} setQuery={setQuery} open={open} select={(entity, record) => setSelected({ entity, record })} remove={remove} />)}</article></section>{editing && <Editor entity={entityMap.get(editing.entity)!} entities={application.database} records={records} values={values} isEditing={Boolean(editing.record)} change={(name, value) => setValues((current) => ({ ...current, [name]: value }))} cancel={() => setEditing(null)} save={save} />}{selected && <Detail entity={entityMap.get(selected.entity)!} record={selected.record} application={application} records={records} close={() => setSelected(null)} edit={() => open(selected.entity, selected.record)} remove={() => remove(selected.entity, selected.record.__id)} />}<Styles /></main>;
}

function Component({ component, application, records, query, setQuery, open, select, remove }: { component: ApplicationBlueprint["pages"][number]["components"][number]; application: ApplicationBlueprint; records: Records; query: string; setQuery: (value: string) => void; open: (entity: string, record?: RecordItem) => void; select: (entity: string, record: RecordItem) => void; remove: (entity: string, id: string) => void }) {
  const entity = application.database.find((item) => item.name === component.entity);
  const group = entity ? records[entity.name] ?? [] : [];
  const filtered = group.filter((record) => Object.values(record).some((value) => display(value).toLowerCase().includes(query.toLowerCase())));
  if (component.type === "text") return <section className="card"><p>{component.name}</p><h2>{component.purpose}</h2></section>;
  if (component.type === "stats") return <section className="stat"><p>{component.name}</p><b>{entity ? group.length : Object.values(records).flat().length}</b><span>{entity ? `${label(entity.name)} records` : "Records across your application"}</span></section>;
  if (!entity) return <section className="card"><h2>{component.name}</h2><span>This component is not connected to a generated entity.</span></section>;
  if (component.type === "form") return <section className="card action"><div><p>{label(entity.name)}</p><h2>{component.name}</h2><span>{component.purpose}</span></div><button className="primary" onClick={() => open(entity.name)}>Create {label(entity.name)}</button></section>;
  if (component.type === "calendar" || component.type === "chart") return <section className="card"><p>{label(entity.name)}</p><h2>{component.name}</h2><div className="insight"><b>{component.type === "calendar" ? "Schedule" : "Trend"}</b><br />{group.length ? `${group.length} ${label(entity.name).toLowerCase()} record${group.length === 1 ? "" : "s"} available for this view.` : `Create ${label(entity.name).toLowerCase()} records to populate this view.`}</div></section>;
  return <Collection title={component.name} entity={entity} group={component.type === "detail" ? filtered.slice(0, 1) : filtered} query={query} setQuery={setQuery} open={open} select={select} remove={remove} />;
}

function Collection({ title, entity, group, query, setQuery, open, select, remove }: { title: string; entity: Entity; group: RecordItem[]; query: string; setQuery: (value: string) => void; open: (entity: string, record?: RecordItem) => void; select: (entity: string, record: RecordItem) => void; remove: (entity: string, id: string) => void }) { const columns = fields(entity).slice(0, 5); return <section className="card"><div className="heading"><div><p>{label(entity.name)}</p><h2>{title}</h2></div><button onClick={() => open(entity.name)}>+ Add</button></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label(entity.name).toLowerCase()}...`} />{group.length === 0 ? <div className="empty mini"><b>{query ? "No matching records" : `No ${label(entity.name).toLowerCase()} yet`}</b><span>{query ? "Try a different search." : `Create the first ${label(entity.name).toLowerCase()} record to get started.`}</span>{!query && <button className="primary" onClick={() => open(entity.name)}>Create {label(entity.name)}</button>}</div> : <div className="table"><table><thead><tr>{columns.map((field) => <th key={field.name}>{label(field.name)}</th>)}<th /></tr></thead><tbody>{group.map((record) => <tr key={record.__id} onClick={() => select(entity.name, record)}>{columns.map((field) => <td key={field.name}>{display(record[field.name])}</td>)}<td onClick={(event) => event.stopPropagation()}><button onClick={() => open(entity.name, record)}>Edit</button><button className="delete" onClick={() => remove(entity.name, record.__id)}>Delete</button></td></tr>)}</tbody></table></div>}</section>; }

function Editor({ entity, entities, records, values, isEditing, change, cancel, save }: { entity: Entity; entities: Entity[]; records: Records; values: Record<string, Value>; isEditing: boolean; change: (name: string, value: Value) => void; cancel: () => void; save: () => void }) { return <div className="veil"><section className="modal"><button className="x" onClick={cancel}>×</button><p>{isEditing ? "Edit record" : "New record"}</p><h2>{label(entity.name)}</h2><div className="form">{fields(entity).map((field) => { const related = relation(field, entities); const type = inputType(field); return <label key={field.name}><span>{label(field.name)}{field.required && <b> *</b>}</span>{related ? <select value={String(values[field.name] ?? "")} onChange={(event) => change(field.name, event.target.value)}><option value="">Select {label(related.name)}</option>{(records[related.name] ?? []).map((record) => <option key={record.__id} value={record.__id}>{recordLabel(record, related)}</option>)}</select> : bool(field) ? <input type="checkbox" checked={Boolean(values[field.name])} onChange={(event) => change(field.name, event.target.checked)} /> : longText(field) ? <textarea value={String(values[field.name] ?? "")} onChange={(event) => change(field.name, event.target.value)} /> : <input type={type} value={String(values[field.name] ?? "")} onChange={(event) => change(field.name, type === "number" && event.target.value ? Number(event.target.value) : event.target.value)} />}</label>; })}</div><footer><button onClick={cancel}>Cancel</button><button className="primary" onClick={save}>{isEditing ? "Save changes" : `Create ${label(entity.name)}`}</button></footer></section></div>; }

function Detail({ entity, record, application, records, close, edit, remove }: { entity: Entity; record: RecordItem; application: ApplicationBlueprint; records: Records; close: () => void; edit: () => void; remove: () => void }) { const children = application.database.flatMap((child) => fields(child).map((field) => ({ child, field })).filter(({ field }) => relation(field, application.database)?.name === entity.name).map(({ child, field }) => ({ name: child.name, count: (records[child.name] ?? []).filter((item) => String(item[field.name]) === record.__id).length }))).filter((item) => item.count); return <aside className="detail"><button className="x" onClick={close}>×</button><p>{label(entity.name)}</p><h2>{recordLabel(record, entity)}</h2><dl>{fields(entity).map((field) => <div key={field.name}><dt>{label(field.name)}</dt><dd>{display(record[field.name])}</dd></div>)}</dl>{children.length > 0 && <section className="related"><p>Related records</p>{children.map((child) => <div key={child.name}>{child.count} {label(child.name)}</div>)}</section>}<footer><button onClick={edit}>Edit</button><button className="danger" onClick={remove}>Delete</button></footer></aside>; }

function Styles() { return <style jsx global>{`.app{min-height:100vh;background:#f7f8fc;color:#172238;display:grid;grid-template-columns:245px 1fr;font-family:Arial,Helvetica,sans-serif}.app>aside:not(.detail){min-height:100vh;padding:28px 16px;background:#101a2d;color:#dbe4f5;display:flex;flex-direction:column;gap:35px}.app>aside strong{padding:0 10px}.app nav{display:grid;gap:5px}.app nav button{padding:12px 10px;border:0;border-radius:8px;background:transparent;color:#acb9d2;text-align:left;cursor:pointer}.app nav button.active,.app nav button:hover{background:#253452;color:white}.app nav i{font-style:normal;font-size:10px;margin-right:10px;color:#8291ae}.app>aside small{margin-top:auto;padding:13px 10px;border-top:1px solid #2c3954;color:#95a3bd;line-height:1.8}.main header{padding:30px clamp(24px,5vw,70px);background:#fff;border-bottom:1px solid #e2e7f0;display:flex;align-items:center;justify-content:space-between;gap:16px}.main header p,.card>p,.stat p,.modal>p,.detail>p,.related>p{margin:0;color:#6474a4;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;font-weight:700}.main h1{margin:5px 0 0;font-size:29px}.main article{max-width:1200px;margin:auto;padding:36px clamp(24px,5vw,70px);display:grid;gap:20px}.purpose{margin:0;color:#5e6b80;line-height:1.6}.card,.stat,.empty{background:white;border:1px solid #e1e6ef;border-radius:14px;box-shadow:0 8px 25px #25375a0a}.card{padding:24px}.card h2{margin:6px 0;font-size:20px}.card span{color:#65728a}.stat{padding:22px}.stat b{display:block;margin:9px 0 4px;font-size:34px}.stat span{font-size:12px;color:#75829a}.heading{display:flex;justify-content:space-between;gap:12px;margin-bottom:18px}.heading h2{margin:5px 0 0}.heading button,.card button:not(.primary),footer button{border:1px solid #d7deea;background:#fff;border-radius:8px;padding:8px 11px;color:#37445b;font-weight:700;cursor:pointer}.primary{border:1px solid #596ae6!important;background:#596ae6!important;color:#fff!important;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer}.card input,.form input:not([type=checkbox]),.form select,.form textarea{width:100%;border:1px solid #dce2ed;border-radius:8px;padding:10px 11px;outline:none;font:inherit;color:#293650}.card>input{margin-bottom:16px}.table{overflow:auto}.table table{width:100%;border-collapse:collapse;font-size:13px}.table th{text-align:left;padding:0 12px 11px;color:#77849b;font-size:11px;text-transform:uppercase}.table td{border-top:1px solid #edf0f5;padding:14px 12px;color:#344159;white-space:nowrap}.table tbody tr{cursor:pointer}.table tbody tr:hover{background:#fafbff}.table td button{border:0;background:transparent;color:#50617d;cursor:pointer;margin-right:8px}.table td .delete{color:#be3e4f}.empty{max-width:560px;min-height:300px;margin:auto;padding:45px;text-align:center;display:grid;place-content:center;gap:10px}.empty h1{margin:0;font-size:27px}.empty span{color:#728099;line-height:1.5}.empty.mini{max-width:none;min-height:175px;box-shadow:none;border:0}.empty.mini b{font-size:16px}.empty.mini .primary{margin:8px auto 0}.action{display:flex;align-items:center;justify-content:space-between;gap:20px}.insight{margin-top:18px;padding:20px;background:#f3f6fb;border-radius:9px;color:#66738a;line-height:1.6}.veil{position:fixed;inset:0;z-index:20;background:#101a2d70;display:grid;place-items:center;padding:20px}.modal{position:relative;width:min(650px,100%);max-height:90vh;overflow:auto;padding:24px;background:#fff;border-radius:15px;box-shadow:0 28px 80px #17223850}.modal h2{margin:6px 0 23px}.x{border:0;background:transparent;color:#68758b;font-size:27px;line-height:1;cursor:pointer}.modal>.x,.detail>.x{position:absolute;right:20px;top:20px}.form{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.form label{display:grid;gap:7px;font-size:13px;font-weight:700;color:#4a5870}.form label b{color:#ce4151}.form textarea{min-height:92px;resize:vertical}.form input[type=checkbox]{width:18px;height:18px;margin:5px 0}footer{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}.detail{position:fixed;z-index:15;right:0;top:0;bottom:0;width:min(430px,100%);overflow:auto;background:#fff;padding:32px;box-shadow:-10px 0 36px #17223824}.detail h2{margin:6px 30px 25px 0;font-size:27px}.detail dl{margin:0}.detail dl div{padding:13px 0;border-top:1px solid #edf0f5}.detail dt{color:#77849a;font-size:11px;text-transform:uppercase}.detail dd{margin:5px 0 0;color:#344159}.related{margin-top:22px;padding-top:18px;border-top:1px solid #edf0f5;color:#52617a}.related div{padding:7px 0}.danger{color:#b52c3d!important;border-color:#ffc9cf!important;background:#fff1f2!important}@media(max-width:720px){.app{display:block}.app>aside:not(.detail){min-height:auto;padding:16px;gap:15px}.app nav{display:flex;overflow:auto}.app nav button{white-space:nowrap}.app>aside small{display:none}.main header{padding:22px 20px}.main article{padding:26px 20px}.main h1{font-size:24px}.form{grid-template-columns:1fr}.action{align-items:flex-start;flex-direction:column}.table th:nth-child(n+4),.table td:nth-child(n+4){display:none}}`}</style>; }
