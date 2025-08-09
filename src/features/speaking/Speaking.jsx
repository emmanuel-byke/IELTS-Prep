import React, { useState, useEffect, useRef } from "react";
import { FiUser, FiTarget, FiCheck, FiX, FiStar, FiDownload, FiUpload, FiTrash2, FiClock, FiVolume2, FiBook, FiEdit, FiMic, FiBarChart2, FiBookmark, FiPlay, FiPause, FiRefreshCw, FiCalendar, FiHelpCircle } from "react-icons/fi";
import { FaIcons } from "react-icons/fa";

export default function IeltsPrepTracker() {
  const [name, setName] = useState(() => localStorage.getItem("name") || "");
  const [targetBand, setTargetBand] = useState(() => parseFloat(localStorage.getItem("targetBand")) || 8.5);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Tasks
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tasks")) || [];
    } catch (e) {
      return [];
    }
  });
  const [taskInput, setTaskInput] = useState("");

  // Skill assessments
  const defaultAssessment = { 
    speaking: { fluency: 6, lexical: 6, grammar: 6, pronunciation: 6 },
    listening: { detail: 6, mainIdeas: 6, inference: 6, vocabulary: 6 },
    reading: { skimming: 6, scanning: 6, detail: 6, inference: 6 },
    writing: { task1: 6, task2: 6, coherence: 6, vocabulary: 6 }
  };
  
  const [assessment, setAssessment] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("assessment")) || defaultAssessment;
    } catch (e) {
      return defaultAssessment;
    }
  });

  // Progress history
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("history")) || [];
    } catch (e) {
      return [];
    }
  });

  // Tips with API integration
  const [tips, setTips] = useState([
    { id: 1, title: "Use the Why–Because–Example rule", text: "Always extend your answers: give a reason and an example.", category: "speaking", source: "IELTS Expert" },
    { id: 2, title: "Replace fillers", text: "Swap 'um' and 'you know' with short pauses or linking phrases.", category: "speaking", source: "IELTS Expert" },
    { id: 3, title: "Part 2 structure", text: "Intro → 2–3 points → personal feeling → short conclusion.", category: "speaking", source: "IELTS Expert" },
    { id: 4, title: "Shadowing technique", text: "Repeat short audio clips to copy natural rhythm and intonation.", category: "speaking", source: "IELTS Expert" },
    { id: 5, title: "Record & compare", text: "Record yourself and compare to band 8+ sample answers.", category: "speaking", source: "IELTS Expert" }
  ]);
  
  const [favs, setFavs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favTips")) || [];
    } catch (e) {
      return [];
    }
  });

  // Practice prompts with API integration
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);

  // Mock test timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const timerRef = useRef(null);

  // News articles for reading practice
  const [articles, setArticles] = useState([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);

  // Vocabulary words
  const [vocabulary, setVocabulary] = useState([]);
  const [newWord, setNewWord] = useState({ word: "", meaning: "", example: "" });

  // Writing tasks
  const [writingTasks, setWritingTasks] = useState([]);
  const [writingTaskInput, setWritingTaskInput] = useState("");

  // --- Effects: persist to localStorage ---
  useEffect(() => localStorage.setItem("name", name), [name]);
  useEffect(() => localStorage.setItem("targetBand", targetBand.toString()), [targetBand]);
  useEffect(() => localStorage.setItem("tasks", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("assessment", JSON.stringify(assessment)), [assessment]);
  useEffect(() => localStorage.setItem("history", JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem("favTips", JSON.stringify(favs)), [favs]);

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // Fetch news articles for reading practice
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoadingArticles(true);
      try {
        // In a real app, we would fetch from NewsAPI
        // const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=${process.env.REACT_APP_NEWSAPI_KEY}`);
        // const data = await response.json();
        
        // Simulated response
        setTimeout(() => {
          const mockArticles = [
            { id: 1, title: "Global Shift Towards Renewable Energy Sources", source: "Environmental Journal", description: "Countries worldwide are accelerating their transition to renewable energy to combat climate change and reduce carbon emissions." },
            { id: 2, title: "The Impact of AI on Modern Education Systems", source: "Tech Review", description: "Artificial intelligence is transforming educational approaches, offering personalized learning experiences and automating administrative tasks." },
            { id: 3, title: "Urbanization and Its Effects on Mental Health", source: "Psychology Today", description: "Research indicates that urban living may contribute to increased stress levels and mental health challenges among residents." }
          ];
          setArticles(mockArticles);
          setIsLoadingArticles(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setIsLoadingArticles(false);
      }
    };
    
    fetchArticles();
  }, []);

  // --- Helpers ---
  function addTask() {
    if (!taskInput.trim()) return;
    const newTask = { id: Date.now(), text: taskInput.trim(), done: false, createdAt: new Date().toISOString() };
    setTasks((t) => [newTask, ...t]);
    setTaskInput("");
  }

  function toggleTask(id) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  function removeTask(id) {
    setTasks((t) => t.filter((x) => x.id !== id));
  }

  function estimateOverallBand(skill) {
  const skillAssessment = assessment[skill];
  if (!skillAssessment) return 0; // Prevent error if missing

  const weights = {
    speaking: { fluency: 0.3, lexical: 0.25, grammar: 0.25, pronunciation: 0.2 },
    listening: { detail: 0.25, mainIdeas: 0.3, inference: 0.25, vocabulary: 0.2 },
    reading: { skimming: 0.3, scanning: 0.3, detail: 0.2, inference: 0.2 },
    writing: { task1: 0.3, task2: 0.4, coherence: 0.2, vocabulary: 0.1 }
  };
  
  let score = 0;
  for (const [criteria, value] of Object.entries(skillAssessment)) {
    score += value * weights[skill][criteria];
  }
  
  return Math.round(score * 4) / 4;
}

  const currentSpeakingBand = estimateOverallBand("speaking");
  const currentListeningBand = estimateOverallBand("listening");
  const currentReadingBand = estimateOverallBand("reading");
  const currentWritingBand = estimateOverallBand("writing");
  
  const overallBand = Math.min(
    (currentSpeakingBand + currentListeningBand + currentReadingBand + currentWritingBand) / 4,
    9
  );

  function saveAssessmentSnapshot() {
    const snap = { 
      date: new Date().toISOString().split("T")[0], 
      speaking: currentSpeakingBand,
      listening: currentListeningBand,
      reading: currentReadingBand,
      writing: currentWritingBand,
      overall: overallBand
    };
    setHistory((h) => [snap, ...h].slice(0, 365));
  }

  function markTipFav(id) {
    setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }

  async function fetchNewTip() {
    setIsLoadingTip(true);
    try {
      // In a real app, we would fetch from an IELTS tips API
      // const response = await fetch('https://api.ielts-tips.com/random');
      // const data = await response.json();
      
      // Simulated response
      setTimeout(() => {
        const newTips = [
          { 
            id: tips.length + 1, 
            title: "Paraphrase effectively", 
            text: "Show your lexical resource by paraphrasing questions in your answers.", 
            category: "writing",
            source: "IELTS Expert"
          },
          { 
            id: tips.length + 2, 
            title: "Predict answers", 
            text: "During listening, predict possible answers based on context before you hear them.", 
            category: "listening",
            source: "IELTS Expert"
          },
          { 
            id: tips.length + 3, 
            title: "Skim then scan", 
            text: "First skim for main ideas, then scan for specific details to save time.", 
            category: "reading",
            source: "IELTS Expert"
          }
        ];
        
        const randomTip = newTips[Math.floor(Math.random() * newTips.length)];
        setTips(prev => [randomTip, ...prev]);
        setIsLoadingTip(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching tip:", error);
      setIsLoadingTip(false);
    }
  }

  function genPrompt(skill = "speaking", part = 2) {
    setIsLoadingPrompt(true);
    
    // Simulate API call for prompts
    setTimeout(() => {
      const speakingPrompts = {
        part1: [
          "Describe your hometown.",
          "What kinds of food do you like?",
          "Do you work or study? Why?",
          "How do you spend your weekends?"
        ],
        part2: [
          "Describe a book you recently read.",
          "Describe a memorable journey.",
          "Describe a skill you would like to learn."
        ],
        part3: [
          "How will technology change reading habits in the future?",
          "Should governments support the arts? Why?",
          "What are the advantages and disadvantages of studying abroad?"
        ]
      };
      
      const writingPrompts = [
        "Some people believe that unpaid community service should be a compulsory part of high school programs. To what extent do you agree or disagree?",
        "In many countries, the amount of waste produced by households and industries is increasing. What are the causes of this trend and what measures can be taken to address it?",
        "Many museums charge for admission while others are free. Do you think the advantages of charging people for admission to museums outweigh the disadvantages?"
      ];
      
      const readingPrompts = [
        "Analyze the impact of social media on interpersonal relationships.",
        "Discuss the economic implications of climate change policies.",
        "Examine the role of technology in modern healthcare systems."
      ];
      
      let prompt = "";
      
      if (skill === "speaking") {
        prompt = speakingPrompts[`part${part}`][Math.floor(Math.random() * speakingPrompts[`part${part}`].length)];
      } else if (skill === "writing") {
        prompt = writingPrompts[Math.floor(Math.random() * writingPrompts.length)];
      } else if (skill === "reading") {
        prompt = readingPrompts[Math.floor(Math.random() * readingPrompts.length)];
      }
      
      setGeneratedPrompt(prompt);
      setIsLoadingPrompt(false);
      
      // Reset timer for speaking Part 2
      if (skill === "speaking" && part === 2) {
        setSecondsLeft(60);
        setTimerRunning(false);
      }
    }, 700);
  }

  function startPart2() {
    setSecondsLeft(60);
    setTimerRunning(true);
  }

  function stopTimer() {
    setTimerRunning(false);
    clearInterval(timerRef.current);
  }

  function exportProgress() {
    const payload = { name, targetBand, tasks, assessment, history, favTips: favs };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ielts_prep_export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importProgress(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.name) setName(data.name);
        if (data.targetBand) setTargetBand(data.targetBand);
        if (data.tasks) setTasks(data.tasks);
        if (data.assessment) setAssessment(data.assessment);
        if (data.history) setHistory(data.history);
        if (data.favTips) setFavs(data.favTips);
        alert("Import successful.");
      } catch (err) {
        alert("Invalid file.");
      }
    };
    reader.readAsText(file);
  }

  function clearAll() {
    if (!confirm("Clear all stored progress? This will remove tasks, assessment and history.")) return;
    localStorage.clear();
    setName("");
    setTargetBand(8.5);
    setTasks([]);
    setAssessment(defaultAssessment);
    setHistory([]);
    setFavs([]);
  }

  function addVocabulary() {
    if (!newWord.word || !newWord.meaning) return;
    const newVocab = { 
      id: Date.now(), 
      ...newWord,
      createdAt: new Date().toISOString()
    };
    setVocabulary(v => [newVocab, ...v]);
    setNewWord({ word: "", meaning: "", example: "" });
  }

  function addWritingTask() {
    if (!writingTaskInput.trim()) return;
    const newTask = { 
      id: Date.now(), 
      prompt: writingTaskInput.trim(), 
      response: "",
      createdAt: new Date().toISOString()
    };
    setWritingTasks(wt => [newTask, ...wt]);
    setWritingTaskInput("");
  }

  function updateWritingResponse(id, response) {
    setWritingTasks(wt => wt.map(task => 
      task.id === id ? { ...task, response } : task
    ));
  }

  // Skill icons mapping
  const skillIcons = {
    speaking: <FiMic className="text-blue-500" />,
    listening: <FiVolume2 className="text-green-500" />,
    reading: <FiBook className="text-amber-500" />,
    writing: <FiEdit className="text-purple-500" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center">
              <FaIcons className="mr-2 text-indigo-600" />
              IELTS Prep Tracker
            </h1>
            <p className="text-sm text-slate-500">Comprehensive preparation for all IELTS skills</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2">
              <FiUser className="text-slate-500 mr-2" />
              <input
                className="bg-transparent w-28 md:w-auto placeholder-slate-500 focus:outline-none"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2">
              <FiTarget className="text-slate-500 mr-2" />
              <select
                className="bg-transparent focus:outline-none"
                value={targetBand}
                onChange={(e) => setTargetBand(parseFloat(e.target.value))}
              >
                {[6, 6.5, 7, 7.5, 8, 8.5, 9].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={exportProgress} 
                className="flex items-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
              >
                <FiDownload className="mr-1" /> Export
              </button>
              
              <label className="flex items-center px-3 py-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200 transition">
                <FiUpload className="mr-1" /> Import
                <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files && importProgress(e.target.files[0])} />
              </label>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["dashboard", "speaking", "listening", "reading", "writing", "resources"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize font-medium transition ${
                activeTab === tab 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Tasks + Resources */}
          <section className="lg:col-span-1 space-y-6">
            {/* Daily Tasks */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <h2 className="font-bold text-lg mb-4 flex items-center">
                <FiCheck className="mr-2 text-green-500" /> Daily Tasks
              </h2>
              <div className="flex gap-2 mb-4">
                <input 
                  value={taskInput} 
                  onChange={(e) => setTaskInput(e.target.value)} 
                  className="flex-1 border border-slate-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" 
                  placeholder="Add a task (e.g. 'Record Part 2 - 2 prompts')" 
                />
                <button 
                  onClick={addTask} 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Add
                </button>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {tasks.length === 0 ? (
                  <div className="text-center py-4 text-slate-400">No tasks yet. Add your first task!</div>
                ) : (
                  tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleTask(t.id)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            t.done 
                              ? "bg-green-500 text-white" 
                              : "border border-slate-300"
                          }`}
                        >
                          {t.done && <FiCheck size={16} />}
                        </button>
                        <div>
                          <div className={t.done ? "line-through text-slate-400" : "text-slate-700"}>{t.text}</div>
                          <div className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeTask(t.id)} 
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Vocabulary Builder */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <h2 className="font-bold text-lg mb-4 flex items-center">
                <FiBookmark className="mr-2 text-amber-500" /> Vocabulary Builder
              </h2>
              
              <div className="space-y-3 mb-4">
                <input
                  value={newWord.word}
                  onChange={(e) => setNewWord({...newWord, word: e.target.value})}
                  className="w-full border border-slate-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="New word"
                />
                <input
                  value={newWord.meaning}
                  onChange={(e) => setNewWord({...newWord, meaning: e.target.value})}
                  className="w-full border border-slate-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="Meaning"
                />
                <input
                  value={newWord.example}
                  onChange={(e) => setNewWord({...newWord, example: e.target.value})}
                  className="w-full border border-slate-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="Example sentence (optional)"
                />
                <button 
                  onClick={addVocabulary}
                  className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                >
                  Add to Vocabulary
                </button>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {vocabulary.map((word) => (
                  <div key={word.id} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <div className="font-bold text-amber-700">{word.word}</div>
                    <div className="text-sm text-slate-700">{word.meaning}</div>
                    {word.example && (
                      <div className="text-xs text-slate-500 italic mt-1">"{word.example}"</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Middle column: Main Content */}
          <section className="lg:col-span-1">
            {/* Dashboard View */}
            {activeTab === "dashboard" && (
              <div className="bg-white rounded-xl shadow-md p-5">
                <h2 className="font-bold text-xl mb-4">Progress Dashboard</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="text-blue-700 font-bold text-xl">{overallBand.toFixed(1)}</div>
                    <div className="text-sm text-blue-600">Overall Band</div>
                    <div className="mt-2 text-xs text-slate-500">Target: {targetBand}</div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-slate-700 font-bold text-xl">{tasks.filter(t => t.done).length}/{tasks.length}</div>
                    <div className="text-sm text-slate-600">Tasks Completed</div>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg mb-3">Skill Assessments</h3>
                <div className="space-y-4">
                  {["speaking", "listening", "reading", "writing"].map(skill => (
                    <div key={skill} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          {skillIcons[skill]}
                          <span className="ml-2 font-medium capitalize">{skill}</span>
                        </div>
                        <div className="font-bold">
                          {estimateOverallBand(skill).toFixed(1)}
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${(estimateOverallBand(skill) / 9) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={saveAssessmentSnapshot}
                  className="w-full mt-6 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Save Progress Snapshot
                </button>
              </div>
            )}
            
            {/* Speaking Practice */}
            {activeTab === "speaking" && (
              <div className="bg-white rounded-xl shadow-md p-5">
                <h2 className="font-bold text-xl mb-4 flex items-center">
                  <FiMic className="mr-2 text-blue-500" /> Speaking Practice
                </h2>
                
                <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-blue-700 font-bold text-xl">{currentSpeakingBand.toFixed(1)}</div>
                      <div className="text-sm text-blue-600">Current Speaking Band</div>
                    </div>
                    <div className="text-sm text-slate-600">Target: {targetBand}</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">Self-Assessment</h3>
                  <div className="space-y-4">
                    {Object.keys(assessment.speaking).map((k) => (
                      <div key={k} className="flex items-center gap-3">
                        <div className="w-28 capitalize text-sm">{k}</div>
                        <input
                          type="range"
                          min="0"
                          max="9"
                          step="0.25"
                          value={assessment.speaking[k]}
                          onChange={(e) => setAssessment(a => ({ 
                            ...a, 
                            speaking: { ...a.speaking, [k]: parseFloat(e.target.value) } 
                          }))}
                          className="flex-1 accent-blue-500"
                        />
                        <div className="w-10 text-right font-medium">{assessment.speaking[k]}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-3">Practice Prompts</h3>
                  <div className="flex gap-2 mb-4">
                    <button 
                      onClick={() => genPrompt("speaking", 1)} 
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      Part 1
                    </button>
                    <button 
                      onClick={() => genPrompt("speaking", 2)} 
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      Part 2
                    </button>
                    <button 
                      onClick={() => genPrompt("speaking", 3)} 
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      Part 3
                    </button>
                  </div>
                  
                  {isLoadingPrompt ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-slate-500">Generating prompt...</p>
                    </div>
                  ) : generatedPrompt ? (
                    <div className="p-4 border border-blue-200 rounded-xl bg-blue-50">
                      <div className="font-medium text-lg mb-3">{generatedPrompt}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-blue-700 font-medium">
                          {secondsLeft > 0 ? 
                            `Time left: ${Math.floor(secondsLeft/60)}:${String(secondsLeft%60).padStart(2,'0')}` : 
                            'Timer stopped'}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={startPart2} 
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                          >
                            <FiPlay className="inline mr-1" /> Start Prep
                          </button>
                          <button 
                            onClick={stopTimer} 
                            className="px-3 py-1 border border-blue-300 rounded-lg text-sm"
                          >
                            <FiPause className="inline mr-1" /> Stop
                          </button>
                          <button 
                            onClick={() => setSecondsLeft(120)} 
                            className="px-3 py-1 border border-blue-300 rounded-lg text-sm"
                          >
                            <FiRefreshCw className="inline mr-1" /> Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      Click a button to generate a speaking prompt
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Reading Practice */}
            {activeTab === "reading" && (
              <div className="bg-white rounded-xl shadow-md p-5">
                <h2 className="font-bold text-xl mb-4 flex items-center">
                  <FiBook className="mr-2 text-amber-500" /> Reading Practice
                </h2>
                
                <div className="mb-6 bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-amber-700 font-bold text-xl">{currentReadingBand.toFixed(1)}</div>
                      <div className="text-sm text-amber-600">Current Reading Band</div>
                    </div>
                    <div className="text-sm text-slate-600">Target: {targetBand}</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">Self-Assessment</h3>
                  <div className="space-y-4">
                    {Object.keys(assessment.reading).map((k) => (
                      <div key={k} className="flex items-center gap-3">
                        <div className="w-28 capitalize text-sm">{k}</div>
                        <input
                          type="range"
                          min="0"
                          max="9"
                          step="0.25"
                          value={assessment.reading[k]}
                          onChange={(e) => setAssessment(a => ({ 
                            ...a, 
                            reading: { ...a.reading, [k]: parseFloat(e.target.value) } 
                          }))}
                          className="flex-1 accent-amber-500"
                        />
                        <div className="w-10 text-right font-medium">{assessment.reading[k]}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-3">Reading Materials</h3>
                  
                  <div className="flex justify-between mb-4">
                    <div>
                      <button 
                        onClick={() => genPrompt("reading")} 
                        className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition"
                      >
                        Generate Reading Prompt
                      </button>
                    </div>
                    <div className="text-sm text-slate-500">
                      {articles.length} articles available
                    </div>
                  </div>
                  
                  {isLoadingArticles ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                      <p className="mt-2 text-slate-500">Loading articles...</p>
                    </div>
                  ) : generatedPrompt ? (
                    <div className="p-4 border border-amber-200 rounded-xl bg-amber-50 mb-4">
                      <div className="font-bold text-amber-700 mb-2">Discussion Prompt:</div>
                      <div className="font-medium">{generatedPrompt}</div>
                    </div>
                  ) : null}
                  
                  <div className="space-y-4">
                    {articles.map(article => (
                      <div key={article.id} className="border border-slate-200 rounded-xl p-4 hover:border-amber-300 transition">
                        <div className="font-bold text-lg mb-1">{article.title}</div>
                        <div className="text-sm text-amber-600 mb-2">{article.source}</div>
                        <p className="text-slate-600">{article.description}</p>
                        <button className="mt-3 px-3 py-1 bg-amber-600 text-white rounded-lg text-sm">
                          Read Full Article & Answer Questions
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Writing Practice */}
            {activeTab === "writing" && (
              <div className="bg-white rounded-xl shadow-md p-5">
                <h2 className="font-bold text-xl mb-4 flex items-center">
                  <FiEdit className="mr-2 text-purple-500" /> Writing Practice
                </h2>
                
                <div className="mb-6 bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-purple-700 font-bold text-xl">{currentWritingBand.toFixed(1)}</div>
                      <div className="text-sm text-purple-600">Current Writing Band</div>
                    </div>
                    <div className="text-sm text-slate-600">Target: {targetBand}</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">Self-Assessment</h3>
                  <div className="space-y-4">
                    {Object.keys(assessment.writing).map((k) => (
                      <div key={k} className="flex items-center gap-3">
                        <div className="w-28 capitalize text-sm">{k}</div>
                        <input
                          type="range"
                          min="0"
                          max="9"
                          step="0.25"
                          value={assessment.writing[k]}
                          onChange={(e) => setAssessment(a => ({ 
                            ...a, 
                            writing: { ...a.writing, [k]: parseFloat(e.target.value) } 
                          }))}
                          className="flex-1 accent-purple-500"
                        />
                        <div className="w-10 text-right font-medium">{assessment.writing[k]}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-3">Writing Tasks</h3>
                  
                  <div className="flex gap-2 mb-4">
                    <input 
                      value={writingTaskInput} 
                      onChange={(e) => setWritingTaskInput(e.target.value)} 
                      className="flex-1 border border-slate-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200" 
                      placeholder="Add a writing prompt" 
                    />
                    <button 
                      onClick={addWritingTask} 
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => genPrompt("writing")} 
                    className="w-full mb-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                  >
                    Generate Writing Prompt
                  </button>
                  
                  <div className="space-y-4">
                    {writingTasks.map(task => (
                      <div key={task.id} className="border border-slate-200 rounded-xl p-4">
                        <div className="font-bold mb-2">{task.prompt}</div>
                        <textarea
                          value={task.response}
                          onChange={(e) => updateWritingResponse(task.id, e.target.value)}
                          className="w-full h-32 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-200"
                          placeholder="Type your response here..."
                        />
                        <div className="text-sm text-slate-500 mt-1 text-right">
                          {task.response.length} words
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Resources */}
            {activeTab === "resources" && (
              <div className="bg-white rounded-xl shadow-md p-5">
                <h2 className="font-bold text-xl mb-4">Learning Resources</h2>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg">Tips & Strategies</h3>
                    <button 
                      onClick={fetchNewTip}
                      disabled={isLoadingTip}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isLoadingTip ? "Loading..." : "Get New Tip"}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {tips.map((tip) => (
                      <div key={tip.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-start hover:border-indigo-300 transition">
                        <div>
                          <div className="font-medium flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                            {tip.title}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">{tip.text}</div>
                          <div className="text-xs text-slate-400 mt-2 flex items-center">
                            <FiHelpCircle className="mr-1" /> {tip.category} • {tip.source}
                          </div>
                        </div>
                        <button 
                          onClick={() => markTipFav(tip.id)} 
                          className={`text-lg ${favs.includes(tip.id) ? 'text-amber-500' : 'text-slate-300'}`}
                        >
                          <FiStar />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-3">Recommended Resources</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition">
                      <div className="font-bold mb-1">Official IELTS Materials</div>
                      <div className="text-sm text-slate-600">Practice tests and preparation materials</div>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition">
                      <div className="font-bold mb-1">Vocabulary Lists</div>
                      <div className="text-sm text-slate-600">Academic word list and topic vocabulary</div>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition">
                      <div className="font-bold mb-1">Grammar Guides</div>
                      <div className="text-sm text-slate-600">Essential grammar for IELTS writing</div>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition">
                      <div className="font-bold mb-1">Practice Partners</div>
                      <div className="text-sm text-slate-600">Connect with other IELTS candidates</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Right column: Progress + Tips */}
          <section className="lg:col-span-1 space-y-6">
            {/* Progress History */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <h2 className="font-bold text-lg mb-4 flex items-center">
                <FiBarChart2 className="mr-2 text-indigo-500" /> Progress History
              </h2>
              
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-500">Snapshots saved: {history.length}</div>
                <button 
                  onClick={clearAll}
                  className="text-sm flex items-center text-red-600 hover:text-red-800"
                >
                  <FiTrash2 className="mr-1" /> Clear All
                </button>
              </div>
              
              <div className="h-80 overflow-y-auto">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    No history yet. Save your first assessment!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((h) => (
                      <div key={h.date} className="border border-slate-200 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center text-sm text-slate-500">
                            <FiCalendar className="mr-1" /> {h.date}
                          </div>
                          <div className="font-bold text-lg">{h.overall}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-xs">
                            <span className="font-medium">Speaking:</span> {h.speaking}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Listening:</span> {h.listening}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Reading:</span> {h.reading}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Writing:</span> {h.writing}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Plan */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <h2 className="font-bold text-lg mb-4">Study Plan to Reach Target Band</h2>
              
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                <li>Record and evaluate: do 3 timed recordings per week and compare to band 8+ samples.</li>
                <li>Vocabulary expansion: learn 10–15 high-utility phrases per topic weekly.</li>
                <li>Target weak points: if grammar score lags, do focused grammar drills.</li>
                <li>Simulate exam conditions: full mock tests every 2 weeks.</li>
                <li>Daily practice: consistent 30–60 minute sessions.</li>
              </ol>
              
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="font-medium text-indigo-700">Today's Recommendation</div>
                <div className="text-sm mt-1">Complete 2 speaking practice sessions and review 10 vocabulary words</div>
              </div>
            </div>
          </section>
        </main>

        <footer className="max-w-7xl mx-auto mt-6 text-sm text-slate-500">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
            <div>IELTS Prep Tracker • Comprehensive preparation for all IELTS skills</div>
            <div className="flex gap-2">
              <button 
                onClick={() => alert('Tip: Consistency is key! Practice a little every day rather than cramming before the test.')} 
                className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Quick Tip
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}