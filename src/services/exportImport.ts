import { AppSettings, Batch, DrawLogEntry, Item, WorkspaceBackup } from '../types';

export const DataExportImport = {
  exportToJSON(items: Item[], filename = 'rndmz-items.json') {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  exportToCSV(items: Item[], filename = 'rndmz-items.csv') {
    const headers = ['ID', 'Text', 'Category', 'Weight'];
    const rows = items.map((it) => [
      `"${it.id.replace(/"/g, '""')}"`,
      `"${it.text.replace(/"/g, '""')}"`,
      `"${(it.category || 'General').replace(/"/g, '""')}"`,
      it.weight ?? 1,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportWorkspace(
    batches: Batch[],
    settings: AppSettings,
    drawLogs: DrawLogEntry[],
    filename = `rndmz-backup-${new Date().toISOString().slice(0, 10)}.json`
  ) {
    const backupData: WorkspaceBackup = {
      version: 1,
      exportedAt: Date.now(),
      batches,
      settings,
      drawLogs,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  parseWorkspaceBackup(file: File): Promise<WorkspaceBackup> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (!parsed || typeof parsed !== 'object') {
            throw new Error('Invalid JSON structure');
          }
          if (!Array.isArray(parsed.batches) || parsed.batches.length === 0) {
            throw new Error('Backup must contain at least one valid batch');
          }

          // Validate and sanitize batches
          const sanitizedBatches: Batch[] = parsed.batches.map((b: unknown, idx: number) => {
            const batchObj = b as Partial<Batch>;
            return {
              id: String(batchObj.id || `batch-${Date.now()}-${idx}`),
              name: String(batchObj.name || `Batch ${idx + 1}`),
              items: Array.isArray(batchObj.items)
                ? batchObj.items.map((it: unknown, itIdx: number) => {
                    const itemObj = it as Partial<Item>;
                    return {
                      id: String(itemObj.id || `${Date.now()}-${itIdx}`),
                      text: String(itemObj.text || '').trim(),
                      category: String(itemObj.category || 'General').trim(),
                      weight: Math.max(1, Number(itemObj.weight) || 1),
                    };
                  }).filter((it) => it.text.length > 0)
                : [],
              drawnIds: Array.isArray(batchObj.drawnIds) ? batchObj.drawnIds.map(String) : [],
              createdAt: Number(batchObj.createdAt) || Date.now(),
            };
          });

          resolve({
            version: Number(parsed.version) || 1,
            exportedAt: Number(parsed.exportedAt) || Date.now(),
            batches: sanitizedBatches,
            settings: parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : undefined,
            drawLogs: Array.isArray(parsed.drawLogs) ? parsed.drawLogs : undefined,
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read backup file'));
      reader.readAsText(file);
    });
  },

  parseImportedFile(file: File): Promise<Item[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (file.name.endsWith('.json')) {
            const parsed = JSON.parse(content);
            if (!Array.isArray(parsed)) throw new Error('JSON root must be an array of items');
            const items: Item[] = parsed.map((item, idx) => ({
              id: item.id || `${Date.now()}-${idx}`,
              text: String(item.text || item.name || '').trim(),
              category: String(item.category || 'General').trim(),
              weight: Number(item.weight) > 0 ? Number(item.weight) : 1,
            })).filter((it) => it.text.length > 0);
            resolve(items);
          } else if (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text')) {
            const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
            if (lines.length === 0) resolve([]);

            const items: Item[] = [];
            const startIndex = lines[0].toLowerCase().includes('text') || lines[0].toLowerCase().includes('name') ? 1 : 0;

            for (let i = startIndex; i < lines.length; i++) {
              // Parse simple CSV line handling quotes
              const cols = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
              if (cols.length === 1 && cols[0]) {
                items.push({
                  id: `${Date.now()}-${i}`,
                  text: cols[0],
                  category: 'General',
                  weight: 1,
                });
              } else if (cols.length >= 2) {
                const text = cols[1] && isNaN(Number(cols[1])) ? cols[1] : cols[0];
                const category = cols[2] || (cols[1] && isNaN(Number(cols[1])) ? 'General' : cols[1]) || 'General';
                const weight = Number(cols[3]) || 1;
                items.push({
                  id: `${Date.now()}-${i}`,
                  text,
                  category,
                  weight,
                });
              }
            }
            resolve(items);
          } else {
            reject(new Error('Unsupported file format. Please upload .json or .csv.'));
          }
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};
