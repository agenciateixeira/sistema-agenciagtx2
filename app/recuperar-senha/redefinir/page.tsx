import { Logo } from '@/components/logo';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    redirect('/recuperar-senha');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto text-gray-900" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Redefinir Senha</h1>
            <p className="mt-2 text-sm text-gray-600">
              Digite sua nova senha abaixo
            </p>
          </div>

          <ResetPasswordForm token={token} />

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              ← Voltar para Login
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          © 2025 Agência GTX. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
