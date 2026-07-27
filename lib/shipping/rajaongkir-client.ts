// Epic 12: Cek Ongkir Real-Time (RajaOngkir)
// Lihat docs/plan/epic-12-cek-ongkir-rajaongkir.md bagian 6.4.
//
// ⚠️ PERINGATAN: modul ini memakai RAJAONGKIR_API_KEY (server-only, TIDAK
// prefix NEXT_PUBLIC_). TIDAK PERNAH diimpor dari Client Component atau kode
// yang bisa berakhir di bundle browser — pola sama seperti peringatan di
// lib/supabase/admin.ts. Hanya dipanggil dari lib/queries/shipping-*.ts.

import { z } from "zod";

const BASE_URL = "https://rajaongkir.komerce.id/api/v1/";

function apiKey(): string {
  const key = process.env.RAJAONGKIR_API_KEY;
  if (!key) throw new Error("RAJAONGKIR_API_KEY belum diisi.");
  return key;
}

export type RajaOngkirDestination = {
  id: string;
  label: string;
  province: string | null;
  city: string | null;
  district: string | null;
  subdistrict: string | null;
  zipCode: string | null;
};

/**
 * Keputusan C (lihat plan bagian 3) — TERVERIFIKASI manual via curl dengan
 * API key asli (plan bagian 15 #3, bagian 16 #4): bentuk di bawah persis
 * response asli `destination/domestic-destination`.
 */
const destinationResultSchema = z.object({
  id: z.union([z.string(), z.number()]),
  label: z.string(),
  province_name: z.string().nullish(),
  city_name: z.string().nullish(),
  district_name: z.string().nullish(),
  subdistrict_name: z.string().nullish(),
  zip_code: z.union([z.string(), z.number()]).nullish(),
});

const destinationResponseSchema = z.object({
  data: z.array(destinationResultSchema),
});

function parseDestinationResponse(body: unknown): RajaOngkirDestination[] {
  const parsed = destinationResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error("Format response RajaOngkir tidak dikenali (destination search).");
  }
  return parsed.data.data.map((d) => ({
    id: String(d.id),
    label: d.label,
    province: d.province_name ?? null,
    city: d.city_name ?? null,
    district: d.district_name ?? null,
    subdistrict: d.subdistrict_name ?? null,
    zipCode: d.zip_code != null ? String(d.zip_code) : null,
  }));
}

export async function searchDestination(query: string): Promise<RajaOngkirDestination[]> {
  const url = new URL("destination/domestic-destination", BASE_URL);
  url.searchParams.set("search", query);
  url.searchParams.set("limit", "10");

  const res = await fetch(url, { headers: { key: apiKey() } });
  if (!res.ok) throw new Error(`RajaOngkir destination search gagal (${res.status})`);
  const body = await res.json();
  return parseDestinationResponse(body);
}

export type RajaOngkirRateOption = {
  courierCode: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  description: string | null;
  cost: number;
  etd: string | null;
};

/**
 * Keputusan C — TERVERIFIKASI manual via curl dengan API key asli (plan
 * bagian 15 #3, bagian 16 #4). Bentuk asli FLAT (satu baris = satu
 * courier+service, BUKAN dikelompokkan per courier dengan array `costs`
 * nested seperti asumsi awal V1-style) — contoh nyata:
 * `{"data":[{"name":"Jalur Nugraha Ekakurir (JNE)","code":"jne","service":"REG","description":"Layanan Reguler","cost":57000,"etd":"3 day"}, ...]}`.
 */
const rateResultSchema = z.object({
  code: z.string(),
  name: z.string(),
  service: z.string(),
  description: z.string().nullish(),
  cost: z.number(),
  etd: z.string().nullish(),
});

const rateResponseSchema = z.object({
  data: z.array(rateResultSchema),
});

function parseRateResponse(body: unknown): RajaOngkirRateOption[] {
  const parsed = rateResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error("Format response RajaOngkir tidak dikenali (rate calculation).");
  }

  return parsed.data.data.map((row) => ({
    courierCode: row.code,
    courierName: row.name,
    serviceCode: row.service,
    serviceName: row.service,
    description: row.description ?? null,
    cost: row.cost,
    etd: row.etd ?? null,
  }));
}

export async function calculateDomesticCost(params: {
  originId: string;
  destinationId: string;
  weightGram: number;
  courierSet: string;
}): Promise<RajaOngkirRateOption[]> {
  const body = new URLSearchParams({
    origin: params.originId,
    destination: params.destinationId,
    weight: String(params.weightGram),
    courier: params.courierSet,
  });

  const res = await fetch(new URL("calculate/domestic-cost", BASE_URL), {
    method: "POST",
    headers: { key: apiKey(), "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`RajaOngkir rate calculation gagal (${res.status})`);
  const responseBody = await res.json();
  return parseRateResponse(responseBody);
}
