import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const FaqSection = () => {
  const faqs = [
    {
      question: 'Como funciona o financiamento?',
      answer:
        'Trabalhamos com as principais instituições financeiras do mercado. Você pode simular o financiamento diretamente em nosso site e nossa equipe entrará em contato para finalizar o processo.',
    },
    {
      question: 'Os veículos têm garantia?',
      answer:
        'Sim! Todos os nossos veículos passam por rigorosa inspeção e oferecemos garantia de motor e câmbio de 3 meses.',
    },
    {
      question: 'Posso fazer test drive?',
      answer:
        'Claro! Agende seu test drive através do WhatsApp ou telefone. É rápido e sem compromisso.',
    },
    {
      question: 'Aceitam veículo como parte do pagamento?',
      answer:
        'Sim, aceitamos seu veículo como parte do pagamento. Nossa equipe faz a avaliação e apresenta uma proposta justa.',
    },
    {
      question: 'Qual documentação necessária para compra?',
      answer:
        'Para pessoa física: RG, CPF, comprovante de residência e comprovante de renda. Para pessoa jurídica: contrato social, CNPJ e documentos do responsável.',
    },
  ];

  return (
    <section className="py-16 bg-primary-light">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
            <img src="/ponto.png" alt="" className="w-2 h-2" aria-hidden="true" />
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre nossos serviços e processos
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl px-6 border shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
