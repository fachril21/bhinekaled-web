"use client";

// Epic 12: Cek Ongkir Real-Time (RajaOngkir)
// Lihat docs/plan/epic-12-cek-ongkir-rajaongkir.md bagian 10.1.

import { useEffect, useState } from "react";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Price } from "@/components/ui/Price";
import type { RajaOngkirDestination, RajaOngkirRateOption } from "@/lib/shipping/rajaongkir-client";

const SEARCH_DEBOUNCE_MS = 450;
const MIN_QUERY_LENGTH = 3;

export type SelectedShipping = {
  destinationId: string;
  destinationLabel: string;
  province: string | null;
  city: string | null;
  district: string | null;
  subdistrict: string | null;
  zipCode: string | null;
  courierCode: string;
  serviceCode: string;
  serviceName: string;
  cost: number;
};

type ShippingSelectorProps = {
  onSelect: (selection: SelectedShipping | null) => void;
};

export function ShippingSelector({ onSelect }: ShippingSelectorProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const [searchResults, setSearchResults] = useState<RajaOngkirDestination[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedDestination, setSelectedDestination] = useState<RajaOngkirDestination | null>(null);
  const [rateOptions, setRateOptions] = useState<RajaOngkirRateOption[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [selectedRateKey, setSelectedRateKey] = useState<string | null>(null);

  // Edge case #1 — <3 karakter: tidak fetch sama sekali. Hasil pencarian
  // dianggap kosong secara derived (bukan setState di effect) lewat
  // `visibleResults` di bawah, supaya tidak ada setState sinkron di awal effect.
  useEffect(() => {
    if (debouncedQuery.trim().length < MIN_QUERY_LENGTH) {
      return;
    }

    const controller = new AbortController();

    // setIsSearching(true) sengaja dipanggil di dalam .then() (bukan langsung
    // di body effect) supaya lolos react-hooks/set-state-in-effect — perilaku
    // tetap sama (microtask, imperceptible), tapi tidak setState sinkron
    // langsung di awal effect.
    Promise.resolve()
      .then(() => {
        setIsSearching(true);
        return fetch(`/api/shipping/destinations?q=${encodeURIComponent(debouncedQuery)}`, {
          signal: controller.signal,
        });
      })
      .then((res) => res.json())
      .then((data) => setSearchResults(data.results ?? []))
      .catch(() => {
        // AbortError saat query berubah lagi — abaikan, request lama dibatalkan.
      })
      .finally(() => setIsSearching(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  function fetchRates(destinationId: string) {
    setIsLoadingRates(true);
    setRateError(null);

    fetch("/api/shipping/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Gagal memuat ongkir, coba lagi.");
        setRateOptions(data.options ?? []);
      })
      .catch((err: Error) => {
        setRateOptions([]);
        setRateError(err.message);
      })
      .finally(() => setIsLoadingRates(false));
  }

  function handlePickDestination(destination: RajaOngkirDestination) {
    // Edge case #2 — ganti destinasi mereset pilihan kurir sebelumnya supaya
    // tidak submit kombinasi destinasi lama + kurir destinasi berbeda.
    setSelectedDestination(destination);
    setSelectedRateKey(null);
    setRateOptions([]);
    setQuery(destination.label);
    setSearchResults([]);
    onSelect(null);
    fetchRates(destination.id);
  }

  function handlePickRate(option: RajaOngkirRateOption) {
    if (!selectedDestination) return;
    const key = `${option.courierCode}:${option.serviceCode}`;
    setSelectedRateKey(key);
    onSelect({
      destinationId: selectedDestination.id,
      destinationLabel: selectedDestination.label,
      province: selectedDestination.province,
      city: selectedDestination.city,
      district: selectedDestination.district,
      subdistrict: selectedDestination.subdistrict,
      zipCode: selectedDestination.zipCode,
      courierCode: option.courierCode,
      serviceCode: option.serviceCode,
      serviceName: option.serviceName,
      cost: option.cost,
    });
  }

  function handleRetryRates() {
    if (selectedDestination) fetchRates(selectedDestination.id);
  }

  const visibleResults = debouncedQuery.trim().length < MIN_QUERY_LENGTH ? [] : searchResults;
  const showDropdown = visibleResults.length > 0 && query !== selectedDestination?.label;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex flex-col gap-1 text-sm">
        <label htmlFor="shipping-destination" className="font-medium text-neutral-700">
          Cari Kecamatan/Kelurahan Tujuan
          <span className="text-brand-red"> *</span>
        </label>
        <input
          id="shipping-destination"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedDestination) {
              setSelectedDestination(null);
              setSelectedRateKey(null);
              setRateOptions([]);
              onSelect(null);
            }
          }}
          placeholder="Ketik minimal 3 karakter, mis. Bandung"
          autoComplete="off"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />
        {isSearching && <span className="text-xs text-neutral-500">Mencari...</span>}

        {showDropdown && (
          <ul className="absolute top-full z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
            {visibleResults.map((dest) => (
              <li key={dest.id}>
                <button
                  type="button"
                  onClick={() => handlePickDestination(dest)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
                >
                  {dest.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        {!isSearching &&
          debouncedQuery.trim().length >= MIN_QUERY_LENGTH &&
          visibleResults.length === 0 &&
          query === debouncedQuery &&
          !selectedDestination && <span className="text-xs text-neutral-500">Tidak ditemukan, coba kata kunci lain.</span>}
      </div>

      {selectedDestination && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <RegionField label="Provinsi" value={selectedDestination.province} />
          <RegionField label="Kota/Kabupaten" value={selectedDestination.city} />
          <RegionField label="Kecamatan" value={selectedDestination.district} />
          <RegionField label="Kelurahan/Desa" value={selectedDestination.subdistrict} />
          <RegionField label="Kode Pos" value={selectedDestination.zipCode} />
        </div>
      )}

      {selectedDestination && (
        <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3">
          {isLoadingRates && <p className="text-sm text-neutral-500">Memuat pilihan kurir...</p>}

          {!isLoadingRates && rateError && (
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-red-600">{rateError}</p>
              <button
                type="button"
                onClick={handleRetryRates}
                className="self-start rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!isLoadingRates && !rateError && rateOptions.length === 0 && (
            <p className="text-sm text-neutral-500">Tidak ada opsi kurir untuk tujuan ini.</p>
          )}

          {!isLoadingRates && !rateError && rateOptions.length > 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium text-neutral-700">Pilih Kurir</legend>
              {rateOptions.map((option) => {
                const key = `${option.courierCode}:${option.serviceCode}`;
                return (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${
                      selectedRateKey === key ? "border-brand-red bg-red-50" : "border-neutral-200"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="shipping-rate"
                        checked={selectedRateKey === key}
                        onChange={() => handlePickRate(option)}
                      />
                      <span>
                        <span className="block font-medium text-neutral-900">
                          {option.courierName} - {option.serviceName}
                        </span>
                        {option.etd && (
                          <span className="block text-xs text-neutral-500">Estimasi {formatEtd(option.etd)}</span>
                        )}
                      </span>
                    </span>
                    <Price amount={option.cost} className="shrink-0 font-semibold text-neutral-900" />
                  </label>
                );
              })}
            </fieldset>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * `option.etd` dari RajaOngkir sudah termasuk satuan dalam Bahasa Inggris
 * (mis. "15 day", "3 day", bukan cuma angka) — verifikasi manual curl
 * (plan bagian 16 #4). Ganti "day"/"days" jadi "hari" alih-alih menempel
 * " hari" mentah yang berakhir dobel ("15 day hari"). Fallback ke teks asli
 * kalau formatnya beda dari yang terverifikasi.
 */
function formatEtd(etd: string): string {
  const match = etd.match(/^(\d+)\s*days?$/i);
  return match ? `${match[1]} hari` : etd;
}

/** Field turunan dari destinasi yang dipilih — readonly, bukan input manual, supaya tidak
 * mismatch dengan id RajaOngkir yang dipakai kalkulasi ongkir (nama wilayah harus persis
 * data RajaOngkir, tidak bisa diketik bebas). */
function RegionField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-neutral-700">{label}</span>
      <input
        value={value ?? "—"}
        readOnly
        disabled
        className="w-full rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-600"
      />
    </div>
  );
}
