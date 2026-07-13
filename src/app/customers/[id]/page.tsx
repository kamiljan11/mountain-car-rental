"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useData } from "@/components/DataProvider";
import {
  fetchContractsAction as fetchContracts,
  fetchCustomerDocumentsAction as fetchCustomerDocuments,
  insertCustomerDocumentAction as insertCustomerDocument,
  deleteCustomerDocumentAction as deleteCustomerDocument,
} from "@/lib/actions";
import { isk, type Contract } from "@/lib/contract";
import { DOC_TYPES, isCompanyCustomer, type CustomerDocument, type DocType } from "@/lib/types";
import { fmtDate } from "@/lib/dates";
import CustomerFormModal from "@/components/CustomerFormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  ArrowLeft,
  FileText,
  ListChecks,
  Pencil,
  ShieldAlert,
  Trash2,
  Plus,
} from "lucide-react";

const STATUS = {
  sent: { label: "wysłana", cls: "bg-blue-100 text-blue-700" },
  signed: { label: "podpisana", cls: "bg-green-100 text-green-700" },
  draft: { label: "szkic", cls: "bg-zinc-100 text-zinc-600" },
} as const;

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";
const labelCls = "mb-1 block text-xs font-medium text-zinc-600";

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-zinc-900 text-zinc-900"
          : "border-transparent text-zinc-500 hover:text-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-800">{value || "—"}</span>
    </div>
  );
}

