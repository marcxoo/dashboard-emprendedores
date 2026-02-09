import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { Database } from '../data/Database';
import { csvContent } from '../data/csvData';
import { generarAsignacionParaSemana } from '../data/AssignmentLogic';


const DataContext = createContext();

export function DataProvider({ children }) {
    const [db] = useState(() => new Database());
    const [isLoaded, setIsLoaded] = useState(false);
    const [entrepreneurs, setEntrepreneurs] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [customSurveys, setCustomSurveys] = useState([]);
    // Fairs State
    const [fairs, setFairs] = useState([]);
    const [fairEntrepreneurs, setFairEntrepreneurs] = useState([]);
    const [fairAssignments, setFairAssignments] = useState([]);
    const [fairSales, setFairSales] = useState([]);

    // Date State
    // Date State
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    });
    const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
    const [currentBlock, setCurrentBlock] = useState('lunes-martes');
    const [invitationLogs, setInvitationLogs] = useState([]);

    const initialLoadStarted = useRef(false);

    const refreshData = async () => {
        await db.loadData();
        setEntrepreneurs([...db.getEmprendedores()]);
        setAssignments([...db.asignaciones]);
        setEarnings(Array.isArray(db.earnings) ? [...db.earnings] : []);
        setCustomSurveys(db.getCustomSurveys ? [...db.getCustomSurveys()] : []);
        setInvitationLogs(db.getInvitationLogs ? [...db.getInvitationLogs()] : []);
        setFairs(db.getFairs ? [...db.getFairs()] : []);
        setFairEntrepreneurs(db.getFairEntrepreneurs ? [...db.getFairEntrepreneurs()] : []);
        setFairAssignments(db.getFairAssignments ? [...db.fairAssignments] : []); // access directly or via method if exists, db.fairAssignments is array
        setFairSales(db.fairSales ? [...db.fairSales] : []);
    };

    useEffect(() => {
        const initData = async () => {
            if (initialLoadStarted.current) return;
            initialLoadStarted.current = true;

            await db.loadInitialData(csvContent);
            await refreshData();
            setIsLoaded(true);
        };
        initData();
    }, []);

    // Update Week and Block when Date changes
    useEffect(() => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        const week = getWeekNumber(date);
        const weekString = `${year}-S${week.toString().padStart(2, '0')}`;

        setCurrentWeek(weekString);

        const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        let block = 'lunes-martes';
        if (dayOfWeek === 3 || dayOfWeek === 4) block = 'miercoles-jueves';
        if (dayOfWeek === 5) block = 'viernes';

        setCurrentBlock(block);
    }, [selectedDate]);

    const [earnings, setEarnings] = useState([]);



    const generateAssignments = async (week) => {
        const newAssignments = generarAsignacionParaSemana(week, db);
        await db.saveAssignmentsBatch(newAssignments);
        await refreshData();
    };

    const updateAssignmentStatus = async (id, status) => {
        await db.updateAssignmentStatus(id, status);
        await refreshData();
    };

    const updateAssignmentAttendance = async (id, attended, comments) => {
        await db.updateAssignmentAttendance(id, attended, comments);
        await refreshData();
    };

    const setManualAssignment = async (assignment) => {
        await db.setManualAssignment(assignment);
        await refreshData();
    };

    const removeAssignment = async (standId, week, jornada, bloque) => {
        await db.removeAssignment(standId, week, jornada, bloque);
        await refreshData();
    };

    const deleteAssignment = async (id) => {
        await db.deleteAssignment(id);
        await refreshData();
    };

    const getAssignmentsByWeek = (week) => {
        if (!week) return [];
        // Handle both S and W formats for backward compatibility
        const parts = week.split(/-[SW]/);
        if (parts.length === 2) {
            const [y, w] = parts;
            const sVariant = `${y}-S${w}`;
            const wVariant = `${y}-W${w}`;
            return assignments.filter(a => a.semana === sVariant || a.semana === wVariant);
        }
        return assignments.filter(a => a.semana === week);
    };

    const clearAllData = async () => {
        if (window.confirm('¿Estás seguro de que deseas borrar TODO el historial de asignaciones? Esta acción no se puede deshacer.')) {
            await db.clearData();
            await refreshData();
        }
    };

    const clearWeekAssignments = async (week) => {
        await db.clearWeekAssignments(week);
        await refreshData();
    };

    const clearBlockAssignments = async (week, block) => {
        await db.clearBlockAssignments(week, block);
        await refreshData();
    };

    const addEntrepreneur = async (data) => {
        try {
            const newEmp = await db.addEntrepreneur(data);
            await refreshData();
            return newEmp;
        } catch (error) {
            console.error('DataContext addEntrepreneur error:', error);
            throw error;
        }
    };

    const updateEntrepreneur = async (id, data) => {
        // Optimistic update
        setEntrepreneurs(prev => prev.map(e =>
            e.id === id ? { ...e, ...data } : e
        ));

        const updatedEmp = await db.updateEntrepreneur(id, data);
        // We still refresh to ensure consistency, but the UI has already updated
        await refreshData();
        return updatedEmp;
    };

    const deleteEntrepreneur = async (id) => {
        const success = await db.deleteEntrepreneur(id);
        if (success) await refreshData();
        return success;
    };

    const addEarning = async (data) => {
        const newEarning = await db.addEarning(data);
        if (newEarning) await refreshData();
        return newEarning;
    };

    const deleteEarning = async (id) => {
        const success = await db.deleteEarning(id);
        if (success) await refreshData();
        return success;
    };

    // Custom Survey Methods
    const addCustomSurvey = async (surveyData) => {
        const newSurvey = await db.addCustomSurvey(surveyData);
        await refreshData();
        return newSurvey;
    };

    const deleteCustomSurvey = async (id) => {
        const success = await db.deleteCustomSurvey(id);
        if (success) await refreshData();
        return success;
    };

    const updateCustomSurvey = async (id, data) => {
        const success = await db.updateCustomSurvey(id, data);
        if (success) await refreshData();
        return success;
    };

    const addSurveyResponse = async (surveyId, responseData) => {
        const result = await db.addSurveyResponse(surveyId, responseData);
        if (result) await refreshData();
        return result;
    };

    const getSurveyById = (id) => {
        return customSurveys.find(s => s.id === id);
    };

    const value = useMemo(() => ({
        db,
        isLoaded,
        entrepreneurs,
        assignments,
        earnings,
        currentWeek,
        setCurrentWeek,
        selectedDate,
        setSelectedDate,
        currentBlock,
        generateAssignments,
        updateAssignmentStatus,
        setManualAssignment,
        removeAssignment,
        deleteAssignment,
        getAssignmentsByWeek,
        refreshData,
        clearAllData,
        addEntrepreneur,
        updateEntrepreneur,
        deleteEntrepreneur,
        updateAssignmentAttendance,
        clearWeekAssignments,
        clearBlockAssignments,
        addEarning,
        deleteEarning,
        addFollowUp: async (id, data) => {
            const result = await db.addFollowUp(id, data);
            if (result) await refreshData();
            return result;
        },
        deleteFollowUp: async (id, index) => {
            const result = await db.deleteFollowUp(id, index);
            if (result) await refreshData();
            return result;
        },
        customSurveys,
        addCustomSurvey,
        updateCustomSurvey,
        deleteCustomSurvey,
        addSurveyResponse,
        getSurveyById,
        downloadCustomSurveyResponses: (id) => db.downloadCustomSurveyResponses(id),
        addInvitationLog: async (data) => {
            const result = await db.addInvitationLog(data);
            if (result) await refreshData();
            return result;
        },
        addInvitationLogBatch: async (dataArray) => {
            const result = await db.addInvitationLogBatch(dataArray);
            if (result.success) await refreshData();
            return result;
        },
        invitationLogs,

        // Fairs Portal
        fairs,
        fairEntrepreneurs,
        fairAssignments,

        addFair: async (data) => {
            const res = await db.addFair(data);
            if (res) await refreshData();
            return res;
        },
        updateFair: async (id, data) => {
            const res = await db.updateFair(id, data);
            if (res) await refreshData();
            return res;
        },
        deleteFair: async (id) => {
            const res = await db.deleteFair(id);
            if (res) await refreshData();
            return res;
        },
        addFairEntrepreneur: async (data) => {
            const res = await db.addFairEntrepreneur(data);
            if (res) await refreshData();
            return res;
        },
        updateFairEntrepreneur: async (id, data) => {
            const res = await db.updateFairEntrepreneur(id, data);
            if (res) await refreshData();
            return res;
        },
        deleteFairEntrepreneur: async (id) => {
            const res = await db.deleteFairEntrepreneur(id);
            if (res) await refreshData();
            return res;
        },
        assignEntrepreneurToFair: async (fairId, entId) => {
            const res = await db.assignEntrepreneurToFair(fairId, entId);
            if (res) await refreshData();
            return res;
        },
        removeEntrepreneurFromFair: async (fairId, entId) => {
            // Optimistic update
            setFairAssignments(prev => prev.filter(a =>
                !(a.fair_id === fairId && a.entrepreneur_id === entId)
            ));

            try {
                const res = await db.removeEntrepreneurFromFair(fairId, entId);
                if (res) refreshData();
                return res;
            } catch (error) {
                console.error("Error removing entrepreneur:", error);
                refreshData();
                return null;
            }
        },
        updateFairAssignmentStatus: async (fairId, entId, status) => {
            // Optimistic update
            setFairAssignments(prev => prev.map(a =>
                (a.fair_id === fairId && a.entrepreneur_id === entId)
                    ? { ...a, status }
                    : a
            ));

            try {
                const res = await db.updateFairAssignmentStatus(fairId, entId, status);
                if (res) refreshData();
                return res;
            } catch (error) {
                console.error("Error updating status:", error);
                refreshData();
                return null;
            }
        },
        bulkImportFairEntrepreneurs: async (fairId, data) => {
            const res = await db.bulkImportFairEntrepreneurs(fairId, data);
            if (res) await refreshData();
            return res;
        },
        // Sales
        fairSales,
        addFairSale: async (data) => {
            const res = await db.addFairSale(data);
            if (res) await refreshData();
            return res;
        },
        deleteFairSale: async (id) => {
            const res = await db.deleteFairSale(id);
            if (res) await refreshData();
            return res;
        }
    }), [
        db, isLoaded, entrepreneurs, assignments, earnings, currentWeek, selectedDate, currentBlock,
        customSurveys, invitationLogs, fairs, fairEntrepreneurs, fairAssignments, fairSales
    ]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}

function getCurrentWeek() {
    const now = new Date();
    return getWeekNumberString(now);
}

function getWeekNumberString(d) {
    const week = getWeekNumber(d);
    const year = d.getFullYear();
    return `${year}-S${week.toString().padStart(2, '0')}`;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}


