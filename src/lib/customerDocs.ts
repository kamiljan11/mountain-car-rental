import { DOC_TYPES, type CustomerDocument } from "@/lib/types";
import type { CustomerFormValues, CustomerDocValues } from "@/components/CustomerFormModal";
import {
  insertCustomerDocumentAction as insertCustomerDocument,
  deleteCustomerDocumentAction as deleteCustomerDocument,
} from "@/lib/actions";

// Zapisuje dokumenty klienta (dowód osobisty + prawo jazdy) na podstawie danych
// z CustomerFormModal — używane spójnie przy TWORZENIU (existing: []), edycji z
// profilu klienta i edycji z kalendarza. Numer prawa jazdy żyje w patch.license,
// numer dowodu w docs.idNumber; daty w docs. Dokumenty trzymamy w osobnej tabeli
// (customer_documents), stąd osobny kanał zapisu niż rekord klienta.
//
// Zwraca { changed, ok }:
//  - changed: czy cokolwiek zmieniono (wołający może odświeżyć listę dokumentów),
//  - ok: czy każdy zapis się powiódł (insert zwraca null przy błędzie — bez tego
//    flagi błąd zapisu dokumentu ginął po cichu, a na umowie brakowało numeru).
export async function reconcileCustomerDocuments(
  customerId: string,
  patch: Pick<CustomerFormValues, "license">,
  docs: CustomerDocValues,
  existing: CustomerDocument[],
): Promise<{ changed: boolean; ok: boolean }> {
  const idExisting = existing.find((d) => d.docType === DOC_TYPES[0]);
  const licExisting = existing.find((d) => d.docType === DOC_TYPES[1]);
  let changed = false;
  let ok = true;

  // Dowód osobisty — kluczem jest numer; zmiana numeru/dat → podmiana wpisu.
  const idChanged =
    !!docs.idNumber &&
    (docs.idNumber !== idExisting?.docNumber ||
      (docs.idIssued ?? "") !== (idExisting?.issuedAt ?? "") ||
      (docs.idExpires ?? "") !== (idExisting?.expiresAt ?? ""));
  if (idChanged) {
    if (idExisting) await deleteCustomerDocument(idExisting.id);
    const r = await insertCustomerDocument({
      customerId,
      docType: DOC_TYPES[0],
      docNumber: docs.idNumber,
      issuedAt: docs.idIssued ?? idExisting?.issuedAt,
      expiresAt: docs.idExpires ?? idExisting?.expiresAt,
    });
    if (!r) ok = false;
    changed = true;
  }

  // Prawo jazdy — numer (patch.license) LUB same daty. Zapisujemy gdy jest numer
  // albo którakolwiek data (inaczej daty prawka wpisane bez numeru ginęły —
  // asymetria względem dowodu, którą tu wyrównujemy).
  const licNumber = patch.license;
  const hasLic = !!(licNumber || docs.licIssued || docs.licExpires);
  const licChanged =
    hasLic &&
    ((licNumber ?? "") !== (licExisting?.docNumber ?? "") ||
      (docs.licIssued ?? "") !== (licExisting?.issuedAt ?? "") ||
      (docs.licExpires ?? "") !== (licExisting?.expiresAt ?? ""));
  if (licChanged) {
    if (licExisting) await deleteCustomerDocument(licExisting.id);
    const r = await insertCustomerDocument({
      customerId,
      docType: DOC_TYPES[1],
      docNumber: licNumber ?? licExisting?.docNumber,
      issuedAt: docs.licIssued ?? licExisting?.issuedAt,
      expiresAt: docs.licExpires ?? licExisting?.expiresAt,
    });
    if (!r) ok = false;
    changed = true;
  }

  return { changed, ok };
}
