'use client';

import { useState } from 'react';
import { Copy, BookOpen, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAI } from '@/context/AIContext';

interface DocumentField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
  children?: DocumentField[];
}

export default function DocumentationSection() {
  const [viewMode, setViewMode] = useState<'table' | 'markdown'>('table');
  const [copySuccess, setCopySuccess] = useState(false);
  const { data, isLoading, error } = useAI();

  // 将字段数据转换为文档格式
  const convertToDocumentData = (): DocumentField[] => {
    if (!data?.fields) return [];
    
    const documentFields: DocumentField[] = [];
    const processedPaths = new Set<string>();
    
    data.fields.forEach(field => {
      const pathParts = field.path.split('.');
      let currentPath = '';
      
      pathParts.forEach((part, index) => {
        const fullPath = currentPath ? `${currentPath}.${part}` : part;
        
        if (!processedPaths.has(fullPath)) {
          processedPaths.add(fullPath);
          
          const fieldData = data.fields.find(f => f.path === fullPath);
          if (fieldData) {
            documentFields.push({
              name: part,
              type: fieldData.type,
              required: true, // 假设所有字段都是必填的
              description: fieldData.description,
              example: generateExample(fieldData.type)
            });
          }
        }
        
        currentPath = fullPath;
      });
    });
    
    return documentFields;
  };

  const generateExample = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'string': return '"示例文本"';
      case 'number': return '123';
      case 'boolean': return 'true';
      case 'array': return '[]';
      case 'object': return '{}';
      default: return `"${type}示例"`;
    }
  };

  const documentationData = convertToDocumentData();

  const generateMarkdown = () => {
    if (!data?.doc && !data?.summary) return '';
    
    let markdown = `# 接口文档

## 接口概述
${data.summary || ''}

## 字段说明

`;

    const renderFieldMarkdown = (fields: DocumentField[], level = 0) => {
      fields.forEach(field => {
        const indent = '  '.repeat(level);
        const required = field.required ? '**必填**' : '可选';
        const example = field.example ? ` \`${field.example}\`` : '';
        
        markdown += `${indent}- **${field.name}** (${field.type}) - ${required}\n`;
        markdown += `${indent}  ${field.description}${example}\n\n`;
        
        if (field.children) {
          renderFieldMarkdown(field.children, level + 1);
        }
      });
    };

    renderFieldMarkdown(documentationData);

    if (data.doc) {
      markdown += `\n## 详细说明\n\n${data.doc}\n`;
    }

    return markdown;
  };

  const copyToClipboard = async () => {
    try {
      const content = viewMode === 'markdown' ? generateMarkdown() : data?.doc || '';
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const flattenFields = (fields: DocumentField[], level = 0): Array<DocumentField & { level: number }> => {
    const result: Array<DocumentField & { level: number }> = [];
    
    fields.forEach(field => {
      result.push({ ...field, level });
      if (field.children) {
        result.push(...flattenFields(field.children, level + 1));
      }
    });
    
    return result;
  };

  // Loading 状态
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">接口文档</h3>
            <p className="text-sm text-gray-600 mt-1">AI 正在生成详细的接口说明文档</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">正在生成接口文档...</p>
            <p className="text-sm text-gray-500 mt-1">请稍等片刻</p>
          </div>
        </div>
      </div>
    );
  }

  // Error 状态
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">接口文档</h3>
            <p className="text-sm text-gray-600 mt-1">AI 生成接口文档时出现错误</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">生成失败</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 无数据状态
  if (!data?.doc && !data?.fields) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">接口文档</h3>
            <p className="text-sm text-gray-600 mt-1">AI 将自动生成标准化的接口说明文档</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">还没有分析数据</p>
            <p className="text-sm text-gray-500 mt-1">请先在上方输入 JSON 数据并点击"开始 AI 解析"</p>
          </div>
        </div>
      </div>
    );
  }

  const flatFields = flattenFields(documentationData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">接口文档</h3>
          <p className="text-sm text-gray-600 mt-1">AI 自动生成的标准化接口说明文档</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              表格视图
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'markdown'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Markdown
            </button>
          </div>
          <button
            onClick={copyToClipboard}
            className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              copySuccess 
                ? 'border-green-300 text-green-700 bg-green-50' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Copy className="w-4 h-4 mr-2" />
            {copySuccess ? '已复制!' : '复制文档'}
          </button>
        </div>
      </div>

      {/* AI 生成说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">AI 智能生成</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              以下接口文档由 AI 根据 JSON 结构和字段解释智能生成，
              包含完整的字段说明和使用示例，适合技术文档和团队协作。
            </p>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              字段详细说明
            </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    字段名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    必填
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    说明
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    示例
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flatFields.map((field, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div style={{ marginLeft: `${field.level * 20}px` }} className="flex items-center">
                          {field.level > 0 && (
                            <div className="w-4 h-px bg-gray-300 mr-2"></div>
                          )}
                          <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {field.name}
                          </code>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {field.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        field.required 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {field.required ? '必填' : '可选'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs break-words">
                        {field.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {field.example && (
                        <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {field.example}
                        </code>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Markdown 文档</h4>
          </div>
          <div className="p-6">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
              {generateMarkdown()}
            </pre>
          </div>
        </div>
      )}

      {/* AI 生成的详细文档 */}
      {data?.doc && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            AI 生成的详细说明
          </h4>
          <div className="text-emerald-800 leading-relaxed whitespace-pre-line">
            {data.doc}
          </div>
        </div>
      )}

      {/* 使用建议 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h4 className="text-md font-semibold text-amber-900 mb-4">💡 文档使用建议</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-amber-800">团队协作</h5>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 分享给前端和后端开发团队</li>
              <li>• 作为API设计和评审的参考</li>
              <li>• 用于新人培训和知识传递</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-amber-800">文档维护</h5>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 复制到 Wiki 或文档系统中</li>
              <li>• 定期更新保持同步</li>
              <li>• 结合实际业务场景完善</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
