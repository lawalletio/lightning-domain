import Link from 'next/link';
import LaCryptaLogo from '~/components/LaCryptaLogo';
import Logo from '~/components/Logo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#d2d2d2] to-[#fefefe]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-black sm:text-[5rem]">
          <Logo />
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-black hover:bg-white/20"
            href="https://lacrypta.ar"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">
              <LaCryptaLogo />
            </h3>
            <div className="text-lg">Conocé quiénes están detrás de todo esto.</div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-10 rounded-xl bg-white/10 p-4 pt-8 text-black hover:bg-white/20"
            href="https://lawallet.io"
            target="_blank"
          >
            <h3 className="text-3xl font-bold">Desarrolladores</h3>
            <div className="text-lg">Verificá la documentación, es todo open source.</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
