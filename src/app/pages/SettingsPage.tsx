/**
 * Settings Page
 * 
 * App configuration and preferences.
 */

import { TagColorPicker } from '@app/components/ticket/TagColorPicker';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Trash2, Download } from 'lucide-react';

export function SettingsPage() {
  const clearDatabase = () => {
    if (!confirm('Are you sure? All data will be lost!')) return;
    
    localStorage.clear();
    window.location.reload();
  };

  const exportAllData = () => {
    const allData = {
      database: localStorage.getItem('ticket-tracker-db'),
      tagColors: localStorage.getItem('tag-colors'),
      filterPresets: localStorage.getItem('filter-presets'),
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
              <Button variant="outline" onClick={exportAllData}>
                <Download className="w-4 h-4 mr-2" />
                Export
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