// `key={customer.id}` on the call site remounts this on customer change, so
// the draft resets to the new customer's notes without syncing via effect.
function NotesEditor({
  initialNotes,
  onSave,
}: {
  initialNotes: string;
  onSave: (notes: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  };

  return (
    <InfoBox title="Notatki o kliencie">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={5}
        placeholder="Notatka widoczna tylko dla zespołu…"
        className={inputCls}
      />
      <button
        onClick={save}
        disabled={saving || draft === initialNotes}
        className="rounded-lg bg-zinc-900 px-3 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
      >
        {saving ? "Zapisywanie…" : "Dodaj notatkę"}
      </button>
    </InfoBox>
  );
}

export default function CustomerProfile() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { customers, bookings, vehicleById, updateCustomer, removeCustomer } = useData();
  const customer = customers.find((c) => c.id === id);
  const custBookings = bookings.filter((b) => b.customerId === id);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [tab, setTab] = useState<"summary" | "documents">("summary");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchContracts(id).then(setContracts);
    fetchCustomerDocuments(id).then(setDocuments);
  }, [id]);

  if (!customer) {
    return (
      <div className="p-6">
        <p className="mb-2 text-sm text-zinc-500">Nie znaleziono klienta.</p>
        <Link href="/customers" className="text-sm text-blue-600 underline">← Klienci</Link>
      </div>
    );
  }

  const isCompany = isCompanyCustomer(customer);

  const saveNotes = async (notes: string) => {
    await updateCustomer(id, { notes });
  };

  const toggleSuspect = () => updateCustomer(id, { suspect: !customer.suspect });

  const onDelete = async () => {
    await removeCustomer(id);
    router.push("/customers");
  };

  return (
    <div className="p-6">
      <Link
        href="/customers"
        className="-ml-2 mb-2 inline-flex items-center gap-1 rounded-lg px-2 py-3 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
      >
        <ArrowLeft className="size-4" /> Klienci
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{customer.name}</h1>
            {customer.suspect && (
              <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                <ShieldAlert className="size-3" /> podejrzany
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-zinc-500">
            {customer.phone ?? "—"} · {customer.email ?? "—"} · źródło: {customer.source ?? "—"}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/bookings?customerId=${id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <ListChecks className="size-4" /> Zobacz rezerwacje
          </Link>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Pencil className="size-4" /> Edytuj klienta
          </button>
          <button
            onClick={toggleSuspect}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <ShieldAlert className="size-4" />
            {customer.suspect ? "Odznacz podejrzanego" : "Oznacz jako podejrzany"}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <Trash2 className="size-4" /> Usuń klienta
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-1 border-b border-zinc-200">
        <TabBtn active={tab === "summary"} onClick={() => setTab("summary")}>
          Podsumowanie
        </TabBtn>
        <TabBtn active={tab === "documents"} onClick={() => setTab("documents")}>
          Dokumenty ({documents.length})
        </TabBtn>
      </div>

      {tab === "summary" ? (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {isCompany ? (
              <>
                <InfoBox title="Dane firmy">
                  <Row label="Nazwa firmy" value={customer.companyName} />
                  <Row label="NIP" value={customer.nip} />
                  <Row label="Adres firmy" value={customer.companyAddress} />
                  <Row label="E-mail firmy" value={customer.companyEmail} />
                  <Row label="Telefon firmy" value={customer.companyPhone} />
                </InfoBox>
                <InfoBox title="Dane korzystającego">
                  <Row label="Korzystający" value={customer.name} />
                  <Row label="Adres" value={customer.address} />
                  <Row label="E-mail" value={customer.email} />
                  <Row label="Telefon" value={customer.phone} />
                  <Row label="PESEL" value={customer.id_number} />
                  <Row label="Prawo jazdy" value={customer.license} />
                </InfoBox>
              </>
            ) : (
              <InfoBox title="Szczegóły klienta">
                <Row label="Adres" value={customer.address} />
                <Row label="E-mail" value={customer.email} />
                <Row label="Telefon" value={customer.phone} />
                <Row label="PESEL" value={customer.id_number} />
                <Row label="Prawo jazdy" value={customer.license} />
              </InfoBox>
            )}

            <NotesEditor key={customer.id} initialNotes={customer.notes ?? ""} onSave={saveNotes} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-zinc-700">
              Podpięte umowy ({contracts.length})
            </h2>
            {contracts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
                Brak umów. Wygeneruj w zakładce{" "}
                <Link href="/contracts" className="underline">Kontrakt</Link>.
              </p>
            ) : (
              <div className="space-y-2">
                {contracts.map((k) => (
                  <details key={k.id} className="rounded-xl border border-zinc-200 bg-white">
                    <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm">
                      <FileText className="size-4 text-zinc-400" />
                      <span className="font-medium text-zinc-900">{k.number}</span>
                      <span className="text-zinc-500">{k.templateName}</span>
                      <span className={`ml-auto rounded px-1.5 py-0.5 text-xs ${STATUS[k.status].cls}`}>
                        {STATUS[k.status].label}
                      </span>
                      <span className="text-xs text-zinc-400">{fmtDate(k.createdAt.slice(0, 10))}</span>
                    </summary>
                    <div
                      className="contract border-t border-zinc-100 px-4 py-3"
                      dangerouslySetInnerHTML={{ __html: k.content }}
                    />
                  </details>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-zinc-700">
              Rezerwacje ({custBookings.length})
            </h2>
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-zinc-100">
                  {custBookings.length === 0 ? (
                    <tr>
                      <td className="px-4 py-3 text-zinc-400">Brak rezerwacji.</td>
                    </tr>
                  ) : (
                    custBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="px-4 py-3 font-medium text-zinc-900">{vehicleById(b.vehicleId)?.name}</td>
                        <td className="px-4 py-3 text-zinc-600">{fmtDate(b.start)} — {fmtDate(b.end)}</td>
                        <td className="px-4 py-3 text-zinc-600">{isk(b.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <DocumentsTab customerId={id} documents={documents} setDocuments={setDocuments} />
      )}

      {editing && (
        <CustomerFormModal
          title="Edytuj klienta"
          submitLabel="Zapisz"
          initial={customer}
          initialDocs={{
            idNumber: documents.find((d) => d.docType === DOC_TYPES[0])?.docNumber,
            idIssued: documents.find((d) => d.docType === DOC_TYPES[0])?.issuedAt,
            idExpires: documents.find((d) => d.docType === DOC_TYPES[0])?.expiresAt,
            licIssued: documents.find((d) => d.docType === DOC_TYPES[1])?.issuedAt,
            licExpires: documents.find((d) => d.docType === DOC_TYPES[1])?.expiresAt,
          }}
          onClose={() => setEditing(false)}
          onSubmit={async (patch, docs) => {
            const ok = await updateCustomer(id, patch);
            if (!ok) return;
            // Dokumenty żyją w customer_documents. Zmiana czegokolwiek → podmiana
            // wpisu danego typu; wyczyszczenie numeru dowodu NIE usuwa dokumentu
            // (od tego jest zakładka Dokumenty).
            const idExisting = documents.find((d) => d.docType === DOC_TYPES[0]);
            const licExisting = documents.find((d) => d.docType === DOC_TYPES[1]);
            let changed = false;
            const idChanged =
              docs.idNumber &&
              (docs.idNumber !== idExisting?.docNumber ||
                (docs.idIssued ?? "") !== (idExisting?.issuedAt ?? "") ||
                (docs.idExpires ?? "") !== (idExisting?.expiresAt ?? ""));
            if (idChanged) {
              if (idExisting) await deleteCustomerDocument(idExisting.id);
              await insertCustomerDocument({
                customerId: id,
                docType: DOC_TYPES[0],
                docNumber: docs.idNumber,
                issuedAt: docs.idIssued ?? idExisting?.issuedAt,
                expiresAt: docs.idExpires ?? idExisting?.expiresAt,
              });
              changed = true;
            }
            const licNumber = patch.license;
            const licChanged =
              licNumber &&
              (docs.licIssued || docs.licExpires) &&
              (licNumber !== licExisting?.docNumber ||
                (docs.licIssued ?? "") !== (licExisting?.issuedAt ?? "") ||
                (docs.licExpires ?? "") !== (licExisting?.expiresAt ?? ""));
            if (licChanged) {
              if (licExisting) await deleteCustomerDocument(licExisting.id);
              await insertCustomerDocument({
                customerId: id,
                docType: DOC_TYPES[1],
                docNumber: licNumber,
                issuedAt: docs.licIssued,
                expiresAt: docs.licExpires,
              });
              changed = true;
            }
            if (changed) fetchCustomerDocuments(id).then(setDocuments);
            setEditing(false);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          danger
          title="Usunąć klienta?"
          description="Tej operacji nie można cofnąć. Rezerwacje klienta pozostaną w kalendarzu, ale bez przypisanego klienta."
          summary={[
            { label: "Klient", value: customer.name },
            ...(customer.phone ? [{ label: "Telefon", value: customer.phone }] : []),
            { label: "Rezerwacje", value: String(custBookings.length) },
          ]}
          confirmLabel="Usuń klienta"
          onConfirm={onDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

function DocumentsTab({
  customerId,
  documents,
  setDocuments,
}: {
  customerId: string;
  documents: CustomerDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<CustomerDocument[]>>;
}) {
  const [adding, setAdding] = useState(false);
  const [docType, setDocType] = useState<DocType>(DOC_TYPES[0]);
  const [docNumber, setDocNumber] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingDel, setPendingDel] = useState<CustomerDocument | null>(null);

  const add = async () => {
    setSaving(true);
    setError("");
    const doc = await insertCustomerDocument({
      customerId,
      docType,
      docNumber: docNumber || undefined,
      issuedAt: issuedAt || undefined,
      expiresAt: expiresAt || undefined,
    });
    setSaving(false);
    if (!doc) {
      setError("Nie udało się zapisać dokumentu. Spróbuj ponownie.");
      return;
    }
    setDocuments((prev) => [...prev, doc]);
    setAdding(false);
    setDocNumber("");
    setIssuedAt("");
    setExpiresAt("");
  };

  const remove = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await deleteCustomerDocument(id);
  };

  return (
    <div className="mt-5">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Rodzaj dokumentu</th>
              <th className="px-4 py-3 font-medium">Numer dokumentu</th>
              <th className="px-4 py-3 font-medium">Data wystawienia</th>
              <th className="px-4 py-3 font-medium">Data ważności</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {documents.length === 0 && !adding && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                  Brak dokumentów. Dodaj pierwszy poniżej.
                </td>
              </tr>
            )}
            {documents.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-medium text-zinc-900">{d.docType}</td>
                <td className="px-4 py-3 text-zinc-600">{d.docNumber || "—"}</td>
                <td className="px-4 py-3 text-zinc-600">{d.issuedAt ? fmtDate(d.issuedAt) : "—"}</td>
                <td className="px-4 py-3 text-zinc-600">{d.expiresAt ? fmtDate(d.expiresAt) : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setPendingDel(d)}
                    aria-label="Usuń dokument"
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adding ? (
        <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-4">
              {error}
            </p>
          )}
          <div>
            <label className={labelCls}>Rodzaj</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType)}
              className={inputCls}
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Numer</label>
            <input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Data wystawienia</label>
            <input type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Data ważności</label>
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputCls} />
          </div>
          <div className="flex items-end gap-2 sm:col-span-4">
            <button
              onClick={add}
              disabled={saving}
              className="rounded-lg bg-zinc-900 px-3 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
            >
              {saving ? "Zapisywanie…" : "Zapisz dokument"}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="rounded-lg border border-zinc-200 px-3 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Anuluj
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <Plus className="size-4" /> Dodaj dokument
        </button>
      )}

      {pendingDel && (
        <ConfirmDialog
          danger
          title="Usunąć dokument?"
          description="Tej operacji nie można cofnąć."
          summary={[
            { label: "Rodzaj", value: pendingDel.docType },
            { label: "Numer", value: pendingDel.docNumber || "—" },
          ]}
          confirmLabel="Usuń dokument"
          onConfirm={() => remove(pendingDel.id)}
          onClose={() => setPendingDel(null)}
        />
      )}
    </div>
  );
}

