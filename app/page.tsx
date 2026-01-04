
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Menu,
  Facebook,
  Instagram,
  Youtube,
  Church,
} from "lucide-react";
import { getConfiguracion } from "@/actions/configuracion/configuracionActions";
import Image from "next/image";
import { LandingHeader } from "@/components/landing/LandingHeader";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const config = await getConfiguracion();
  const logoUrl = config?.logo_url;

  return (
    <div className="flex min-h-screen flex-col font-sans text-slate-900">
      {/* --- STICKY HEADER --- */}
      <LandingHeader logoUrl={logoUrl} />

      <main className="flex-1">
        {/* --- HERO SECTION --- */}
        <section className="relative flex min-h-[600px] flex-col items-center justify-center text-center text-white">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop"
              alt="Church Interior Worship"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
          </div>

          <div className="relative z-10 container px-4 md:px-6 space-y-6">
            <div className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm backdrop-blur-sm">
              <span className="mr-2 h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              Bienvenidos a Casa
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-sm">
              Fuente de Salvación <br className="hidden sm:inline" />
              <span className="text-blue-200">Misionera INC.</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-slate-200 md:text-xl font-medium drop-shadow-md">
              Una familia de Fe y Esperanza en San Cristóbal. Un lugar donde tu vida será transformada por el poder de Dios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="#schedule">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-slate-100 w-full sm:w-auto font-semibold">
                  Ver Horarios
                  <Calendar className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#location">
                <Button size="lg" variant="outline" className="border-white text-blue-900 hover:bg-white/20 hover:text-white w-full sm:w-auto">
                  Visítanos
                  <MapPin className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* --- ABOUT / LEADERSHIP SECTION --- */}
        <section id="about" className="py-16 md:py-24 bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 font-medium">
                  Nuestro Liderazgo
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-slate-900">
                  Guiados por el Espíritu,<br />Servimos con Amor
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Bajo la cobertura y dirección de la <strong>Pastora Mercedes Hidalgo</strong>, nuestra congregación se dedica a predicar el evangelio integral, restaurar familias y servir a nuestra comunidad en San Cristóbal.
                </p>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Creemos en una iglesia viva, donde cada miembro es parte fundamental del cuerpo de Cristo. Nuestra misión es llevar la luz de la esperanza a cada rincón de Zona Verde y más allá.
                </p>
                <div className="pt-4 flex gap-4">
                  <div className="flex flex-col border-l-4 border-blue-600 pl-4">
                    <span className="font-bold text-slate-900 text-xl">Pastora Mercedes Hidalgo</span>
                    <span className="text-slate-500">Líder Principal</span>
                  </div>
                </div>
              </div>
              <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl shadow-xl bg-slate-200">
                {/* Placeholder for Pastor's photo - using a dignified generic portrait or church related image if specific one not available */}
                <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-slate-500">
                  <Users className="h-24 w-24 opacity-20" />
                  <span className="absolute bottom-4 text-sm font-medium opacity-60">Foto de la Pastora</span>
                </div>
                {/* 
                 <Image 
                   src="/path-to-pastor-photo.jpg" 
                   alt="Pastora Mercedes Hidalgo"
                   fill
                   className="object-cover"
                 />
                 */}
              </div>
            </div>
          </div>
        </section>

        {/* --- SERVICE SCHEDULE --- */}
        <section id="schedule" className="py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-slate-900">Nuestros Servicios</h2>
              <p className="text-slate-500 text-lg">
                Te invitamos a adorar y crecer con nosotros. Hay un lugar especial para ti en cada reunión.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Tuesday */}
              <div className="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-full bg-blue-100 p-3 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900">Martes</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-blue-700 font-semibold text-lg">Culto de Oración</p>
                  <p className="text-slate-500">
                    Un tiempo poderoso de intercesión y búsqueda de la presencia de Dios.
                  </p>
                  <div className="pt-2 text-sm font-medium text-slate-400">
                    7:30 PM - 9:00 PM
                  </div>
                </div>
              </div>

              {/* Saturday */}
              <div className="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-full bg-indigo-100 p-3 text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900">Sábado</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-indigo-700 font-semibold text-lg">Sociedad de Jóvenes</p>
                  <p className="text-slate-500">
                    Dinámicas, adoración y enseñanza enfocada en la nueva generación.
                  </p>
                  <div className="pt-2 text-sm font-medium text-slate-400">
                    7:00 PM - 9:00 PM
                  </div>
                </div>
              </div>

              {/* Sunday */}
              <div className="group relative overflow-hidden rounded-2xl border bg-blue-50 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ring-1 ring-blue-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-full bg-blue-600 p-3 text-white">
                    <Church className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900">Domingo</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-blue-800 font-semibold text-lg">Culto Dominical</p>
                  <p className="text-slate-600">
                    Nuestra celebración principal. Alabanza, adoración y la Palabra de Dios para toda la familia.
                  </p>
                  <div className="pt-2 text-sm font-medium text-slate-500">
                    9:30 AM - 11:30 AM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- LOCATION / FOOTER --- */}
        <section id="location" className="py-16 md:py-24 bg-slate-900 text-slate-300">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-white">
                  <Church className="h-6 w-6" />
                  <span className="text-xl font-bold">Fuente de Salvación</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Somos una iglesia comprometida con la verdad del evangelio y el amor al prójimo.
                  Únete a nosotros para crecer juntos en la fe.
                </p>
                <div className="flex gap-4">
                  <Button size="icon" variant="ghost" className="hover:bg-white/10 hover:text-white">
                    <Facebook className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="hover:bg-white/10 hover:text-white">
                    <Instagram className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="hover:bg-white/10 hover:text-white">
                    <Youtube className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Visítanos</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                      <p className="font-medium text-white">Dirección Física</p>
                      <p className="mt-1">Calle Respaldo Libertad</p>
                      <p>Barrio Zona Verde</p>
                      <p>San Cristóbal, República Dominicana</p>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <a href="https://maps.google.com/?q=Calle+Respaldo+Libertad+Zona+Verde+San+Cristobal" target="_blank" rel="noopener noreferrer">
                      Ver en Google Maps
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Contacto</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>
                    <span className="block text-white font-medium mb-1">Pastora Mercedes Hidalgo</span>
                    Líder General
                  </li>
                  <li className="pt-2">
                    <span className="block text-white font-medium mb-1">Teléfono / WhatsApp</span>
                    +1 (809) 000-0000
                  </li>
                  <li className="pt-2">
                    <span className="block text-white font-medium mb-1">Email</span>
                    info@fuentesalvacion.org
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-16 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
              <p>© {new Date().getFullYear()} Fuente de Salvación Misionera INC. Todos los derechos reservados.</p>
              <div className="mt-4">
                <Link href="/login" className="hover:text-white transition-colors">
                  Acceso Administrativo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
