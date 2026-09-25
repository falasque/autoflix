import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { Calculator, Car, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaWhatsapp } from 'react-icons/fa';

const SimularFinanciamento = () => {
  const { config } = useSiteConfig();
  const [formData, setFormData] = useState({
    valor: '',
    entrada: '',
    parcelas: '12'
  });

  const [resultado, setResultado] = useState<{
    valorParcela: number;
    valorTotal: number;
    jurosTotal: number;
  } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    // Remove caracteres não numéricos e aplica formatação
    const numericValue = value.replace(/\D/g, '');
    
    if (field === 'valor' || field === 'entrada') {
      const formatted = numericValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const calcularFinanciamento = () => {
    const valor = parseFloat(formData.valor.replace(/\./g, ''));
    const entrada = parseFloat(formData.entrada.replace(/\./g, '')) || 0;
    const numeroParcelas = parseInt(formData.parcelas);
    
    if (valor && numeroParcelas) {
      const valorFinanciado = valor - entrada;
      // Taxa de juros simulada (2% ao mês)
      const taxaJuros = 0.02;
      
      // Cálculo da parcela usando fórmula de juros compostos
      const parcela = (valorFinanciado * taxaJuros * Math.pow(1 + taxaJuros, numeroParcelas)) / 
                     (Math.pow(1 + taxaJuros, numeroParcelas) - 1);
      
      const valorTotal = (parcela * numeroParcelas) + entrada;
      const jurosTotal = valorTotal - valor;
      
      setResultado({
        valorParcela: parcela,
        valorTotal: valorTotal,
        jurosTotal: jurosTotal
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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
              Simular Financiamento
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Descubra as melhores condições para comprar o seu carro
            </p>
          </div>
        </section>

        {/* Simulador */}
        <section className="py-16 bg-gray-50">
          <div className="container max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Formulário */}
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Calculator className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Simulador de Financiamento
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-2">
                      Valor do Veículo
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                      <input
                        type="text"
                        id="valor"
                        value={formData.valor}
                        onChange={(e) => handleInputChange('valor', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="50.000"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="entrada" className="block text-sm font-medium text-gray-700 mb-2">
                      Valor da Entrada (opcional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                      <input
                        type="text"
                        id="entrada"
                        value={formData.entrada}
                        onChange={(e) => handleInputChange('entrada', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10.000"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="parcelas" className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Parcelas
                    </label>
                    <select
                      id="parcelas"
                      value={formData.parcelas}
                      onChange={(e) => setFormData(prev => ({ ...prev, parcelas: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="12">12 meses</option>
                      <option value="18">18 meses</option>
                      <option value="24">24 meses</option>
                      <option value="36">36 meses</option>
                      <option value="48">48 meses</option>
                      <option value="60">60 meses</option>
                    </select>
                  </div>

                  <Button 
                    onClick={calcularFinanciamento}
                    className="w-full py-3 text-lg font-semibold"
                    style={{ backgroundColor: config.colors.primary }}
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    Calcular Financiamento
                  </Button>
                </div>
              </div>

              {/* Resultado */}
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Resultado da Simulação
                  </h2>
                </div>

                {resultado ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg text-blue-900">Valor da Parcela</h3>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatCurrency(resultado.valorParcela)}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        por {formData.parcelas} meses
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-1">Valor Total</h4>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(resultado.valorTotal)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-1">Juros Total</h4>
                        <p className="text-xl font-bold text-orange-600">
                          {formatCurrency(resultado.jurosTotal)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <p className="text-sm text-gray-600 mb-4">
                        *Simulação com taxa de 2% ao mês. Valores podem variar conforme análise de crédito.
                      </p>
                      
                      {config.contact.whatsapp && (
                        <Button 
                          asChild 
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <a 
                            href={`https://wa.me/${config.contact.whatsapp}?text=Olá%2C+fiz+uma+simulação+de+financiamento+e+gostaria+de+mais+informações.+Valor%3A+R%24+${formData.valor}%2C+Parcelas%3A+${formData.parcelas}x+de+${formatCurrency(resultado.valorParcela)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaWhatsapp className="h-5 w-5 mr-2" />
                            Falar com Consultor
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Preencha os dados acima e clique em "Calcular Financiamento" para ver o resultado
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Informações Importantes */}
            <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Informações Importantes
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">
                    Documentos Necessários
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• RG e CPF</li>
                    <li>• Comprovante de renda dos últimos 3 meses</li>
                    <li>• Comprovante de residência</li>
                    <li>• Referências pessoais e comerciais</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">
                    Vantagens do Financiamento
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Taxas competitivas</li>
                    <li>• Aprovação rápida</li>
                    <li>• Parcelas que cabem no seu bolso</li>
                    <li>• Atendimento personalizado</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SimularFinanciamento;