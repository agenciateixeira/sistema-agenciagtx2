import { Logo } from '@/components/logo';
import { LoginForm } from '@/components/login/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto text-gray-900" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Entrar</h1>
            <p className="mt-2 text-sm text-gray-600">
              Acesse sua conta
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center">
            <a
              href="/cadastro"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Criar nova conta
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          © 2025 Agência GTX. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
