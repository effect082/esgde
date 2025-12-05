
import React, { useState } from 'react';
import { ESG_QUESTIONS } from './constants';
import { UserInfo, Answer, Rating } from './types';
import { Button, ProgressBar, RatingInput, Card, ChecklistGroup } from './components/UIComponents';
import { AdminDashboard } from './components/AdminDashboard';
import { submitToGoogleSheet } from './services/sheetService';
import { Leaf, Users, Building2, ChevronRight, Check, Loader2, ShieldCheck, Settings, CheckCircle2, BarChart3, ArrowRight } from 'lucide-react';

enum AppState {
  LANDING,
  USER_INPUT,
  ASSESSMENT,
  SUBMITTING,
  COMPLETED,
  ADMIN
}

export default function App() {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', department: '' });
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  
  // Handlers
  const handleStartInput = () => {
    setState(AppState.USER_INPUT);
  };

  const handleStartAssessment = () => {
    if (userInfo.name && userInfo.department) {
      setState(AppState.ASSESSMENT);
      window.scrollTo(0, 0);
    } else {
      alert("성함과 부서를 입력해주세요.");
    }
  };

  const handleAnswer = (rating: Rating) => {
    const question = ESG_QUESTIONS[currentQuestionIdx];
    const newAnswers = [...answers];
    const existingIdx = newAnswers.findIndex(a => a.questionId === question.id);
    
    // Preserve existing detail checks if we are just updating the rating
    const existingDetails = existingIdx >= 0 ? newAnswers[existingIdx].details : {};

    if (existingIdx >= 0) {
      newAnswers[existingIdx] = { ...newAnswers[existingIdx], rating };
    } else {
      newAnswers.push({ questionId: question.id, rating, details: existingDetails });
    }
    
    setAnswers(newAnswers);
  };

  // Handle detailed checklist changes
  const handleDetailChange = (index: number, option: string) => {
    const question = ESG_QUESTIONS[currentQuestionIdx];
    const newAnswers = [...answers];
    const existingIdx = newAnswers.findIndex(a => a.questionId === question.id);

    let currentAnswer = existingIdx >= 0 ? newAnswers[existingIdx] : { questionId: question.id, rating: 0 as any, details: {} };
    
    const currentDetails = currentAnswer.details || {};
    const currentOptionsForIndex = currentDetails[index] || [];

    let newOptionsForIndex;
    if (currentOptionsForIndex.includes(option)) {
      newOptionsForIndex = currentOptionsForIndex.filter(o => o !== option);
    } else {
      newOptionsForIndex = [...currentOptionsForIndex, option];
    }

    const newDetails = { ...currentDetails, [index]: newOptionsForIndex };
    currentAnswer = { ...currentAnswer, details: newDetails };

    if (existingIdx >= 0) {
      newAnswers[existingIdx] = currentAnswer;
    } else {
      newAnswers.push(currentAnswer);
    }

    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIdx < ESG_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setState(AppState.SUBMITTING);
    await submitToGoogleSheet(userInfo, answers);
    setState(AppState.COMPLETED);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetApp = () => {
    setUserInfo({ name: '', department: '' });
    setAnswers([]);
    setCurrentQuestionIdx(0);
    setState(AppState.LANDING);
  };

  // --- Renders ---

  const renderLanding = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="max-w-2xl w-full text-center space-y-10">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-md mb-6">
            <Leaf className="w-12 h-12 text-teal-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
            강동어울림복지관<br/>
            <span className="text-teal-600">ESG 경영 자체진단</span>
          </h1>
          <p className="text-gray-600 text-lg">
            지속가능한 복지관 운영을 위한<br/>
            ESG 경영 중장기 발전계획 수립의 첫걸음입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Employee Section */}
          <button 
            onClick={handleStartInput}
            className="group relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left border border-transparent hover:border-teal-500"
          >
            <div className="absolute top-6 right-6 bg-teal-100 p-2 rounded-lg group-hover:bg-teal-600 transition-colors">
              <Users className="w-6 h-6 text-teal-700 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">자가진단 참여하기</h3>
            <p className="text-gray-500 text-sm mb-6">
              복지관 직원용<br/>
              개인별 ESG 인식 및 실천도 진단
            </p>
            <div className="flex items-center text-teal-600 font-bold group-hover:translate-x-1 transition-transform">
              시작하기 <ArrowRight className="w-5 h-5 ml-1" />
            </div>
          </button>

          {/* Admin Section */}
          <button 
            onClick={() => setState(AppState.ADMIN)}
            className="group relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left border border-transparent hover:border-gray-500"
          >
            <div className="absolute top-6 right-6 bg-gray-100 p-2 rounded-lg group-hover:bg-gray-700 transition-colors">
              <BarChart3 className="w-6 h-6 text-gray-700 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">관리자 대시보드</h3>
            <p className="text-gray-500 text-sm mb-6">
              관리자 전용<br/>
              실시간 응답 현황 및 결과 분석
            </p>
            <div className="flex items-center text-gray-700 font-bold group-hover:translate-x-1 transition-transform">
              확인하기 <ArrowRight className="w-5 h-5 ml-1" />
            </div>
          </button>
        </div>

        <div className="text-xs text-gray-400">
          © 2024 Gangdong Oullim Welfare Center. All rights reserved.
        </div>
      </div>
    </div>
  );

  const renderUserInput = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-lg mx-auto">
      <div className="text-center space-y-6 w-full">
        <div className="text-left mb-6">
          <Button variant="secondary" onClick={() => setState(AppState.LANDING)} className="px-3 py-1 text-xs">
            ← 뒤로가기
          </Button>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900">참여자 정보 입력</h2>
        
        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 text-left flex gap-4 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-blue-500 flex-shrink-0" />
          <div className="text-sm text-gray-700 leading-relaxed">
            <span className="font-bold text-blue-700 block mb-1 text-base">보안 및 익명성 안내</span>
            응답하신 내용은 <strong>철저하게 비공개 처리</strong>됩니다.<br/>
            수집된 성명과 부서명은 <strong>중복 응답 방지 및 부서별 통계 산출</strong> 목적으로만 활용되오니 안심하고 작성해 주시기 바랍니다.
          </div>
        </div>

        <Card className="text-left space-y-5 bg-white shadow-lg border-t-4 border-teal-500">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">부서명</label>
            <input 
              type="text" 
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all text-lg placeholder:text-gray-400"
              placeholder="예: 기획운영지원팀"
              value={userInfo.department}
              onChange={e => setUserInfo({...userInfo, department: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">성명</label>
            <input 
              type="text" 
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all text-lg placeholder:text-gray-400"
              placeholder="홍길동"
              value={userInfo.name}
              onChange={e => setUserInfo({...userInfo, name: e.target.value})}
            />
          </div>
        </Card>

        <Button onClick={handleStartAssessment} className="w-full text-lg shadow-xl py-4 mt-4">
          진단 문항 시작하기
        </Button>
      </div>
    </div>
  );

  const renderAssessment = () => {
    const question = ESG_QUESTIONS[currentQuestionIdx];
    const currentAnswerObj = answers.find(a => a.questionId === question.id);
    const currentRating = currentAnswerObj?.rating || null;
    const currentDetails = currentAnswerObj?.details || {};

    const isLast = currentQuestionIdx === ESG_QUESTIONS.length - 1;
    const CategoryIcon = question.id.startsWith('E') ? Leaf : question.id.startsWith('S') ? Users : Building2;
    const categoryColor = question.id.startsWith('E') ? 'text-green-600' : question.id.startsWith('S') ? 'text-blue-600' : 'text-orange-600';

    return (
      <div className="min-h-screen flex flex-col max-w-2xl mx-auto p-4 bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 bg-gray-50 pt-4 pb-2 z-20 shadow-sm">
          <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
            <span>진행률</span>
            <span>{Math.round(((currentQuestionIdx) / ESG_QUESTIONS.length) * 100)}%</span>
          </div>
          <ProgressBar current={currentQuestionIdx + (currentRating ? 1 : 0)} total={ESG_QUESTIONS.length} />
        </div>

        {/* Question Card */}
        <div className="flex-1 flex flex-col justify-center py-6">
          <div className={`flex items-center gap-2 font-bold text-lg mb-2 ${categoryColor}`}>
            <CategoryIcon className="w-6 h-6" />
            <span>{question.category}</span>
          </div>
          
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-1 leading-snug">
              {question.subCategory}
            </h2>
            <h3 className="text-lg text-gray-600 font-medium">
              {question.indicator}
            </h3>
          </div>

          <Card className="mb-6 border-l-4 border-teal-500 shadow-sm">
            <h4 className="font-bold text-gray-500 mb-2 text-xs uppercase tracking-wider flex items-center gap-1">
              <Check className="w-3 h-3" /> 평가 (Rating)
            </h4>
            <RatingInput value={currentRating} onChange={handleAnswer} />

            <ChecklistGroup 
              descriptions={question.description} 
              selectedDetails={currentDetails}
              onChange={handleDetailChange}
            />
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4 py-6 sticky bottom-0 bg-gray-50/95 backdrop-blur z-20 border-t border-gray-200">
          <Button variant="secondary" onClick={handlePrev} disabled={currentQuestionIdx === 0} className="w-24">
            이전
          </Button>
          
          {isLast ? (
             <Button onClick={handleSubmit} disabled={!currentRating} className="flex-1 shadow-lg bg-teal-600 hover:bg-teal-700">
               제출하기
             </Button>
          ) : (
            <Button onClick={handleNext} disabled={!currentRating} className="flex-1 flex items-center justify-center gap-2 shadow-lg">
              다음 <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderSubmitting = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">제출 중입니다</h2>
        <p className="text-gray-500 text-sm">
          소중한 의견을 안전하게 저장하고 있습니다.
        </p>
      </div>
    </div>
  );

  const renderCompleted = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="w-20 h-20 text-teal-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">제출이 완료되었습니다</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {userInfo.department} <span className="font-bold">{userInfo.name}</span>님,<br/>
          ESG 자가진단에 참여해 주셔서 감사합니다.<br/><br/>
          <span className="text-sm text-gray-500 bg-gray-100 p-2 rounded block">
            전체 직원의 응답이 완료된 후,<br/>
            통합 분석 결과가 공유될 예정입니다.
          </span>
        </p>
        <Button onClick={resetApp} className="w-full">
          처음 화면으로
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {state === AppState.LANDING && renderLanding()}
      {state === AppState.USER_INPUT && renderUserInput()}
      {state === AppState.ASSESSMENT && renderAssessment()}
      {state === AppState.SUBMITTING && renderSubmitting()}
      {state === AppState.COMPLETED && renderCompleted()}
      {state === AppState.ADMIN && <AdminDashboard onBack={() => setState(AppState.LANDING)} />}
    </>
  );
}
