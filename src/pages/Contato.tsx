import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

const Contato = () => {
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16 md:pt-0">
        {/* Hero Section */}
        <section 
          className="text-white py-24 md:py-32 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
          }}
        >
          <div className="container text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Entre em Contato
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Estamos aqui para ajudar você a encontrar o carro dos seus sonhos
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Informações de Contato */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-8 text-gray-900">
                    Informações de Contato
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Telefone */}
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <Phone className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">Telefone</h3>
                        <p className="text-gray-600">{config.contact.phone}</p>
                        <Button asChild size="sm" className="mt-2">
                          <a href={`tel:${config.contact.phone.replace(/\D/g, '')}`}>
                            Ligar Agora
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    {config.contact.whatsapp && (
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-xl">
                          <FaWhatsapp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">WhatsApp</h3>
                          <p className="text-gray-600">Atendimento rápido e direto</p>
                          <Button asChild size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                            <a 
                              href={`https://wa.me/${config.contact.whatsapp}?text=Olá%2C+gostaria+de+mais+informações+sobre+os+veículos`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FaWhatsapp className="h-4 w-4 mr-2" />
                              Conversar no WhatsApp
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Endereço */}
                    <div className="flex items-start gap-4">
                      <div className="bg-orange-100 p-3 rounded-xl">
                        <MapPin className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">Endereço</h3>
                        <p className="text-gray-600">Rua Exemplo, 123 - Centro</p>
                        <Button asChild size="sm" variant="outline" className="mt-2">
                          <a 
                            href="https://maps.google.com/?q=Sua+Localização+Aqui"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Ver no Mapa
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Horário de Funcionamento */}
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-100 p-3 rounded-xl">
                        <Clock className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Horário de Funcionamento</h3>
                        <div className="space-y-1 text-gray-600">
                          <p><span className="font-medium">Segunda a Sexta:</span> 8:00 - 18:00</p>
                          <p><span className="font-medium">Sábado:</span> 8:00 - 16:00</p>
                          <p><span className="font-medium">Domingo:</span> Fechado</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulário de Contato */}
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Envie uma Mensagem
                </h2>
                
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Assunto
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="interesse">Interesse em veículo</option>
                      <option value="financiamento">Financiamento</option>
                      <option value="troca">Troca de veículo</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Conte-nos como podemos ajudar..."
                    ></textarea>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-3 text-lg font-semibold"
                    style={{ backgroundColor: config.colors.primary }}
                  >
                    Enviar Mensagem
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Mapas das Lojas */}
        <section className="py-16 bg-white">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900">
              Nossas Lojas
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Loja 1 */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-green-600" />
                  Loja 1 - Autoflix Multimarcas
                </h3>
                <div className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200" style={{ height: '400px' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3600.0096798395625!2d-49.28441942301325!3d-25.538054477493016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dcfb420f9a9ae1%3A0x5f86fd536f55637e!2sAutoflix%20Multimarcas%20Ve%C3%ADculos%20Seminovos!5e0!3m2!1spt-BR!2sbr!4v1761777686574!5m2!1spt-BR!2sbr"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização da Loja 1"
                  />
                </div>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <a 
                    href="https://maps.app.goo.gl/CTzzr2ozXy6xX33R9"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Como Chegar na Loja 1
                  </a>
                </Button>
              </div>

              {/* Loja 2 */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-green-600" />
                  Loja 2 - Autoflix Multimarcas
                </h3>
                <div className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200" style={{ height: '400px' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3599.9180128938156!2d-49.26381262301321!3d-25.541107777491202!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dcfb29433cd83b%3A0xef4353bb78dc3b!2sLoja%202%20Autoflix%20Multimarcas%20Seminovos%20Ve%C3%ADculos!5e0!3m2!1spt-BR!2sbr!4v1761777720909!5m2!1spt-BR!2sbr"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização da Loja 2"
                  />
                </div>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <a 
                    href="https://maps.app.goo.gl/zQ4bLpPR2WnJaHFJ6"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Como Chegar na Loja 2
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contato;