{
    view === 'list' && !viewingResultsId && (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Eventos Activos"
                    value={customSurveys.length}
                    icon={Calendar}
                    color="bg-blue-500/20"
                />
                <StatsCard
                    title="Respuestas Totales"
                    value={customSurveys.reduce((acc, s) => acc + (s.responses?.length || 0), 0)}
                    icon={Users}
                    color="bg-emerald-500/20"
                />
                <StatsCard
                    title="Vistas Totales"
                    value="1,234"
                    icon={LayoutList}
                    color="bg-orange-500/20"
                    trend={12}
                />
                <StatsCard
                    title="Tasa de Conversión"
                    value="24%"
                    icon={Trophy}
                    color="bg-purple-500/20"
                    trend={-5}
                />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/50 backdrop-blur-xl p-2 rounded-2xl border border-white/5">
                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar eventos..."
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-transparent focus:border-indigo-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-0 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setView('create')}
                        className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap flex items-center gap-2"
                    >
                        <Plus size={14} />
                        <span>Nuevo Evento</span>
                    </button>
                    <div className="h-8 w-px bg-white/10 mx-2"></div>
                    <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                        <LayoutGrid size={18} />
                    </button>
                    <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                        <LayoutList size={18} />
                    </button>
                </div>
            </div>

            {/* Folders Section (Grouped Surveys) */}
            {folders.length > 0 && activeFolder === null && (
                <div className="space-y-8">
                    {folders.map(folder => {
                        const folderSurveys = customSurveys.filter(s => parseSurveyNote(s.note).group === folder);
                        if (folderSurveys.length === 0) return null;

                        return (
                            <div key={folder} className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                            <LayoutList size={18} />
                                        </div>
                                        <h3 className="text-lg font-bold text-white">{folder}</h3>
                                        <span className="px-2 py-0.5 bg-white/5 text-slate-500 text-[10px] font-bold rounded-full">{folderSurveys.length}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {folderSurveys.map(survey => (
                                        <SurveyCard
                                            key={survey.id}
                                            survey={survey}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onViewResults={(id) => { setViewingResultsId(id); }}
                                            onCopy={copyToClipboard}
                                            onDragStart={handleSurveyDragStart}
                                            onDragEnd={handleSurveyDragEnd}
                                            simple={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Main Grid (Ungrouped or Active Folder) */}
            <div>
                {activeFolder && (
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setActiveFolder(null)}
                                className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h3 className="text-2xl font-black text-white">{activeFolder}</h3>
                                <p className="text-sm text-slate-500 font-medium">Carpeta de Eventos</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {isRenamingFolder ? (
                                <div className="flex items-center gap-2 animate-fade-in">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={tempFolderName}
                                        onChange={(e) => setTempFolderName(e.target.value)}
                                        className="bg-black/40 border border-purple-500/50 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-purple-500"
                                    />
                                    <button onClick={handleRenameFolder} className="p-2 bg-purple-500 text-white rounded-lg"><Check size={16} /></button>
                                    <button onClick={() => setIsRenamingFolder(false)} className="p-2 bg-white/10 text-slate-400 rounded-lg"><X size={16} /></button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { setTempFolderName(activeFolder); setIsRenamingFolder(true); }}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                                    >
                                        <Pencil size={14} /> Renombrar
                                    </button>
                                    <button
                                        onClick={handleDeleteFolder}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div
                    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${isDraggingOverMain ? 'bg-indigo-500/10 rounded-3xl p-4 border-2 border-dashed border-indigo-500/50 transition-all' : ''}`}
                    onDragOver={handleMainDragOver}
                    onDragLeave={handleMainDragLeave}
                    onDrop={handleMainDrop}
                >
                    {customSurveys
                        .filter(s => {
                            const { group } = parseSurveyNote(s.note);
                            // If viewing a folder, show only that folder's surveys
                            if (activeFolder) return group === activeFolder;
                            // If viewing main list, show only ungrouped surveys
                            return !group;
                        })
                        .map(survey => (
                            <SurveyCard
                                key={survey.id}
                                survey={survey}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onViewResults={(id) => { setViewingResultsId(id); }}
                                onCopy={copyToClipboard}
                                onDragStart={handleSurveyDragStart}
                                onDragEnd={handleSurveyDragEnd}
                            />
                        ))}

                    {/* Empty State */}
                    {activeFolder && customSurveys.filter(s => parseSurveyNote(s.note).group === activeFolder).length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-3xl">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                                <LayoutList size={32} className="opacity-50" />
                            </div>
                            <p className="font-bold">Carpeta vacía</p>
                            <p className="text-sm opacity-50">Arrastra formularios aquí</p>
                        </div>
                    )}

                    {/* New Card Button (Main view only) */}
                    {!activeFolder && (
                        <button
                            onClick={() => setView('create')}
                            className="group relative overflow-hidden rounded-[2rem] border border-dashed border-white/10 hover:border-indigo-500/50 bg-slate-900/30 hover:bg-indigo-500/10 transition-all duration-300 flex flex-col items-center justify-center gap-4 min-h-[300px]"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-indigo-500 text-slate-500 group-hover:text-white flex items-center justify-center transition-colors shadow-lg shadow-black/20 group-hover:shadow-indigo-500/50 group-hover:-translate-y-2 transform duration-300">
                                <Plus size={32} />
                            </div>
                            <span className="font-bold text-slate-500 group-hover:text-indigo-300 transition-colors">Crear Nuevo Evento</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
