
import React from 'react';
import { CheckCircle2, Circle, CheckSquare, Square } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "px-6 py-3 rounded-lg font-bold transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md";
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700",
    secondary: "bg-white text-teal-600 border-2 border-teal-600 hover:bg-teal-50"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const percentage = Math.min((current / total) * 100, 100);
  return (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export const RatingInput: React.FC<{ value: number | null; onChange: (val: 1|2|3|4) => void }> = ({ value, onChange }) => {
  const options = [
    { val: 4, label: "우수", desc: "체계적이고 구체적인 성과 있음" },
    { val: 3, label: "양호", desc: "대체로 잘 이행되고 있음" },
    { val: 2, label: "보통", desc: "부분적 이행 또는 계획 단계" },
    { val: 1, label: "미흡", desc: "관련 활동이나 계획 부재" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
      {options.map((opt) => (
        <button
          key={opt.val}
          onClick={() => onChange(opt.val as 1|2|3|4)}
          className={`
            relative p-4 rounded-xl border-2 text-left transition-all duration-200
            flex flex-col items-center justify-center gap-2
            ${value === opt.val 
              ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-200' 
              : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50 text-gray-600'}
          `}
        >
          {value === opt.val ? (
            <CheckCircle2 className="w-6 h-6 text-teal-600" />
          ) : (
            <Circle className="w-6 h-6 text-gray-300" />
          )}
          <span className="font-bold text-lg">{opt.label}</span>
          <span className="text-xs text-center text-gray-500 font-normal">{opt.desc}</span>
        </button>
      ))}
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

// New Component for Detailed Checklists
interface ChecklistProps {
  descriptions: string[];
  selectedDetails: Record<number, string[]>;
  onChange: (index: number, option: string) => void;
}

export const ChecklistGroup: React.FC<ChecklistProps> = ({ descriptions, selectedDetails, onChange }) => {
  const options = ["알고 있음", "알지 못함", "하고 있음", "하지 않음"];

  return (
    <div className="space-y-6 mt-6">
      <h4 className="font-bold text-gray-700 text-md border-b pb-2">진단 내용 상세 체크</h4>
      {descriptions.map((desc, idx) => (
        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-3 flex items-start gap-2">
            <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full mt-0.5 shrink-0">
              내용 {idx + 1}
            </span>
            {desc}
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const isSelected = selectedDetails[idx]?.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => onChange(idx, opt)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border
                    ${isSelected 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}
                  `}
                >
                  {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
