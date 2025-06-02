'use client';

import { useState } from 'react';
import { Play, RotateCcw, Trash2, FileText, AlertCircle, Sparkles, Zap, Clock } from 'lucide-react';
import { useAI } from '@/context/AIContext';

interface JsonInputSectionProps {
  jsonInput: string;
  setJsonInput: (value: string) => void;
}

export default function JsonInputSection({ 
  jsonInput, 
  setJsonInput
}: JsonInputSectionProps) {
  const [error, setError] = useState('');
  const { isLoading, error: aiError, analyzeJson, duration } = useAI();

  const sampleJson = `{
  "status": "success",
  "data": {
    "articles": [
      {
        "id": 1001,
        "title": "深入理解 React Hooks",
        "author": {
          "name": "张三",
          "avatar": "https://example.com/avatar.jpg"
        },
        "publish_time": "2024-01-15T10:30:00Z",
        "category": {
          "id": 5,
          "name": "前端技术"
        },
        "tags": ["React", "Hooks", "JavaScript"],
        "view_count": 1250,
        "is_featured": true
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_count": 95
    }
  }
}`;

  const handleInputChange = (value: string) => {
    setJsonInput(value);
    setError('');
    
    if (value.trim()) {
      try {
        JSON.parse(value);
      } catch (e) {
        setError('JSON 格式不正确');
      }
    }
  };

  const handleFormat = () => {
    if (jsonInput.trim()) {
      try {
        const parsed = JSON.parse(jsonInput);
        const formatted = JSON.stringify(parsed, null, 2);
        setJsonInput(formatted);
        setError('');
      } catch (e) {
        setError('JSON 格式不正确，无法格式化');
      }
    }
  };

  const handleLoadSample = () => {
    setJsonInput(sampleJson);
    setError('');
  };

  const handleClear = () => {
    setJsonInput('');
    setError('');
  };

  const handleAnalyze = async () => {
    if (!jsonInput.trim()) {
      setError('请先输入 JSON 数据');
      return;
    }
    
    try {
      JSON.parse(jsonInput);
      setError('');
      await analyzeJson(jsonInput);
    } catch (e) {
      setError('JSON 格式不正确，请检查后重试');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <Zap className="w-5 h-5 text-white" />
              </div>
              JSON 输入与解析
            </h2>
            <p className="text-gray-600">
              粘贴您的 JSON 数据，AI 将智能解析字段含义和结构语义
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="hidden md:flex items-center space-x-1 text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
              <Sparkles className="w-3 h-3" />
              <span>AI 驱动解析</span>
            </div>
            {duration && (
              <div className="flex items-center space-x-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
                <Clock className="w-3 h-3" />
                <span>分析耗时: {duration}ms</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              JSON 数据输入
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="请在此处粘贴您的 JSON 数据...&#10;&#10;支持任意复杂的嵌套结构，包括对象、数组等"
              className={`w-full h-72 p-6 border-2 rounded-xl font-mono text-sm resize-none transition-all duration-200 ${
                error || aiError
                  ? 'border-red-300 bg-red-50 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300'
              }`}
              disabled={isLoading}
            />
            {(error || aiError) && (
              <div className="absolute top-12 right-4 flex items-center text-red-500">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}
          </div>

          {(error || aiError) && (
            <div className="flex items-center space-x-3 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error || aiError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !jsonInput.trim()}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    AI 分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />
                    开始 AI 解析
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleFormat}
                disabled={!jsonInput.trim() || isLoading}
                className="inline-flex items-center px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2" />
                格式化
              </button>

              <button
                onClick={handleLoadSample}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                加载示例
              </button>

              <button
                onClick={handleClear}
                disabled={!jsonInput.trim() || isLoading}
                className="inline-flex items-center px-4 py-2.5 border-2 border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:border-red-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清空
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100 px-8 py-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-3">💡 使用提示</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>支持任意复杂的 JSON 结构，包括嵌套对象和数组</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>建议先点击"格式化"按钮整理 JSON 结构</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>可以点击"加载示例"查看演示数据</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>AI 分析通常需要 3-5 秒时间</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 