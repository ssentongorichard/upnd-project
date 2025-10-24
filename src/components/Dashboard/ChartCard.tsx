import React, { useState } from 'react';
import { Info, Download, FileSpreadsheet, FileJson, Globe } from 'lucide-react';

interface ChartCardProps {
  title: string;
  data: any;
  type: 'bar' | 'line';
  onDataPointClick?: (key: string, value: number) => void;
}

type ExportFormat = 'pdf' | 'csv' | 'json' | 'html';

export function ChartCard({ title, data, type, onDataPointClick }: ChartCardProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleMouseEnter = (key: string, event: React.MouseEvent) => {
    setHoveredItem(key);
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const exportData = (format: ExportFormat) => {
    setShowExportMenu(false);

    if (format === 'csv') {
      let csvContent = '';
      if (type === 'bar' && typeof data === 'object' && !Array.isArray(data)) {
        csvContent = 'Category,Value\n';
        Object.entries(data).forEach(([key, value]) => {
          csvContent += `"${key}",${value}\n`;
        });
      } else if (type === 'line' && Array.isArray(data)) {
        csvContent = 'Month,Registrations\n';
        data.forEach(item => {
          csvContent += `${item.month},${item.registrations}\n`;
        });
      }
      const blob = new Blob([csvContent], { type: 'text/csv' });
      downloadFile(blob, `${title.toLowerCase().replace(/\s+/g, '-')}.csv`);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      downloadFile(blob, `${title.toLowerCase().replace(/\s+/g, '-')}.json`);
    } else if (format === 'html') {
      let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #C8102E; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #C8102E; color: white; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <table>
`;
      if (type === 'bar' && typeof data === 'object' && !Array.isArray(data)) {
        htmlContent += '    <tr><th>Category</th><th>Value</th></tr>\n';
        Object.entries(data).forEach(([key, value]) => {
          htmlContent += `    <tr><td>${key}</td><td>${value}</td></tr>\n`;
        });
      } else if (type === 'line' && Array.isArray(data)) {
        htmlContent += '    <tr><th>Month</th><th>Registrations</th></tr>\n';
        data.forEach(item => {
          htmlContent += `    <tr><td>${item.month}</td><td>${item.registrations}</td></tr>\n`;
        });
      }
      htmlContent += '  </table>\n</body>\n</html>';
      const blob = new Blob([htmlContent], { type: 'text/html' });
      downloadFile(blob, `${title.toLowerCase().replace(/\s+/g, '-')}.html`);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (type === 'bar' && typeof data === 'object' && !Array.isArray(data)) {
    const maxValue = Math.max(...Object.values(data) as number[]);
    const sortedEntries = Object.entries(data).sort(([, a], [, b]) => (b as number) - (a as number));

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-upnd-red hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-upnd-black">{title}</h3>
          <div className="flex items-center space-x-2">
            <button
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Information"
            >
              <Info className="w-4 h-4 text-gray-500" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Export data"
              >
                <Download className="w-4 h-4 text-gray-500" />
              </button>
              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1">
                    <button
                      onClick={() => exportData('csv')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={() => exportData('json')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FileJson className="w-4 h-4 text-blue-600" />
                      <span>Export JSON</span>
                    </button>
                    <button
                      onClick={() => exportData('html')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Globe className="w-4 h-4 text-orange-600" />
                      <span>Export HTML</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedEntries.map(([key, value]) => {
            const percentage = ((value as number) / maxValue) * 100;
            const isHovered = hoveredItem === key;

            return (
              <div
                key={key}
                className="flex items-center space-x-3 group"
                onMouseEnter={(e) => handleMouseEnter(key, e)}
                onMouseLeave={handleMouseLeave}
                onClick={() => onDataPointClick?.(key, value as number)}
              >
                <div className="w-24 text-sm font-medium text-gray-700 truncate" title={key}>
                  {key}
                </div>
                <div className="flex-1 relative">
                  <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHovered
                          ? 'bg-gradient-to-r from-upnd-red-dark to-upnd-yellow-dark'
                          : 'bg-gradient-to-r from-upnd-red to-upnd-yellow'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  {isHovered && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-upnd-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      {key}: {value} members ({percentage.toFixed(1)}%)
                    </div>
                  )}
                </div>
                <div className="text-sm font-semibold text-upnd-black w-12 text-right">
                  {value as number}
                </div>
                <div className="text-xs text-gray-500 w-12 text-right">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'line' && Array.isArray(data)) {
    const maxValue = Math.max(...data.map(item => item.registrations));

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-upnd-yellow hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-upnd-black">{title}</h3>
          <div className="flex items-center space-x-2">
            <button
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Information"
            >
              <Info className="w-4 h-4 text-gray-500" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Export data"
              >
                <Download className="w-4 h-4 text-gray-500" />
              </button>
              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1">
                    <button
                      onClick={() => exportData('csv')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={() => exportData('json')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FileJson className="w-4 h-4 text-blue-600" />
                      <span>Export JSON</span>
                    </button>
                    <button
                      onClick={() => exportData('html')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Globe className="w-4 h-4 text-orange-600" />
                      <span>Export HTML</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="flex items-end space-x-3 h-48 px-2 min-w-max pb-2">
            {data.map((item, index) => {
              const height = (item.registrations / maxValue) * 100;
              const isHovered = hoveredItem === item.month;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center group relative"
                  style={{ minWidth: '70px' }}
                  onMouseEnter={(e) => handleMouseEnter(item.month, e)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => onDataPointClick?.(item.month, item.registrations)}
                >
                  <div className="relative w-full flex items-end justify-center">
                    <div
                      className={`w-full rounded-t transition-all duration-500 cursor-pointer ${
                        isHovered
                          ? 'bg-gradient-to-t from-upnd-red to-upnd-red-light'
                          : 'bg-gradient-to-t from-upnd-yellow to-upnd-yellow-light'
                      }`}
                      style={{
                        height: `${height}%`,
                        minHeight: '12px'
                      }}
                    >
                      {isHovered && (
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-upnd-black text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap z-10">
                          {item.month}: {item.registrations} registrations
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-700 mt-3">{item.month}</div>
                  <div className={`text-xs font-semibold mt-1 transition-colors ${
                    isHovered ? 'text-upnd-red' : 'text-gray-500'
                  }`}>
                    {item.registrations}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-200 mt-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-300">
      <h3 className="text-lg font-semibold text-upnd-black mb-4">{title}</h3>
      <p className="text-gray-500">No data available</p>
    </div>
  );
}
