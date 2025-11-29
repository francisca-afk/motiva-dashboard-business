"use client";
import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Palette, Check } from 'lucide-react';

const ColorPicker = ({ label, color, onChange, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:scale-105 transition-transform"
            style={{ backgroundColor: color }}
          />
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute right-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                <HexColorPicker color={color} onChange={onChange} />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => onChange(e.target.value)}
                  className="mt-3 w-full px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-center uppercase"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function ThemeCustomizer({ business, onSave }) {
  const [colors, setColors] = useState({
    primary: business?.chatbotSettings?.theme?.primary || '#b9d825',
    secondary: business?.chatbotSettings?.theme?.secondary || '#7d3f97',
    background: business?.chatbotSettings?.theme?.background || '#f2f6f8e8',
    textMuted: business?.chatbotSettings?.theme?.textMuted || '#646464',
    text: business?.chatbotSettings?.theme?.text || '#646464'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('colors', colors);
      await onSave(colors);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    colors.primary !== (business?.chatbotSettings?.theme?.primary || '#A8D55F') ||
    colors.secondary !== (business?.chatbotSettings?.theme?.secondary || '#E91E8C') ||
    colors.background !== (business?.chatbotSettings?.theme?.background || '#f2f6f8e8') ||
    colors.textMuted !== (business?.chatbotSettings?.theme?.textMuted || '#646464') ||
    colors.text !== (business?.chatbotSettings?.theme?.text || '#1F2937');

  return (
    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        <Palette className="h-4 w-4 text-gray-500" />
        Theme Colors
      </div>

      <div className="rounded-lg bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10 p-6 border border-gray-200 dark:border-gray-700">
        <div className="space-y-6">
          <ColorPicker
            label="Primary Color"
            description="Main brand color (buttons, accents)"
            color={colors.primary}
            onChange={(value) => setColors(prev => ({ ...prev, primary: value }))}
          />
          
          <ColorPicker
            label="Secondary Color"
            description="User messages and highlights"
            color={colors.secondary}
            onChange={(value) => setColors(prev => ({ ...prev, secondary: value }))}
          />

          <ColorPicker
            label="Background Color"
            description="Background color for the chatbot"
            color={colors.background}
            onChange={(value) => setColors(prev => ({ ...prev, background: value }))}
          />
          <ColorPicker
            label="Text Muted Color"
            description="Secondary text color for the chat"
            color={colors.textMuted}
            onChange={(value) => setColors(prev => ({ ...prev, textMuted: value }))}
          />
          <ColorPicker
            label="Text Color"
            description="IA & business messages text color"
            color={colors.text}
            onChange={(value) => setColors(prev => ({ ...prev, text: value }))}
          />

          {/* Preview */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Preview</p>
            <div className="flex gap-2 items-center">
              <div 
                className="h-16 flex-1 rounded-lg shadow-sm flex items-center justify-center text-white font-medium text-sm"
                style={{ backgroundColor: colors.primary }}
              >
                Primary
              </div>
              <div 
                className="h-16 flex-1 rounded-lg shadow-sm flex items-center justify-center text-white font-medium text-sm"
                style={{ backgroundColor: colors.secondary }}
              >
                Secondary
              </div>
              <div 
                className="h-16 flex-1 rounded-lg shadow-sm flex items-center justify-center text-gray-500 font-medium text-sm"
                style={{ backgroundColor: colors.background }}
              >
                Background
              </div>
              <div 
                className="h-16 flex-1 rounded-lg shadow-sm flex items-center justify-center font-medium text-sm border border-gray-200"
                style={{ color: colors.textMuted, backgroundColor: 'white' }}
              >
                Text Muted
              </div>
              <div 
                className="h-16 flex-1 rounded-lg shadow-sm flex items-center justify-center font-medium text-sm border border-gray-200"
                style={{ color: colors.text, backgroundColor: 'white' }}
              >
                Text
              </div>
            </div>
          </div>

          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-brand-500 to-purple-500 text-white font-medium hover:from-brand-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Theme Colors'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default ThemeCustomizer;