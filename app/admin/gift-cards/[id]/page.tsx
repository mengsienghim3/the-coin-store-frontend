"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  CreditCard,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Check,
  Globe,
  Trash2,
  ExternalLink,
  Tag,
  FileText,
  Sliders,
} from "lucide-react";
import {
  fetchGiftCard,
  updateGiftCard,
  deleteGiftCard,
  uploadImage,
  getStoredAdmin,
  clearStoredAdmin,
  verifyAdminSession,
  GiftCard,
} from "../../../../lib/api";

const GIFT_CARD_CATEGORIES = [
  "PC & Steam",
  "Mobile & Apps",
  "Console",
  "Gaming Points",
  "Entertainment",
];

export default function EditGiftCardPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Original gift card
  const [originalCard, setOriginalCard] = useState<GiftCard | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [nameKh, setNameKh] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionKh, setDescriptionKh] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("PC & Steam");
  const [brand, setBrand] = useState("");
  const [deliveryType, setDeliveryType] = useState("Instant Digital Code");
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // R2 Upload states
  const [isUploadingR2, setIsUploadingR2] = useState(false);
  const [uploadSuccessR2, setUploadSuccessR2] = useState(false);
  const [uploadErrorR2, setUploadErrorR2] = useState<string | null>(null);

  // Live preview language toggle
  const [previewLang, setPreviewLang] = useState<"en" | "km">("en");

  // Auth & Data loading
  useEffect(() => {
    const session = getStoredAdmin();
    if (!session) {
      router.replace("/admin/login");
      return;
    }

    verifyAdminSession(session.token).then((verified) => {
      if (!verified) {
        clearStoredAdmin();
        router.replace("/admin/login");
      }
    });

    if (cardId) {
      loadCardData(cardId);
    }
  }, [cardId, router]);

  const loadCardData = async (id: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchGiftCard(id);
      if (!data) {
        setErrorMessage("Gift card not found or has been removed.");
        setLoading(false);
        return;
      }
      setOriginalCard(data);
      setName(data.name);
      setNameKh(data.nameKh || "");
      setDescription(data.description || "");
      setDescriptionKh(data.descriptionKh || "");
      setImageUrl(data.imageUrl);
      setCategory(data.category || "PC & Steam");
      setBrand(data.brand || "");
      setDeliveryType(data.deliveryType || "Instant Digital Code");
      setOrder(data.order || 1);
      setIsActive(data.isActive);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to load gift card information",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle R2 Image Upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingR2(true);
    setUploadErrorR2(null);
    setUploadSuccessR2(false);
    try {
      const res = await uploadImage(file);
      setImageUrl(res.url);
      setUploadSuccessR2(true);
      setTimeout(() => setUploadSuccessR2(false), 4000);
    } catch (err) {
      setUploadErrorR2(
        err instanceof Error
          ? err.message
          : "Failed to upload image to Cloudflare R2",
      );
    } finally {
      setIsUploadingR2(false);
    }
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId || !originalCard) return;

    if (!name.trim()) {
      setErrorMessage("Please provide a gift card title.");
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMessage("Please upload or enter a cover image URL.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const isNewName = name.trim() !== originalCard.name;
      const isNewImage = imageUrl.trim() !== originalCard.imageUrl;
      const isNewDesc = description.trim() !== (originalCard.description || "");

      const updated = await updateGiftCard(cardId, {
        name: name.trim(),
        nameKh: nameKh.trim() || null,
        description: description.trim() || null,
        descriptionKh: descriptionKh.trim() || null,
        imageUrl: imageUrl.trim(),
        category: category.trim(),
        brand: brand.trim() || null,
        deliveryType: deliveryType.trim() || "Instant Digital Code",
        order: Number(order),
        isActive,
        isCustomName: isNewName ? true : originalCard.isCustomName,
        isCustomImage: isNewImage ? true : originalCard.isCustomImage,
        isCustomDescription: isNewDesc
          ? true
          : originalCard.isCustomDescription,
      });

      setOriginalCard(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to save gift card changes",
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this gift card? This action cannot be undone.",
      )
    )
      return;

    setDeleting(true);
    try {
      await deleteGiftCard(cardId);
      router.replace("/admin?view=gift-cards");
    } catch (err) {
      alert(
        "Failed to delete gift card: " +
          (err instanceof Error ? err.message : ""),
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070518] text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 animate-spin text-pink-400 mb-4" />
        <p className="text-sm text-slate-400">Loading gift card details...</p>
      </div>
    );
  }

  if (errorMessage && !originalCard) {
    return (
      <div className="min-h-screen bg-[#070518] text-white flex flex-col items-center justify-center p-6">
        <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">
            Error Loading Gift Card
          </h2>
          <p className="text-xs text-slate-400 mb-6">{errorMessage}</p>
          <Link
            href="/admin?view=gift-cards"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gift Cards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070518] text-white pb-24">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-pink-600/15 via-purple-600/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Header Sticky Bar */}
      <header className="sticky top-0 z-30 bg-[#0a0720]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin?view=gift-cards"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Return to gift cards catalog"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-black text-white truncate">
                  Edit Gift Card
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-pink-500/15 text-pink-300 border border-pink-500/30">
                  {brand || "Voucher"}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-white/5 border border-white/5 truncate max-w-[150px]">
                  {originalCard?.slug || cardId}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Delete gift card"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Delete</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isUploadingR2}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-xs font-black text-white shadow-lg shadow-pink-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        {/* Save Success Alert */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Gift card configuration successfully saved & published!
              </span>
            </div>
            <button
              onClick={() => setSaveSuccess(false)}
              className="text-emerald-400 hover:text-white px-2 py-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white px-2 py-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (7-8 cols): Gift Card Fields */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* Section 1: Titles & Identity */}
              <div className="p-6 rounded-3xl bg-[#0e0a2b]/80 border border-white/10 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">
                      Titles & Brand Identity
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Bilingual naming and brand classification for the digital
                      card.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Card Title (English) *</span>
                      <span className="text-[10px] text-pink-400 font-medium">
                        Preserved
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. PUBG: BATTLEGROUNDS (Global)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Card Title (Khmer ខ្មែរ)</span>
                      <span className="text-[10px] text-pink-400 font-medium">
                        🇰🇭 Khmer UI
                      </span>
                    </label>
                    <input
                      type="text"
                      value={nameKh}
                      onChange={(e) => setNameKh(e.target.value)}
                      placeholder="e.g. ផាប់ជី បេថលហ្គ្រោន (សកល)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 font-khmer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#16122d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-400"
                    >
                      {GIFT_CARD_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Brand / Franchise
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. PUBG, Steam, Roblox"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Delivery Method
                    </label>
                    <input
                      type="text"
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      placeholder="Instant Digital Code"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Descriptions & Redemption Guide */}
              <div className="p-6 rounded-3xl bg-[#0e0a2b]/80 border border-white/10 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">
                      Redemption Details & Instructions
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Explain activation instructions, eligible regions, and
                      voucher terms.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Description & Terms (English)
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Region: Global. Codes can be safely stored and redeemed at pubg.com/redeem..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Description & Terms (Khmer ខ្មែរ)
                    </label>
                    <textarea
                      rows={3}
                      value={descriptionKh}
                      onChange={(e) => setDescriptionKh(e.target.value)}
                      placeholder="តំបន់៖ សកល។ កូដអាចរក្សាទុកដោយសុវត្ថិភាព និងបញ្ចូលនៅ..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 resize-none leading-relaxed font-khmer"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Cloudflare R2 Artwork Upload */}
              <div className="p-6 rounded-3xl bg-[#0e0a2b]/80 border border-white/10 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">
                      Cover Artwork (Cloudflare R2)
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Upload high-resolution horizontal voucher artwork (16:10
                      or 16:9 ratio).
                    </p>
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div className="relative border-2 border-dashed border-white/15 hover:border-pink-500/50 rounded-2xl p-6 bg-white/[0.02] text-center transition-all">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <UploadCloud className="w-8 h-8 text-pink-400 animate-bounce" />
                    <span className="text-xs font-bold text-slate-200">
                      Drag & drop your custom card artwork here
                    </span>
                    <span className="text-[10px] text-slate-400">
                      or click to browse from device (WebP, PNG, JPG)
                    </span>
                  </div>

                  {isUploadingR2 && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-2 text-xs text-pink-300 z-20">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Uploading artwork to Cloudflare R2 bucket...</span>
                    </div>
                  )}
                </div>

                {uploadSuccessR2 && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Artwork successfully uploaded to Cloudflare R2!</span>
                  </div>
                )}

                {uploadErrorR2 && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {uploadErrorR2}
                  </div>
                )}

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Image Public URL (R2 or CDN)
                  </label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              {/* Section 4: Display Order & Status */}
              <div className="p-6 rounded-3xl bg-[#0e0a2b]/80 border border-white/10 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">
                      Display Order & Storefront Status
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Control visibility and sorting position in the gift card
                      catalog.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Display Order (Sort Index)
                    </label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) =>
                        setOrder(parseInt(e.target.value, 10) || 1)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-400"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Lower numbers appear first (e.g. 1, 2, 3).
                    </span>
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="text-xs font-bold text-slate-300 mb-2">
                      Storefront Visibility
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isActive
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                          : "bg-red-500/15 border-red-500/40 text-red-300"
                      }`}
                    >
                      <span className="text-xs font-bold">
                        {isActive
                          ? "✓ Active (Visible to Customers)"
                          : "✕ Inactive (Hidden)"}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40">
                        {isActive ? "Published" : "Draft"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4-5 cols): Sticky Live Preview */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="p-6 rounded-3xl bg-gradient-to-b from-[#181138] to-[#0f0b28] border border-pink-500/30 shadow-2xl shadow-pink-500/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">
                        Live Storefront Card
                      </h3>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
                      <button
                        type="button"
                        onClick={() => setPreviewLang("en")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          previewLang === "en"
                            ? "bg-pink-600 text-white shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewLang("km")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-khmer transition-all ${
                          previewLang === "km"
                            ? "bg-purple-600 text-white shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        ខ្មែរ
                      </button>
                    </div>
                  </div>

                  {/* Visual Gift Card Preview */}
                  <div className="rounded-2xl bg-[#0e111a] border border-pink-500/40 overflow-hidden shadow-xl">
                    {/* Artwork */}
                    <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Card Artwork"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-[11px]">
                            No artwork provided
                          </span>
                        </div>
                      )}

                      {/* Brand Badge */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
                          #{order}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="absolute top-2 right-2">
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-bold text-red-300 backdrop-blur-md">
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Category Pill */}
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-900/80 backdrop-blur-md border border-purple-500/30 text-[10px] font-bold text-purple-200">
                          {category}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 font-mono block">
                        {brand || "Digital Voucher"}
                      </span>

                      <h4
                        className={`text-sm font-black text-white line-clamp-1 ${
                          previewLang === "km" && nameKh
                            ? "font-khmer text-pink-300"
                            : ""
                        }`}
                      >
                        {previewLang === "km" && nameKh
                          ? nameKh
                          : name || "Gift Card Title"}
                      </h4>

                      <p
                        className={`text-xs text-slate-400 line-clamp-2 leading-relaxed whitespace-pre-line ${
                          previewLang === "km" && descriptionKh
                            ? "font-khmer"
                            : ""
                        }`}
                      >
                        {previewLang === "km" && descriptionKh
                          ? descriptionKh
                          : description ||
                            "Instant digital voucher delivered to your account."}
                      </p>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-pink-300 font-semibold">
                          {deliveryType}
                        </span>
                        <span className="font-mono text-slate-500">
                          Fast Delivery
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sticky Save Action */}
                  <button
                    type="submit"
                    disabled={saving || isUploadingR2}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-xs font-black text-white shadow-xl shadow-pink-600/30 transition-all active:scale-98 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Card...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Gift Card Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
