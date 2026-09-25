import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Calendar, User } from 'lucide-react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

interface FinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleName: string;
  vehiclePrice: number;
  vehicleUrl: string;
}

export const FinanceModal: React.FC<FinanceModalProps> = ({
  isOpen,
  onClose,
  vehicleName,
  vehiclePrice,
  vehicleUrl
}) => {
  const { config } = useSiteConfig();
  const [formData, setFormData] = useState({
    nome: '',
    valorEntrada: '',
    parcelas: '48'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.currentTarget;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome) {
      alert('Por favor, preencha seu nome.');
      return;
    }

    const entrada = formData.valorEntrada || '0';

    const mensagem = `*💰 Solicitação de Financiamento*%0A%0A` +
      `*Veículo:* ${vehicleName}%0A` +
      `*Preço:* R$ ${vehiclePrice.toLocaleString('pt-BR')}%0A%0A` +
      `*Dados do Cliente:*%0A` +
      `*Nome:* ${formData.nome}%0A%0A` +
      `*Proposta:*%0A` +
      `*Entrada desejada:* R$ ${entrada}%0A` +
      `*Parcelamento desejado:* ${formData.parcelas}x%0A%0A` +
      `*Link do Veículo:* ${vehicleUrl}%0A%0A` +
      `_Aguardo retorno com as melhores condições de financiamento!_`;

    const phoneNumber = config.contact.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phoneNumber}?text=${mensagem}`, '_blank');

    setFormData({ nome: '', valorEntrada: '', parcelas: '48' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6" />
              <h2 className="text-xl font-bold">Simular Financiamento</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Fechar modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-white/90 mt-2">Preencha os dados e receba as melhores condições via WhatsApp</p>
        </div>

        {/* Informações do Veículo */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <img src="/ponto.png" alt="" className="w-3 h-3 mt-1" aria-hidden="true" />
            <div>
              <p className="text-sm text-gray-600 uppercase font-semibold">Veículo Selecionado</p>
              <p className="text-lg font-bold text-gray-900 uppercase">{vehicleName}</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                R$ {vehiclePrice.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <input type="hidden" id="finance-vehicle-price" value={vehiclePrice} />
          <input type="hidden" id="finance-vehicle-name" value={vehicleName} />
          <input type="hidden" id="finance-vehicle-url" value={vehicleUrl} />

          {/* Nome */}
          <div>
            <label htmlFor="nome" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User className="h-4 w-4 text-green-600" />
              Nome Completo *
            </label>
            <input
              type="text"
              id="nome"
              required
              value={formData.nome}
              onChange={handleChange}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all"
              placeholder="Digite seu nome completo"
            />
          </div>

          {/* Valor de Entrada */}
          <div>
            <label htmlFor="valorEntrada" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Valor de Entrada (Opcional)
            </label>
            <input
              type="text"
              id="valorEntrada"
              value={formData.valorEntrada}
              onChange={handleChange}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all"
              placeholder="R$ 5.000,00"
            />
            <p className="text-xs text-gray-500 mt-1">Quanto você pretende dar de entrada?</p>
          </div>

          {/* Parcelas */}
          <div>
            <label htmlFor="parcelas" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="h-4 w-4 text-green-600" />
              Parcelamento Desejado
            </label>
            <select
              id="parcelas"
              value={formData.parcelas}
              onChange={handleChange}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all cursor-pointer"
            >
              <option value="12">12x (1 ano)</option>
              <option value="24">24x (2 anos)</option>
              <option value="36">36x (3 anos)</option>
              <option value="48">48x (4 anos)</option>
              <option value="60">60x (5 anos)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Em quantas vezes você gostaria de pagar?</p>
          </div>

          {/* Aviso */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>📱 Próximo passo:</strong> Ao clicar em enviar, você será redirecionado para o WhatsApp com seus dados preenchidos. Nossa equipe retornará com as melhores condições de financiamento!
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Enviar para WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
