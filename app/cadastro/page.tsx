import { Logo } from '@/components/logo';
import { CadastroForm } from '@/components/cadastro/cadastro-form';

export default function CadastroPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto text-gray-900" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
            <p className="mt-2 text-sm text-gray-600">
              Preencha os dados abaixo
            </p>
          </div>

          <CadastroForm />

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Já tenho uma conta
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
