/**
 * Templates Page
 * 
 * Manage form templates.
 * Connected with useTemplates hook.
 */

import { Plus, Star, Copy, Download, Trash2, Edit, Upload, Layout, Store, MoreVertical, Search, Eye, GitBranch } from 'lucide-react';
import { useState } from 'react';
import { useTemplates } from '@app/hooks/useTemplates';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { toast } from 'sonner';
import { ImportTemplateModal } from '@app/components/template/ImportTemplateModal';
import { TemplateMarketplace } from '@app/components/template/TemplateMarketplace';
import { TemplatePreviewModal } from '@app/components/template/TemplatePreviewModal';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@app/components/ui/empty';
import { Skeleton } from '@app/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { Input } from '@app/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@app/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@app/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Label } from '@app/components/ui/label';
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
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string } | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [duplicateName, setDuplicateName] = useState('');
  
  const { 
    templates, 
    loading, 
    setAsDefault,
    duplicateTemplate,
    deleteTemplate,
    exportToJSON,
    createNewVersion,
    createTemplate,
  } = useTemplates();

  // Filtrar templates baseado na busca
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSetDefault = async (id: string) => {
    try {
      await setAsDefault(id);
      toast.success('Template set as default.');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const openDuplicateDialog = (id: string, name: string) => {
    setSelectedTemplate({ id, name });
    setDuplicateName(`${name} (copy)`);
    setDuplicateDialogOpen(true);
  };

  const handleDuplicate = async () => {
    if (!selectedTemplate || !duplicateName.trim()) return;

    try {
      await duplicateTemplate(selectedTemplate.id, duplicateName);
      toast.success('Template duplicated successfully.');
      setDuplicateDialogOpen(false);
      setDuplicateName('');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleCreateNewVersion = async (id: string, name: string) => {
    try {
      const newVersion = await createNewVersion(id);
      toast.success(`New version ${newVersion.version} of "${name}" created successfully.`);
      // Redirect to edit the new version
      window.location.href = `/templates/builder/${newVersion.id}`;
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
      toast.success('Template exported successfully.');
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
      toast.success('Template deleted successfully.');
      setDeleteDialogOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const openPreviewModal = (template: any) => {
    setPreviewTemplate(template);
    setPreviewModalOpen(true);
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
                ? `Manage your ${templates.length} template${templates.length > 1 ? 's' : ''}`
                : 'Manage form templates'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => window.location.href = '/templates/builder/new'}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="my-templates" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-templates">
              <Layout className="w-4 h-4 mr-2" />
              My Templates
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
                  placeholder="Search templates..."
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
                title="No templates found"
                description="Create your first template to start customizing your tickets."
                action={{
                  label: 'Create Template',
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
                                <TooltipContent>Default template</TooltipContent>
                              </Tooltip>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1.5 line-clamp-2">
                            {template.description || 'No description'}
                          </CardDescription>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => openPreviewModal(template)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.location.href = `/templates/builder/${template.id}`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCreateNewVersion(template.id, template.name)}>
                              <GitBranch className="w-4 h-4 mr-2" />
                              Criar Nova Versão
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDuplicateDialog(template.id, template.name)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicar Template
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!template.isDefault && (
                              <DropdownMenuItem onClick={() => handleSetDefault(template.id)}>
                                <Star className="w-4 h-4 mr-2" />
                                Set as default
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleExport(template.id, template.name)}>
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(template.id, template.name)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
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
                          {template.sections.length} {template.sections.length === 1 ? 'section' : 'sections'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.getTotalFieldCount()} {template.getTotalFieldCount() === 1 ? 'field' : 'fields'}
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
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or create a new template.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="mt-6">
            <TemplateMarketplace onTemplateCreated={createTemplate} />
          </TabsContent>
        </Tabs>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the template "{selectedTemplate?.name}"? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Duplicate Dialog */}
        <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicate Template</DialogTitle>
              <DialogDescription>
                Enter the name for the duplicated template.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  placeholder="Template name..."
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
                Cancel
              </Button>
              <Button onClick={handleDuplicate} disabled={!duplicateName.trim()}>
                Duplicate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Modal */}
        {showImportModal && <ImportTemplateModal onClose={() => setShowImportModal(false)} />}
        
        {/* Preview Modal */}
        {previewTemplate && (
          <TemplatePreviewModal 
            template={previewTemplate} 
            open={previewModalOpen} 
            onOpenChange={setPreviewModalOpen} 
          />
        )}
      </div>
    </TooltipProvider>
  );
}

