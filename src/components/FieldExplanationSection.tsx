'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Copy, Info, Eye, EyeOff, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAI } from '@/context/AIContext';

interface FieldExplanation {
  path: string;
  type: string;
  description: string;
  level: number;
  children?: FieldExplanation[];
}

export default function FieldExplanationSection() {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set(['root']));
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const { data, isLoading, error } = useAI();

  // 将平铺的字段数据转换为树形结构
  const fieldExplanations: FieldExplanation[] = useMemo(() => {
    if (!data?.fields) return [];

    // 计算字段层级
    const convertToTree = (fields: Array<{ path: string; type: string; description: string }>) => {
      return fields.map(field => ({
        ...field,
        level: field.path.split('.').length - 1
      }));
    };

    return convertToTree(data.fields);
  }, [data?.fields]);

  // 递归收集所有字段路径的函数
  const getAllFieldPaths = (fields: FieldExplanation[]): string[] => {
    return fields.map(field => field.path);
  };

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFields(newExpanded);
  };

  const copyFieldPath = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopySuccess(path);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      string: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      number: 'bg-blue-100 text-blue-800 border-blue-200',
      boolean: 'bg-purple-100 text-purple-800 border-purple-200',
      object: 'bg-orange-100 text-orange-800 border-orange-200',
      array: 'bg-rose-100 text-rose-800 border-rose-200',
      'array<string>': 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 全部展开功能 - 展开所有字段
  const expandAll = () => {
    const allPaths = getAllFieldPaths(fieldExplanations);
    setExpandedFields(new Set(allPaths));
  };

  // 全部收缩功能 - 只保留根级别
  const collapseAll = () => {
    setExpandedFields(new Set(['root']));
  };

  const renderField = (field: FieldExplanation, index: number) => {
    const isExpanded = expandedFields.has(field.path);
    const hasChildren = field.children && field.children.length > 0;
    const indentLevel = field.level;

    return (
      <div
        key={field.path}
        className={`border border-gray-200 rounded-lg mb-3 overflow-hidden transition-all duration-200 hover:shadow-md ${
          isExpanded ? 'bg-blue-50 border-blue-200' : 'bg-white'
        }`}
      >
        <div 
          className={`p-4 cursor-pointer flex items-center justify-between group ${
            isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => hasChildren && toggleExpanded(field.path)}
          style={{ paddingLeft: `${16 + indentLevel * 20}px` }}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {hasChildren && (
              isExpanded ? 
                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" /> :
                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded border truncate">
                  {field.path}
                </code>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(field.type)}`}>
                  {field.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {field.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyFieldPath(field.path);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
              title="复制字段路径"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {copySuccess === field.path && (
          <div className="px-4 pb-2">
            <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-2 py-1 inline-block">
              路径已复制!
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading 状态
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">字段解释</h3>
            <p className="text-sm text-gray-600 mt-1">AI 正在分析 JSON 结构中的每个字段含义</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">正在分析字段含义...</p>
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
            <h3 className="text-xl font-semibold text-gray-900">字段解释</h3>
            <p className="text-sm text-gray-600 mt-1">AI 分析字段含义时出现错误</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">分析失败</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 无数据状态
  if (!data?.fields || fieldExplanations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">字段解释</h3>
            <p className="text-sm text-gray-600 mt-1">AI 将智能解析 JSON 结构中的每个字段含义</p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">字段解释</h3>
          <p className="text-sm text-gray-600 mt-1">
            AI 智能解析的 {fieldExplanations.length} 个字段含义，点击字段可查看详细信息
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={expandAll}
            className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Eye className="w-4 h-4 mr-1" />
            全部展开
          </button>
          <button
            onClick={collapseAll}
            className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <EyeOff className="w-4 h-4 mr-1" />
            全部收起
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">智能解析说明</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              以下字段解释由 AI 根据字段名称、数据类型和上下文语义智能推理生成。
              每个字段都包含路径、类型和详细的含义说明，帮助您快速理解 JSON 结构。
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {fieldExplanations.map((field, index) => renderField(field, index))}
      </div>

      {fieldExplanations.length > 10 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            共 {fieldExplanations.length} 个字段 • 已全部显示
          </p>
        </div>
      )}
    </div>
  );
} 