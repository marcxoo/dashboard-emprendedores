import { useState, useEffect, useMemo } from 'react';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Filter from 'lucide-react/dist/esm/icons/filter';
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Pencil from 'lucide-react/dist/esm/icons/pencil';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Save from 'lucide-react/dist/esm/icons/save';
import Search from 'lucide-react/dist/esm/icons/search';
import Clock from 'lucide-react/dist/esm/icons/clock';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Users from 'lucide-react/dist/esm/icons/users';
import Download from 'lucide-react/dist/esm/icons/download';
import { Checkbox } from "@/components/ui/checkbox";
import { responsibleOptions } from '@/data/eventsData';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AvatarGroup from '@/components/ui/AvatarGroup';
import { AnimatePresence, motion } from 'framer-motion';
// Image Mapping for Events
const EVENT_IMAGES = {
    'bootcamp parte iii': 'https://i.imgur.com/hmqpdCKh.jpg',
    'bootcamp parte 3': 'https://i.imgur.com/hmqpdCKh.jpg',
    'bootcamp parte ii': 'https://i.imgur.com/vJd6Ucqh.jpg',
    'bootcamp parte 2': 'https://i.imgur.com/vJd6Ucqh.jpg',
    'misión huancavilca': 'https://i.imgur.com/AbiYAnjh.jpg',
    'mision huancavilca': 'https://i.imgur.com/AbiYAnjh.jpg',
    'emprendex': 'https://i.imgur.com/aWzHp0dh.jpg',
    'taller': 'https://i.imgur.com/ezqazBkh.jpg',
    'emprender': 'https://i.imgur.com/JdPJahoh.jpg',
    'networking': 'https://i.imgur.com/vOjQxE7h.jpg',
    'webinar': 'https://i.imgur.com/685rKvAh.jpg',
    'bootcamp': 'https://i.imgur.com/zQtA3Nqh.jpg'
};

const getEventImage = (ev) => {
    if (!ev) return null;
    const searchString = `${ev.name || ''} ${ev.type || ''}`.toLowerCase();
    const match = Object.keys(EVENT_IMAGES).find(key => searchString.includes(key.toLowerCase()));
    return match ? EVENT_IMAGES[match] : null;
};
const TEAM_AVATARS = {
    'ANGIE': 'https://sga.unemi.edu.ec/media/fotos/2025/02/20/foto_aholguinb2025220152859.jpeg',
    'MARCOS': 'https://sga.unemi.edu.ec/media/fotos/2025/09/09/foto_mlojas202599123822.png',
    'CARLOS': 'https://sga.unemi.edu.ec/media/fotos/2023/06/29/foto_202362981126.jpg',
    'XUXA': 'https://sga.unemi.edu.ec/media/fotos/2023/01/22/foto_2023122124839.jpg',
    'JAEL': 'https://www.unemi.edu.ec/wp-content/uploads/2025/09/ZAMBRANO-MIELES-JAEL-DOLORES-scaled.jpg'
};

const EVENT_SEMESTERS = {
    S1: {
        label: '1er Semestre',
        trimesters: {
            T1: { label: 'Trimestre 1', months: ['ENERO', 'FEBRERO', 'MARZO'] },
            T2: { label: 'Trimestre 2', months: ['ABRIL', 'MAYO', 'JUNIO'] },
        }
    },
    S2: {
        label: '2do Semestre',
        trimesters: {
            T1: { label: 'Trimestre 1', months: ['JULIO', 'AGOSTO', 'SEPTIEMBRE'] },
            T2: { label: 'Trimestre 2', months: ['OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'] },
        }
    }
};

const getAvatarUrl = (name) => {
    const upperName = name.toUpperCase();
    for (const [key, url] of Object.entries(TEAM_AVATARS)) {
        if (upperName.includes(key)) return url;
    }
    return null;
};

const MotionDiv = motion.div;

function EventDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    // URL-driven helper
    const updateParams = (updates) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            Object.entries(updates).forEach(([k, v]) => {
                if (v === null || v === undefined || v === '') next.delete(k);
                else next.set(k, v);
            });
            return next;
        }, { replace: true });
    };
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    // Derived from URL search params
    const trackingModalOpen = searchParams.get('seguimiento') || null;
    const isFormOpen = searchParams.has('modal');
    const [currentEvent, setCurrentEvent] = useState(null);
    const [formData, setFormData] = useState({
        month: 'ENERO',
        type: 'Taller',
        name: '',
        scope: 'Interno',
        guest: '',
        responsibles: [],
        participants_count: 0,
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        indicator: 'Eventos de capacitación',
        tracking: [
            { id: '1', label: 'Correos Enviados', completed: false },
            { id: '2', label: 'Auditorio Solicitado', completed: false },
            { id: '3', label: 'Invitaciones Enviadas', completed: false },
            { id: '4', label: 'Confirmar Asistencia', completed: false },
            { id: '5', label: 'Recursos Listos', completed: false }
        ]
    });
    const [persistedResponsibleOptions, setPersistedResponsibleOptions] = useState([]);
    const [customResponsibleOptions, setCustomResponsibleOptions] = useState([]);
    const [newResponsibleName, setNewResponsibleName] = useState('');
    const [exportingFormat, setExportingFormat] = useState(null);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
        fetchPersistedResponsibles();
    }, []);

    const fetchPersistedResponsibles = async () => {
        const { data, error } = await supabase
            .from('event_responsibles')
            .select('name')
            .eq('active', true)
            .order('name', { ascending: true });

        if (error) {
            console.warn('No se pudo cargar event_responsibles:', error.message);
            return;
        }

        const names = (data || [])
            .map(item => (item.name || '').trim())
            .filter(Boolean);

        setPersistedResponsibleOptions(names);
    };

    const fetchEvents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('events_2026')
            .select('*')
            .in('status', ['active', 'not_executed']) // Fetch both active and not executed events
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching events:', error);
        } else {
            // Normalize tracking data
            const normalizedData = (data || []).map(ev => {
                if (!Array.isArray(ev.tracking)) {
                    // Convert legacy object to array
                    const legacyMap = {
                        emailsSent: 'Correos Enviados',
                        auditoriumRequested: 'Auditorio Solicitado',
                        invitationsSent: 'Invitaciones Enviadas',
                        confirmedAttendance: 'Confirmar Asistencia',
                        resourcesReady: 'Recursos Listos'
                    };
                    const newTracking = Object.keys(ev.tracking).map((key, index) => ({
                        id: `legacy-${index}`,
                        label: legacyMap[key] || key,
                        completed: ev.tracking[key]
                    }));
                    return { ...ev, tracking: newTracking };
                }
                return ev;
            });
            setEvents(normalizedData);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const toggleTracking = async (eventId, itemId) => {
        const event = events.find(e => e.id === eventId);
        if (!event) return;

        let updatedTracking;

        // Backward compatibility check
        if (!Array.isArray(event.tracking)) {
            // Convert old object to array if needed (though fetchEvents should handle this ideally)
            // For now, assuming data is normalized or we are handling array
            console.error("Tracking format error: expected array");
            return;
        }

        updatedTracking = event.tracking.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );

        // Optimistic update
        setEvents(prev => prev.map(ev => {
            if (ev.id === eventId) {
                return { ...ev, tracking: updatedTracking };
            }
            return ev;
        }));

        const { error } = await supabase
            .from('events_2026')
            .update({ tracking: updatedTracking })
            .eq('id', eventId);

        if (error) {
            console.error('Error updating tracking:', error);
            fetchEvents(); // Revert on error
        }
    };

    const getResponsibleDotColor = (name) => {
        const n = name.toUpperCase();
        if (n.includes('ANGIE')) return 'bg-pink-500 shadow-pink-500/50';
        if (n.includes('CARLOS')) return 'bg-blue-500 shadow-blue-500/50';
        if (n.includes('XUXA')) return 'bg-green-500 shadow-green-500/50';
        if (n.includes('MARCOS')) return 'bg-orange-500 shadow-orange-500/50';
        if (n.includes('JAEL')) return 'bg-purple-500 shadow-purple-500/50';
        return 'bg-slate-500 shadow-slate-500/50';
    };

    const getIndicatorColor = (indicator) => {
        switch (indicator) {
            case 'Eventos de capacitación': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500/30';
            case 'Eventos de sensibilización': return 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-500/30';
            case 'Encuentro de articulación profesional o emprendedora': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-500/30';
            default: return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'not_executed') {
            return (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40">
                    <div className="bg-red-600/95 backdrop-blur-md text-white text-[7px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-b-2xl shadow-xl shadow-red-900/40 border-x border-b border-white/20 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-100 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        No Ejecutado
                    </div>
                </div>
            );
        }
        return null;
    };

    const resetForm = () => {
        setFormData({
            month: 'ENERO',
            type: 'Taller',
            name: '',
            scope: 'Interno',
            guest: '',
            responsibles: [],
            participants_count: 0,
            date: '',
            startTime: '',
            endTime: '',
            location: '',
            status: 'active',
            indicator: 'Eventos de capacitación',
            tracking: [
                { id: '1', label: 'Correos Enviados', completed: false },
                { id: '2', label: 'Auditorio Solicitado', completed: false },
                { id: '3', label: 'Invitaciones Enviadas', completed: false },
                { id: '4', label: 'Confirmar Asistencia', completed: false },
                { id: '5', label: 'Recursos Listos', completed: false }
            ]
        });
        setCurrentEvent(null);
    };

    const handleAddNew = () => {
        resetForm();
        updateParams({ modal: 'nuevo' });
    };

    const handleEdit = (event) => {
        setCurrentEvent(event);
        setFormData({
            ...event,
            status: event.status || 'active',
            participants_count: Number.isFinite(event.participants_count) ? event.participants_count : 0,
            startTime: event.startTime ? event.startTime.slice(0, 5) : '',
            endTime: event.endTime ? event.endTime.slice(0, 5) : ''
        });
        updateParams({ modal: 'editar', eventoId: event.id });
    };

    // Sync edit modal from URL on load (deep-link support)
    useEffect(() => {
        const modalType = searchParams.get('modal');
        const eventId = searchParams.get('eventoId');
        if (modalType === 'editar' && eventId && events.length > 0 && !currentEvent) {
            const ev = events.find(e => e.id === eventId);
            if (ev) {
                setCurrentEvent(ev);
                setFormData({
                    ...ev,
                    participants_count: Number.isFinite(ev.participants_count) ? ev.participants_count : 0,
                    startTime: ev.startTime ? ev.startTime.slice(0, 5) : '',
                    endTime: ev.endTime ? ev.endTime.slice(0, 5) : ''
                });
            }
        }
        if (modalType === 'nuevo' && !currentEvent) {
            resetForm();
        }
    }, [searchParams, events, currentEvent]);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este evento?')) {
            // Optimistic delete
            setEvents(prev => prev.filter(ev => ev.id !== id));

            const { error } = await supabase
                .from('events_2026')
                .update({ status: 'deleted' }) // Soft delete
                .eq('id', id);

            if (error) {
                console.error('Error deleting event:', error);
                fetchEvents(); // Revert
            }
        }
    };

    const handleSave = async () => {
        const payload = {
            ...formData,
            // Ensure types match DB
            date: formData.date || null,
            startTime: formData.startTime || null,
            endTime: formData.endTime || null,
            participants_count: Math.max(0, Number.parseInt(formData.participants_count, 10) || 0),
        };

        // If editing, use ID. If new, Supabase generates ID (don't send custom numeric ID)
        if (currentEvent && currentEvent.id) {
            const { error } = await supabase
                .from('events_2026')
                .update(payload)
                .eq('id', currentEvent.id);

            if (error) console.error("Error updating", error);
        } else {
            // Remove ID if it exists in formData/payload to let DB generate UUID
            delete payload.id;
            const { error } = await supabase
                .from('events_2026')
                .insert([payload]);

            if (error) console.error("Error creating", error);
        }

        await fetchEvents(); // Refresh to get correct IDs/Data
        updateParams({ modal: null, eventoId: null });
        resetForm();
    };


    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleResponsibleChange = (resp) => {
        setFormData(prev => {
            const responsibles = prev.responsibles.includes(resp)
                ? prev.responsibles.filter(r => r !== resp)
                : [...prev.responsibles, resp];
            return { ...prev, responsibles };
        });
    };

    const availableResponsibleOptions = useMemo(() => {
        const fromEvents = events.flatMap(ev => Array.isArray(ev.responsibles) ? ev.responsibles : []);
        const fromForm = Array.isArray(formData.responsibles) ? formData.responsibles : [];

        return [...new Set(
            [...responsibleOptions, ...persistedResponsibleOptions, ...customResponsibleOptions, ...fromEvents, ...fromForm]
                .map(name => (name || '').trim().replace(/\s+/g, ' '))
                .filter(Boolean)
        )];
    }, [events, formData.responsibles, persistedResponsibleOptions, customResponsibleOptions]);

    const responsibleEventCounts = useMemo(() => {
        const counts = {};
        availableResponsibleOptions.forEach((resp) => {
            counts[resp] = events.filter(ev => Array.isArray(ev.responsibles) && ev.responsibles.includes(resp)).length;
        });
        return counts;
    }, [events, availableResponsibleOptions]);

    const baseResponsibleSet = useMemo(() => new Set(responsibleOptions), []);

    const handleAddResponsibleOption = () => {
        const normalized = newResponsibleName.trim().replace(/\s+/g, ' ').toUpperCase();
        if (!normalized) return;

        const existing = availableResponsibleOptions.find(
            resp => resp.toLowerCase() === normalized.toLowerCase()
        );
        const valueToUse = existing || normalized;

        const ensureSelected = () => {
            setFormData(prev => {
                if (prev.responsibles.includes(valueToUse)) return prev;
                return { ...prev, responsibles: [...prev.responsibles, valueToUse] };
            });
            setNewResponsibleName('');
        };

        if (existing) {
            ensureSelected();
            return;
        }

        setCustomResponsibleOptions(prev => [...prev, valueToUse]);
        ensureSelected();

        (async () => {
            const { error } = await supabase
                .from('event_responsibles')
                .upsert([{ name: valueToUse, active: true }], { onConflict: 'name' });

            if (error) {
                console.warn('No se pudo persistir el responsable en event_responsibles:', error.message);
                return;
            }

            await fetchPersistedResponsibles();
            setCustomResponsibleOptions(prev => prev.filter(r => r !== valueToUse));
        })();
    };

    const handleDeleteResponsibleOption = async (resp) => {
        if (baseResponsibleSet.has(resp)) {
            window.alert('Este responsable es base del sistema y no se puede eliminar.');
            return;
        }

        const inUseCount = responsibleEventCounts[resp] || 0;
        const msg = inUseCount > 0
            ? `"${resp}" está asignado en ${inUseCount} evento(s). Si lo eliminas del catálogo ya no saldrá para nuevos eventos, pero seguirá en los eventos existentes. ¿Deseas continuar?`
            : `¿Eliminar "${resp}" del catálogo de responsables?`;

        if (!window.confirm(msg)) return;

        setCustomResponsibleOptions(prev => prev.filter(r => r !== resp));
        setPersistedResponsibleOptions(prev => prev.filter(r => r !== resp));
        setFormData(prev => ({
            ...prev,
            responsibles: (prev.responsibles || []).filter(r => r !== resp)
        }));

        if (selectedResponsible === resp) {
            updateParams({ responsable: null });
        }

        const { error } = await supabase
            .from('event_responsibles')
            .update({ active: false })
            .eq('name', resp);

        if (error) {
            console.warn('No se pudo desactivar responsable:', error.message);
            await fetchPersistedResponsibles();
        }
    };

    // Auto-update Month and Indicator based on Type (Auto-Mapping logic)
    useEffect(() => {
        const typeToIndicator = {
            '@Emprender': 'Eventos de sensibilización',
            'Taller': 'Eventos de capacitación',
            'Webinar': 'Eventos de capacitación',
            'Emprendex': 'Eventos de sensibilización',
            'Networking': 'Encuentro de articulación profesional o emprendedora',
            'Bootcamp Parte I': 'Eventos de capacitación',
            'Bootcamp Parte II': 'Eventos de capacitación',
            'Bootcamp Parte III': 'Eventos de capacitación',
            'Otro': ''
        };

        if (formData.type && typeToIndicator[formData.type]) {
            setFormData(prev => ({ ...prev, indicator: typeToIndicator[formData.type] }));
        }

    }, [formData.type]);

    // Auto-update Month based on Date
    useEffect(() => {
        if (formData.date) {
            const dateObj = new Date(formData.date + 'T12:00:00');
            const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
            setFormData(prev => ({ ...prev, month: monthNames[dateObj.getMonth()] || 'ENERO' }));
        }
    }, [formData.date]);

    // Get current month name in Spanish
    const getCurrentMonthName = () => {
        const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
        return monthNames[new Date().getMonth()];
    };

    const selectedView = searchParams.get('vista') || 'cronograma';
    const selectedSemester = searchParams.get('semestre') || 'S1';
    const selectedTrimester = searchParams.get('trimestre') || 'T1';
    const selectedMonth = searchParams.get('mes') || getCurrentMonthName();
    const selectedResponsible = searchParams.get('responsable') || 'Todos';
    const searchTerm = searchParams.get('buscar') || '';
    const months = ['Todos', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

    const activeEvents = useMemo(
        () => events.filter(ev => ev.status === 'active'),
        [events]
    );

    const semesterStats = useMemo(() => {
        return Object.entries(EVENT_SEMESTERS).map(([semesterKey, semesterValue]) => {
            const trimesterStats = Object.entries(semesterValue.trimesters).map(([triKey, triValue]) => {
                const periodEvents = activeEvents.filter(ev => triValue.months.includes(ev.month));
                const participants = periodEvents.reduce((acc, ev) => acc + (Number.parseInt(ev.participants_count, 10) || 0), 0);
                return {
                    key: triKey,
                    label: triValue.label,
                    months: triValue.months,
                    events: periodEvents.length,
                    participants,
                    average: periodEvents.length ? Math.round(participants / periodEvents.length) : 0,
                };
            });

            const totalParticipants = trimesterStats.reduce((acc, t) => acc + t.participants, 0);
            const totalEvents = trimesterStats.reduce((acc, t) => acc + t.events, 0);
            return {
                key: semesterKey,
                label: semesterValue.label,
                trimesters: trimesterStats,
                totalParticipants,
                totalEvents,
                average: totalEvents ? Math.round(totalParticipants / totalEvents) : 0,
            };
        });
    }, [activeEvents]);

    const currentSemesterStats = semesterStats.find(s => s.key === selectedSemester) || semesterStats[0];
    const currentTrimesterStats = currentSemesterStats?.trimesters.find(t => t.key === selectedTrimester) || currentSemesterStats?.trimesters?.[0];
    const yearParticipantsTotal = useMemo(
        () => semesterStats.reduce((acc, s) => acc + (s.totalParticipants || 0), 0),
        [semesterStats]
    );
    const trimesterEventsList = useMemo(() => {
        if (!currentTrimesterStats?.months?.length) return [];
        return activeEvents
            .filter(ev => currentTrimesterStats.months.includes(ev.month))
            .sort((a, b) => (Number.parseInt(b.participants_count, 10) || 0) - (Number.parseInt(a.participants_count, 10) || 0));
    }, [activeEvents, currentTrimesterStats]);
    const trimesterTypeStats = useMemo(() => {
        const grouped = trimesterEventsList.reduce((acc, ev) => {
            const type = (ev.type || 'Sin tipo').trim();
            if (!acc[type]) {
                acc[type] = { type, participants: 0, events: 0 };
            }
            acc[type].participants += Number.parseInt(ev.participants_count, 10) || 0;
            acc[type].events += 1;
            return acc;
        }, {});

        return Object.values(grouped)
            .map((item) => ({
                ...item,
                average: item.events ? Math.round(item.participants / item.events) : 0,
            }))
            .sort((a, b) => b.participants - a.participants);
    }, [trimesterEventsList]);
    const semesterMonthlyStats = useMemo(() => {
        if (!currentSemesterStats?.trimesters?.length) return [];

        const monthsInSemester = currentSemesterStats.trimesters.flatMap((tri) => tri.months);

        return monthsInSemester.map((month) => {
            const monthEvents = activeEvents.filter((ev) => ev.month === month);
            const participants = monthEvents.reduce((acc, ev) => acc + (Number.parseInt(ev.participants_count, 10) || 0), 0);

            const byTypeMap = monthEvents.reduce((acc, ev) => {
                const type = (ev.type || 'Sin tipo').trim();
                if (!acc[type]) acc[type] = 0;
                acc[type] += Number.parseInt(ev.participants_count, 10) || 0;
                return acc;
            }, {});

            const byType = Object.entries(byTypeMap)
                .map(([type, total]) => ({ type, participants: total }))
                .sort((a, b) => b.participants - a.participants);

            return {
                month,
                participants,
                events: monthEvents.length,
                byType,
            };
        });
    }, [activeEvents, currentSemesterStats]);
    const previousTrimesterStats = useMemo(() => {
        if (!currentSemesterStats?.trimesters?.length || !currentTrimesterStats) return null;
        const currentIndex = currentSemesterStats.trimesters.findIndex((tri) => tri.key === currentTrimesterStats.key);
        if (currentIndex <= 0) return null;
        return currentSemesterStats.trimesters[currentIndex - 1];
    }, [currentSemesterStats, currentTrimesterStats]);

    const trimesterParticipantsDelta = useMemo(() => {
        if (!previousTrimesterStats) return null;
        const base = previousTrimesterStats.participants || 0;
        const current = currentTrimesterStats?.participants || 0;
        const delta = current - base;
        const percent = base > 0 ? Math.round((delta / base) * 100) : (current > 0 ? 100 : 0);
        return { delta, percent };
    }, [previousTrimesterStats, currentTrimesterStats]);

    const monthMaxParticipants = useMemo(
        () => Math.max(...semesterMonthlyStats.map((item) => item.participants), 1),
        [semesterMonthlyStats]
    );

    const typeMaxParticipants = useMemo(
        () => Math.max(...trimesterTypeStats.map((item) => item.participants), 1),
        [trimesterTypeStats]
    );

    const semesterShare = yearParticipantsTotal > 0
        ? Math.round(((currentSemesterStats?.totalParticipants || 0) / yearParticipantsTotal) * 100)
        : 0;

    const handleExportStatsCSV = () => {
        setExportingFormat('csv');
        const rows = [];
        rows.push(['Panel', 'Eventos 2026 - Estadísticas']);
        rows.push(['Semestre', currentSemesterStats?.label || '']);
        rows.push(['Trimestre', currentTrimesterStats?.label || '']);
        rows.push(['Meses', currentTrimesterStats?.months?.join(' / ') || '']);
        rows.push(['Participantes (semestre)', currentSemesterStats?.totalParticipants || 0]);
        rows.push(['Participantes (trimestre)', currentTrimesterStats?.participants || 0]);
        rows.push(['Eventos (trimestre)', currentTrimesterStats?.events || 0]);
        rows.push(['Promedio por evento', currentTrimesterStats?.average || 0]);
        rows.push([]);
        rows.push(['Comparativo trimestral']);
        rows.push(['Trimestre', 'Meses', 'Participantes', 'Eventos', 'Promedio']);
        (currentSemesterStats?.trimesters || []).forEach((tri) => {
            rows.push([tri.label, tri.months.join(' / '), tri.participants, tri.events, tri.average]);
        });
        rows.push([]);
        rows.push(['Participantes por tipo de evento (trimestre)']);
        rows.push(['Tipo', 'Participantes', 'Eventos', 'Promedio']);
        trimesterTypeStats.forEach((item) => {
            rows.push([item.type, item.participants, item.events, item.average]);
        });
        rows.push([]);
        rows.push(['Detalle mensual (semestre)']);
        rows.push(['Mes', 'Participantes', 'Eventos']);
        semesterMonthlyStats.forEach((item) => {
            rows.push([item.month, item.participants, item.events]);
            item.byType.forEach((t) => {
                rows.push([`  - ${t.type}`, t.participants, '']);
            });
        });
        rows.push([]);
        rows.push(['Eventos del trimestre']);
        rows.push(['Nombre', 'Tipo', 'Mes', 'Participantes']);
        trimesterEventsList.forEach((ev) => {
            rows.push([
                ev.name || ev.type || 'Sin nombre',
                ev.type || '',
                ev.month || '',
                Number.parseInt(ev.participants_count, 10) || 0,
            ]);
        });

        try {
            const csv = rows
                .map((row) => row.map((cell) => {
                    const value = cell === undefined || cell === null ? '' : String(cell);
                    return `"${value.replace(/"/g, '""')}"`;
                }).join(','))
                .join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `estadisticas_eventos_${selectedSemester}_${selectedTrimester}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } finally {
            setTimeout(() => setExportingFormat(null), 350);
        }
    };

    const handleExportStatsPDF = async () => {
        setExportingFormat('pdf');
        try {
            const { default: jsPDF } = await import('jspdf');
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            let y = 52;
            const lineHeight = 18;
            const pageBottom = 780;

            const writeLine = (text, size = 11, bold = false) => {
                if (y > pageBottom) {
                    doc.addPage();
                    y = 52;
                }
                doc.setFont('helvetica', bold ? 'bold' : 'normal');
                doc.setFontSize(size);
                doc.text(text, 40, y);
                y += lineHeight;
            };

            writeLine('Dashboard de Estadísticas - Eventos 2026', 16, true);
            y += 6;
            writeLine(`Semestre: ${currentSemesterStats?.label || '-'}`, 12, true);
            writeLine(`Trimestre: ${currentTrimesterStats?.label || '-'}`);
            writeLine(`Meses: ${currentTrimesterStats?.months?.join(' / ') || '-'}`);
            writeLine(`Participantes (semestre): ${currentSemesterStats?.totalParticipants || 0}`);
            writeLine(`Participantes (trimestre): ${currentTrimesterStats?.participants || 0}`);
            writeLine(`Eventos (trimestre): ${currentTrimesterStats?.events || 0}`);
            writeLine(`Promedio por evento: ${currentTrimesterStats?.average || 0}`);

            y += 8;
            writeLine('Comparativo trimestral', 13, true);
            (currentSemesterStats?.trimesters || []).forEach((tri) => {
                writeLine(`- ${tri.label} (${tri.months.join(' / ')}) | participantes: ${tri.participants} | eventos: ${tri.events} | promedio: ${tri.average}`);
            });

            y += 8;
            writeLine('Participantes por tipo de evento', 13, true);
            if (trimesterTypeStats.length === 0) {
                writeLine('- Sin datos por tipo para este trimestre');
            } else {
                trimesterTypeStats.forEach((item) => {
                    writeLine(`- ${item.type} | participantes: ${item.participants} | eventos: ${item.events} | promedio: ${item.average}`);
                });
            }

            y += 8;
            writeLine('Detalle mensual (semestre)', 13, true);
            if (semesterMonthlyStats.length === 0) {
                writeLine('- Sin datos mensuales para este semestre');
            } else {
                semesterMonthlyStats.forEach((item) => {
                    writeLine(`- ${item.month} | participantes: ${item.participants} | eventos: ${item.events}`);
                    item.byType.slice(0, 3).forEach((t) => {
                        writeLine(`   · ${t.type}: ${t.participants}`);
                    });
                });
            }

            doc.save(`estadisticas_eventos_${selectedSemester}_${selectedTrimester}.pdf`);
        } finally {
            setTimeout(() => setExportingFormat(null), 350);
        }
    };

    const filteredEvents = events.filter(ev => {
        const matchesResponsible = selectedResponsible === 'Todos' || ev.responsibles.includes(selectedResponsible);
        const matchesMonth = selectedMonth === 'Todos' || ev.month === selectedMonth;
        const matchesSearch = searchTerm === '' ||
            ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ev.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ev.indicator && ev.indicator.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesResponsible && matchesMonth && matchesSearch;
    });

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${hours}:${minutes} ${ampm}`;
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans selection:bg-primary-500/20">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 z-50 flex items-center px-4 justify-between transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <span className="font-bold text-white text-lg">E</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white tracking-tight">Events</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:fixed left-0 top-0 z-50 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 shadow-2xl lg:shadow-none transition-transform duration-300 ease-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                pt-16 lg:pt-0 flex flex-col
            `}>
                {/* Brand */}
                <div className="hidden lg:block p-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 border border-white/20">
                            <span className="font-bold text-xl text-white">E</span>
                        </div>
                        <h1 className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Emprende</h1>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 pl-1">Gestión de Eventos 2026</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Menú Principal</div>
                    <button
                        onClick={() => updateParams({ vista: 'cronograma' })}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group font-bold ${selectedView === 'cronograma'
                            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                    >
                        <CalendarDays size={20} className="text-primary-600 dark:text-primary-400" />
                        <span>Cronograma 2026</span>
                    </button>
                    <button
                        onClick={() => updateParams({ vista: 'estadisticas' })}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group font-bold ${selectedView === 'estadisticas'
                            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                    >
                        <BarChart3 size={20} className="text-primary-600 dark:text-primary-400" />
                        <span>Estadísticas</span>
                    </button>
                </nav>

                {/* User Profile & Back to Portal */}
                <div className="p-4 m-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm text-slate-600 font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate opacity-80">{user?.email || 'admin@emprende.com'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => navigate('/portal')} className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/5 transition-all text-xs font-bold shadow-sm hover:shadow">
                            <ArrowLeft size={14} /> Portal
                        </button>
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 border border-slate-200 dark:border-white/5 transition-all text-xs font-bold shadow-sm hover:shadow">
                            <LogOut size={14} /> Salir
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 min-h-screen pt-20 lg:pt-0 bg-slate-50 dark:bg-slate-900 transition-all duration-300 w-full max-w-full overflow-x-hidden">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8 px-4 lg:px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            {selectedView === 'estadisticas' ? 'Dashboard de Estadísticas' : 'Panel de Eventos'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {selectedView === 'estadisticas'
                                ? 'Participantes por semestre y trimestre'
                                : 'Gestión y seguimiento del cronograma 2026'}
                        </p>
                    </div>
                    {selectedView === 'cronograma' && <div className="flex items-center gap-3">
                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-600/30 hover:bg-primary-500 hover:scale-105 active:scale-95 transition-all duration-300 ring-2 ring-white/20 ring-offset-2 dark:ring-offset-slate-900"
                        >
                            <Plus size={20} className="stroke-[3px]" />
                            <span>Nuevo Evento</span>
                        </button>
                    </div>}
                    {selectedView === 'estadisticas' && <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleExportStatsCSV}
                            disabled={exportingFormat !== null}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Download size={16} /> {exportingFormat === 'csv' ? 'Exportando...' : 'CSV'}
                        </button>
                        <button
                            onClick={handleExportStatsPDF}
                            disabled={exportingFormat !== null}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Download size={16} /> {exportingFormat === 'pdf' ? 'Exportando...' : 'PDF'}
                        </button>
                    </div>}
                </header>

                <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full space-y-8">
                    {selectedView === 'estadisticas' && (
                        loading ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map((n) => (
                                        <div key={n} className="h-28 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/60 animate-pulse" />
                                    ))}
                                </div>
                                <div className="h-72 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/60 animate-pulse" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-800/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-white/10 p-5 shadow-sm space-y-4 lg:sticky lg:top-28 h-fit">
                                    <div className="pb-3 border-b border-slate-100 dark:border-white/5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Navegación</p>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Semestres y Trimestres</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total anual: <span className="font-semibold text-slate-700 dark:text-slate-300">{yearParticipantsTotal} participantes</span></p>
                                    </div>

                                    {semesterStats.map((semester) => (
                                        <div key={semester.key} className="space-y-2">
                                            <button
                                                onClick={() => updateParams({ semestre: semester.key, trimestre: 'T1' })}
                                                className={`w-full px-4 py-3 rounded-2xl text-left font-bold transition-all border ${selectedSemester === semester.key
                                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20 border-primary-500/50'
                                                    : 'bg-white/80 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/70'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span>{semester.label}</span>
                                                    <span className={`text-[11px] px-2 py-1 rounded-full ${selectedSemester === semester.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                                        {semester.totalParticipants}
                                                    </span>
                                                </div>
                                            </button>

                                            {selectedSemester === semester.key && (
                                                <div className="pl-2 space-y-2">
                                                    {semester.trimesters.map((tri) => (
                                                        <button
                                                            key={tri.key}
                                                            onClick={() => updateParams({ semestre: semester.key, trimestre: tri.key })}
                                                            className={`w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors border ${selectedTrimester === tri.key
                                                                ? 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm dark:bg-slate-700/50 dark:border-slate-600 dark:text-white'
                                                                : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-300'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span>{tri.label}</span>
                                                                <span className="text-[11px] opacity-80">{tri.participants}</span>
                                                            </div>
                                                            <span className="block text-[11px] opacity-70 mt-0.5">{tri.months.join(' - ')}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                                    <AnimatePresence mode="wait">
                                        <MotionDiv
                                            key={`${selectedSemester}-${selectedTrimester}`}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.22, ease: 'easeOut' }}
                                            className="space-y-6"
                                        >
                                            {activeEvents.length === 0 && (
                                                <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 p-6">
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Todavía no hay eventos ejecutados con datos para estadísticas.</p>
                                                    <p className="text-xs text-slate-500 mt-1">Registra eventos y completa el campo de participantes para ver métricas aquí.</p>
                                                </div>
                                            )}
                                            <div className="relative overflow-hidden rounded-3xl border border-primary-500/20 bg-gradient-to-br from-primary-50/50 to-white dark:from-slate-800/90 dark:to-slate-900/90 dark:border-primary-500/10 p-6 sm:p-8 shadow-sm">
                                                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative z-10">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600/80 dark:text-primary-400/80 mb-1.5">Resumen del periodo</p>
                                                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{currentSemesterStats?.label} <span className="text-slate-400 dark:text-slate-500 font-normal">·</span> {currentTrimesterStats?.label}</h3>
                                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-2">Meses: <span className="text-slate-500">{currentTrimesterStats?.months?.join(' - ') || '-'}</span></p>
                                                        {trimesterParticipantsDelta && (
                                                            <div className="mt-4 flex items-center gap-2">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${trimesterParticipantsDelta.delta >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                                                                    {trimesterParticipantsDelta.delta >= 0 ? '+' : ''}{trimesterParticipantsDelta.percent}%
                                                                </span>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">vs trimestre anterior</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-left md:text-right">
                                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Peso en el año</p>
                                                        <div className="flex items-baseline md:justify-end gap-1">
                                                            <p className="text-4xl font-bold tracking-tighter text-slate-900 dark:text-white">{semesterShare}</p>
                                                            <p className="text-xl font-medium text-slate-400">%</p>
                                                        </div>
                                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mt-2">Total anual: {yearParticipantsTotal}</p>
                                                    </div>
                                                </div>
                                                {/* Abstract accent glow */}
                                                <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                                <div className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 to-transparent"></div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Semestre activo</p>
                                                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{currentSemesterStats?.label || '-'}</p>
                                                </div>
                                                <div className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/20 to-transparent"></div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Participantes <span className="opacity-70">(Semestre)</span></p>
                                                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{currentSemesterStats?.totalParticipants || 0}</p>
                                                </div>
                                                <div className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Eventos <span className="opacity-70">(Trimestre)</span></p>
                                                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{currentTrimesterStats?.events || 0}</p>
                                                </div>
                                                <div className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/20 to-transparent"></div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Participantes <span className="opacity-70">(Trimestre)</span></p>
                                                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{currentTrimesterStats?.participants || 0}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                                                <div className="xl:col-span-3 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200/50 dark:border-white/5 p-6 shadow-sm">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Comparativo trimestral</h3>
                                                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{currentSemesterStats?.label}</span>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {(currentSemesterStats?.trimesters || []).map((tri) => {
                                                            const maxParticipants = Math.max(...(currentSemesterStats?.trimesters || []).map(t => t.participants), 1);
                                                            const width = tri.participants > 0 ? Math.max(2, Math.round((tri.participants / maxParticipants) * 100)) : 0;
                                                            return (
                                                                <button
                                                                    key={tri.key}
                                                                    onClick={() => updateParams({ trimestre: tri.key })}
                                                                    className={`w-full group text-left rounded-2xl p-4 border transition-all duration-200 ${selectedTrimester === tri.key ? 'bg-slate-50/50 border-slate-200 shadow-sm dark:bg-slate-700/30 dark:border-slate-600' : 'border-transparent hover:bg-slate-50/50 hover:border-slate-200/50 dark:hover:bg-slate-700/20 dark:hover:border-slate-700/50'}`}
                                                                >
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{tri.label} <span className="text-slate-400 font-normal ml-1">{tri.months.join(' - ')}</span></p>
                                                                        <div className="text-right">
                                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{tri.participants}</p>
                                                                            <p className="text-[10px] text-slate-400">participantes</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                                                                        <div className="h-full rounded-full bg-primary-500 transition-all duration-700 ease-out" style={{ width: `${width}%` }}></div>
                                                                    </div>
                                                                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                                        <span>Eventos: <strong className="font-semibold text-slate-700 dark:text-slate-300">{tri.events}</strong></span>
                                                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                                        <span>Promedio: <strong className="font-semibold text-slate-700 dark:text-slate-300">{tri.average}</strong> / evento</span>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="xl:col-span-2 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200/50 dark:border-white/5 p-6 shadow-sm">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Top Eventos <span className="text-slate-400 font-normal">· Trimestre</span></h3>
                                                    </div>

                                                    <div className="space-y-3 max-h-[340px] overflow-y-auto scrollbar-thin pr-2">
                                                        {trimesterEventsList.length === 0 && (
                                                            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50 p-6 text-center">
                                                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sin eventos en este trimestre</p>
                                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Registra asistencia para ver el ranking.</p>
                                                            </div>
                                                        )}

                                                        {trimesterEventsList.map((ev, index) => (
                                                            <div key={ev.id} className="group flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                                                    index === 1 ? 'bg-slate-200 dark:bg-slate-600/50 text-slate-600 dark:text-slate-300' :
                                                                        index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                                                                            'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                                                                    }`}>
                                                                    {index + 1}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{ev.name || ev.type}</p>
                                                                    <p className="text-[11px] text-slate-500 truncate">{ev.month} · <span className="font-medium text-slate-600 dark:text-slate-400">{ev.type}</span></p>
                                                                </div>
                                                                <div className="text-right flex-shrink-0 flex items-center gap-1.5">
                                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                                        {Number.parseInt(ev.participants_count, 10) || 0}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">pers.</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Distribución por Tipo</h4>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trimestre</span>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {trimesterTypeStats.length === 0 && (
                                                                <p className="text-xs text-slate-500 text-center py-4">Sin datos por tipo.</p>
                                                            )}

                                                            {trimesterTypeStats.map((item) => (
                                                                <div key={item.type} className="group">
                                                                    <div className="flex items-center justify-between mb-1.5">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.type}</p>
                                                                        </div>
                                                                        <div className="flex items-baseline gap-1">
                                                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{item.participants}</span>
                                                                            <span className="text-[10px] text-slate-400">pers.</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full rounded-full bg-primary-500 transition-all duration-700 ease-out"
                                                                            style={{ width: `${item.participants > 0 ? Math.max(2, Math.round((item.participants / typeMaxParticipants) * 100)) : 0}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <div className="flex justify-between items-center mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <p className="text-[10px] text-slate-400">Eventos: {item.events}</p>
                                                                        <p className="text-[10px] text-slate-400">Promedio: {item.average}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Desglose Mensual</h4>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Semestre</span>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {semesterMonthlyStats.length === 0 && (
                                                                <p className="text-xs text-slate-500 text-center py-4">Sin datos mensuales.</p>
                                                            )}

                                                            {semesterMonthlyStats.map((item) => (
                                                                <details key={item.month} open={currentTrimesterStats?.months?.includes(item.month)} className="group rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 open:bg-white dark:open:bg-slate-800/50 transition-colors open:ring-1 open:ring-slate-200/50 dark:open:ring-white/5">
                                                                    <summary className="list-none cursor-pointer p-4 flex items-center justify-between select-none">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-500 transition-transform group-open:rotate-90">
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.month}</p>
                                                                                <p className="text-[10px] text-slate-400">{item.events} eventos</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right flex items-baseline gap-1">
                                                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{item.participants}</span>
                                                                            <span className="text-[10px] text-slate-500">pers.</span>
                                                                        </div>
                                                                    </summary>

                                                                    <div className="px-4 pb-4 text-sm">
                                                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden mb-3">
                                                                            <div
                                                                                className="h-full bg-primary-400 dark:bg-primary-500 rounded-full transition-all duration-700"
                                                                                style={{ width: `${item.participants > 0 ? Math.max(2, Math.round((item.participants / monthMaxParticipants) * 100)) : 0}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                                                                            {item.byType.length === 0 ? (
                                                                                <p className="text-xs text-slate-400">Sin eventos este mes.</p>
                                                                            ) : (
                                                                                item.byType.map((t) => (
                                                                                    <div key={`${item.month}-${t.type}`} className="flex justify-between items-center text-xs">
                                                                                        <span className="text-slate-500 dark:text-slate-400">{t.type}</span>
                                                                                        <span className="font-medium text-slate-700 dark:text-slate-300">{t.participants}</span>
                                                                                    </div>
                                                                                ))
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </details>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </MotionDiv>
                                    </AnimatePresence>
                                </div>
                            </div>
                        )
                    )}

                    {
                        selectedView === 'cronograma' && (
                            <>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                                            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                <Calendar size={18} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">Total Eventos</span>
                                        </div>
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">{events.filter(e => e.status === 'active').length}</span>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle size={18} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">Completados</span>
                                        </div>
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                                            {events.filter(e => e.status === 'active' && (Array.isArray(e.tracking) ? e.tracking.some(t => t.completed) : Object.values(e.tracking).some(t => t))).length}
                                        </span>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                                            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                                <Clock size={18} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">Próximo Mes</span>
                                        </div>
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                                            {events.filter(e => e.status === 'active' && e.month === 'ENERO').length}
                                        </span>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                                            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                                <Filter size={18} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">Filtrados</span>
                                        </div>
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                                            {filteredEvents.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Filters Section */}
                                <div className="flex flex-col gap-6">



                                    {/* Search and Filters Container */}
                                    <div className="flex flex-col gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-800">

                                        {/* Search Bar */}
                                        <div className="relative group">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-400 transition-colors" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Buscar evento por nombre, tipo..."
                                                value={searchTerm}
                                                onChange={(e) => updateParams({ buscar: e.target.value || null })}
                                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-200 font-medium"
                                            />
                                        </div>

                                        {/* Month Filter - Improved */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-bold text-sm ml-1">
                                                <Calendar size={18} className="text-orange-500" />
                                                <span>Filtrar por Mes</span>
                                            </div>
                                            <div className="flex overflow-x-auto pb-4 -mx-1 px-1 gap-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                                {months.map(month => (
                                                    <button
                                                        key={month}
                                                        onClick={() => updateParams({ mes: month === getCurrentMonthName() ? null : month })}
                                                        className={`px-6 py-2.5 rounded-2xl text-xs font-black tracking-wide whitespace-nowrap snap-center transition-all duration-300 border uppercase ${selectedMonth === month
                                                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-lg shadow-slate-900/20 dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] transform scale-105'
                                                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800/50 dark:text-slate-500 dark:border-slate-700/50 dark:hover:bg-slate-800 dark:hover:border-slate-600 dark:hover:text-slate-300'
                                                            }`}
                                                    >
                                                        {month}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Responsible Filter */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-bold text-sm ml-1">
                                                <Filter size={18} className="text-orange-500" />
                                                <span>Filtrar por Responsable</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => updateParams({ responsable: null })}
                                                    className={`px-6 py-2.5 rounded-2xl text-xs font-black tracking-wide transition-all duration-300 border uppercase ${selectedResponsible === 'Todos'
                                                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-lg shadow-slate-900/20 dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] transform scale-105'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800/50 dark:text-slate-500 dark:border-slate-700/50 dark:hover:bg-slate-800 dark:hover:border-slate-600 dark:hover:text-slate-300'
                                                        }`}
                                                >
                                                    Todos
                                                </button>
                                                {availableResponsibleOptions.map(resp => (
                                                    <button
                                                        key={resp}
                                                        onClick={() => updateParams({ responsable: selectedResponsible === resp ? null : resp })}
                                                        className={`pl-5 pr-6 py-2.5 rounded-2xl text-xs font-black tracking-wide transition-all duration-300 flex items-center gap-2.5 border uppercase ${selectedResponsible === resp
                                                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-lg shadow-slate-900/20 dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] transform scale-105'
                                                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800/50 dark:text-slate-500 dark:border-slate-700/50 dark:hover:bg-slate-800 dark:hover:border-slate-600 dark:hover:text-slate-300'
                                                            }`}
                                                        title={`${responsibleEventCounts[resp] || 0} eventos`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-300 ${getResponsibleDotColor(resp)}`}></div>
                                                        {resp.split(' ')[0]}
                                                        <span className="text-[10px] opacity-80">({responsibleEventCounts[resp] || 0})</span>
                                                    </button>
                                                ))}
                                            </div>
                                            {selectedResponsible !== 'Todos' && (
                                                <p className="text-xs text-slate-500 ml-1">
                                                    Responsable seleccionado: <span className="font-bold">{selectedResponsible}</span> ({responsibleEventCounts[selectedResponsible] || 0} eventos).
                                                    {filteredEvents.length === 0 && (
                                                        <button
                                                            onClick={() => updateParams({ responsable: null })}
                                                            className="ml-2 font-bold text-primary-600 hover:underline"
                                                        >
                                                            Ver todos
                                                        </button>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop View: Grid Layout */}
                                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                    {filteredEvents.map((ev, index) => {
                                        const isTrackingComplete = (Array.isArray(ev.tracking) && ev.tracking.length > 0 && ev.tracking.every(t => t.completed));
                                        const trackingCount = Array.isArray(ev.tracking) ? ev.tracking.filter(t => t.completed).length : 0;
                                        const trackingTotal = Array.isArray(ev.tracking) ? ev.tracking.length : 0;

                                        return (
                                            <div
                                                key={ev.id}
                                                className={`group relative bg-white dark:bg-slate-800/80 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 border border-slate-200/60 dark:border-white/5 flex flex-col ${(ev.status === 'not_executed' || new Date(ev.date) < new Date().setHours(0, 0, 0, 0)) ? 'grayscale opacity-70 hover:grayscale-[0.5] hover:opacity-100' : ''}`}
                                            >
                                                {/* Header Gradient / Image Area */}
                                                <div className={`h-56 relative overflow-hidden rounded-t-[2rem] ${getEventImage(ev) ? 'bg-slate-900' :
                                                    index % 4 === 0 ? 'bg-gradient-to-br from-blue-600 to-indigo-600' :
                                                        index % 4 === 1 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                                                            index % 4 === 2 ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                                                                'bg-gradient-to-br from-purple-600 to-pink-600'
                                                    }`}>

                                                    {/* Background Image if available */}
                                                    {getEventImage(ev) ? (
                                                        <>
                                                            <img
                                                                src={getEventImage(ev)}
                                                                alt="Event Header"
                                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                            {/* Minimal gradient for text readability at the very bottom, or remove entirely if preferred */}
                                                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent"></div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Abstract Shapes for Gradient */}
                                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:translate-x-1/3 transition-transform duration-700"></div>
                                                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:-translate-x-1/3 transition-transform duration-700"></div>
                                                        </>
                                                    )}

                                                    {/* Content Overlay */}
                                                    <div className="absolute inset-0 p-6 flex flex-col justify-between relative z-10">
                                                        {getStatusBadge(ev.status)}
                                                        <div className="flex justify-between items-start">
                                                            <div className={`${ev.type === '@Emprender' ? 'bg-slate-900/90 border-slate-700' : 'bg-white/25 border-white/30'} backdrop-blur-md border rounded-2xl p-2.5 text-center min-w-[3.5rem] shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                                <span className={`text-[9px] font-bold uppercase tracking-widest block mb-0.5 ${ev.type === '@Emprender' ? 'text-white/80' : 'text-white/90'}`}>
                                                                    {ev.date ? new Date(ev.date + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short' }).replace('.', '') : '---'}
                                                                </span>
                                                                <span className="text-2xl font-bold tracking-tight text-white leading-none">
                                                                    {ev.date ? new Date(ev.date + 'T12:00:00').getDate() : '?'}
                                                                </span>
                                                            </div>

                                                            {ev.guest && (
                                                                <div className="bg-black/30 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-lg">
                                                                    <span>⭐</span>
                                                                    <span className="max-w-[120px] truncate">{ev.guest}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Avatar Group Removed from Header to avoid duplication */}
                                                        {isTrackingComplete && (
                                                            <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg shadow-emerald-500/20 translate-y-2 group-hover:translate-y-0 transition-transform absolute bottom-6 right-6">
                                                                <CheckCircle size={18} strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Card Body */}
                                                <div className="p-6 flex flex-col flex-1">
                                                    <div className="mb-4">
                                                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${getIndicatorColor(ev.indicator).replace(' border ', ' ').replace('bg-opacity-20', 'bg-opacity-10')
                                                                }`}>
                                                                {ev.type}
                                                            </span>
                                                            {ev.indicator && (
                                                                <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                                                                    {ev.indicator}
                                                                </span>
                                                            )}
                                                            <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-md border ${ev.scope === 'Interno'
                                                                ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-500/20'
                                                                : 'bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/20'
                                                                }`}>
                                                                {ev.scope}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug mb-3 min-h-[3rem] line-clamp-2" title={ev.name}>
                                                            {ev.name || 'Evento sin nombre'}
                                                        </h3>

                                                        <div className="flex flex-col gap-2.5 mt-2">
                                                            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                                                                <Clock size={14} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                                                <span>
                                                                    {ev.startTime && ev.endTime ? `${formatTime(ev.startTime)} - ${formatTime(ev.endTime)}` : formatTime(ev.startTime) || 'Hora por definir'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                                                                <MapPin size={14} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                                                <span className="truncate">{ev.location || 'Por definir'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                                                                <Users size={14} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                                                <span><strong className="text-slate-700 dark:text-slate-300">{Number.parseInt(ev.participants_count, 10) || 0}</strong> personas registradas</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Divider */}
                                                    <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50 my-2"></div>

                                                    {/* Footer Info */}
                                                    <div className="mt-auto pt-4 flex items-center justify-between">
                                                        <div className="relative z-10"> {/* Removed flex -space-x-2 and added relative z-10 for robust stacking */}
                                                            <AvatarGroup
                                                                avatars={ev.responsibles.map(resp => ({
                                                                    src: getAvatarUrl(resp) || `https://ui-avatars.com/api/?name=${encodeURIComponent(resp)}&background=random&color=fff`,
                                                                    alt: resp,
                                                                    label: resp
                                                                }))}
                                                                maxVisible={5}
                                                                size={34}
                                                                overlap={8}
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                onClick={() => updateParams({ seguimiento: ev.id })}
                                                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border shadow-sm ${trackingTotal > 0 && trackingCount === trackingTotal
                                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80 dark:hover:bg-slate-700 dark:hover:border-slate-600'
                                                                    }`}
                                                            >
                                                                {trackingTotal > 0 ? `${trackingCount}/${trackingTotal} Tareas` : 'Ver'}
                                                            </button>

                                                            <div className="relative group/menu">
                                                                <button className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                                    <div className="flex gap-0.5">
                                                                        <div className="w-1 h-1 rounded-full bg-current"></div>
                                                                        <div className="w-1 h-1 rounded-full bg-current"></div>
                                                                        <div className="w-1 h-1 rounded-full bg-current"></div>
                                                                    </div>
                                                                </button>
                                                                {/* Dropdown Menu */}
                                                                <div className="absolute right-0 bottom-full w-32 pb-2 hidden group-hover/menu:block hover:block z-20 animate-in fade-in zoom-in-95 duration-200">
                                                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-white/5 p-1">
                                                                        <button
                                                                            onClick={() => handleEdit(ev)}
                                                                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2"
                                                                        >
                                                                            <Pencil size={12} /> Editar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(ev.id)}
                                                                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                                                        >
                                                                            <Trash2 size={12} /> Eliminar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Empty State Card */}
                                    <button
                                        onClick={handleAddNew}
                                        className="group h-full min-h-[300px] rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-900 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex items-center justify-center border-2 border-slate-100 dark:border-slate-700 group-hover:border-primary-200 dark:group-hover:border-primary-500/30">
                                            <Plus size={32} />
                                        </div>
                                        <span className="font-bold text-sm">Crear Nuevo Evento</span>
                                    </button>

                                    {filteredEvents.length === 0 && (
                                        <div className="col-span-full py-20 text-center">
                                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400 rotate-12">
                                                <Search size={32} />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No se encontraron eventos</h3>
                                            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                                Intenta ajustar los filtros o tu búsqueda para encontrar lo que necesitas.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    updateParams({ buscar: null, responsable: null, mes: null });
                                                }}
                                                className="mt-6 text-primary-600 dark:text-primary-400 font-bold hover:underline"
                                            >
                                                Limpiar filtros
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile View: Cards */}
                                <div className="md:hidden space-y-6 pb-24">
                                    {filteredEvents.map((ev, index) => {
                                        const isTrackingComplete = (Array.isArray(ev.tracking) && ev.tracking.length > 0 && ev.tracking.every(t => t.completed));
                                        const trackingCount = Array.isArray(ev.tracking) ? ev.tracking.filter(t => t.completed).length : 0;
                                        const trackingTotal = Array.isArray(ev.tracking) ? ev.tracking.length : 0;

                                        return (
                                            <div key={ev.id} className={`bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg border border-slate-100 dark:border-white/5 overflow-visible relative flex flex-col ${(ev.status === 'not_executed' || new Date(ev.date) < new Date().setHours(0, 0, 0, 0)) ? 'grayscale opacity-75' : ''}`}>
                                                {/* Header Gradient */}
                                                <div className={`h-52 relative rounded-t-[2rem] overflow-hidden ${getEventImage(ev) ? 'bg-slate-900' :
                                                    index % 4 === 0 ? 'bg-gradient-to-br from-blue-600 to-indigo-600' :
                                                        index % 4 === 1 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                                                            index % 4 === 2 ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                                                                'bg-gradient-to-br from-purple-600 to-pink-600'
                                                    }`}>
                                                    {getStatusBadge(ev.status)}

                                                    {/* Background Image if available */}
                                                    {getEventImage(ev) ? (
                                                        <>
                                                            <img
                                                                src={getEventImage(ev)}
                                                                alt="Event Header"
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent"></div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Abstract Shapes overlay */}
                                                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
                                                        </>
                                                    )}

                                                    {/* Date Badge */}
                                                    <div className={`absolute top-4 left-4 ${ev.type === '@Emprender' ? 'bg-slate-950/80 border-slate-800' : 'bg-white/20 border-white/20'} backdrop-blur-md border rounded-2xl p-2 text-center min-w-[3rem] flex flex-col shadow-lg`}>
                                                        <span className={`text-[9px] font-black uppercase tracking-wider ${ev.type === '@Emprender' ? 'text-white' : 'text-white/90'}`}>
                                                            {ev.date ? new Date(ev.date + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short' }).replace('.', '') : '---'}
                                                        </span>
                                                        <span className="text-xl font-black text-white leading-none mb-0.5">
                                                            {ev.date ? new Date(ev.date + 'T12:00:00').getDate() : '?'}
                                                        </span>
                                                    </div>

                                                    {/* Guest Badge */}
                                                    {ev.guest && (
                                                        <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                                                            <span>⭐</span>
                                                            <span className="max-w-[100px] truncate">{ev.guest}</span>
                                                        </div>
                                                    )}

                                                    {/* Completed Indicator */}
                                                    {isTrackingComplete && (
                                                        <div className="absolute bottom-4 right-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg shadow-emerald-500/20">
                                                            <CheckCircle size={16} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Card Content */}
                                                <div className="p-5 flex flex-col gap-4">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${getIndicatorColor(ev.indicator).replace(' border ', ' ').replace('bg-opacity-20', 'bg-opacity-10')
                                                                }`}>
                                                                {ev.type}
                                                            </span>
                                                            {ev.indicator && (
                                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                                                                    {ev.indicator}
                                                                </span>
                                                            )}
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ev.scope === 'Interno'
                                                                ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-500/20'
                                                                : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/20'
                                                                }`}>
                                                                {ev.scope}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                                            {ev.name || 'Evento sin nombre'}
                                                        </h3>
                                                        <div className="flex flex-col gap-1.5 mt-2">
                                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                                                                <Clock size={14} className="text-slate-400 flex-shrink-0" />
                                                                <span>
                                                                    {ev.startTime && ev.endTime ? `${formatTime(ev.startTime)} - ${formatTime(ev.endTime)}` : formatTime(ev.startTime) || 'Hora por definir'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                                                                <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                                                                <span className="truncate">{ev.location || 'Por definir'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                                                                <Users size={14} className="text-slate-400 flex-shrink-0" />
                                                                <span>{Number.parseInt(ev.participants_count, 10) || 0} participantes</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>

                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="relative z-10">
                                                            <AvatarGroup
                                                                avatars={ev.responsibles.map(resp => ({
                                                                    src: getAvatarUrl(resp) || `https://ui-avatars.com/api/?name=${encodeURIComponent(resp)}&background=random&color=fff`,
                                                                    alt: resp,
                                                                    label: resp
                                                                }))}
                                                                maxVisible={4}
                                                                size={32}
                                                                overlap={8}
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => updateParams({ seguimiento: ev.id })}
                                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${trackingTotal > 0 && trackingCount === trackingTotal
                                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/20'
                                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                                                                    }`}
                                                            >
                                                                {trackingTotal > 0 ? `${trackingCount}/${trackingTotal}` : 'Ver'}
                                                            </button>

                                                            <div className="relative group/menu">
                                                                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-white/5 rounded-xl">
                                                                    <div className="flex gap-0.5">
                                                                        <div className="w-1 h-1 rounded-full bg-current"></div>
                                                                        <div className="w-1 h-1 rounded-full bg-current"></div>
                                                                        <div className="w-1 h-1 rounded-full bg-current"></div>
                                                                    </div>
                                                                </button>
                                                                {/* Dropdown Menu (adjusted for mobile) */}
                                                                <div className="absolute right-0 bottom-full w-32 pb-2 hidden group-hover/menu:block hover:block active:block focus-within:block z-20">
                                                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-white/5 p-1">
                                                                        <button
                                                                            onClick={() => handleEdit(ev)}
                                                                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2"
                                                                        >
                                                                            <Pencil size={12} /> Editar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(ev.id)}
                                                                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                                                        >
                                                                            <Trash2 size={12} /> Eliminar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tracking Modal Logic Reuse */}
                                                {trackingModalOpen === ev.id && (
                                                    <>
                                                        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm transition-opacity" onClick={() => updateParams({ seguimiento: null })}></div>
                                                        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[2.5rem] z-50 p-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-full duration-300 border-t border-slate-200 dark:border-white/10 max-h-[85vh] flex flex-col">

                                                            {/* Mobile Header */}
                                                            <div className="relative p-6 pb-8 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 rounded-t-[2.5rem] flex-shrink-0">
                                                                {/* Pull Indicator */}
                                                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4"></div>

                                                                <div className="flex justify-between items-start mb-4 mt-2">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-wider">
                                                                                Seguimiento
                                                                            </span>
                                                                            {(Array.isArray(ev.tracking) ? ev.tracking : []).every(t => t.completed) && (Array.isArray(ev.tracking) && ev.tracking.length > 0) && (
                                                                                <span className="flex items-center gap-1 text-emerald-500 font-bold text-[10px] uppercase tracking-wide">
                                                                                    <CheckCircle size={12} /> Listo
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight pr-8">
                                                                            {ev.name || ev.type}
                                                                        </h3>
                                                                    </div>
                                                                    <button onClick={() => updateParams({ seguimiento: null })} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
                                                                        <X size={20} />
                                                                    </button>
                                                                </div>

                                                                {/* Progress */}
                                                                {(() => {
                                                                    const items = Array.isArray(ev.tracking) ? ev.tracking : [];
                                                                    const total = items.length;
                                                                    const done = items.filter(i => i.completed).length;
                                                                    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

                                                                    return (
                                                                        <div className="space-y-2">
                                                                            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                                                <span>Tu Progreso</span>
                                                                                <span className="text-primary-600 dark:text-primary-400">{pct}%</span>
                                                                            </div>
                                                                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className="h-full bg-primary-500 transition-all duration-500 ease-out rounded-full"
                                                                                    style={{ width: `${pct}%` }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>

                                                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                                                <div className="space-y-3 pb-6">
                                                                    {Array.isArray(ev.tracking) && ev.tracking.map((item) => (
                                                                        <div key={item.id} className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${item.completed
                                                                            ? 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-75'
                                                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 shadow-sm'
                                                                            }`}>
                                                                            <Checkbox
                                                                                id={`mobile-${item.id}`}
                                                                                checked={item.completed}
                                                                                onCheckedChange={() => toggleTracking(ev.id, item.id)}
                                                                                className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 rounded-lg"
                                                                            />

                                                                            <div className="flex-1 min-w-0">
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.label}
                                                                                    onChange={(e) => {
                                                                                        const newValue = e.target.value;
                                                                                        setEvents(prev => prev.map(event => {
                                                                                            if (event.id === ev.id) {
                                                                                                const newTracking = event.tracking.map(t =>
                                                                                                    t.id === item.id ? { ...t, label: newValue } : t
                                                                                                );
                                                                                                return { ...event, tracking: newTracking };
                                                                                            }
                                                                                            return event;
                                                                                        }));
                                                                                    }}
                                                                                    onBlur={async () => {
                                                                                        await supabase
                                                                                            .from('events_2026')
                                                                                            .update({ tracking: ev.tracking })
                                                                                            .eq('id', ev.id);
                                                                                    }}
                                                                                    className={`w-full bg-transparent border-none p-0 text-base font-bold transition-colors ${item.completed
                                                                                        ? 'text-slate-400 dark:text-slate-500 line-through decoration-slate-400/50 decoration-2'
                                                                                        : 'text-slate-700 dark:text-slate-200'
                                                                                        }`}
                                                                                />
                                                                            </div>

                                                                            <button
                                                                                onClick={async () => {
                                                                                    if (!confirm('¿Eliminar paso?')) return;
                                                                                    const newTracking = ev.tracking.filter(t => t.id !== item.id);
                                                                                    setEvents(prev => prev.map(event => event.id === ev.id ? { ...event, tracking: newTracking } : event));
                                                                                    await supabase.from('events_2026').update({ tracking: newTracking }).eq('id', ev.id);
                                                                                }}
                                                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                            >
                                                                                <Trash2 size={18} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <button
                                                                    onClick={async () => {
                                                                        const newStep = {
                                                                            id: crypto.randomUUID(),
                                                                            label: 'Nuevo paso',
                                                                            completed: false
                                                                        };
                                                                        const newTracking = [...(ev.tracking || []), newStep];
                                                                        setEvents(prev => prev.map(event => event.id === ev.id ? { ...event, tracking: newTracking } : event));
                                                                        await supabase.from('events_2026').update({ tracking: newTracking }).eq('id', ev.id);
                                                                    }}
                                                                    className="w-full py-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mb-6"
                                                                >
                                                                    <Plus size={18} />
                                                                    Agregar Paso
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })
                                    }
                                </div >
                            </>
                        )
                    }
                </div >

                {/* Edit/Create Modal */}
                {
                    isFormOpen && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => updateParams({ modal: null, eventoId: null })}></div>
                            <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200 custom-scrollbar">
                                <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-10 transition-all">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                            {currentEvent ? 'Editar Evento' : 'Nuevo Evento'}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            Completa la información del evento
                                        </p>
                                    </div>
                                    <button onClick={() => updateParams({ modal: null, eventoId: null })} className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* Status Toggle */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.status === 'not_executed' ? 'bg-red-100 text-red-600 dark:bg-red-900/10 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400'}`}>
                                                {formData.status === 'not_executed' ? <X size={20} /> : <CheckCircle size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white">Estado del Evento</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Marcar si el taller se realizó o no</p>
                                            </div>
                                        </div>
                                        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${formData.status === 'active' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                            >
                                                Ejecutado
                                            </button>
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, status: 'not_executed' }))}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${formData.status === 'not_executed' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                            >
                                                No Ejecutado
                                            </button>
                                        </div>
                                    </div>

                                    {/* Type & Scope Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tipo de Evento</label>
                                            <div className="relative">
                                                <select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={handleFormChange}
                                                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-slate-700 dark:text-slate-200 appearance-none transition-all cursor-pointer"
                                                >
                                                    <option>Taller</option>
                                                    <option>Webinar</option>
                                                    <option>@Emprender</option>
                                                    <option>Emprendex</option>
                                                    <option>Bootcamp Parte I</option>
                                                    <option>Bootcamp Parte II</option>
                                                    <option>Bootcamp Parte III</option>
                                                    <option>Networking</option>
                                                    <option>Otro</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Alcance</label>
                                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                                                {['Interno', 'Externo'].map((scopeOption) => (
                                                    <button
                                                        key={scopeOption}
                                                        onClick={() => setFormData({ ...formData, scope: scopeOption })}
                                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${formData.scope === scopeOption
                                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                            }`}
                                                    >
                                                        {scopeOption}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Indicator (Read Only) */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Indicador (Automático)</label>
                                        <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 cursor-not-allowed flex items-center gap-3 opacity-80">
                                            <div className={`w-3 h-3 rounded-full ${formData.indicator ? getIndicatorColor(formData.indicator).replace('text-', 'bg-').split(' ')[0] : 'bg-slate-300'}`}></div>
                                            <span className="font-bold text-slate-500 dark:text-slate-400 select-none">
                                                {formData.indicator || 'Selecciona un tipo de evento...'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nombre del Evento</label>
                                        <textarea
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            placeholder="Escribe un nombre descriptivo..."
                                            rows="2"
                                            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-900 dark:text-white resize-none transition-all placeholder:text-slate-400"
                                        ></textarea>
                                    </div>

                                    {/* Date & Time Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-4 space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Fecha</label>
                                            <input
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleFormChange}
                                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-4 space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Inicio</label>
                                            <input
                                                type="time"
                                                name="startTime"
                                                value={formData.startTime || ''}
                                                onChange={handleFormChange}
                                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-4 space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Fin</label>
                                            <input
                                                type="time"
                                                name="endTime"
                                                value={formData.endTime || ''}
                                                onChange={handleFormChange}
                                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ubicación</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleFormChange}
                                                    placeholder="Ej: Bloque V, Zoom..."
                                                    className="w-full pl-11 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-900 dark:text-white transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Invitado (Opcional)</label>
                                            <input
                                                type="text"
                                                name="guest"
                                                value={formData.guest}
                                                onChange={handleFormChange}
                                                placeholder="Nombre del invitado..."
                                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-900 dark:text-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Participantes</label>
                                        <div className="relative">
                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={formData.participants_count ?? 0}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    participants_count: Math.max(0, Number.parseInt(e.target.value || '0', 10) || 0)
                                                }))}
                                                placeholder="Total de participantes"
                                                className="w-full pl-11 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-slate-900 dark:text-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Responsables</label>
                                        <div className="flex flex-col sm:flex-row gap-2.5">
                                            <input
                                                type="text"
                                                value={newResponsibleName}
                                                onChange={(e) => setNewResponsibleName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddResponsibleOption();
                                                    }
                                                }}
                                                placeholder="Agregar nuevo responsable..."
                                                className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-900 dark:text-white transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddResponsibleOption}
                                                className="px-4 py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Plus size={16} />
                                                Agregar
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                            {availableResponsibleOptions.map(resp => (
                                                <div key={resp} className="relative group/chip inline-flex items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleResponsibleChange(resp)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide border-2 transition-all duration-300 ${formData.responsibles.includes(resp)
                                                            ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/30 scale-105'
                                                            : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                                                            }`}
                                                    >
                                                        {resp}
                                                    </button>
                                                    {!baseResponsibleSet.has(resp) && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteResponsibleOption(resp);
                                                            }}
                                                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md opacity-0 group-hover/chip:opacity-100 transition-opacity"
                                                            title="Eliminar responsable"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                <div className="p-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md sticky bottom-0 z-10">
                                    <button
                                        onClick={() => updateParams({ modal: null, eventoId: null })}
                                        className="px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-xl shadow-primary-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
                                    >
                                        <Save size={20} className="stroke-[2.5px]" />
                                        <span>Guardar Cambios</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </main >
            {/* Desktop Global Tracking Modal */}
            {
                trackingModalOpen && (() => {
                    const ev = events.find(e => e.id === trackingModalOpen);
                    if (!ev) return null;

                    const trackingItems = Array.isArray(ev.tracking) ? ev.tracking : [];
                    const completedCount = trackingItems.filter(t => t.completed).length;
                    const totalCount = trackingItems.length;
                    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

                    return (
                        <>
                            <div className="fixed inset-0 bg-slate-900/60 z-[60] backdrop-blur-sm transition-all duration-300" onClick={() => updateParams({ seguimiento: null })}></div>
                            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] z-[70] p-0 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-white/10 overflow-hidden">

                                {/* Header with Progress */}
                                <div className="bg-slate-50 dark:bg-white/5 p-8 pb-10 border-b border-slate-100 dark:border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 z-20">
                                        <button onClick={() => updateParams({ seguimiento: null })} className="p-2.5 bg-white dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                                            <X size={20} strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-wider">
                                                Seguimiento
                                            </div>
                                            {progress === 100 && (
                                                <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs uppercase tracking-wide animate-in fade-in slide-in-from-left-2">
                                                    <CheckCircle size={14} /> completado
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-6 pr-12">
                                            {ev.name || ev.type}
                                        </h3>

                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                <span>Progreso</span>
                                                <span className="text-primary-600 dark:text-primary-400">{progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary-500 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(var(--primary-500),0.3)]"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decorative Background Blob */}
                                    <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
                                </div>

                                <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
                                    <div className="space-y-3">
                                        {trackingItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${item.completed
                                                    ? 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-75 hover:opacity-100'
                                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 hover:border-primary-200 dark:hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-0.5'
                                                    }`}
                                            >
                                                {/* Status Line Indicator */}
                                                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-colors ${item.completed ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-primary-400'
                                                    }`}></div>

                                                <div className="pl-2">
                                                    <Checkbox
                                                        id={`desktop-${item.id}`}
                                                        checked={item.completed}
                                                        onCheckedChange={() => toggleTracking(ev.id, item.id)}
                                                        className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 rounded-md transition-all"
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <input
                                                        type="text"
                                                        value={item.label}
                                                        onChange={(e) => {
                                                            const newValue = e.target.value;
                                                            setEvents(prev => prev.map(event => {
                                                                if (event.id === ev.id) {
                                                                    const newTracking = event.tracking.map(t =>
                                                                        t.id === item.id ? { ...t, label: newValue } : t
                                                                    );
                                                                    return { ...event, tracking: newTracking };
                                                                }
                                                                return event;
                                                            }));
                                                        }}
                                                        onBlur={async () => {
                                                            await supabase
                                                                .from('events_2026')
                                                                .update({ tracking: ev.tracking })
                                                                .eq('id', ev.id);
                                                        }}
                                                        className={`w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0 placeholder-slate-400 transition-colors ${item.completed
                                                            ? 'text-slate-400 dark:text-slate-500 line-through decoration-slate-400/50 decoration-2'
                                                            : 'text-slate-700 dark:text-slate-200'
                                                            }`}
                                                    />
                                                </div>

                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (!confirm('¿Eliminar paso?')) return;
                                                        const newTracking = ev.tracking.filter(t => t.id !== item.id);
                                                        setEvents(prev => prev.map(event => event.id === ev.id ? { ...event, tracking: newTracking } : event));
                                                        await supabase.from('events_2026').update({ tracking: newTracking }).eq('id', ev.id);
                                                    }}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform scale-90 hover:scale-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={async () => {
                                            const newStep = {
                                                id: crypto.randomUUID(),
                                                label: 'Nuevo paso',
                                                completed: false
                                            };
                                            const newTracking = [...(ev.tracking || []), newStep];
                                            setEvents(prev => prev.map(event => event.id === ev.id ? { ...event, tracking: newTracking } : event));
                                            await supabase.from('events_2026').update({ tracking: newTracking }).eq('id', ev.id);
                                        }}
                                        className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wide hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                                            <Plus size={16} className="group-hover:scale-110 transition-transform" />
                                        </div>
                                        Agregar Nuevo Paso
                                    </button>
                                </div>
                            </div>
                        </>
                    );
                })()
            }
        </div >
    );
}

export default EventDashboard;
