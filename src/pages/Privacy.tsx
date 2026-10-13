import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';

export default function Privacy() {
  const { config } = useSiteConfig();
  return (
    <>
      <Header />
      <main className="bg-gray-50 px-4 pb-12 pt-28 md:pt-32">
        <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-10">
          <h1 className="text-3xl font-extrabold text-gray-900">Política de Privacidade</h1>
          <p className="text-sm text-gray-500">Atualizada em 13 de outubro de 2026</p>
          <section className="space-y-2"><h2 className="text-xl font-bold">Contato e atendimento</h2>
            <p>Este site apresenta o estoque e os canais de atendimento da {config.name}. Nos formulários de contato e financiamento, você informa nome, mensagem e, quando aplicável, valores e condições de interesse. Esses campos são usados para montar uma mensagem e abrir o WhatsApp. O envio da mensagem depende da sua confirmação no WhatsApp.</p>
          </section>
          <section className="space-y-2"><h2 className="text-xl font-bold">Uso das informações</h2>
            <p>As informações enviadas à loja são utilizadas no atendimento da sua solicitação, incluindo dúvidas sobre veículos, propostas e financiamento. Evite incluir senhas, documentos ou dados bancários no campo de mensagem.</p>
          </section>
          <section className="space-y-2"><h2 className="text-xl font-bold">Dados de navegação e armazenamento</h2>
            <p>O site utiliza Google Analytics e Google Tag Manager para registrar navegação e interações. O navegador também pode armazenar configurações e arquivos em cache para o funcionamento das páginas. Serviços de hospedagem e proteção podem registrar dados técnicos, como endereço IP, páginas solicitadas e horário de acesso.</p>
          </section>
          <section className="space-y-2"><h2 className="text-xl font-bold">Serviços externos</h2>
            <p>WhatsApp, Google Maps e Google Analytics possuem suas próprias políticas de privacidade. Ao abrir esses serviços ou carregar seus recursos, informações técnicas e dados que você decidir enviar podem ser tratados por esses fornecedores.</p>
          </section>
          <section className="space-y-2"><h2 className="text-xl font-bold">Suas solicitações</h2>
            <p>Para esclarecer o uso dos seus dados ou solicitar acesso, correção ou exclusão de informações enviadas à loja, entre em contato e descreva sua solicitação. A equipe deverá avaliar os dados envolvidos e eventuais necessidades de conservação.</p>
            <a className="inline-block font-semibold text-green-700 underline" href={`https://wa.me/${normalizeWhatsAppNumber(config.contact.whatsapp || config.contact.phone)}`} target="_blank" rel="noopener noreferrer">Falar com a {config.name} pelo WhatsApp</a>
          </section>
          <a href="/contato" className="inline-block font-semibold text-green-700 underline">Voltar ao contato</a>
        </article>
      </main>
      <Footer />
    </>
  );
}
