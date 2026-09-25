import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { Phone, MapPin, Mail, Clock, MessageCircle } from 'lucide-react';

const Contact = () => {
  const { config } = useSiteConfig();
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    assunto: '',
    mensagem: ''
  });

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    
    const texto = `*Contato via Site*%0A%0A*Nome:* ${encodeURIComponent(formData.nome)}%0A*Assunto:* ${encodeURIComponent(formData.assunto)}%0A*Mensagem:* ${encodeURIComponent(formData.mensagem)}`;
    const phoneNumber = config.contact.phone.replace(/\D/g, '');
    
    window.open(`https://wa.me/${phoneNumber}?text=${texto}`, '_blank');
    
    setFormData({ nome: '', assunto: '', mensagem: '' });
  };

  const faqItems = [
    {
      pergunta: 'Como funciona o financiamento de veículos na AUTOFLIX MULTIMARCAS?',
      resposta: 'Na AUTOFLIX MULTIMARCAS, oferecemos diversas opções de financiamento com as melhores taxas do mercado. Trabalhamos com os principais bancos e financeiras, o que nos permite oferecer condições especiais para nossos clientes. O processo é simples e rápido, com aprovação em até 24 horas. Você pode financiar seu veículo em até 60 meses, com entrada facilitada.'
    },
    {
      pergunta: 'Quais documentos são necessários para comprar um carro na AUTOFLIX MULTIMARCAS?',
      resposta: 'Para comprar um veículo na AUTOFLIX MULTIMARCAS, você precisará apresentar os seguintes documentos: RG, CPF, comprovante de residência atualizado (últimos 3 meses) e comprovante de renda. Para financiamentos, podem ser solicitados documentos adicionais conforme a política do banco financiador.'
    },
    {
      pergunta: 'A AUTOFLIX MULTIMARCAS aceita o meu carro como entrada?',
      resposta: 'Sim! A AUTOFLIX MULTIMARCAS aceita o seu veículo usado como entrada na compra do seu carro novo. Fazemos uma avaliação justa e transparente do seu veículo atual, oferecendo o melhor valor de mercado. Essa é uma excelente opção para quem deseja reduzir o valor do financiamento ou fazer uma troca com troco.'
    },
    {
      pergunta: 'Como agendar um test drive na AUTOFLIX MULTIMARCAS?',
      resposta: 'Agendar um test drive na AUTOFLIX MULTIMARCAS é muito simples! Você pode entrar em contato conosco por telefone, WhatsApp ou através do formulário de contato em nosso site. Basta informar o veículo de seu interesse e sugerir algumas datas e horários. Nossa equipe entrará em contato para confirmar o agendamento. Você também pode visitar nossa loja e, se o veículo estiver disponível, realizar o test drive no mesmo momento.'
    }
  ];

  const phoneNumber = config.contact.phone.replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${phoneNumber}?text=Olá%2C+gostaria+de+mais+informações`;
  const googleMapsLink = `https://www.google.com/maps/search/${encodeURIComponent(config.address.street + ', ' + config.address.city + ', ' + config.address.state)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full pt-20">
        {/* Seção de Título */}
        <div className="bg-white border-b border-gray-200 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">ENTRE EM CONTATO</h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Estamos à disposição para ajudar você a encontrar o veículo dos seus sonhos. Fale com nossos vendedores e tire todas as suas dúvidas.
              </p>
            </div>
          </div>
        </div>

        {/* Seção Principal */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-12 gap-8">
              {/* Informações de Contato */}
              <div className="md:col-span-5">
                <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
                  <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">INFORMAÇÕES DE CONTATO</h2>
                    
                    <div className="space-y-6">
                      {/* Endereço */}
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 rounded-full p-3 text-green-600 mt-1 flex-shrink-0">
                          <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Endereço</h3>
                          <p className="text-gray-600">{config.address.street}</p>
                          <p className="text-gray-600">{config.address.city}, {config.address.state} - {config.address.zipCode}</p>
                          <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 font-medium mt-2 inline-block">
                            Ver no Google Maps
                          </a>
                        </div>
                      </div>

                      {/* Telefone */}
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 rounded-full p-3 text-green-600 mt-1 flex-shrink-0">
                          <Phone className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Telefone</h3>
                          <p className="text-gray-600">{config.contact.phone}</p>
                          <a href={`tel:${phoneNumber}`} className="text-green-600 hover:text-green-800 font-medium mt-2 inline-block">
                            Ligar agora
                          </a>
                        </div>
                      </div>

                      {/* WhatsApp */}
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 rounded-full p-3 text-green-600 mt-1 flex-shrink-0">
                          <svg viewBox="0 0 448 512" className="h-6 w-6" fill="currentColor">
                            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">WhatsApp</h3>
                          <p className="text-gray-600">Atendimento rápido via WhatsApp</p>
                          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 font-medium mt-2 inline-block">
                            Enviar mensagem
                          </a>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 rounded-full p-3 text-green-600 mt-1 flex-shrink-0">
                          <Mail className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">E-mail</h3>
                          <p className="text-gray-600">contato@autoflixmultimarcas.com.br</p>
                          <a href="mailto:contato@autoflixmultimarcas.com.br" className="text-green-600 hover:text-green-800 font-medium mt-2 inline-block">
                            Enviar e-mail
                          </a>
                        </div>
                      </div>

                      {/* Horário */}
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 rounded-full p-3 text-green-600 mt-1 flex-shrink-0">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Horário de Funcionamento</h3>
                          <p className="text-gray-600">Segunda a Sexta: 9h às 18h</p>
                          <p className="text-gray-600">Sábado: 9h às 16h</p>
                          <p className="text-gray-600">Domingo: Fechado</p>
                        </div>
                      </div>
                    </div>

                    {/* Mapa */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Nossa Localização</h3>
                      <div className="rounded-lg overflow-hidden h-[300px] border border-gray-200">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3600.445!2d-49.254936!3d-25.42894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dcfbb3313f4473%3A0x99fb1c32158b8cfe!2sR.%20Cruzeiro%20do%20Sul%2C%20204!5e0!3m2!1spt-BR!2sbr!4v1713130800000!5m2!1spt-BR!2sbr"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen={true}
                          loading="lazy"
                          title="Localização AUTOFLIX MULTIMARCAS"
                          className="rounded-lg"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulário de Contato */}
              <div className="md:col-span-7">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">ENVIE SUA MENSAGEM</h2>
                    
                    <form onSubmit={handleSendWhatsApp} className="space-y-6">
                      <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome *
                        </label>
                        <input
                          type="text"
                          id="nome"
                          required
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                          placeholder="Digite seu nome"
                        />
                      </div>

                      <div>
                        <label htmlFor="assunto" className="block text-sm font-medium text-gray-700 mb-1">
                          Assunto *
                        </label>
                        <select
                          id="assunto"
                          required
                          value={formData.assunto}
                          onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                        >
                          <option value="">Selecione um assunto</option>
                          <option value="Compra de veículo">Compra de veículo</option>
                          <option value="Venda de veículo">Venda de veículo</option>
                          <option value="Financiamento">Financiamento</option>
                          <option value="Agendamento de test drive">Agendamento de test drive</option>
                          <option value="Dúvidas">Dúvidas</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">
                          Mensagem *
                        </label>
                        <textarea
                          id="mensagem"
                          rows={5}
                          required
                          value={formData.mensagem}
                          onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                          placeholder="Digite sua mensagem aqui..."
                        ></textarea>
                      </div>

                      <div className="flex items-start">
                        <input
                          id="termos"
                          name="termos"
                          type="checkbox"
                          required
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="termos" className="ml-3 text-sm text-gray-600">
                          Concordo com a{' '}
                          <a href="#" className="text-green-600 hover:text-green-800">
                            Política de Privacidade
                          </a>{' '}
                          e autorizo o contato por telefone e e-mail.
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all hover:shadow-lg"
                      >
                        ENVIAR MENSAGEM
                      </button>

                      <p className="text-sm text-gray-500 text-center">* Campos obrigatórios</p>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Perguntas Frequentes */}
            <div className="mt-16">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">PERGUNTAS FREQUENTES</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Tire suas dúvidas sobre a compra de veículos na AUTOFLIX MULTIMARCAS, a melhor revenda de carros em Curitiba.
                </p>
              </div>

              <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="space-y-4">
                    {faqItems.map((item, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <button
                          onClick={() => setActiveQuestion(activeQuestion === index ? null : index)}
                          className="flex w-full justify-between items-center text-left hover:text-green-600 transition-colors"
                        >
                          <h3 className="text-lg font-medium text-gray-900">{item.pergunta}</h3>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${activeQuestion === index ? 'rotate-180' : ''}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {activeQuestion === index && (
                          <div className="mt-3 pl-4 border-l-2 border-green-200 text-gray-600">
                            <p>{item.resposta}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
