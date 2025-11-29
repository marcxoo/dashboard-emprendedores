import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Database } from '../data/Database';
import { csvContent } from '../data/csvData';
import { generarAsignacionParaSemana } from '../data/AssignmentLogic';


const DataContext = createContext();

export function DataProvider({ children }) {
    const [db] = useState(() => new Database());
    const [isLoaded, setIsLoaded] = useState(false);
    const [entrepreneurs, setEntrepreneurs] = useState([]);
    const [assignments, setAssignments] = useState([]);

    // Date State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
    const [currentBlock, setCurrentBlock] = useState('lunes-martes');

    const initialLoadStarted = useRef(false);

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
        const weekString = `${year}-W${week.toString().padStart(2, '0')}`;

        setCurrentWeek(weekString);

        const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        let block = 'lunes-martes';
        if (dayOfWeek === 3 || dayOfWeek === 4) block = 'miercoles-jueves';
        if (dayOfWeek === 5) block = 'viernes';

        setCurrentBlock(block);
    }, [selectedDate]);

    const [earnings, setEarnings] = useState([]);

    const refreshData = async () => {
        await db.loadData();
        setEntrepreneurs([...db.getEmprendedores()]);
        setAssignments([...db.asignaciones]);
        setEarnings(Array.isArray(db.earnings) ? [...db.earnings] : []);
    };

    const generateAssignments = async (week) => {
        const newAssignments = generarAsignacionParaSemana(week, db);
        for (const a of newAssignments) {
            await db.saveAssignment(a);
        }
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
        const newEmp = await db.addEntrepreneur(data);
        await refreshData();
        return newEmp;
    };

    const updateEntrepreneur = async (id, data) => {
        const updatedEmp = await db.updateEntrepreneur(id, data);
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

    const value = {
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
        deleteEarning
    };

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
    return `${year}-W${week.toString().padStart(2, '0')}`;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}


