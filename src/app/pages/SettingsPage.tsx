/**
 * Settings Page
 * 
 * App configuration and preferences.
 */

import { TagColorPicker } from '@app/components/ticket/TagColorPicker';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Trash2, Download, Upload } from 'lucide-react';
import { useExport } from '@app/hooks/useExport';
import { toast } from 'sonner';

export function SettingsPage() {
  const { exportDatabaseAsJSON, downloadAsFile, loading } = useExport();

  const clearDatabase = () => {
    if (!confirm('Are you sure? All data will be lost!')) return;
    
    localStorage.clear();
    window.location.reload();
  };

  const exportAllData = async () => {
    try {
      toast.info('Exportando banco de dados...');
      const json = await exportDatabaseAsJSON();
      const filename = `standupmate-backup-${new Date().toISOString().split('T')[0]}.json`;
      downloadAsFile(json, filename);
      toast.success('Backup exportado com sucesso!');
    } catch (error) {
      console.error('Failed to export backup:', error);
      toast.error('Erro ao exportar backup: ' + (error as Error).message);
    }
  };

  const importBackup = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;
      
      try {
        // Read file content
        const text = await file.text();
        const backupData = JSON.parse(text);
        
        // Validate backup structure
        if (typeof backupData !== 'object' || backupData === null) {
          alert('Invalid backup file format!');
          return;
        }
        
        // Confirm with user
        if (!confirm('Replace current database with backup? All current data will be lost!')) {
          return;
        }
        
        // Restore data to localStorage
        if (backupData.database) {
          localStorage.setItem('standupmate-db', backupData.database);
        }
        if (backupData.tagColors) {
          localStorage.setItem('tag-colors', backupData.tagColors);
        }
        if (backupData.filterPresets) {
          localStorage.setItem('filter-presets', backupData.filterPresets);
        }
        
        // Reload page to apply changes
        window.location.reload();
      } catch (error) {
        console.error('Failed to import backup:', error);
        alert('Failed to import backup. Please check the file format.');
      }
    };
    
    // Trigger file selection
    input.click();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Customize your experience</p>
      </div>

      <div className="space-y-6 w-full max-w-full">
        {/* Tag Colors */}
        <TagColorPicker />

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export Backup</p>
                <p className="text-sm text-muted-foreground">
                  Download all data as JSON
                </p>
              </div>
              <Button variant="outline" onClick={exportAllData} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                {loading ? 'Exporting...' : 'Export'}
              </Button>
            </div>

            <div className="border-t border-border pt-3" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Import Backup</p>
                <p className="text-sm text-muted-foreground">
                  Upload and restore backup file
                </p>
              </div>
              <Button variant="outline" onClick={importBackup}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>

            <div className="border-t border-border pt-3" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">Clear Database</p>
                <p className="text-sm text-muted-foreground">
                  Remove all tickets and templates
                </p>
              </div>
              <Button variant="outline" onClick={clearDatabase} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Version</dt>
                <dd className="font-medium">1.0.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Architecture</dt>
                <dd className="font-medium">Hexagonal (Ports & Adapters)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Storage</dt>
                <dd className="font-medium">SQLite (via sql.js)</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

