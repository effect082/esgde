
import React, { useEffect, useState } from 'react';
import { fetchSurveyResults } from '../services/sheetService';
import { SurveySubmission } from '../types';
import { ESGRadarChart } from './RadarChart';
import { Card, Button } from './UIComponents';
import { Users, BarChart3, RefreshCw, Layers, PieChart, Clock, Lock, KeyRound } from 'lucide-react';
import { ESG_QUESTIONS } from '../constants';

type Tab = 'overview' | 'items' | 'teams';

export const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [data, setData] = useState<SurveySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '0741') {
      setIsAuthenticated(true);
      loadData();
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  const loadData = async () => {
    setLoading(true);
    const results = await fetchSurveyResults();
    setData(results);
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center !p-8">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">관리자 접속</h2>
          <p className="text-sm text-gray-500 mb-6">접근 권한 확인을 위해 비밀번호를 입력해주세요.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호 4자리"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                maxLength={4}
              />
            </div>
            <Button type="submit" className="w-full">
              접속하기
            </Button>
            <Button type="button" variant="secondary" onClick={onBack} className="w-full border-none">
              메인으로 돌아가기
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // --- Aggregation Logic ---
  const totalParticipants = data.length;

  // 1. Category Averages
  const calculateCategoryAverage = (prefix: string) => {
    if (totalParticipants === 0) return 0;
    const categoryQuestions = ESG_QUESTIONS.filter(q => q.id.startsWith(prefix)).length;
    if (categoryQuestions === 0) return 0;

    let totalPoints = 0;
    data.forEach(sub => {
      if (sub.totalScore) {
        totalPoints += sub.totalScore[prefix as 'E' | 'S' | 'G'] || 0;
      }
    });

    const averageTotalScore = totalPoints / totalParticipants;
    return parseFloat((averageTotalScore / categoryQuestions).toFixed(2));
  };

  const avgE = calculateCategoryAverage('E');
  const avgS = calculateCategoryAverage('S');
  const avgG = calculateCategoryAverage('G');

  const chartData = [
    { subject: '환경 (E)', A: avgE, fullMark: 4 },
    { subject: '사회 (S)', A: avgS, fullMark: 4 },
    { subject: '지배구조 (G)', A: avgG, fullMark: 4 },
  ];

  // 2. Item Analysis Logic
  const calculateItemAverages = () => {
    return ESG_QUESTIONS.map(q => {
      const answers = data.map(sub => {
        const val = sub.answers?.[q.id];
        if (typeof val === 'number') return val;
        if (typeof val === 'object' && val !== null) return val.rating;
        return undefined;
      }).filter((v): v is number => v !== undefined);
      
      const avg = answers.length > 0 
        ? answers.reduce((a, b) => a + b, 0) / answers.length 
        : 0;
      return { ...q, average: avg, count: answers.length };
    }).sort((a, b) => b.average - a.average); // Sort by highest score
  };

  const itemStats = calculateItemAverages();

  // 3. Team Analysis Logic
  const calculateTeamStats = () => {
    const teams: Record<string, { E: number[], S: number[], G: number[], count: number }> = {};

    data.forEach(sub => {
      const dept = sub.department || "미지정";
      if (!teams[dept]) teams[dept] = { E: [], S: [], G: [], count: 0 };
      
      // Calculate individual averages per category (normalize to 4.0)
      const eCount = ESG_QUESTIONS.filter(q => q.id.startsWith('E')).length;
      const sCount = ESG_QUESTIONS.filter(q => q.id.startsWith('S')).length;
      const gCount = ESG_QUESTIONS.filter(q => q.id.startsWith('G')).length;

      teams[dept].E.push((sub.totalScore.E || 0) / eCount);
      teams[dept].S.push((sub.totalScore.S || 0) / sCount);
      teams[dept].G.push((sub.totalScore.G || 0) / gCount);
      teams[dept].count++;
    });

    return Object.entries(teams).map(([dept, scores]) => ({
      dept,
      count: scores.count,
      avgE: parseFloat((scores.E.reduce((a,b)=>a+b,0) / scores.count).toFixed(2)),
      avgS: parseFloat((scores.S.reduce((a,b)=>a+b,0) / scores.count).toFixed(2)),
      avgG: parseFloat((scores.G.reduce((a,b)=>a+b,0) / scores.count).toFixed(2)),
    }));
  };

  const teamStats = calculateTeamStats();

  // --- Render Components ---

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Key Metrics */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex items-center justify-between !p-5 bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <div>
            <p className="text-teal-100 text-sm font-medium mb-1">총 참여 인원</p>
            <h3 className="text-3xl font-bold">{totalParticipants}명</h3>
          </div>
          <Users className="w-10 h-10 text-teal-200 opacity-80" />
        </Card>
        <Card className="!p-5 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-bold mb-1">환경 (E) 평균</p>
          <h3 className="text-2xl font-bold text-gray-800">{avgE} <span className="text-sm text-gray-400 font-normal">/ 4.0</span></h3>
        </Card>
        <Card className="!p-5 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-bold mb-1">사회 (S) 평균</p>
          <h3 className="text-2xl font-bold text-gray-800">{avgS} <span className="text-sm text-gray-400 font-normal">/ 4.0</span></h3>
        </Card>
        <Card className="!p-5 border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm font-bold mb-1">지배구조 (G) 평균</p>
          <h3 className="text-2xl font-bold text-gray-800">{avgG} <span className="text-sm text-gray-400 font-normal">/ 4.0</span></h3>
        </Card>
      </div>

      {/* Main Chart */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col items-center justify-center min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-4 w-full text-left border-b pb-2">종합 역량 진단</h3>
          <ESGRadarChart customData={chartData} />
        </Card>
      </div>

      {/* Participant List */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-bold text-gray-800">참여 현황</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">최신순</span>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3">날짜</th>
                  <th className="px-4 py-3">부서</th>
                  <th className="px-4 py-3">성명</th>
                  <th className="px-4 py-3 text-center">E</th>
                  <th className="px-4 py-3 text-center">S</th>
                  <th className="px-4 py-3 text-center">G</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">데이터가 없습니다.</td>
                  </tr>
                ) : (
                  data.slice().reverse().map((row, index) => (
                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{row.timestamp ? new Date(row.timestamp).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.department}</td>
                      <td className="px-4 py-3">{row.name}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-bold">{row.totalScore?.E}</td>
                      <td className="px-4 py-3 text-center text-blue-600 font-bold">{row.totalScore?.S}</td>
                      <td className="px-4 py-3 text-center text-orange-600 font-bold">{row.totalScore?.G}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderItemAnalysis = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">문항별 응답 분석 (평균 점수순)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-16 text-center">순위</th>
                <th className="px-4 py-3 w-20">코드</th>
                <th className="px-4 py-3 w-32">분류</th>
                <th className="px-4 py-3">지표 (문항)</th>
                <th className="px-4 py-3 w-24 text-center">평균점수</th>
                <th className="px-4 py-3 w-24 text-center">상태</th>
              </tr>
            </thead>
            <tbody>
              {itemStats.map((item, index) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-center font-bold text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{item.id}</td>
                  <td className="px-4 py-3 text-gray-500">{item.subCategory}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{item.indicator}</td>
                  <td className="px-4 py-3 text-center font-bold text-teal-600">{item.average.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    {item.average >= 3.5 ? <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">우수</span> :
                     item.average <= 2.5 ? <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">미흡</span> :
                     <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">보통</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderTeamAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamStats.map((team) => (
          <Card key={team.dept} className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">{team.dept}</h3>
              <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full font-medium">
                참여 {team.count}명
              </span>
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">환경(E)</span>
                  <span className="font-bold text-green-600">{team.avgE}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(team.avgE / 4) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">사회(S)</span>
                  <span className="font-bold text-blue-600">{team.avgS}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(team.avgS / 4) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">지배구조(G)</span>
                  <span className="font-bold text-orange-600">{team.avgG}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(team.avgG / 4) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="text-teal-600" />
              ESG 경영 자체진단 관리자
            </h1>
            <p className="text-gray-500 text-sm mt-1">전체 직원 및 팀별 진단 결과를 통합 분석합니다.</p>
          </div>
          <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
            <div className="flex items-center text-xs text-gray-400 gap-1">
              <Clock className="w-3 h-3" />
              <span>마지막 업데이트: {lastUpdated}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={loadData} className="px-4 py-2 text-sm flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
              <Button variant="secondary" onClick={onBack} className="px-4 py-2 text-sm">
                나가기
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2
              ${activeTab === 'overview' 
                ? 'border-teal-500 text-teal-700 bg-white rounded-t-lg' 
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <PieChart className="w-4 h-4" /> 종합 결과
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2
              ${activeTab === 'items' 
                ? 'border-teal-500 text-teal-700 bg-white rounded-t-lg' 
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Layers className="w-4 h-4" /> 문항별 분석
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2
              ${activeTab === 'teams' 
                ? 'border-teal-500 text-teal-700 bg-white rounded-t-lg' 
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Users className="w-4 h-4" /> 팀별 분석
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'items' && renderItemAnalysis()}
        {activeTab === 'teams' && renderTeamAnalysis()}
      </div>
    </div>
  );
};
