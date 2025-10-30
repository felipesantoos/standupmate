/**
 * Templates Page
 * 
 * Manage form templates.
 * Connected with useTemplates hook.
 */

import { Plus, Star, Copy, Download, Trash2, Edit, Upload, Layout, Store } from 'lucide-react';
import { useState } from 'react';
import { useTemplates } from '@app/hooks/useTemplates';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@app/components/ui/Card';
import { Button } from '@app/components/ui/Button';
import { useToast } from '@app/components/ui/Toast';
import { ImportTemplateModal } from '@app/components/template/ImportTemplateModal';
import { TemplateMarketplace } from '@app/components/template/TemplateMarketplace';
import { EmptyState } from '@app/components/ui/EmptyState';
import { SkeletonList } from '@app/components/ui/Skeleton';

export function TemplatesPage() {
  const toast = useToast();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  
  const { 
    templates, 
    defaultTemplate, 
    loading, 
    error,
    setAsDefault,
    duplicateTemplate,
    deleteTemplate,
    exportToJSON,
  } = useTemplates();

  const handleSetDefault = async (id: string) => {
    try {
      await setAsDefault(id);
      toast.success('Default set!', 'Template set as default.');
    } catch (err) {
      toast.error('Error', (err as Error).message);
    }
  };

  const handleDuplicate = async (id: string) => {
    const newName = prompt('Duplicated template name:');
    if (!newName) return;

    try {
      await duplicateTemplate(id, newName);
      toast.success('Duplicated!', 'Template duplicated successfully.');
    } catch (err) {
      toast.error('Error', (err as Error).message);
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
      toast.success('Exported!', 'Template exported successfully.');
    } catch (err) {
      toast.error('Error exporting', (err as Error).message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the template "${name}"?`)) {
      return;
    }

    try {
      await deleteTemplate(id);
      toast.success('Deleted!', 'Template removed successfully.');
    } catch (err) {
      toast.error('Error', (err as Error).message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates</h1>
          <p className="text-muted-foreground mt-2">
            {templates.length > 0
              ? `${templates.length} template${templates.length > 1 ? 's' : ''}`
              : 'Manage form templates'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowMarketplace(!showMarketplace)}>
            <Store className="w-5 h-5 mr-2" />
            Marketplace
          </Button>
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="w-5 h-5 mr-2" />
            Import JSON
          </Button>
          <Button onClick={() => window.location.href = '/templates/builder/new'}>
            <Plus className="w-5 h-5 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-6">
          <p className="font-medium">Error loading templates:</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && <SkeletonList count={2} />}

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

      {!loading && templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      {template.isDefault && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {template.description || 'Sem descrição'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>Version: {template.version}</p>
                    <p>Sections: {template.sections.length}</p>
                    <p>Fields: {template.getTotalFieldCount()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-border flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/templates/builder/${template.id}`}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>

                    {!template.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(template.id)}
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicate(template.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport(template.id, template.name)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(template.id, template.name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Marketplace */}
      {showMarketplace && (
        <div className="mb-8">
          <TemplateMarketplace />
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && <ImportTemplateModal onClose={() => setShowImportModal(false)} />}
    </div>
  );
}

