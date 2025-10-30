/**
 * Templates Page
 * 
 * Manage form templates.
 * Connected with useTemplates hook.
 */

import { Plus, Star, Copy, Download, Trash2, Edit, Upload, Layout, Store, MoreVertical, Search, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useTemplates } from '@app/hooks/useTemplates';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { toast } from 'sonner';
import { ImportTemplateModal } from '@app/components/template/ImportTemplateModal';
import { TemplateMarketplace } from '@app/components/template/TemplateMarketplace';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@app/components/ui/empty';
import { Skeleton } from '@app/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { Input } from '@app/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@app/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@app/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Label } from '@app/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@app/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/ui/tooltip';

interface EmptyStateProps {
  icon: any;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Icon className="h-12 w-12 text-muted-foreground" />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyContent>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
        {action && (
          <Button onClick={action.onClick} className="mt-4">
            {action.label}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}

export function TemplatesPage() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string } | null>(null);
  const [duplicateName, setDuplicateName] = useState('');
  
  const { 
    templates, 
    loading, 
    error,
    setAsDefault,
    duplicateTemplate,
    deleteTemplate,
    exportToJSON,
  } = useTemplates();

  // Filtrar templates baseado na busca
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSetDefault = async (id: string) => {
    try {
      await setAsDefault(id);
      toast.success('Template definido como padrão.');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const openDuplicateDialog = (id: string, name: string) => {
    setSelectedTemplate({ id, name });
    setDuplicateName(`${name} (cópia)`);
    setDuplicateDialogOpen(true);
  };

  const handleDuplicate = async () => {
    if (!selectedTemplate || !duplicateName.trim()) return;

    try {
      await duplicateTemplate(selectedTemplate.id, duplicateName);
      toast.success('Template duplicado com sucesso.');
      setDuplicateDialogOpen(false);
      setDuplicateName('');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleExport = async (id: string, name: string) => {
    try {
      const json = await exportToJSON(id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Template exportado com sucesso.');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const openDeleteDialog = (id: string, name: string) => {
    setSelectedTemplate({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    try {
      await deleteTemplate(selectedTemplate.id);
      toast.success('Template removido com sucesso.');
      setDeleteDialogOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
            <p className="text-muted-foreground mt-1">
              {templates.length > 0
                ? `Gerencie seus ${templates.length} template${templates.length > 1 ? 's' : ''}`
                : 'Gerencie templates de formulários'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button onClick={() => window.location.href = '/templates/builder/new'}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar templates</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs defaultValue="my-templates" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-templates">
              <Layout className="w-4 h-4 mr-2" />
              Meus Templates
            </TabsTrigger>
            <TabsTrigger value="marketplace">
              <Store className="w-4 h-4 mr-2" />
              Marketplace
            </TabsTrigger>
          </TabsList>

          {/* My Templates Tab */}
          <TabsContent value="my-templates" className="space-y-4 mt-6">
            {/* Search */}
            {templates.length > 0 && (
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            {/* Loading State */}
            {loading && <SkeletonList />}

            {/* Empty State */}
            {!loading && templates.length === 0 && (
              <EmptyState
                icon={Layout}
                title="Nenhum template encontrado"
                description="Crie seu primeiro template para começar a personalizar seus tickets."
                action={{
                  label: 'Criar Template',
                  onClick: () => (window.location.href = '/templates/builder/new'),
                }}
              />
            )}

            {/* Templates Grid */}
            {!loading && filteredTemplates.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <Card key={template.id} className="group hover:shadow-lg hover:border-primary/50 transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <span className="truncate">{template.name}</span>
                            {template.isDefault && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>Template padrão</TooltipContent>
                              </Tooltip>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1.5 line-clamp-2">
                            {template.description || 'Sem descrição'}
                          </CardDescription>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => window.location.href = `/templates/builder/${template.id}`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {!template.isDefault && (
                              <DropdownMenuItem onClick={() => handleSetDefault(template.id)}>
                                <Star className="w-4 h-4 mr-2" />
                                Definir como padrão
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openDuplicateDialog(template.id, template.name)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(template.id, template.name)}>
                              <Download className="w-4 h-4 mr-2" />
                              Exportar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(template.id, template.name)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          v{template.version}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.sections.length} {template.sections.length === 1 ? 'seção' : 'seções'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.getTotalFieldCount()} {template.getTotalFieldCount() === 1 ? 'campo' : 'campos'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && templates.length > 0 && filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar sua busca ou crie um novo template.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="mt-6">
            <TemplateMarketplace />
          </TabsContent>
        </Tabs>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o template "{selectedTemplate?.name}"? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Duplicate Dialog */}
        <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicar Template</DialogTitle>
              <DialogDescription>
                Digite o nome para o template duplicado.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Nome do Template</Label>
                <Input
                  id="template-name"
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  placeholder="Nome do template..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && duplicateName.trim()) {
                      handleDuplicate();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleDuplicate} disabled={!duplicateName.trim()}>
                Duplicar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Modal */}
        {showImportModal && <ImportTemplateModal onClose={() => setShowImportModal(false)} />}
      </div>
    </TooltipProvider>
  );
}

