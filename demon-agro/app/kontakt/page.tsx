"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import emailjs from "@emailjs/browser";

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    farmLocation: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Jméno je povinné";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email je povinný";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Neplatný formát emailu";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefon je povinný";
    } else if (!/^(\+420)?[0-9]{9,13}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Neplatný formát telefonu";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Zpráva je povinná";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Zpráva musí mít alespoň 10 znaků";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setStatus("sending");

    // Hardcoded credentials for reliability
    const serviceId = "service_xrx301a";
    const templateId = "template_kogwumm";
    const publicKey = "xL_Khx5Gcnt-lEvUl";

    try {
      const templateParams = {
        user_name: formData.name,
        user_email: formData.email,
        user_phone: formData.phone,
        farm_location: formData.farmLocation || "Neuvedeno",
        message: formData.message,
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", farmLocation: "", message: "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Email send error:", error);
      setStatus("error");
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#F5F1E8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Kontaktujte nás
          </h1>
          <p className="text-xl text-gray-600">
            Rádi zodpovíme vaše dotazy a nabídneme nezávaznou konzultaci
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Kontaktní informace */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Kontaktní údaje
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#4A7C59] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a
                      href="mailto:base@demonagro.cz"
                      className="text-[#4A7C59] hover:text-[#3d6449] transition-colors"
                    >
                      base@demonagro.cz
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#4A7C59] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Telefon</h3>
                    <a
                      href="tel:+420731734907"
                      className="text-[#4A7C59] hover:text-[#3d6449] transition-colors"
                    >
                      +420 731 734 907
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#4A7C59] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Oblast působnosti
                    </h3>
                    <p className="text-gray-600">
                      Plzeňský, Karlovarský, Ústecký, Liberecký, Královéhradecký a Středočeský kraj
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 bg-[#F5F1E8] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Telefonická dostupnost
                </h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Pondělí - Pátek:</span>
                    <span className="font-semibold">8:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sobota:</span>
                    <span className="font-semibold">Dle individuální domluvy</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Neděle:</span>
                    <span className="font-semibold">Dle individuální domluvy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kontaktní formulář */}
            <div id="contact-form">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Nezávazná poptávka
              </h2>

              {/* Success Message */}
              {status === "success" && (
                <div className="mb-6 bg-green-50 p-4 rounded-lg shadow-sm flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-semibold">
                      Děkujeme! Vaše poptávka byla odeslána.
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      Ozveme se vám do 24 hodin.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {status === "error" && (
                <div className="mb-6 bg-red-50 p-4 rounded-lg shadow-sm flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-semibold">
                      Něco se pokazilo.
                    </p>
                    <p className="text-red-700 text-sm mt-1">
                      Zkuste to prosím znovu nebo nám zavolejte na +420 731 734 907
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Jméno */}
                <div>
                  <label htmlFor="name" className="block font-semibold text-gray-900 mb-2">
                    Jméno a příjmení *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none transition-all ${
                      errors.name ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder="Jan Novák"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block font-semibold text-gray-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none transition-all ${
                      errors.email ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder="jan@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Telefon */}
                <div>
                  <label htmlFor="phone" className="block font-semibold text-gray-900 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none transition-all ${
                      errors.phone ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder="+420 123 456 789"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Lokalita / Okres */}
                <div>
                  <label htmlFor="farmLocation" className="block font-semibold text-gray-900 mb-2">
                    Lokalita / Okres
                  </label>
                  <input
                    type="text"
                    id="farmLocation"
                    value={formData.farmLocation}
                    onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                    className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none transition-all"
                    placeholder="např. Louny, Plzeň-sever, Žatecko..."
                  />
                </div>

                {/* Zpráva */}
                <div>
                  <label htmlFor="message" className="block font-semibold text-gray-900 mb-2">
                    Zpráva/poptávka *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none transition-all resize-none ${
                      errors.message ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder="Popište prosím vaši poptávku..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-[#4A7C59] hover:bg-[#3d6449] text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Odesílám..." : "Odeslat poptávku"}
                </button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Odesláním formuláře berete na vědomí zpracování osobních údajů dle{" "}
                  <Link 
                    href="/zasady-ochrany-osobnich-udaju" 
                    target="_blank"
                    className="underline hover:text-gray-700"
                  >
                    Zásad ochrany osobních údajů
                  </Link>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
