
import { LoginForm } from "@/components/forms/LoginForm";
import { getConfiguracion } from "@/actions/configuracion/configuracionActions";
import Image from "next/image";
import Link from "next/link";
import { Church, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const config = await getConfiguracion();
  const logoUrl = config?.logo_url;

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT COLUMN: Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 xl:w-[500px] relative z-10">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center mb-10 gap-4 text-center">
            {logoUrl ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-offset-2 ring-blue-100">
                <Image
                  src={logoUrl}
                  alt="Logo Iglesia"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg shadow-blue-200">
                <Church className="h-8 w-8" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Bienvenido de nuevo
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Ingresa a tu cuenta para administrar el sistema.
              </p>
            </div>
          </div>

          <LoginForm />

          <p className="mt-10 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Fuente de Salvación Misionera INC.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Image */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop"
          alt="Worship background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-blue-900/40 mix-blend-multiply" />
        <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
          <div className="max-w-md space-y-6">
            <div className="h-1 w-20 bg-white/20 mx-auto rounded-full mb-8 backdrop-blur-sm" />
            <blockquote className="text-3xl font-medium text-white italic leading-relaxed drop-shadow-md">
              "Porque donde están dos o tres congregados en mi nombre, allí estoy yo en medio de ellos."
            </blockquote>
            <p className="text-blue-100 font-semibold tracking-wider uppercase text-sm">- Mateo 18:20</p>
          </div>
        </div>
      </div>
    </div>
  );
}
