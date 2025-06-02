'use client';

import { useState } from 'react';
import { Copy, Code, ChevronDown, ChevronUp, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAI } from '@/context/AIContext';

export default function TypeScriptSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const { data, isLoading, error } = useAI();

  const copyToClipboard = async () => {
    if (!data?.typescript) return;
    
    try {
      await navigator.clipboard.writeText(data.typescript);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 分析 TypeScript 代码统计信息
  const getInterfaceStats = () => {
    if (!data?.typescript) return [];
    
    const interfaces = data.typescript.match(/interface\s+(\w+)/g) || [];
    return interfaces.map(match => {
      const name = match.replace('interface ', '');
      // 简单统计字段数（这只是估算）
      const interfaceContent = data.typescript.split(`interface ${name}`)[1]?.split('interface')[0] || '';
      const fieldCount = (interfaceContent.match(/:\s*[\w\[\]<>]+;/g) || []).length;
      return {
        name,
        fields: fieldCount,
        description: '根据 JSON 结构生成'
      };
    });
  };

  const interfaceStats = getInterfaceStats();

  // Loading 状态
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">TypeScript 类型定义</h3>
            <p className="text-sm text-gray-600 mt-1">AI 正在生成 TypeScript 接口定义</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">正在生成类型定义...</p>
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
            <h3 className="text-xl font-semibold text-gray-900">TypeScript 类型定义</h3>
            <p className="text-sm text-gray-600 mt-1">AI 生成类型定义时出现错误</p>
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
  if (!data?.typescript) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">TypeScript 类型定义</h3>
            <p className="text-sm text-gray-600 mt-1">AI 将自动生成 TypeScript 接口定义</p>
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
          <h3 className="text-xl font-semibold text-gray-900">TypeScript 类型定义</h3>
          <p className="text-sm text-gray-600 mt-1">AI 自动生成的 TypeScript 接口，包含详细注释</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={copyToClipboard}
            className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              copySuccess 
                ? 'border-green-300 text-green-700 bg-green-50' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Copy className="w-4 h-4 mr-2" />
            {copySuccess ? '已复制!' : '复制代码'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                折叠
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                展开
              </>
            )}
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
              以下 TypeScript 接口定义由 AI 根据 JSON 结构智能生成，
              包含完整的类型注解和中文注释，可直接用于项目开发。
            </p>
          </div>
        </div>
      </div>

      {/* Interface 统计 */}
      {interfaceStats.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <h4 className="text-sm font-medium text-emerald-900 mb-4 flex items-center">
            <Code className="w-4 h-4 mr-2" />
            生成的接口统计
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {interfaceStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-emerald-100">
                <div className="text-sm font-medium text-gray-900">{stat.name}</div>
                <div className="text-xs text-gray-600 mt-1">{stat.description}</div>
                <div className="text-xs text-emerald-600 mt-1">{stat.fields} 个字段</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 代码展示区 */}
      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">types.ts</span>
              <span className="text-xs text-gray-500">TypeScript 接口定义</span>
            </div>
          </div>
          <div className="relative">
            <SyntaxHighlighter
              language="typescript"
              style={tomorrow}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                background: '#fafafa',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
              showLineNumbers={true}
              lineNumberStyle={{
                color: '#9ca3af',
                fontSize: '12px',
                paddingRight: '1rem',
                minWidth: '3rem',
              }}
            >
              {data.typescript}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h4 className="text-sm font-medium text-amber-900 mb-3">💡 使用说明</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-amber-800">快速开始</h5>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 将代码保存为 <code className="bg-amber-100 px-1 rounded">types.ts</code> 文件</li>
              <li>• 在组件中导入类型：<code className="bg-amber-100 px-1 rounded">import type &#123; ... &#125;</code></li>
              <li>• 使用类型注解确保数据安全</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-amber-800">特性亮点</h5>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 完整的类型覆盖，包含嵌套结构</li>
              <li>• 详细的中文注释，提升可读性</li>
              <li>• 遵循 TypeScript 最佳实践</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 开发建议 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-sm font-medium text-blue-900 mb-3">🚀 开发建议</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-blue-800">类型安全</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 启用 TypeScript 严格模式</li>
              <li>• 使用类型守卫验证数据</li>
              <li>• 配置 ESLint 类型检查</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-blue-800">团队协作</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 与后端团队共享类型定义</li>
              <li>• 建立统一的命名规范</li>
              <li>• 定期更新接口文档</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 