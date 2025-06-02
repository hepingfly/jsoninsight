'use client';

import { Copy, Lightbulb, CheckCircle, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAI } from '@/context/AIContext';
import { useState } from 'react';

export default function StructureSummarySection() {
  const [copySuccess, setCopySuccess] = useState(false);
  const { data, isLoading, error } = useAI();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const copyFullSummary = () => {
    if (!data?.summary) return;
    
    const fullText = `
# JSON 结构总结

## 概述
${data.summary}

## 技术说明
• AI 智能分析生成，基于字段语义和结构特征
• 自动识别数据模式和业务场景
• 提供结构化的技术文档建议
    `.trim();
    
    copyToClipboard(fullText);
  };

  // Loading 状态
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">JSON 结构总结</h3>
            <p className="text-sm text-gray-600 mt-1">AI 正在分析 JSON 的整体结构和业务场景</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">正在生成结构总结...</p>
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
            <h3 className="text-xl font-semibold text-gray-900">JSON 结构总结</h3>
            <p className="text-sm text-gray-600 mt-1">AI 分析结构总结时出现错误</p>
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
  if (!data?.summary) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">JSON 结构总结</h3>
            <p className="text-sm text-gray-600 mt-1">AI 将智能分析 JSON 的整体结构和业务场景</p>
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
          <h3 className="text-xl font-semibold text-gray-900">JSON 结构总结</h3>
          <p className="text-sm text-gray-600 mt-1">AI 智能生成的结构概述和业务场景分析</p>
        </div>
        <button 
          onClick={copyFullSummary}
          className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors cursor-pointer ${
            copySuccess 
              ? 'border-green-300 text-green-700 bg-green-50' 
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          <Copy className="w-4 h-4 mr-2" />
          {copySuccess ? '已复制!' : '复制总结'}
        </button>
      </div>

      {/* AI 生成说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">AI 智能分析</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              以下总结由 AI 根据 JSON 结构特征、字段语义和数据模式智能生成，
              帮助您快速理解数据的业务场景和技术特点。
            </p>
          </div>
        </div>
      </div>

      {/* 主要总结 */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-semibold text-emerald-900 mb-3">结构总结</h4>
            <p className="text-emerald-800 leading-relaxed whitespace-pre-line">{data.summary}</p>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          数据统计
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{data.fields?.length || 0}</div>
            <div className="text-sm text-blue-700 font-medium">解析字段数</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {data.typescript ? data.typescript.split('interface').length - 1 : 0}
            </div>
            <div className="text-sm text-green-700 font-medium">生成接口数</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {Math.max(...(data.fields?.map(f => f.path.split('.').length) || [0]))}
            </div>
            <div className="text-sm text-orange-700 font-medium">最大嵌套层级</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(data.fields?.map(f => f.type) || []).size}
            </div>
            <div className="text-sm text-purple-700 font-medium">数据类型数</div>
          </div>
        </div>
      </div>

      {/* 使用建议 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h4 className="text-md font-semibold text-amber-900 mb-4">💡 使用建议</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-amber-800">开发建议</h5>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 根据字段解释创建合适的数据模型</li>
              <li>• 使用生成的 TypeScript 接口确保类型安全</li>
              <li>• 参考接口文档进行 API 对接</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-amber-800">文档建议</h5>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 将总结内容添加到技术文档中</li>
              <li>• 分享给团队成员提高协作效率</li>
              <li>• 用于代码审查和知识传递</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 