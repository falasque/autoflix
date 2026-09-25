import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { testXmlConnection } from '@/lib/xml-test-service';
import { forceSyncVehicles, getSyncInfo, clearVehicleCache } from '@/lib/xml-service';
import ConnectionStatus from '@/components/ConnectionStatus';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  LogOut, 
  Save, 
  RotateCcw, 
  Palette, 
  MapPin, 
  Phone, 
  Mail,
  Globe,
  Image as ImageIcon,
  Database,
  CheckCircle,
  XCircle,
  BarChart3,
  Target
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

const AdminDashboard: React.FC = () => {
  const { logout } = useAdminAuth();
  const { config, updateConfig, resetConfig } = useSiteConfig();
  const navigate = useNavigate();
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [formData, setFormData] = useState(config);
  const [xmlTestStatus, setXmlTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [xmlTestMessage, setXmlTestMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [syncInfo, setSyncInfo] = useState(() => getSyncInfo());

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleSave = () => {
    updateConfig(formData);
    alert('Configurações salvas com sucesso!');
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar todas as configurações para o padrão?')) {
      resetConfig();
      setFormData(config);
      alert('Configurações resetadas com sucesso!');
    }
  };

  const handleForceSync = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Sincronizando dados do XML...');
    
    try {
      const vehicles = await forceSyncVehicles();
      setSyncStatus('success');
      setSyncMessage(`Sincronização concluída! ${vehicles.length} veículos atualizados.`);
      setSyncInfo(getSyncInfo());
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage(`Erro na sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleClearCache = () => {
    if (confirm('Tem certeza que deseja limpar o cache de veículos? Isso forçará uma nova sincronização na próxima visualização.')) {
      clearVehicleCache();
      setSyncInfo(null);
      alert('Cache limpo com sucesso!');
    }
  };

  const updateFormData = (path: string, value: any) => {
    const keys = path.split('.');
    const newData = { ...formData };
    let current = newData as any;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setFormData(newData);
  };

  const testXmlUrl = async () => {
    if (!formData.xmlUrl) {
      setXmlTestStatus('error');
      setXmlTestMessage('Por favor, insira uma URL do XML primeiro.');
      return;
    }

    setXmlTestStatus('testing');
    setXmlTestMessage('Testando conexão com múltiplos proxies...');

    try {
      const result = await testXmlConnection(formData.xmlUrl);
      
      if (result.success) {
        setXmlTestStatus('success');
        setXmlTestMessage(result.message);
      } else {
        setXmlTestStatus('error');
        setXmlTestMessage(result.message);
      }
    } catch (error: any) {
      setXmlTestStatus('error');
      setXmlTestMessage(`Erro inesperado: ${error.message}`);
    }
  };

  const ColorPickerField = ({ label, colorKey, value }: { label: string, colorKey: string, value: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center space-x-2">
        <div 
          className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => setActiveColorPicker(activeColorPicker === colorKey ? null : colorKey)}
        />
        <Input
          value={value}
          onChange={(e) => updateFormData(`colors.${colorKey}`, e.target.value)}
          className="flex-1"
        />
      </div>
      {activeColorPicker === colorKey && (
        <div className="absolute z-10 mt-2">
          <HexColorPicker
            color={value}
            onChange={(color) => updateFormData(`colors.${colorKey}`, color)}
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => setActiveColorPicker(null)}
          >
            Fechar
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-green-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/logobranco.svg" 
                  alt="Autoflix" 
                  className="h-8 w-auto filter brightness-0"
                />
                <div className="h-8 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Dashboard Admin
                  </h1>
                  <p className="text-xs text-gray-500">Painel de Controle</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="hidden sm:flex items-center border-2 hover:bg-gray-50"
              >
                <Globe className="h-4 w-4 mr-2" />
                Ver Site
              </Button>
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Dashboard! 👋</h2>
            <p className="text-green-100">Gerencie seu site, visualize estatísticas e configure tudo em um só lugar.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button 
            onClick={handleSave} 
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            size="lg"
          >
            <Save className="h-5 w-5 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-2 bg-white/50 p-2 rounded-xl backdrop-blur-sm border-2 border-gray-200">
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg transition-all"
            >
              📊 Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="general"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg transition-all"
            >
              Geral
            </TabsTrigger>
            <TabsTrigger 
              value="contact"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg transition-all"
            >
              Contato
            </TabsTrigger>
            <TabsTrigger 
              value="colors"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg transition-all"
            >
              Cores
            </TabsTrigger>
            <TabsTrigger 
              value="hero"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg transition-all"
            >
              Hero
            </TabsTrigger>
            <TabsTrigger 
              value="social"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg transition-all"
            >
              Social
            </TabsTrigger>
            <TabsTrigger 
              value="data"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold rounded-lg transition-all"
            >
              Dados
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab - Principal */}
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
                <CardDescription>Configure as informações básicas do site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nome do Site</Label>
                    <Input
                      id="siteName"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo">URL do Logo</Label>
                    <Input
                      id="logo"
                      value={formData.logo || ''}
                      onChange={(e) => updateFormData('logo', e.target.value)}
                      placeholder="https://exemplo.com/logo.svg"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recursos/Diferenciais</Label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...formData.features];
                          newFeatures[index] = e.target.value;
                          updateFormData('features', newFeatures);
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newFeatures = formData.features.filter((_, i) => i !== index);
                          updateFormData('features', newFeatures);
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => updateFormData('features', [...formData.features, ''])}
                  >
                    Adicionar Recurso
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rua</Label>
                    <Input
                      value={formData.address.street}
                      onChange={(e) => updateFormData('address.street', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input
                        value={formData.address.city}
                        onChange={(e) => updateFormData('address.city', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input
                        value={formData.address.state}
                        onChange={(e) => updateFormData('address.state', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input
                        value={formData.address.zipCode}
                        onChange={(e) => updateFormData('address.zipCode', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>País</Label>
                      <Input
                        value={formData.address.country}
                        onChange={(e) => updateFormData('address.country', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={formData.contact.phone}
                      onChange={(e) => updateFormData('contact.phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={formData.contact.email}
                      onChange={(e) => updateFormData('contact.email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input
                      value={formData.contact.whatsapp || ''}
                      onChange={(e) => updateFormData('contact.whatsapp', e.target.value)}
                      placeholder="5511999999999"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Paleta de Cores
                </CardTitle>
                <CardDescription>Personalize as cores do seu site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                  <ColorPickerField 
                    label="Cor Primária" 
                    colorKey="primary" 
                    value={formData.colors.primary} 
                  />
                  <ColorPickerField 
                    label="Cor Secundária" 
                    colorKey="secondary" 
                    value={formData.colors.secondary} 
                  />
                  <ColorPickerField 
                    label="Cor de Destaque" 
                    colorKey="accent" 
                    value={formData.colors.accent} 
                  />
                  <ColorPickerField 
                    label="Cor de Fundo" 
                    colorKey="background" 
                    value={formData.colors.background} 
                  />
                  <ColorPickerField 
                    label="Cor do Texto" 
                    colorKey="foreground" 
                    value={formData.colors.foreground} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hero Tab */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Seção Principal (Hero)
                </CardTitle>
                <CardDescription>Configure a seção principal do site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título Principal</Label>
                  <Input
                    value={formData.hero.title}
                    onChange={(e) => updateFormData('hero.title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Textarea
                    value={formData.hero.subtitle}
                    onChange={(e) => updateFormData('hero.subtitle', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Imagem de Fundo (URL)</Label>
                  <Input
                    value={formData.hero.backgroundImage || ''}
                    onChange={(e) => updateFormData('hero.backgroundImage', e.target.value)}
                    placeholder="https://exemplo.com/hero-bg.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>Configure os links das redes sociais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input
                      value={formData.socialMedia.facebook || ''}
                      onChange={(e) => updateFormData('socialMedia.facebook', e.target.value)}
                      placeholder="https://facebook.com/suapagina"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input
                      value={formData.socialMedia.instagram || ''}
                      onChange={(e) => updateFormData('socialMedia.instagram', e.target.value)}
                      placeholder="https://instagram.com/seuusuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter</Label>
                    <Input
                      value={formData.socialMedia.twitter || ''}
                      onChange={(e) => updateFormData('socialMedia.twitter', e.target.value)}
                      placeholder="https://twitter.com/seuusuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn</Label>
                    <Input
                      value={formData.socialMedia.linkedin || ''}
                      onChange={(e) => updateFormData('socialMedia.linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/suaempresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input
                      value={formData.socialMedia.whatsapp || ''}
                      onChange={(e) => updateFormData('socialMedia.whatsapp', e.target.value)}
                      placeholder="https://wa.me/5511999999999"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Fontes de Dados
                </CardTitle>
                <CardDescription>Configure as URLs dos dados externos do site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="xmlUrl">URL do XML de Veículos</Label>
                    <div className="flex gap-2">
                      <Input
                        id="xmlUrl"
                        value={formData.xmlUrl || ''}
                        onChange={(e) => {
                          updateFormData('xmlUrl', e.target.value);
                          // Reset status quando URL mudar
                          setXmlTestStatus('idle');
                          setXmlTestMessage('');
                        }}
                        placeholder="https://exemplo.com/veiculos.xml"
                        className="font-mono text-sm flex-1"
                      />
                      <Button
                        variant="outline"
                        size="default"
                        onClick={testXmlUrl}
                        disabled={!formData.xmlUrl || xmlTestStatus === 'testing'}
                        className="min-w-[100px]"
                      >
                        {xmlTestStatus === 'testing' ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                            Testando
                          </>
                        ) : (
                          <>
                            <Database className="h-3 w-3 mr-2" />
                            Testar
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      URL do arquivo XML que contém os dados dos veículos. Este arquivo será usado para carregar o estoque automaticamente.
                    </p>
                  </div>

                  {/* Status do teste */}
                  {xmlTestStatus !== 'idle' && (
                    <div className={`p-3 rounded-lg border flex items-start gap-2 ${
                      xmlTestStatus === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-200'
                        : xmlTestStatus === 'error'
                        ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-200'
                        : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-200'
                    }`}>
                      {xmlTestStatus === 'success' && <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                      {xmlTestStatus === 'error' && <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                      {xmlTestStatus === 'testing' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mt-0.5 flex-shrink-0"></div>}
                      <span className="text-sm">{xmlTestMessage}</span>
                    </div>
                  )}
                  
                  {formData.xmlUrl && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">URL Atual Configurada:</h4>
                      <code className="text-xs bg-background px-2 py-1 rounded border break-all">
                        {formData.xmlUrl}
                      </code>
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(formData.xmlUrl, '_blank')}
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          Abrir no Navegador
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">
                      💡 Formato do XML
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      O arquivo XML deve conter os dados dos veículos no formato apropriado. O sistema sincroniza os dados automaticamente a cada 24 horas.
                    </p>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-800 dark:text-blue-200 font-medium">
                        Ver exemplo de estrutura XML
                      </summary>
                      <pre className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-900 dark:text-blue-100 overflow-x-auto">
{`<?xml version="1.0" encoding="UTF-8"?>
<veiculos>
  <veiculo>
    <id>1</id>
    <nome>Civic 2020</nome>
    <marca>Honda</marca>
    <modelo>Civic</modelo>
    <ano>2020</ano>
    <preco>85000</preco>
    <quilometragem>25000</quilometragem>
    <combustivel>Flex</combustivel>
    <cambio>Automático</cambio>
    <imagens>
      <imagem>url1.jpg</imagem>
      <imagem>url2.jpg</imagem>
    </imagens>
  </veiculo>
</veiculos>`}
                      </pre>
                    </details>
                  </div>

                  {/* Sistema de Sincronização */}
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Sistema de Cache Local</h3>
                    
                    <ConnectionStatus xmlUrl={formData.xmlUrl} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;