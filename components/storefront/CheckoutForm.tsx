"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkoutFormSchema } from "@/lib/validations";
import { PAYMENT_METHOD_PLACEHOLDER_LABEL } from "@/lib/checkout-config";
import { CheckoutOrderReview } from "@/components/storefront/CheckoutOrderReview";
import { ShippingSelector, type SelectedShipping } from "@/components/storefront/ShippingSelector";
import type { CartItemDetail } from "@/lib/queries/cart";
import type { CalculatedFee } from "@/lib/fees";

type CheckoutFormProps = {
  items: CartItemDetail[];
  subtotal: number;
  fees: CalculatedFee[];
};

type FormValues = {
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  notes: string;
};

const INITIAL_VALUES: FormValues = {
  customer_name: "",
  customer_phone: "",
  shipping_address: "",
  notes: "",
};

/**
 * `values.shipping_address` sekarang cuma detail jalan/rumah (Field "Detail
 * Alamat" di bawah) — provinsi/kota/kecamatan/kelurahan/kode pos datang dari
 * ShippingSelector (hasil pilih destinasi RajaOngkir). Gabungkan jadi satu
 * string sebelum dikirim ke /api/checkout supaya kolom `orders.shipping_address`
 * (single text column, tidak ada perubahan skema) tetap berisi alamat lengkap
 * untuk kurir antar fisik.
 */
function composeShippingAddress(detail: string, shipping: SelectedShipping): string {
  const regionParts = [shipping.subdistrict, shipping.district, shipping.city, shipping.province].filter(
    (part): part is string => Boolean(part && part.trim())
  );
  const zip = shipping.zipCode ? ` ${shipping.zipCode}` : "";
  return regionParts.length > 0 ? `${detail}, ${regionParts.join(", ")}${zip}` : detail;
}

export function CheckoutForm({ items, subtotal, fees }: CheckoutFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<SelectedShipping | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (!selectedShipping) {
      setSubmitError("Pilih tujuan & kurir pengiriman terlebih dahulu.");
      return;
    }

    const parsed = checkoutFormSchema.safeParse({
      customer_name: values.customer_name,
      customer_phone: values.customer_phone,
      shipping_address: values.shipping_address,
      notes: values.notes || undefined,
      shipping: {
        destinationId: selectedShipping.destinationId,
        courierCode: selectedShipping.courierCode,
        serviceCode: selectedShipping.serviceCode,
      },
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        customer_name: flattened.customer_name?.[0],
        customer_phone: flattened.customer_phone?.[0],
        shipping_address: flattened.shipping_address?.[0],
        notes: flattened.notes?.[0],
      });
      return;
    }
    setFieldErrors({});

    const requestBody = {
      ...parsed.data,
      shipping_address: composeShippingAddress(parsed.data.shipping_address, selectedShipping),
    };

    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        const data = await res.json();

        if (!res.ok) {
          setSubmitError(data.error ?? "Gagal membuat pesanan, coba lagi.");
          return;
        }

        router.push(`/checkout/sukses/${data.orderNumber}`);
      } catch {
        setSubmitError("Gagal terhubung ke server, periksa koneksi Anda dan coba lagi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 p-5">
          <Field
            label="Nama Lengkap"
            value={values.customer_name}
            error={fieldErrors.customer_name}
            onChange={(v) => handleChange("customer_name", v)}
          />
          <Field
            label="No. HP"
            value={values.customer_phone}
            error={fieldErrors.customer_phone}
            onChange={(v) => handleChange("customer_phone", v)}
            type="tel"
          />
          <ShippingSelector onSelect={setSelectedShipping} />
          <Field
            label="Detail Alamat (Nama Jalan, No. Rumah, RT/RW, Patokan)"
            value={values.shipping_address}
            error={fieldErrors.shipping_address}
            onChange={(v) => handleChange("shipping_address", v)}
            multiline
          />
          <Field
            label="Catatan (opsional)"
            value={values.notes}
            error={fieldErrors.notes}
            onChange={(v) => handleChange("notes", v)}
            multiline
            required={false}
          />
        </div>

        <div className="rounded-xl border border-neutral-200 p-5">
          <h2 className="mb-2 text-sm font-semibold text-neutral-900">Metode Pembayaran</h2>
          <p className="text-sm text-neutral-600">{PAYMENT_METHOD_PLACEHOLDER_LABEL}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <CheckoutOrderReview
          items={items}
          subtotal={subtotal}
          shippingCost={selectedShipping?.cost ?? null}
          shippingLabel={selectedShipping ? `${selectedShipping.serviceName}` : undefined}
          fees={fees}
        />
        <button
          type="submit"
          disabled={isPending || !selectedShipping}
          className="w-full rounded-full bg-brand-red px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Memproses..." : "Buat Pesanan"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  required?: boolean;
};

function Field({ label, value, error, onChange, type = "text", multiline = false, required = true }: FieldProps) {
  const inputClassName =
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red";

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-neutral-700">
        {label}
        {required && <span className="text-brand-red"> *</span>}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={inputClassName}
        />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputClassName} />
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
